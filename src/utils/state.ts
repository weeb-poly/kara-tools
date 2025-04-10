import pathToFfmpeg from "ffmpeg-static";

const state = {
    binPath: {
        ffmpeg: pathToFfmpeg!
    }
};

export function getState() {
	return state;
}