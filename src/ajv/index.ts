import Ajv from "ajv";
import addErrors from "ajv-errors";
import addFormats from "ajv-formats";

import addCustomFormats from "./formats.js";
import addCustomKeywords from "./keywords.js";

const ajv = new Ajv({ allErrors: true });

addErrors(ajv);
addFormats(ajv);
addCustomFormats(ajv);
addCustomKeywords(ajv);

export { ajv };