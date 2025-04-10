import type Ajv from "ajv";
import semver from "semver";

export default function addKeywords(ajv: Ajv) {
    ajv.addKeyword({
        keyword: "semver",
        validate: (schema, data) => {
            let semverData = semver.coerce(data);
            if (schema.hasOwnProperty('satisfies')) {
                return semver.satisfies(semverData, schema['satisfies']);
            }
            return true;
        }
    });
};