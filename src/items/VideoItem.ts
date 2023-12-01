import { AnuncioProgress } from "src/utils";
import { VideoOptions } from "../types";
import { Item } from "./item";

export class VideoItem extends Item {
  mediaEl: HTMLVideoElement;
  progress: AnuncioProgress;
  overlayEl?: HTMLElement;

  #id: VideoOptions["id"];
  #state: "playing" | "paused" | "play-queued" | "closed" = "closed";
  #type: "image" = "image" as const;

  constructor(options: VideoOptions) {
    super();
    this.#id = options.id;
    this.overlayEl = options.overlay;

    this.progress = new AnuncioProgress({ id: "anuncio-progress-for-" + this.#id, max: 100 });
    this.mediaEl = this.#createVideoEl(options.videoUrl);
  }

  get loading() {
    return this.mediaEl.dataset.loading === "true";
  }

  get progressEl() {
    return this.progress.element;
  }

  get id() {
    return this.#id;
  }

  get type() {
    return this.#type;
  }

  get state() {
    return this.#state;
  }

  #createVideoEl(videoUrl: string) {
    const video = document.createElement("video");
    video.src = videoUrl;
    video.dataset.loading = "true";
    video.id = "anuncio-video-for-" + this.#id;

    video.addEventListener("canplay", () => {
      if (this.#state === "play-queued") this.start();

      video.dataset.loading = "false";
    });

    video.addEventListener("waiting", () => {
      video.dataset.loading = "true";
    });

    video.addEventListener("ended", () => {
      this.dispatchEvent("play-complete");
    });

    video.addEventListener("timeupdate", () => {
      if (this.#state === "playing") this.progress.value = (video.currentTime * 100) / video.duration;
    });

    return video;
  }

  close() {
    this.mediaEl.pause();
    this.mediaEl.currentTime = 0;
    this.#state = "closed";
  }

  pause() {
    if (this.#state === "playing") {
      this.mediaEl.pause();
      this.#state = "paused";
    }
  }

  resume() {
    if (this.#state === "paused") {
      this.mediaEl.play();
      this.#state = "playing";
    }
  }

  start() {
    if (this.#state === "closed" && this.loading) {
      this.#state = "play-queued";
    } else if (this.#state === "closed" || this.#state === "play-queued") {
      this.progress.value = 0;
      this.mediaEl.play();
      this.#state = "playing";
    }
  }
}
