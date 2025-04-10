import type Ajv from "ajv";
import { mediaFileRegexp, subFileRegexp } from "../utils/constants.js";

export default function addFormats(ajv: Ajv) {
    ajv.addFormat("KaraMediaFile", mediaFileRegexp);
    ajv.addFormat("KaraSubFile", subFileRegexp);
};
