import { PAnuncioProgress } from "src/utils";
import { VideoItem, VideoOptions } from "../types";
import { Item } from "./item";

export class PVideoItem extends Item implements VideoItem {
  mediaEl: HTMLVideoElement;
  progress: PAnuncioProgress;
  overlayEl?: HTMLElement;

  #muted: boolean = false;
  #id: VideoOptions["id"];
  #state: VideoItem["state"] = "closed";
  #type: "video" = "video" as const;

  constructor(options: VideoOptions) {
    super();
    this.#id = options.id;
    this.overlayEl = options.overlay;

    this.progress = new PAnuncioProgress({ id: "anuncio-progress-for-" + this.#id, max: 100 });
    this.mediaEl = this.#createVideoEl(options.videoUrl);
    this.addNavigationEvents();
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

  get muted() {
    return this.#muted;
  }

  set muted(value: boolean) {
    this.mediaEl.muted = value;
    this.#muted = value;
  }

  get duration() {
    return this.mediaEl.duration;
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
      this.mediaEl.currentTime = 0;
      this.progress.value = 0;
      this.mediaEl.play();
      this.#state = "playing";
    }
  }
}
