import { defineCollection, getCollection, reference, z, type CollectionEntry, type SchemaContext } from "astro:content";
import { glob } from "astro/loaders";

export type Incentives = z.infer<typeof Incentives>;

const Incentives = z.tuple([z.string(), z.coerce.string()]).array();

export type Notification = z.infer<typeof Notification>;

const Notification = z.object({
  message: z.string().transform((value) => value.trim().split("\n")),
  anchor: z.string().url().optional(),
});

export type Activity = z.infer<typeof Activity>;

const Activity = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("talk"),
    activity: reference("talks"),
  }),
  z.object({
    type: z.literal("workshop"),
    activity: reference("workshops"),
  }),
]);

export type Programme = z.infer<typeof Programme>;

const Programme = z
  .object({
    time: z.coerce.string().time(),
    activities: Activity.array().optional(),
    organizational: z.string().optional(),
  })
  .array();

export type Tier = z.infer<typeof Tier>;

export const tiers = ["platinum", "gold", "silver", "bronze", "introduction"] as const;

const Tier = z.enum(tiers);

export type Role = z.infer<typeof Role>;

export const roles = ["chair", "treasurer", "acquisition", "speakers", "location", "promotion", "board"] as const;

const Role = z.enum(roles);

export type Committee = z.infer<typeof Committee>;

const Committee = z
  .object({
    name: z.string(),
    role: Role,
    contact: z.coerce.string().url().optional(),
  })
  .array();

const acknowledgements = `DomCode, for letting us take inspiration from their code of conduct;
The staff of Utrecht University's CS department for their support in planning and promotion;
All our volunteers, without whom the conference would not be possible;`;

export type Edition = z.infer<typeof Edition>;

const Edition = z.object({
  name: z.string(),
  date: z.coerce.date().optional(),
  incentives: Incentives.optional(),
  highlights: z.string().url().optional(),
  notification: Notification.optional(),
  tickets: z.string().url().optional(),
  programme: Programme.optional(),
  talks: reference("talks").array().optional(),
  workshops: reference("workshops").array().optional(),
  speakers: reference("people").array().optional(),
  hosts: reference("people").array().optional(),
  partners: z.record(Tier, reference("partners").array()).optional(),
  venue: reference("venues").optional(),
  committee: Committee,
  acknowledgements: z
    .string()
    .transform((val) => val.trim())
    .default(acknowledgements),
});

const editions = defineCollection({
  loader: glob({ pattern: "[^_]*.(yml|yaml)", base: "./src/content/" }),
  schema: Edition,
});

export type Social = z.infer<typeof Social>;

export const socials = ["bluesky", "facebook", "github", "glassdoor", "instagram", "linkedin", "twitter", "youtube", "x"] as const;

const Social = z.enum(socials);

export type Contact = z.infer<typeof Contact>;

const Contact = z
  .object({
    website: z.coerce.string().url(),
    mail: z.coerce.string().email(),
    socials: z.record(Social, z.coerce.string().url()),
  })
  .partial();

export type Person = z.infer<ReturnType<typeof Person>>;

export type Partner = z.infer<ReturnType<typeof Partner>>;

const Partner = ({ image }: SchemaContext) => z.object({
  name: z.string(),
  description: z.string().optional(),
  logo: image(),
  contact: Contact.optional(),
});

const partners = defineCollection({
  loader: glob({ pattern: "[^_]*.md", base: "./src/content/partners/" }),
  schema: Partner,
});

const Person = ({ image }: SchemaContext) => z.object({
  name: z.string(),
  description: z.string().optional(),
  portrait: image().optional(),
  contact: Contact.optional(),
});

const people = defineCollection({
  loader: glob({ pattern: "[^_]*.md", base: "./src/content/people/" }),
  schema: Person,
});

export type Talk = z.infer<typeof Talk>;

const Talk = z.object({
  title: z.string(),
  description: z.string().optional(),
  tags: z.string().array().default([]),
  speaker: reference("people"),
});

const talks = defineCollection({
  loader: glob({ pattern: "[^_]*.md", base: "./src/content/talks/" }),
  schema: Talk,
});

export type Venue = z.infer<ReturnType<typeof Venue>>;

const Venue = ({ image }: SchemaContext) => z.object({
  name: z.string(),
  description: z.string().optional(),
  image: image(),
  address: z.string().transform((address) => address.trim().split("\n")),
  directions: z.coerce.string().url(),
  embed: z.coerce.string().url(),
});

const venues = defineCollection({
  loader: glob({ pattern: "[^_]*.md", base: "./src/content/venues/" }),
  schema: Venue,
});

export type Workshop = z.infer<typeof Workshop>;

const Workshop = z.object({
  title: z.string(),
  description: z.string().optional(),
  tags: z.string().array().default([]),
  organizer: reference("partners"),
});

const workshops = defineCollection({
  loader: glob({ pattern: "[^_]*.md", base: "./src/content/workshops/" }),
  schema: Workshop,
});

export const collections = {
  editions,
  partners,
  people,
  talks,
  venues,
  workshops,
};

const epoch = ({ data }: CollectionEntry<"editions">) => data.date?.getTime() || Number.POSITIVE_INFINITY;

const entries = await getCollection("editions").then((editions) => editions.sort((a, b) => epoch(b) - epoch(a)));

export const [current, ...older] = entries;
export const [previous] = older;
