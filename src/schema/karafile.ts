import { Type, type Static } from "@sinclair/typebox";

const SLyricsFile = Type.Object({
    filename: Type.String({ minLength: 1, format: "KaraSubFile" }),
    default: Type.Boolean(),
});

const SMediaFile = Type.Object({
    version: Type.String({ minLength: 1 }),
    filename: Type.String({ minLength: 1, format: "KaraMediaFile" }),
    loudnorm: Type.String(),
    duration: Type.Number({ minimum: 0 }),
    filesize: Type.Number({ minimum: 0 }),
    default: Type.Boolean(),
    lyrics: Type.Array(SLyricsFile),
});

const SUuidString = Type.String({ format: "uuid" });
const SUuidArray = Type.Array(SUuidString);

// TODO: Figure out how to do all of this at compiletime
/*
enum TagTypes {
	series = 1,
	singers = 2,
	songtypes = 3,
	creators = 4,
	langs = 5,
	authors = 6,
	misc = 7,
	songwriters = 8,
	groups = 9,
	families = 10,
	origins = 11,
	genres = 12,
	platforms = 13,
	versions = 14,
	warnings = 15,
	collections = 16,
	singergroups = 17,
	franchises = 18,
};
let TagTypesStrings = Object.keys(TagTypes).filter(key => isNaN(Number(key)))
const SKaraTagsAll = Object.fromEntries(
    TagTypesStrings.map(tagType => [tagType, SUuidArray])
);
*/
const SKaraTagsAll = {
    series: SUuidArray,
    singers: SUuidArray,
    songtypes: SUuidArray,
    creators: SUuidArray,
    langs: SUuidArray,
    authors: SUuidArray,
    misc: SUuidArray,
    songwriters: SUuidArray,
    groups: SUuidArray,
    families: SUuidArray,
    origins: SUuidArray,
    genres: SUuidArray,
    platforms: SUuidArray,
    versions: SUuidArray,
    warnings: SUuidArray,
    collections: SUuidArray,
    singergroups: SUuidArray,
    franchises: SUuidArray,
}

const SKaraTags = Type.Composite([
    Type.Partial(
        Type.Omit(
            Type.Object(SKaraTagsAll),
            ['songtypes', 'collections', 'langs']
        )
    ),
    Type.Required(
        Type.Object({
            songtypes: SUuidArray,
            collections: Type.Array(SUuidString, { minItems: 1 }),
            langs: SUuidArray,
        })
    )
]);

const SKaraData = Type.Object({
    titles: Type.Record(
        Type.String(),
        Type.String(),
    ),
    titles_aliases: Type.Optional(Type.Array(Type.String())),
    titles_default_language: Type.Optional(Type.String({ minLength: 1 })),
    year: Type.Optional(Type.Number()),
    songorder: Type.Optional(Type.Number()),
    tags: SKaraTags,
    from_display_type: Type.Optional(Type.String()),
    // from_display_type?: KaraFromDisplayType;
    repository: Type.Optional(Type.String({ minLength: 1 })),
    created_at: Type.String({ format: "date-time", minLength: 1 }),
    modified_at: Type.String({ format: "date-time", minLength: 1 }),
    kid: Type.String({ format: "uuid" }),
    comment: Type.Optional(Type.String({ minLength: 1 })),
    parents: Type.Optional(Type.Array(Type.String({ format: "uuid" }))),
    ignoreHooks: Type.Boolean(),
    songname: Type.Optional(Type.String({ minLength: 1 })),
});

export const SKaraFile = Type.Object({
    header: Type.Object({
        version: Type.Number({ semver: { satisfies: "4" } }),
        description: Type.Literal("Karaoke Mugen Karaoke Data File"),
    }),
    medias: Type.Array(SMediaFile),
    data: SKaraData,
}, { $id: "https://kara.wpi.moe/schemas/karafile" });

export type TKaraFile = Static<typeof SKaraFile>;
