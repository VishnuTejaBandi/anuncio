export type CommonOptions = { id: string; autoPlay?: boolean };

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

export type AnuncioItemOptions = VideoOptions | ImageOptions;
