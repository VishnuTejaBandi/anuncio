import { ImageItem } from "src/items/ImageItem";
import { VideoItem } from "src/items/VideoItem";

export type AnuncioItemMap = Map<string, ImageItem | VideoItem>;
export * from "./options";
export * from "./events";
