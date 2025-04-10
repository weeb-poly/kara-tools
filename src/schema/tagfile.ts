import { Type, type Static } from "@sinclair/typebox";

// typebox doesn't support string enums out of the box
// so we need to fix that
const StringEnum = <T extends string[]>(values: [...T]) => Type.Unsafe<T[number]>({ 
    type: 'string',
    enum: values
})

const STagTypes = StringEnum([
    "series",
    "singers",
    "songtypes",
    "creators",
    "langs",
    "authors",
    "misc",
    "songwriters",
    "groups",
    "families",
    "origins",
    "genres",
    "platforms",
    "versions",
    "warnings",
    "collections",
    "singergroups",
    "franchises",
]);

export const STagFile = Type.Object({
    header: Type.Object({
        version: Type.Optional(Type.Number({ semver: { satisfies: "1" } })),
        description: Type.Literal("Karaoke Mugen Tag File"),
    }),
    tag: Type.Object({
        types: Type.Array(STagTypes),
        name: Type.String({ minLength: 1 }),
        tid: Type.String({ format: "uuid" }),
        aliases: Type.Optional(Type.Array(Type.String())),
        short: Type.Optional(Type.String()),
        priority: Type.Optional(Type.Number()),
        noLiveDownload: Type.Optional(Type.Boolean()),
        i18n: Type.Optional(
            Type.Record(
                Type.String(),
                Type.String(),
            )
        ),
        description: Type.Optional(
            Type.Record(
                Type.String(),
                Type.String(),
            )
        ),
        repository: Type.String({ minLength: 1 }),
        karafile_tag: Type.Optional(Type.String({ minLength: 1 })),
        external_database_ids: Type.Optional(
            Type.Object({
                myanimelist: Type.Optional(Type.Number()),
                anilist: Type.Optional(Type.Number()),
                kitsu: Type.Optional(Type.Number()),
            })
        ),
        modified_at: Type.Optional(
            Type.String({ format: "date-time", minLength: 1 })
        ),
    }),
}, { $id: "https://kara.wpi.moe/schemas/tagfile" });

export type TTagFile = Static<typeof STagFile>;
