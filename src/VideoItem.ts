import { AnuncioEvent, VideoOptions } from "./types";

export class VideoItem {
  autoPlay: boolean;
  mediaEl: HTMLVideoElement;
  progressEl: HTMLProgressElement;

  #id: VideoOptions["id"];
  #state: "playing" | "paused" | "play-queued" | "closed" = "closed";
  #type: "image" = "image" as const;

  constructor(options: VideoOptions) {
    this.#id = options.id;

    this.autoPlay = options.autoPlay ?? true;
    this.progressEl = this.#CreateProgressEl();
    this.mediaEl = this.#createVideoEl(options.videoUrl, this.progressEl);
  }

  #CreateProgressEl() {
    const progress = document.createElement("progress");

    progress.id = "anuncio-progress-for-" + this.#id;
    progress.classList.add("anuncio-progress-element");
    progress.max = 100;
    progress.value = 0;

    return progress;
  }

  #createVideoEl(videoUrl: string, progressEl: HTMLProgressElement) {
    const video = document.createElement("video");
    video.src = videoUrl;
    video.dataset.loading = "true";
    video.id = "anuncio-video-for" + this.#id;

    video.addEventListener("canplay", () => {
      video.dataset.loading = "false";
    });

    video.addEventListener("waiting", () => {
      video.dataset.loading = "true";
    });

    video.addEventListener("ended", () => {
      this.#dispatchEvent("play-complete");
    });

    video.addEventListener("timeupdate", () => {
      if (!progressEl.getAttribute("max")) {
        progressEl.setAttribute("max", video.duration.toString());
      }
      progressEl.value = video.currentTime;
    });

    return video;
  }

  get loading() {
    return this.mediaEl.dataset.loading === "true";
  }

  get id() {
    return this.#id;
  }

  get type() {
    return this.#type;
  }

  close() {
    this.#state = "closed";

    this.mediaEl.style.display = "none";
    this.mediaEl.pause();
    this.mediaEl.currentTime = 0;

    this.progressEl.value = 0;
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
    if (this.#state === "closed") {
      if (this.loading) this.#state = "play-queued";
      else this.mediaEl.play();
    }
  }

  addEventListener(name: AnuncioEvent, handler: () => void) {
    this.mediaEl.addEventListener(name, handler);
  }

  removeEventListener(name: AnuncioEvent, handler: () => void) {
    this.mediaEl.removeEventListener(name, handler);
  }

  #dispatchEvent(name: AnuncioEvent) {
    const event = new Event(name);
    this.mediaEl.dispatchEvent(event);
  }
}
