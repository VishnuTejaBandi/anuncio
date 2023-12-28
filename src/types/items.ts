export interface AnuncioProgress {
  element: HTMLDivElement;
  value: number;
  max: number;
}

export interface Item {
  id: string;
  progress: AnuncioProgress;
  progressEl: HTMLDivElement;
  overlayEl?: HTMLElement;

  readonly loading: boolean;
  readonly state: "playing" | "paused" | "play-queued" | "closed";
  /** 
    in seconds
  */
  readonly duration: number;

  close(): void;
  pause(): void;
  resume(): void;
  start(): void;

  /** @private */
  addEventListener(event: string, handler: (...args: unknown[]) => unknown): void;
}

export interface ImageItem extends Item {
  mediaEl: HTMLImageElement;
  readonly type: "image";
}

export interface VideoItem extends Item {
  mediaEl: HTMLVideoElement;
  readonly type: "video";
  muted: boolean;
}
