import { AnuncioItemOptions, ImageItem, VideoItem, AnuncioItem, AnuncioItemOrder } from "./types";
import { Fullscreen, Interval, Validator, generateUniqueId } from "./utils";

type AnuncioElement = "mediaEl" | "progressEl" | "overlayEl";

export class Anuncio {
  #data: Record<AnuncioItem["id"], AnuncioItem> = {};
  /**
   *The container for all the anuncio elements(progress, media, overlay, loader).\
   *This container will be appended to document body.
   */
  container: HTMLDivElement;
  #currentIndex: number;
  #order: AnuncioItemOrder;
  #imagePlayerInterval: Interval | null = null;
  /**
   *The destroyed status of the instance, calling any public method on a destroyed
   *  anucio instance will throw error.
   */
  destroyed: boolean = false;

  constructor(items: AnuncioItemOptions[], order?: AnuncioItemOrder) {
    Validator.validateItems(items);

    this.#populateInitialData(items);
    this.container = this.#createAnuncioContainer();
    this.#currentIndex = -1;
    // TODO validate order
    this.#order = order ?? Object.keys(this.#data);
    document.body.append(this.container);
  }

  #populateInitialData(items: AnuncioItemOptions[]) {
    this.#data = {};

    items.forEach((item) => {
      let _item;
      if (item.type === "image") _item = this.#renderImageItem({ ...item, loading: true, duration: 5 });
      else _item = this.#renderVideoItem({ ...item, loading: true });

      if (this.#data[_item.id]) throw new Error("duplicate id" + _item.id);
      else this.#data[_item.id] = _item;
    });
  }

  #createImageProgressElement(item: Omit<ImageItem, AnuncioElement>) {
    const progress = document.createElement("progress");

    progress.id = "anuncio-progress-for-" + item.id;
    progress.classList.add("anuncio-progress-element");
    progress.setAttribute("min", "0");
    progress.setAttribute("max", "100");
    progress.value = 0;

    return progress;
  }

  #tryPlayImage(item: ImageItem) {
    if (item.loading) return;

    this.#imagePlayerInterval = new Interval(
      item.duration * 1000,
      (completion) => {
        if (completion >= item.duration * 1000) {
          this.playNextItem();
        } else {
          // updating the progress value with completion percentage
          item.progressEl.value = completion / (item.duration * 10);
        }
      },
      item.duration * 5
    );
  }

  #createImageElement(item: Omit<ImageItem, AnuncioElement>) {
    const image = document.createElement("img");
    image.id = "anuncio-image-for-" + item.id;

    image.src = item.imageUrl;
    image.dataset.loading = "true";

    image.addEventListener("load", () => {
      image.dataset.loading = "false";
      item.loading = false;

      if (this.#currentIndex < 0) return;

      const currentItem = this.#data[this.#order[this.#currentIndex]];
      if (currentItem.type === "image" && currentItem.id === item.id) this.#tryPlayImage(currentItem);
    });

    return image;
  }

  #renderImageItem(item: Omit<ImageItem, AnuncioElement>): ImageItem {
    return Object.assign(item, {
      progressEl: this.#createImageProgressElement(item),
      mediaEl: this.#createImageElement(item),
    });
  }

  #createVideoElement(item: Omit<VideoItem, AnuncioElement>) {
    const video = document.createElement("video");
    video.id = "anuncio-video-for-" + item.id;
    video.src = item.videoUrl;
    video.dataset.loading = "true";

    video.addEventListener("waiting", () => {
      item.loading = true;
      video.dataset.loading = "true";
    });

    video.addEventListener("canplay", () => {
      item.loading = false;
      video.dataset.loading = "false";
    });

    video.addEventListener("ended", this.playNextItem);

    return video;
  }

  #createVideoProgressElement(item: Omit<VideoItem, Exclude<AnuncioElement, "mediaEl">>) {
    const progress = document.createElement("progress");
    progress.id = "anuncio-progress-for-" + item.id;
    progress.classList.add("anuncio-progress-element");
    progress.setAttribute("min", "0");
    progress.value = 0;

    item.mediaEl.addEventListener("timeupdate", () => {
      if (!progress.getAttribute("max")) {
        progress.setAttribute("max", item.mediaEl.duration.toString());
      }

      progress.value = item.mediaEl.currentTime;
    });

    return progress;
  }

  #renderVideoItem(item: Omit<VideoItem, AnuncioElement>): VideoItem {
    const videoItemWithoutProgress = Object.assign(item, { mediaEl: this.#createVideoElement(item) });
    return Object.assign(videoItemWithoutProgress, {
      progressEl: this.#createVideoProgressElement(videoItemWithoutProgress),
    });
  }

  #createAnuncioContainer() {
    const container = document.createElement("div");
    container.id = generateUniqueId();
    container.classList.add("anuncio-container-element");

    // progress elements
    const progressContainer = document.createElement("div");
    progressContainer.classList.add("anuncio-progress-container");
    progressContainer.append(...Object.values(this.#data).map((item) => item.progressEl));
    progressContainer.id = "anuncio-progress-container-" + container.id;
    container.append(progressContainer);

    // media elements
    container.append(...Object.values(this.#data).map((item) => item.mediaEl));

    // loader
    // TODO make loader configurable
    const loader = document.createElement("div");
    loader.id = "anuncio-loader-" + container.id;
    loader.classList.add("anuncio-loader");
    container.append(loader);

    // cleanup anuncio when leaving fullscreen mode
    container.addEventListener("fullscreenchange", () => {
      if (!document.fullscreenElement) this.close();
    });

    return container;
  }

  #playItemAtIndex(index: number) {
    // TODO callback before play item

    const item = this.#data[this.#order[index]];
    if (item.type === "video") {
      item.mediaEl.play();
    } else {
      this.#tryPlayImage(item);
    }

    item.mediaEl.classList.add("active-anuncio-item");
    item.mediaEl.style.display = "block";
  }

  /**
   *Hides the current playing item and plays the next item.\
   *If the current item is current item is the last item in order, closes the anuncio instance.
   */
  playNextItem() {
    if (this.destroyed) throw new Error("cannot use play on destroyed instance");

    this.#closeItemAtIndex(this.#currentIndex);
    if (this.#currentIndex < this.#order.length - 1) {
      this.#currentIndex += 1;
      this.#playItemAtIndex(this.#currentIndex);
    } else if (this.#currentIndex === this.#order.length - 1) {
      this.close();
    }
  }

  /**
   *Hides the current playing item and plays the previous item.\
   *If the current item is current item is the first item in order, nothing happens.
   */
  playPreviousItem() {
    if (this.destroyed) throw new Error("cannot use play on destroyed instance");

    if (this.#currentIndex <= 0) return;
    this.#closeItemAtIndex(this.#currentIndex);
    this.#currentIndex -= 1;
    this.#playItemAtIndex(this.#currentIndex);
  }

  pause() {
    if (this.destroyed) throw new Error("cannot pause on destroyed instance");
    if (this.#currentIndex < 0) return;

    const currentItem = this.#data[this.#order[this.#currentIndex]];
    if (currentItem.type === "video") {
      currentItem.mediaEl.pause();
    } else {
      this.#imagePlayerInterval?.pause();
    }
  }

  resume() {
    if (this.destroyed) throw new Error("cannot resume on destroyed instance");
    if (this.#currentIndex < 0) return;

    const currentItem = this.#data[this.#order[this.#currentIndex]];
    if (currentItem.type === "video") {
      currentItem.mediaEl.play();
    } else {
      this.#imagePlayerInterval?.resume();
    }
  }

  async play() {
    if (this.destroyed) throw new Error("cannot use play on destroyed instance");

    await Fullscreen.tryEnter(this.container);
    this.container.style.display = "block";

    this.#currentIndex = 0;
    this.#playItemAtIndex(this.#currentIndex);
  }

  #closeItemAtIndex(index: number) {
    const item = this.#data[this.#order[index]];

    if (item.type === "video") {
      item.mediaEl.pause();
      item.mediaEl.currentTime = 0;
    } else {
      item.progressEl.value = 0;
      this.#imagePlayerInterval?.destroy();
    }

    // TODO make this class configurable
    item.mediaEl.classList.remove("active-anuncio-item");
    item.mediaEl.style.display = "none";
  }

  /**
   *!!!! this method cannot be called on destroyed instances !!!!\
   *- This method does these things:
   *  1. leaves fullscreen
   *  2. hides container element
   *  3. cleansup current playing item -> resets progress, seeks video to 0
   */
  async close() {
    if (this.destroyed) throw new Error("cannot use close on destroyed instance");

    await Fullscreen.tryLeave(this.container);

    if (this.#currentIndex > -1) {
      //TODO callback before close
      this.#closeItemAtIndex(this.#currentIndex);
      this.container.style.display = "none";
      this.#currentIndex = -1;
    }
  }

  async destroy() {
    await this.close();
    const container = this.container;

    // @ts-expect-error cleanup - when garbage collecting the container all its events will also be removed
    this.container = null;
    // @ts-expect-error cleanup - when garbage collecting the elements all its events will also be removed
    this.#data = null;
    this.destroyed = true;

    container.remove();
  }
}
