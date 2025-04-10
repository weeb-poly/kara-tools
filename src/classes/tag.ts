import { ajv } from "../ajv/index.js";

import { TTagFile, STagFile } from "../schema/tagfile.js"

//const validator = ajv.compile(schema);
const validator = ajv.compile(Object.assign({ "$async": true }, STagFile));

export default class Tag {
    error = false;
    isModified = false;
    tagfile = '';

    static schema = STagFile;
    static validator = validator;

    raw: TTagFile;

    constructor(raw: TTagFile) {
        this.raw = raw;
    }

    async validateSchema() {
        try {
            await Tag.validator(this.raw);
        } catch (e) {
            throw `Tag data is not valid for ${this.tagfile} : ${JSON.stringify(e.errors)}`;
        }
    }

    get types() {
        return this.raw.tag.types;
    }

    get name() {
        return this.raw.tag.name;
    }

    get tid() {
        return this.raw.tag.tid;
    }

    get aliases() {
        return this.raw.tag.aliases;
    }

    get short() {
        return this.raw.tag.short;
    }

    get priority() {
        return this.raw.tag.priority;
    }

    get noLiveDownload() {
        return this.raw.tag.noLiveDownload;
    }

    get i18n() {
        return this.raw.tag.i18n;
    }

    get repository() {
        return this.raw.tag.repository;
    }
    set repository(repo) {
        this.raw.tag.repository = repo;
        this.isModified = true;
    }

    get modified_at() {
        if (this.raw.tag.modified_at) {
            return new Date(this.raw.tag.modified_at);
        } else {
            return undefined;
        }
    }
    set modified_at(date) {
        if (date instanceof Date) {
            this.raw.tag.modified_at = date.toISOString();
        } else if (typeof date === 'string') {
            this.raw.tag.modified_at = date;
        } else {
            throw new TypeError("Invalid type for modified_at");
        }
        this.isModified = true;
    }

    get karafile_tag() {
        return this.raw.tag.karafile_tag;
    }
}