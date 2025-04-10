import { timeToSeconds } from './date.js';
import logger from './logger.js';

export function ffmpegParseVideoInfo(ffmpegOutputSpaceSplitted: string[]) {
	const indexVideo = ffmpegOutputSpaceSplitted.indexOf('Video:');
	let videoCodec = '';
	let videoHeight = 0;
	let videoWidth = 0;
	let videoColorspace = '';
	let videoFramerate = 0;
	let videoSAR = '';
	let videoDAR = '';
	let videoOffset: number | undefined = 0;
	let isPicture = false;
	if (indexVideo > -1) {
		// Example lines for reference:
		// Stream #0:0[0x1](und):  Video: h264 (avc1 / 0x31637661),        yuv420p10le(tv, bt709, progressive),   1920x1080 [SAR 1:1 DAR 16:9],       3844 kb/s, 23.98 fps, 23.98 tbr, 24k tbn (default)
		// Stream #0:0(eng):       Video: vp9,                             yuv420p(tv, bt709),                    1920x1080, SAR 1:1 DAR 16:9,             24 fps, 24 tbr, 1k tbn (default)
		// Stream #0:0[0x1](und):  Video: h264 (avc1 / 0x31637661),        yuv420p(progressive),                  1920x1080 [SAR 1:1 DAR 16:9],       6003 kb/s, 25 fps, 25 tbr, 90k tbn (default)
		// Stream #0:0[0x1](und):  Video: h264 (avc1 / 0x31637661),        yuv420p(tv, bt709, progressive),       1920x1080 [SAR 1:1 DAR 16:9],       3992 kb/s, 24 fps, 24 tbr, 12288 tbn (default)
		// Stream #0:0[0x1](und):  Video: h264 (avc1 / 0x31637661),    yuv420p(tv, bt709, progressive),       1920x1080,                          4332 kb/s, 23.98 fps, 23.98 tbr, 24k tbn (default)
		// Stream #0:0(eng):    Video: h264 (High) (avc1 / 0x31637661), yuv420p,           1920x1080 [SAR 1:1 DAR 16:9],       5687 kb/s, 23.98 fps, 23.98 tbr, 24k tbn, 47.95 tbc (default)
		// Stream #0:0[0x1](eng):  Video: av1 (Main) (av01 / 0x31307661),  yuv420p(tv, top coded first (swapped)), 854x480, 2446 kb/s, SAR 1:1 DAR 427:240, 29.97 fps, 29.97 tbr, 30k tbn (default)
		// Audio only with embedded pictures:
		// Stream #0:1:    Video: png,            rgba(pc),    1920x1080 [SAR 5669:5669 DAR 16:9], 90k tbr, 90k tbn, 90k tbc (attached pic)
		// Stream #0:1:    Video: mjpeg (Progressive),             yuvj444p(pc, bt470bg/unknown/unknown),  1920x1080 [SAR 1:1 DAR 16:9],       90k tbr, 90k tbn, 90k tbc (attached pic)
		try {
			videoCodec = ffmpegOutputSpaceSplitted[indexVideo + 1].replace(',', ''); // h264 (avc1 / 0x31637661)
			const referenceIndexes = {
				videoFpsIndex: ffmpegOutputSpaceSplitted.findIndex(a => a.replace(',', '') === 'fps'),
				attachedPicEndLineIndex: ffmpegOutputSpaceSplitted.findIndex(
					(a, index) => index >= indexVideo && a === '(attached'
				),
				sarIndex: ffmpegOutputSpaceSplitted.findIndex(
					(a, index) => index >= indexVideo && (a === '[SAR' || a === 'SAR')
				),
				darIndex: ffmpegOutputSpaceSplitted.findIndex((a, index) => index >= indexVideo && a === 'DAR'),
			};
			isPicture =
				referenceIndexes.attachedPicEndLineIndex > 0 &&
				ffmpegOutputSpaceSplitted.some(a => a.trim() === 'pic)');
			const searchBeforeIndexSameLine =
				(referenceIndexes.videoFpsIndex >= 0 && referenceIndexes.videoFpsIndex) ||
				// Fallback to properties nearby if no fps defined
				(referenceIndexes.attachedPicEndLineIndex >= 0 && referenceIndexes.attachedPicEndLineIndex) ||
				(referenceIndexes.sarIndex >= 0 && referenceIndexes.sarIndex) || 0;
			let resIndex: number = 0;
			// Resolution is the first piece behind videoFpsIndex that contains "x"
			for (let i = searchBeforeIndexSameLine - 1; i > indexVideo; i -= 1) {
				// Make sure to only search in the same "Video" line and not everywhere by checking other indexes
				if (ffmpegOutputSpaceSplitted[i].includes('x')) {
					try {
						// Check if the format is a resolution
						// If numbers can't be parsed, it's not a resolution, silently continue
						const resArray = ffmpegOutputSpaceSplitted[i]
							.replace(',', '')
							.split('x')
							.map(a => Number(a));
						videoWidth = resArray[0];
						videoHeight = resArray[1];
						resIndex = i;
						break;
					} catch (e) {
						// Ignore if it's not a resolution
					}
				}
			}

			// SAR / DAR pixel format
			if (referenceIndexes.sarIndex > 0) videoSAR = ffmpegOutputSpaceSplitted[referenceIndexes.sarIndex + 1];
			if (referenceIndexes.darIndex > 0) videoDAR = ffmpegOutputSpaceSplitted[referenceIndexes.darIndex + 1];
			if (videoDAR.endsWith(',')) videoDAR = videoDAR.substring(0, videoDAR.length - 1);
			if (videoDAR.endsWith(']')) videoDAR = videoDAR.substring(0, videoDAR.length - 1);

			// Colorspace is the first piece behind resIndex, detect two formats of it:
			// yuv420p,
			// yuv420p(tv, bt709, progressive),
			if (
				resIndex > 1 &&
				ffmpegOutputSpaceSplitted[resIndex - 1].includes(',') &&
				!ffmpegOutputSpaceSplitted[resIndex - 1].includes(')')
			) {
				videoColorspace = ffmpegOutputSpaceSplitted[resIndex - 1].replace(',', '');
			} else {
				// The first piece behind resIndex that contains "("
				for (let i = resIndex - 1; i > indexVideo; i -= 1) {
					if (ffmpegOutputSpaceSplitted[i].includes('(') && !ffmpegOutputSpaceSplitted[i].includes('))')) {
						videoColorspace = ffmpegOutputSpaceSplitted[i].split('(')[0];
						break;
					}
				}
			}

			if (referenceIndexes.videoFpsIndex > 0) {
				videoFramerate = Number(ffmpegOutputSpaceSplitted[referenceIndexes.videoFpsIndex - 1]);
			}

			videoOffset = findAndParseOffset(ffmpegOutputSpaceSplitted, indexVideo);
		} catch (e) {
			logger.warn('Error on parsing technical video info', {
				service: 'ffmpeg.parser',
				error: e,
			});
		}
	}
	return {
		videoCodec,
		videoColorspace,
		videoHeight,
		videoWidth,
		videoResolution: (videoHeight && videoWidth) ? {
			height: videoHeight,
			width: videoWidth,
			formatted: `${videoWidth}x${videoHeight}`,
		} : undefined,
		videoFramerate,
		videoAspectRatio: { pixelAspectRatio: videoSAR, displayAspectRatio: videoDAR },
		videoOffset,
		isPicture,
	};
}

export function ffmpegParseAudioInfo(ffmpegOutputSpaceSplitted: string[]) {
	// Example lines for reference:
	// Stream #0:1[0x2](und): Audio: opus (Opus / 0x7375704F), 48000 Hz, stereo, fltp, 198 kb/s (default)
	const indexAudio = ffmpegOutputSpaceSplitted.indexOf('Audio:');
	let audioCodec = '';
	if (indexAudio > -1) {
		audioCodec = ffmpegOutputSpaceSplitted[indexAudio + 1].replace(',', '');
	}
	const indexAudioHz = ffmpegOutputSpaceSplitted.indexOf('Hz,');
	let audioSampleRate = 0;
	if (indexAudioHz) {
		audioSampleRate = Number(ffmpegOutputSpaceSplitted[indexAudioHz - 1])
	}
	const indexAudioChannelLayout = indexAudioHz + 2;
	let audioChannelLayout = '';
	if (indexAudioChannelLayout) {
		audioChannelLayout = ffmpegOutputSpaceSplitted[indexAudioChannelLayout - 1]?.replace(',', '');
	}

	const audioOffset = findAndParseOffset(ffmpegOutputSpaceSplitted, indexAudio);
	return {
		audioCodec,
		audioSampleRate,
		audioChannelLayout,
		audioOffset
	};
}

function findAndParseOffset(ffmpegOutputSpaceSplitted: string[], lastIndex: number) {
	let indexOffset = 0;
	for (let i = lastIndex; i > 0 && !indexOffset; i--) {
		if (ffmpegOutputSpaceSplitted[i].startsWith('start:'))
			indexOffset = i + 1;
		else if (ffmpegOutputSpaceSplitted[i]?.toLowerCase() === 'duration:') // Looked to much back, property start doesn't exist
			return undefined;
	}
	if (indexOffset) {
		try {
			return Number(ffmpegOutputSpaceSplitted[indexOffset]?.replaceAll(',', ''));
		} catch (e) {
			logger.warn(`Could not parse offset "${ffmpegOutputSpaceSplitted[indexOffset]}" to number`, {
				service: 'ffmpeg.parser',
				error: e,
			});
		}
	}
}

export function ffmpegParseLourdnorm(ffmpegOutputNewlineSplitted: string[]) {
	const indexLoudnormStart = ffmpegOutputNewlineSplitted.findIndex(s => s.startsWith('[Parsed_loudnorm'));
	if (indexLoudnormStart) {
		const indexLoudnormEnd = ffmpegOutputNewlineSplitted.findIndex(
			(s, index) => index > indexLoudnormStart && s.trim() === '}'
		);
		const loudnormArr = ffmpegOutputNewlineSplitted.slice(indexLoudnormStart + 1, indexLoudnormEnd + 1);
		const loudnorm = JSON.parse(loudnormArr.join('\n'));
		const loudnormStr = `${loudnorm.input_i},${loudnorm.input_tp},${loudnorm.input_lra},${loudnorm.input_thresh},${loudnorm.target_offset}`;
		return loudnormStr;
	}
	return '';
}

// Modified to fix type issue
export function ffmpegParseDuration(output: string | string[]) {
	const outputArray = (typeof output === 'string') ? output.split(' ') : output;
	const indexDuration = outputArray.indexOf('Duration:');
	if (indexDuration > -1) {
		const duration = outputArray[indexDuration + 1].replace(',', '');
		return timeToSeconds(duration);
	}
	return 0;
}
