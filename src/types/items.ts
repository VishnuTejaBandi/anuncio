import { ImageOptions, Item, VideoOptions } from ".";

// TODO change these optional to required
type CommonData = Pick<Item, "id"> & { loading: boolean; progressEl: HTMLProgressElement; overlayEl?: HTMLElement };
type ImageData = { mediaEl: HTMLImageElement; duration: number } & ImageOptions;
type VideoData = { mediaEl: HTMLVideoElement } & VideoOptions;

export type AnuncioItem = CommonData & (ImageData | VideoData);

export type ImageItem = CommonData & ImageData;
export type VideoItem = CommonData & VideoData;
export type AnuncioItemOrder = Array<AnuncioItem["id"]>;
