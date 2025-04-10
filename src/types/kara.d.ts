import { AudioChannelLayout } from '../utils/constants.ts';

export type MediaInfoWarning = 'LIBAVCODEC_ENCODER';

export interface MediaInfo {
	size?: number;
	filename: string;
	fileExtension?: string;
	error: boolean;
	loudnorm: string;
	duration: number;

	mediaType?: 'audio' | 'video',
	overallBitrate?: number;
	videoCodec?: string;
	videoColorspace?: string;
	videoAspectRatio?: {
		pixelAspectRatio?: string, // PAR / SAR (on ffmpeg)
		displayAspectRatio?: string // DAR
	};
	videoResolution?: { height: number; width: number; formatted: string };
	videoFramerate?: number;
	videoOffset?: number;
	audioCodec?: string;
	audioSampleRate?: number;
	audioChannelLayout?: AudioChannelLayout;
	audioOffset?: number;
	hasCoverArt?: boolean;
	warnings?: Array<MediaInfoWarning>
}