import { execa } from "execa";
import { basename } from 'path';

import { getState } from '../utils/state.js';
import { MediaInfo, MediaInfoWarning } from '../types/kara.js';
import { supportedFiles } from './constants.js';
import {
	ffmpegParseAudioInfo,
	ffmpegParseDuration,
	ffmpegParseLourdnorm,
	ffmpegParseVideoInfo,
} from './ffmpeg.parser.js';
import logger from './logger.js';

const service = 'FFmpeg';

export async function getMediaInfo(
	mediafile: string,
	computeLoudnorm = true
): Promise<MediaInfo> {
	try {
		logger.info(`Analyzing ${mediafile}`, { service });
		const ffmpeg = getState().binPath.ffmpeg;
		const ffmpegExecResult = await execa(
			ffmpeg,
			[
				'-i',
				mediafile,
				'-vn',
				'-af',
				`replaygain${computeLoudnorm ? ',loudnorm=print_format=json' : ''}`,
				'-f',
				'null',
				'-',
			],
			{ encoding: 'utf8' }
		);

		let error = false;
		const outputArraySpaceSplitted = ffmpegExecResult.stderr.split(' ');
		const outputArrayNewlineSplitted = ffmpegExecResult.stderr.split('\n');
		logger.debug(
			`ffmpeg output lines count: ${outputArrayNewlineSplitted?.length}`,
			{ service, obj: { ffmpegExecResult } }
		);
		const videoInfo = ffmpegParseVideoInfo(outputArraySpaceSplitted);
		const audioInfo = ffmpegParseAudioInfo(outputArraySpaceSplitted);
		const duration = ffmpegParseDuration(outputArraySpaceSplitted);
		if (!duration) {
			error = true;
		}

		const loudnormString =
			computeLoudnorm ? ffmpegParseLourdnorm(outputArrayNewlineSplitted) : '';
		let mediaType: 'audio' | 'video';
		if (supportedFiles.audio.some(extension => mediafile.endsWith(extension)))
			mediaType = 'audio';
		else if (
			supportedFiles.video.some(extension => mediafile.endsWith(extension))
		)
			mediaType = 'video';
		else {
			logger.error(
				`Could not determine mediaType (audio or video) for file: ${mediafile}`,
				{ service, obj: { ffmpegExecResult } }
			);
			mediaType =
				videoInfo.isPicture || !videoInfo.videoResolution ? 'audio' : 'video'; // Fallback
		}

		const mediaWarnings: Array<MediaInfoWarning> = [];
		const isUsingFFmpegAacEncoder =
			audioInfo.audioCodec === 'aac' &&
			(await detectFFmpegAacEncoder(mediafile));
		if (isUsingFFmpegAacEncoder) mediaWarnings.push('LIBAVCODEC_ENCODER');

		const mediaInfo: MediaInfo = {
			duration: +duration,
			loudnorm: loudnormString,
			error,
			filename: basename(mediafile),
			mediaType,
			warnings: mediaWarnings,

			...videoInfo,
			...audioInfo,
		};
		logger.debug('Finished parsing ffmpeg output', {
			service,
			obj: { mediaInfo },
		});
		return mediaInfo;
	} catch (err) {
		logger.warn(`Video ${mediafile} probe error`, {
			service,
			obj: err,
		});
		return {
			duration: 0,
			loudnorm: '',
			error: true,
			filename: basename(mediafile),
		};
	}
}

async function detectFFmpegAacEncoder(mediafile: string) {
	const ffmpeg = getState().binPath.ffmpeg;
	const aacExtractResult = await execa(
		ffmpeg,
		[
			'-t',
			'0',
			'-i',
			mediafile,
			'-hide_banner',
			'-vn',
			'-f',
			'rawvideo',
			'-c',
			'copy',
			'-map',
			'0:a',
			'-',
		],
		{ encoding: 'utf8' }
	);
	return aacExtractResult.stdout?.includes('Lavc');
}
