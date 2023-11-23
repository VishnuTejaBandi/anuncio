import { ImageItem } from "src/items/ImageItem";
import { VideoItem } from "src/items/VideoItem";

export type CommonOptions = { id: string };

export type ImageOptions = CommonOptions & {
  imageUrl: string;
  videoUrl?: undefined;
  type: "image";
  duration: number;
};

export type VideoOptions = CommonOptions & {
  videoUrl: string;
  imageUrl?: undefined;
  type: "video";
};

export type AnuncioConfigOptions = {
  loader?: HTMLElement;
  containerId?: string;
  order?: (ImageItem["id"] | VideoItem["id"])[];
  autostart?: boolean;
};

export type AnuncioItemOptions = VideoOptions | ImageOptions;
