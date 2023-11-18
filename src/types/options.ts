export type ImageOptions = {
  imageUrl: string;
  videoUrl?: undefined;
  type: "image";
};

export type VideoOptions = {
  videoUrl: string;
  imageUrl?: undefined;
  type: "video";
};

export type Item = { id: string } & (VideoOptions | ImageOptions);
