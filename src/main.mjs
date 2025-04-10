#!/usr/bin/env -S node --experimental-modules

import { allFilesInDir, readAllJsonFiles, getWorkDir } from "./utils/files.mjs";

import { validateFileSchema } from "./services/validator.mjs";
import { postProcessing } from "./services/processor.mjs";
import { buildDataMaps } from "./services/generator.mjs";

import { Kara, Tag } from "./classes/index.js";

const WORK_DIR = getWorkDir();

const TAGS_DIR = new URL('./tags/', WORK_DIR);
const KARAS_DIR = new URL('./karaokes/', WORK_DIR);

const MEDIA_DIRS = ['./medias/', '../medias/', '../../kara.moe/medias/'].map(x => new URL(x, WORK_DIR));
const LYRICS_DIRS = ['./lyrics/'].map(x => new URL(x, WORK_DIR));

async function readAllTags() {
    const tagFnames = await allFilesInDir(TAGS_DIR);
    const tagFiles = await readAllJsonFiles(tagFnames);
    return Object.fromEntries(
        Object.entries(tagFiles).map(([fileName, fileData]) => {
            const tag = new Tag(fileData);
            tag.tagfile = fileName;
            return [tag.tid, tag];
        })
    );
}

async function readAllKaras() {
    const karaFnames = await allFilesInDir(KARAS_DIR);
    const karaFiles = await readAllJsonFiles(karaFnames);
    return Object.fromEntries(
        Object.entries(karaFiles).map(([fileName, fileData]) => {
            const kara = new Kara(fileData);
            kara.karafile = fileName;
            return [kara.kid, kara];
        })
    );
}

async function main() {
    console.time("Reading Data Files");

    const tags = await readAllTags();
    const _tags = Object.values(tags);
    const karas = await readAllKaras();
    const _karas = Object.values(karas);

    console.timeEnd("Reading Data Files");

    console.debug('Number of karas found: %d', _karas.length);
    console.debug('Number of tags found: %d', _tags.length);
    
    console.time("Schema Validation");

    await validateFileSchema(_tags, _karas);

    console.timeEnd("Schema Validation");

    console.time("Post Processing");

    await postProcessing(_tags, _karas, MEDIA_DIRS, LYRICS_DIRS);

    console.timeEnd("Post Processing");

    console.time("Building Data Map");

    const dataMap = await buildDataMaps(_karas, _tags);

    const unusedTags = Array.from(
        dataMap.tags.entries(),
        ([tid, kMap]) => (kMap.size === 0) ? tags[tid].tagfile : []
    ).flat();

    if (unusedTags.length !== 0) {
        console.log("Unused tags found:");
        console.log(unusedTags);
    }

    console.timeEnd("Building Data Map");

    //console.debug(dataMap.tags);

    if (dataMap.error) {
        throw "Error in PostProcessing + DataMap Steps";
    }

    console.info("Validation Complete");
}

await main();