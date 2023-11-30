import { ImageItem } from "./items/ImageItem";
import { VideoItem } from "./items/VideoItem";
import { AnuncioConfigOptions, AnuncioItemMap, AnuncioItemOptions } from "./types";
import { Fullscreen, Validator, generateUniqueId } from "./utils";

class Anuncio {
  autostart: boolean;
  container: HTMLDivElement;
  nativeFullScreen: boolean;

  #currentIndex: number = -1;
  #items: AnuncioItemMap;
  #order: (ImageItem["id"] | VideoItem["id"])[];
  #state: "playing" | "closed" | "destroyed" | "paused" = "closed";

  constructor(itemOptionsList: AnuncioItemOptions[], configOptions: AnuncioConfigOptions) {
    Validator.validateItemOptions(itemOptionsList);

    const containerId = configOptions.containerId ?? generateUniqueId();
    const loader = configOptions.loader ?? this.#createLoader(containerId);
    const closeButton = configOptions.closeButton ?? this.#createCloseButton(containerId);

    const configOptionsWithDefaults = { ...configOptions, containerId, loader, closeButton };

    this.nativeFullScreen = configOptions.nativeFullScreen ?? false;
    this.autostart = configOptions.autostart ?? true;
    this.#items = this.#createItemMap(itemOptionsList);
    this.#order = configOptions.order ?? Array.from(this.#items.keys());

    this.container = this.#createContainer(configOptionsWithDefaults);
    document.body.appendChild(this.container);
  }

  get state() {
    return this.#state;
  }

  get order() {
    return this.#order;
  }

  get items(): Record<string, ImageItem | VideoItem> {
    return Object.fromEntries(this.#items.entries());
  }

  get currentItem() {
    if (this.#currentIndex >= 0 && this.#currentIndex < this.#items.size) {
      return this.#items.get(this.#order[this.#currentIndex]);
    }
  }

  set order(newOrder) {
    if (this.#state !== "closed") {
      throw new Error("Order cannot be set when anuncio is " + this.#state);
    }

    this.#order = newOrder;
    this.#order.forEach((itemId, index) => {
      const item = this.#items.get(itemId);
      if (item) item.progressEl.style.order = index.toString();
    });
  }

  #createItemMap(itemOptions: AnuncioItemOptions[]): AnuncioItemMap {
    const items: AnuncioItemMap = new Map();
    itemOptions.forEach((options) => {
      let item: ImageItem | VideoItem;
      if (options.type == "image") {
        item = new ImageItem(options);
      } else {
        item = new VideoItem(options);
      }

      item.addEventListener("play-complete", () => {
        this.playNextItem();
      });

      items.set(item.id, item);
    });

    return items;
  }

  #createLoader(containerId: string) {
    const loader = document.createElement("div");
    loader.classList.add("anuncio-loader-element");
    loader.id = "anuncio-loader-for" + containerId;

    return loader;
  }

  #createCloseButton(containerId: string) {
    const button = document.createElement("button");
    button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" >
      <path d="M376.6 84.5c11.3-13.6 9.5-33.8-4.1-45.1s-33.8-9.5-45.1 4.1L192 206 56.6 43.5C45.3 29.9 25.1 28.1 11.5 39.4S-3.9 70.9 7.4 84.5L150.3 256 7.4 427.5c-11.3 13.6-9.5 33.8 4.1 45.1s33.8 9.5 45.1-4.1L192 306 327.4 468.5c11.3 13.6 31.5 15.4 45.1 4.1s15.4-31.5 4.1-45.1L233.7 256 376.6 84.5z"/>
    </svg>`;

    button.id = "anuncio-close-button-for-" + containerId;
    button.classList.add("anuncio-close-button");

    return button;
  }

  #createContainer(
    configOptions: AnuncioConfigOptions & Required<Pick<AnuncioConfigOptions, "containerId" | "loader" | "closeButton">>
  ) {
    const container = document.createElement("div");
    container.id = configOptions.containerId;
    container.classList.add("anuncio-container-element");
    container.style.display = "none";

    const progressContainer = document.createElement("div");
    progressContainer.classList.add("anuncio-progress-container");
    progressContainer.id = "anuncio-progress-container-" + container.id;

    const overlayContainer = document.createElement("div");
    overlayContainer.classList.add("anuncio-overlay-container");
    overlayContainer.id = "anuncio-overlay-container-" + container.id;

    // Items in dom will be in this order
    // container
    //   progressContainer
    //   closeButton
    //   mediaElements
    //   overlayContainer
    //   loader
    container.append(progressContainer);
    container.append(configOptions.closeButton);
    for (const item of this.#items.values()) {
      item.mediaEl.style.display = "none";
      container.appendChild(item.mediaEl);

      if (item.overlayEl) {
        overlayContainer.appendChild(item.overlayEl);
        item.overlayEl.style.display = "none";
      }
      progressContainer.appendChild(item.progressEl);
    }
    // this calls the setter and sets the order of the progress elements
    this.order = this.#order;
    container.append(overlayContainer);
    container.append(configOptions.loader);

    container.addEventListener("fullscreenchange", () => {
      if (!document.fullscreenElement) this.close();
    });

    configOptions.closeButton.addEventListener("click", () => {
      this.close();
    });

    return container;
  }

  showCurrentItem() {
    if (this.currentItem) {
      if (this.currentItem.overlayEl) this.currentItem.overlayEl.style.display = "block";
      this.currentItem.mediaEl.style.display = "block";
      this.currentItem.mediaEl.classList.add("active-anuncio-item");
    }
  }

  closeCurrentItem() {
    if (this.currentItem) {
      this.currentItem.progress.value = this.currentItem.progress.max;

      this.currentItem.close();
      this.currentItem.mediaEl.style.display = "none";
      this.currentItem.mediaEl.classList.remove("active-anuncio-item");

      if (this.currentItem.overlayEl) this.currentItem.overlayEl.style.display = "none";
    }
  }

  async start() {
    if (this.#state === "closed") {
      this.container.style.display = "block";

      await Fullscreen.tryEnter(this.container, this.nativeFullScreen);
      this.#currentIndex = 0;

      this.#state = "playing";
      if (!this.autostart) this.showCurrentItem();
      else this.#playCurrentItem();
    }
  }

  close() {
    if (this.#state === "playing" || this.#state === "paused") {
      Fullscreen.tryLeave(this.container, this.nativeFullScreen);

      this.#state = "closed";
      this.closeCurrentItem();
      this.#currentIndex = -1;
      this.container.style.display = "none";

      for (const item of this.#items.values()) {
        item.progress.value = 0;
      }
    }
  }

  resume() {
    if (this.#state === "paused") {
      this.#state = "playing";
      this.currentItem?.resume();
    }
  }

  pause() {
    if (this.#state === "playing") {
      this.#state = "paused";
      this.currentItem?.pause();
    }
  }

  #playCurrentItem() {
    if (this.#state !== "destroyed") {
      this.currentItem?.start();
      this.showCurrentItem();
    }
  }

  playNextItem() {
    if (this.#state === "playing") {
      this.closeCurrentItem();

      if (this.#currentIndex < this.#items.size - 1) {
        this.#currentIndex += 1;
        this.#playCurrentItem();
      } else this.close();
    }
  }

  playPreviousItem() {
    if (this.#state === "playing") {
      if (this.#currentIndex > 0) {
        this.closeCurrentItem();
        this.#currentIndex -= 1;
        this.#playCurrentItem();
      }
    }
  }

  destroy() {
    this.currentItem?.close();
    // @ts-expect-error cleanup
    this.#items = null;

    // @ts-expect-error cleanup
    this.container = null;

    this.#state = "destroyed";
  }
}

export { Anuncio, ImageItem, VideoItem };
