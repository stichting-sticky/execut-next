import { type CollectionEntry } from "astro:content";

const epoch = ({ data }: CollectionEntry<"editions">) =>
  data.date?.getTime() || Number.POSITIVE_INFINITY;

export const sort = (editions: CollectionEntry<"editions">[]) =>
  editions.sort((a, b) => epoch(b) - epoch(a));
