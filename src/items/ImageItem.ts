import { ImageItem, ImageOptions } from "../types";
import { PAnuncioProgress, Interval } from "../utils";
import { Item } from "./item";

let imagePlayerInterval: Interval | null = null;

export class PImageItem extends Item implements ImageItem {
  mediaEl: HTMLImageElement;
  progress: PAnuncioProgress;
  overlayEl?: HTMLElement;

  #duration: ImageOptions["duration"];
  #id: ImageOptions["id"];
  #state: ImageItem["state"] = "closed";
  #type: "image" = "image" as const;

  constructor(options: ImageOptions) {
    super();
    this.#id = options.id;
    this.#duration = options.duration ?? 5;
    this.overlayEl = options.overlay;

    this.progress = new PAnuncioProgress({ id: "anuncio-progress-for-" + this.#id, max: 100 });
    this.mediaEl = this.#createImageEl(options.imageUrl);
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

  get duration() {
    return this.#duration * 1000;
  }

  #createImageEl(imageUrl: ImageOptions["imageUrl"]) {
    const image = document.createElement("img");
    image.src = imageUrl;
    image.dataset.loading = "true";
    image.id = "anuncio-image-for-" + this.#id;

    image.addEventListener("load", () => {
      image.dataset.loading = "false";

      if (this.#state === "play-queued") this.start();
    });
    return image;
  }

  close() {
    this.#state = "closed";

    // garbage collect interval
    imagePlayerInterval?.destroy();
    imagePlayerInterval = null;
  }

  pause() {
    if (this.#state === "playing") {
      imagePlayerInterval?.pause();
      this.#state = "paused";
    }
  }

  resume() {
    if (this.#state === "paused") {
      imagePlayerInterval?.resume();
      this.#state = "playing";
    }
  }

  start() {
    if (this.#state === "closed" && this.loading) {
      this.#state = "play-queued";
    } else if (this.#state === "closed" || this.#state === "play-queued") {
      this.#state = "playing";
      this.progress.value = 0;

      imagePlayerInterval = new Interval(
        this.#duration * 1000,
        (completion) => {
          if (completion >= this.#duration * 1000) {
            this.dispatchEvent("play-complete");
          } else {
            // updating the progress value with completion percentage
            this.progress.value = completion / (this.#duration * 10);
          }
        },
        1000 / 60
      );
    }
  }
}
