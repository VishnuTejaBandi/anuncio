import "./utils/progress";
import { ImageItem } from "./items/ImageItem";
import { VideoItem } from "./items/VideoItem";
import { AnuncioConfigOptions, AnuncioItemMap, AnuncioItemOptions } from "./types";
import { Fullscreen, generateUniqueId } from "./utils";

class Anuncio {
  autostart: boolean;
  items: AnuncioItemMap;

  container: HTMLDivElement;
  #currentIndex: number = -1;
  #order: (ImageItem["id"] | VideoItem["id"])[];
  #state: "playing" | "closed" | "destroyed" | "paused" = "closed";
  nativeFullScreen: boolean;

  constructor(itemOptions: AnuncioItemOptions[], configOptions: AnuncioConfigOptions) {
    const containerId = configOptions.containerId ?? generateUniqueId();
    const loader = configOptions.loader ?? this.#createLoader(containerId);
    const closeButton = configOptions.closeButton ?? this.#createCloseButton(containerId);

    const configOptionsWithDefaults = { ...configOptions, containerId, loader, closeButton };

    this.nativeFullScreen = configOptions.nativeFullScreen ?? false;
    this.autostart = configOptions.autostart ?? true;
    this.items = this.#createItemMap(itemOptions);
    this.#order = configOptions.order ?? Array.from(this.items.keys());

    this.container = this.#createContainer(configOptionsWithDefaults);
    document.body.appendChild(this.container);
  }

  get state() {
    return this.#state;
  }

  get order() {
    return this.#order;
  }

  set order(newOrder) {
    if (this.#state !== "closed") {
      throw new Error("Order cannot be set when anuncio is " + this.#state);
    }

    this.#order = newOrder;
    this.#order.forEach((itemId, index) => {
      const item = this.items.get(itemId);
      if (item) item.progressEl.style.order = index.toString();
    });
  }

  get currentItem() {
    if (this.#currentIndex >= 0 && this.#currentIndex < this.items.size) {
      return this.items.get(this.#order[this.#currentIndex]);
    }
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
    button.innerText = "X";
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
    container.addEventListener("fullscreenchange", () => {
      if (!document.fullscreenElement) this.close();
    });

    const progressContainer = document.createElement("div");
    progressContainer.classList.add("anuncio-progress-container");
    progressContainer.id = "anuncio-progress-container-" + container.id;
    container.append(progressContainer);

    configOptions.closeButton.addEventListener("click", () => {
      this.close();
    });
    container.append(configOptions.closeButton);

    for (const item of this.items.values()) {
      progressContainer.appendChild(item.progressEl);
      container.appendChild(item.mediaEl);
    }
    // this calls the setter and sets the order of the progress elements
    this.order = this.#order;

    container.append(configOptions.loader);

    return container;
  }

  showCurrentItem() {
    if (this.currentItem) {
      this.currentItem.mediaEl.style.display = "block";
      this.currentItem.mediaEl.classList.add("active-anuncio-item");
    }
  }

  closeCurrentItem() {
    if (this.currentItem) {
      this.currentItem.close();
      this.currentItem.mediaEl.style.display = "none";
      this.currentItem.mediaEl.classList.remove("active-anuncio-item");
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
    if (this.#state === "playing") {
      Fullscreen.tryLeave(this.container, this.nativeFullScreen);

      this.#state = "closed";
      this.closeCurrentItem();
      this.#currentIndex = -1;
      this.container.style.display = "none";
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
    this.closeCurrentItem();

    if (this.#currentIndex < this.items.size - 1! && this.#state !== "destroyed") {
      this.#currentIndex += 1;
      this.#playCurrentItem();
    } else {
      this.close();
      return;
    }
  }

  playPreviousItem() {
    this.closeCurrentItem();

    if (this.#currentIndex >= 0 && this.#state !== "destroyed") {
      this.#currentIndex -= 1;
      this.#playCurrentItem();
    }
  }

  destroy() {
    this.currentItem?.close();
    // @ts-expect-error cleanup
    this.items = null;

    // @ts-expect-error cleanup
    this.container = null;

    this.#state = "destroyed";
  }
}

export { Anuncio, ImageItem, VideoItem };
