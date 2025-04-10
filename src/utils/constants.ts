/*
 * Constants for KM (tags, langs, types, etc.).
 */

export const supportedFiles = {
	video: [
		'avi',
		'mkv',
		'mp4',
		'webm',
		'mov',
		'wmv',
		'mpg',
		'm2ts',
		'rmvb',
		'ts',
		'm4v',
	],
	audio: [
		'ogg',
		'opus',
		'aac',
		'm4a',
		'mp3',
		'wav',
		'flac',
		'mid',
		'mka'
	],
	lyrics: [
		'ass',
		'srt',
		'kar',
		'txt',
		'kfn',
		'lrc',
		'vtt',
		'sub',
		'sbv',
		'smi',
		'ssa',
		'json',
		'kbp'
	],
	mpvlyrics: [
		'ass',
		'jss',
		'lrc',
		'mpl2',
		'rt',
		'smi',
		'srt',
		'stl',
		'sub',
		'vtt'
	],
	pictures: [
		'jpg',
		'jpeg',
		'png',
		'gif',
		'webp',
		'apng',
		'jng'
	]
};

/** Regexps for validation. */
export const mediaFileRegexp = new RegExp(
	`^.+\\.(${supportedFiles.video.concat(supportedFiles.audio).join('|')})$`
);
export const imageFileRegexp = new RegExp(`^.+\\.(${supportedFiles.pictures.join('|')})$`);
export const subFileRegexp = new RegExp(
	`^.+\\.(${supportedFiles.lyrics.join('|')})$`
);
export const audioFileRegexp = new RegExp(
	`^.+\\.(${supportedFiles.audio.join('|')})$`
);
export const asciiRegexp = /^[\u0000-\u007F]+$/u;
export const imageFileTypes = ['jpg', 'jpeg', 'png', 'gif'];

export const supportedAudioChannelLayouts = [
	// ffmpeg -layouts
	'mono',            // FC
	'stereo',          // FL+FR
	'2.1',             // FL+FR+LFE
	'3.0',             // FL+FR+FC
	'3.0(back)',       // FL+FR+BC
	'4.0',             // FL+FR+FC+BC
	'quad',            // FL+FR+BL+BR
	'quad(side)',      // FL+FR+SL+SR
	'3.1',             // FL+FR+FC+LFE
	'5.0',             // FL+FR+FC+BL+BR
	'5.0(side)',       // FL+FR+FC+SL+SR
	'4.1',             // FL+FR+FC+LFE+BC
	'5.1',             // FL+FR+FC+LFE+BL+BR
	'5.1(side)',       // FL+FR+FC+LFE+SL+SR
	'6.0',             // FL+FR+FC+BC+SL+SR
	'6.0(front)',      // FL+FR+FLC+FRC+SL+SR
	'hexagonal',       // FL+FR+FC+BL+BR+BC
	'6.1',             // FL+FR+FC+LFE+BC+SL+SR
	'6.1(back)',       // FL+FR+FC+LFE+BL+BR+BC
	'6.1(front)',      // FL+FR+LFE+FLC+FRC+SL+SR
	'7.0',             // FL+FR+FC+BL+BR+SL+SR
	'7.0(front)',      // FL+FR+FC+FLC+FRC+SL+SR
	'7.1',             // FL+FR+FC+LFE+BL+BR+SL+SR
	'7.1(wide)',       // FL+FR+FC+LFE+BL+BR+FLC+FRC
	'7.1(wide-side)',  // FL+FR+FC+LFE+FLC+FRC+SL+SR
	'7.1(top)',        // FL+FR+FC+LFE+BL+BR+TFL+TFR
	'octagonal',       // FL+FR+FC+BL+BR+BC+SL+SR
	'cube',            // FL+FR+BL+BR+TFL+TFR+TBL+TBR
	'hexadecagonal',   // FL+FR+FC+BL+BR+BC+SL+SR+TFL+TFC+TFR+TBL+TBC+TBR+WL+WR
	'downmix',         // DL+DR
	'22.2'
]
export type AudioChannelLayout = typeof supportedAudioChannelLayouts[number];
