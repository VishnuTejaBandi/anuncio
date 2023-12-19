/**
 * This module exports all the items listed down below
 *
 * @module
 */

import { PImageItem } from "./items/ImageItem";
import { PVideoItem } from "./items/VideoItem";
import { Fullscreen, Validator, generateUniqueId } from "./utils";
import type {
  ImageItem,
  VideoItem,
  AnuncioConfigOptions,
  AnuncioItemMap,
  AnuncioItemOptions,
  AnuncioEventType,
  AnuncioEventListenerMap,
  AnuncioPayloadByType,
} from "./types";

export * from "./types";

const AnuncioInstances: Map<string, Anuncio> = new Map();

/**
 * Class representing an anuncio instance.
 *
 * @example -
 * ```javascript
 * import { Anuncio } from "anuncio";
 * import "anuncio/styles/index.css";
 *
 * const anuncio = new Anuncio(
 *   [
 *     {
 *       id: "item2",
 *       imageUrl: "https://images-assets.nasa.gov/image/iss070e025826/iss070e025826~orig.jpg",
 *       type: "image",
 *       duration: 10
 *     },
 *     {
 *       id: "item3",
 *       imageUrl: "https://images-assets.nasa.gov/image/iss070e025826/iss070e025826~orig.jpg",
 *       type: "image",
 *       duration: 3
 *     },
 *     {
 *       id: "item1",
 *       videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
 *       type: "video",
 *     }
 *   ],
 *   {
 *     containerId: "anuncio-container",
 *     order: ["item1", "item2", "item3"],
 *     muted:true,
 *     autostart: true
 *   });
 * anuncio.start();
 * ```
 */
export class Anuncio {
  /**
   * If autostart is set to true, during the next start of anuncio using anuncio.start() the current media(first item in the order) will start automatically.
   * Set this to false to disable this behaviour and you can start the current media using anuncio.playCurrentItem() whenever you need.
   *
   * Defaults to true
   */
  autostart: boolean;
  nativeFullScreen: boolean;

  #container: HTMLDivElement;
  #currentIndex: number = -1;
  #items: AnuncioItemMap;
  #order: (ImageItem["id"] | VideoItem["id"])[];
  #state: "playing" | "closed" | "destroyed" | "paused" = "closed";
  #muted: boolean = false;
  #maxProgressTrackers: Record<ImageItem["id"] | VideoItem["id"], number> = {};

  /**
   * creates a anuncio instance.
   * @param { (AnuncioItemOptions[]) } itemOptionsList  list of options for video or image
   * @param { AnuncioConfigOptions } configOptions  configuration for anuncio
   */
  constructor(itemOptionsList: AnuncioItemOptions[], configOptions?: AnuncioConfigOptions) {
    Validator.validateItemOptions(itemOptionsList);
    Validator.validateConfigOptions(configOptions);

    const containerId = configOptions?.containerId ?? generateUniqueId();
    const loader = configOptions?.loader ?? this.#createLoader(containerId);
    const closeButton = configOptions?.closeButton ?? this.#createCloseButton(containerId);
    const root = configOptions?.root ?? document.body;
    const muteButton = configOptions?.muteButton ?? this.#createMuteButton(containerId);
    const handleMuteButtonClick = configOptions?.handleMuteButtonClick ?? true;
    const defaultNavigation = configOptions?.defaultNavigation ?? true;
    const handleCloseButtonClick = configOptions?.handleCloseButtonClick ?? true;

    const configOptionsWithDefaults = {
      ...(configOptions ?? {}),
      containerId,
      loader,
      closeButton,
      muteButton,
      handleMuteButtonClick,
      handleCloseButtonClick,
      defaultNavigation,
    };

    this.nativeFullScreen = configOptions?.nativeFullScreen ?? false;
    this.autostart = configOptions?.autostart ?? true;
    this.#items = this.#createItemMap(itemOptionsList);
    this.#order = configOptions?.order ?? Array.from(this.#items.keys());
    this.#container = this.#createContainer(configOptionsWithDefaults);

    // invokes the muted setter, this line must be after container is defined
    this.muted = configOptions?.muted ?? false;

    root.appendChild(this.#container);

    AnuncioInstances.set(containerId, this);
  }

  /**
   * Get the container for the instance.\
   * Mutating this is not advised, may lead to undefined behaviour.
   */
  get container() {
    return this.#container;
  }

  /**
   * Get the current state of the instance
   */
  get state() {
    return this.#state;
  }

  /**
   * Get a structuredClone of the current order. To mutate this property use the order setter.\
   * Order defines the position of media in the player.
   */
  get order() {
    return structuredClone(this.#order);
  }

  /**
   * You can only set the order when anuncio is "closed".
   * @property {string[]} newOrder The new order of media for the player.
   */
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

  /**
   * Get the items in the instance as a object in {id : item} format. \
   * Mutating the item object is not advised.
   */
  get items() {
    const items: Record<string, ImageItem | VideoItem> = {};
    this.#items.forEach((value, key) => {
      items[key] = value;
    });
    return items;
  }

  /**
   * Get the current item. Mutation is not advised.
   */
  get currentItem() {
    if (this.#currentIndex >= 0 && this.#currentIndex < this.#items.size) {
      return this.#items.get(this.#order[this.#currentIndex]) ?? null;
    }
    return null;
  }

  /**
   * is anuncio muted now ?
   */
  get muted() {
    return this.#muted;
  }

  get maxProgressMap() {
    const maxProgressMap: AnuncioPayloadByType<"anuncio-close">["maxProgressMap"] = {};
    for (const key in this.#maxProgressTrackers) {
      const item = this.#items.get(key)!;
      const percentage = this.#maxProgressTrackers[key];
      const duration = Number.isFinite(item.duration) ? item.duration : 0;
      maxProgressMap[key] = { value: (duration * percentage) / 100, percentage };
    }

    return maxProgressMap;
  }

  /**
   * setting this to true mutes the instance, sets data-muted attribute on the container according to the value given.
   * @param {boolean} value - mutes and unmutes the instance if value is true and false respectively
   */
  set muted(value: boolean) {
    this.#muted = value;
    this.#container.dataset.muted = value.toString();

    if (this.#state === "playing" && this.currentItem && this.currentItem.type === "video") {
      this.currentItem.muted = this.#muted;
    }

    this.#dispatchEvent(this.#muted ? "anuncio-mute" : "anuncio-unmute");
  }

  #createItemMap(itemOptions: AnuncioItemOptions[]): AnuncioItemMap {
    const items: AnuncioItemMap = new Map();
    itemOptions.forEach((options) => {
      let item;
      if (options.type == "image") {
        item = new PImageItem(options);
      } else {
        item = new PVideoItem(options);
      }

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

  #createMuteButton(containerId: string) {
    const muteButtonContainer = document.createElement("div");
    muteButtonContainer.classList.add("anuncio-mute-button");
    muteButtonContainer.id = "anuncio-mute-button-for-" + containerId;

    muteButtonContainer.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" class="unmute">
      <rect width="256" height="256" fill="none"/>
      <path d="M80,168H32a8,8,0,0,1-8-8V96a8,8,0,0,1,8-8H80l72-56V224Z" fill="none"  stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
      <line x1="80" y1="88" x2="80" y2="168" fill="none"  stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
      <path d="M192,106.85a32,32,0,0,1,0,42.3" fill="none"  stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
      <path d="M221.67,80a72,72,0,0,1,0,96" fill="none"  stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
    </svg>


    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" class="mute">
      <rect width="256" height="256" fill="none"/>
      <path d="M80,168H32a8,8,0,0,1-8-8V96a8,8,0,0,1,8-8H80l72-56V224Z" fill="none"  stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
      <line x1="240" y1="104" x2="192" y2="152" fill="none"  stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
      <line x1="240" y1="152" x2="192" y2="104" fill="none"  stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
    </svg>
    `;

    return muteButtonContainer;
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
    configOptions: AnuncioConfigOptions &
      Required<
        Pick<
          AnuncioConfigOptions,
          "closeButton" | "containerId" | "defaultNavigation" | "handleCloseButtonClick" | "handleMuteButtonClick" | "loader" | "muteButton"
        >
      >
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

    // Items in dom will be in this order, loader and mutebutton will be displayed according to the current active item using ~ selector, hence loader and mute button are placed after media elements in DOM.
    // container
    //   progressContainer
    //   closeButton
    //   mediaElements
    //   overlayContainer
    //   loader
    //   muteButton
    container.append(progressContainer);
    container.append(configOptions.closeButton);

    this.#items.forEach((item) => {
      item.mediaEl.style.display = "none";
      container.appendChild(item.mediaEl);

      if (item.overlayEl) {
        overlayContainer.appendChild(item.overlayEl);
        item.overlayEl.style.display = "none";
      }
      progressContainer.appendChild(item.progressEl);

      if (configOptions.defaultNavigation) {
        item.addEventListener("play-complete", () => {
          this.playNextItem();
        });

        item.addEventListener("tap-right", () => {
          this.playNextItem();
        });

        item.addEventListener("tap-left", () => {
          this.playPreviousItem();
        });

        item.addEventListener("longpress-start", () => {
          this.pause();
        });

        item.addEventListener("longpress-end", () => {
          this.resume();
        });
      }
    });

    // this calls the setter and sets the order of the progress elements
    this.order = this.#order;
    container.append(overlayContainer);
    container.append(configOptions.loader);
    container.append(configOptions.muteButton);

    container.addEventListener("fullscreenchange", () => {
      if (!document.fullscreenElement) this.close();
    });

    if (configOptions.handleCloseButtonClick)
      configOptions.closeButton.addEventListener("click", (event) => {
        event.stopPropagation();
        this.close();
      });

    if (configOptions.handleMuteButtonClick)
      configOptions.muteButton.addEventListener("click", (event) => {
        event.stopPropagation();
        this.muted = !this.#muted;
      });

    return container;
  }

  /**
   * Makes the current item visible.\
   * !!! DOES NOT START THE CURRENT ITEM, ONLY SHOWS IT !!!
   */
  showCurrentItem() {
    if (this.currentItem) {
      if (this.currentItem.overlayEl) this.currentItem.overlayEl.style.display = "block";
      this.currentItem.mediaEl.style.display = "block";
      this.currentItem.mediaEl.classList.add("active-anuncio-item");
      this.currentItem.progressEl.classList.add("active-progress-item");
    }
  }

  /**
   * Closes the current item and hides it.
   */
  closeCurrentItem() {
    if (this.currentItem) {
      this.#maxProgressTrackers[this.currentItem.id] = Math.max(
        this.#maxProgressTrackers[this.currentItem.id] ?? 0,
        this.currentItem.progress.value
      );
      this.currentItem.progress.value = this.currentItem.progress.max;
      this.currentItem.progressEl.classList.remove("active-progress-item");

      this.currentItem.close();
      this.currentItem.mediaEl.style.display = "none";
      this.currentItem.mediaEl.classList.remove("active-anuncio-item");

      if (this.currentItem.overlayEl) this.currentItem.overlayEl.style.display = "none";

      this.#dispatchEvent("anuncio-item-close", { closedItem: this.currentItem });
    }
  }

  /**
   * 1. Makes the instance visible and sets the current item as the first item in order
   * 2. Displays the current item.
   * 3. Starts the current item if autostart is set to true.
   */
  async start() {
    if (this.#state === "closed") {
      this.#container.style.display = "block";

      await Fullscreen.tryEnter(this.#container, this.nativeFullScreen);
      this.#currentIndex = 0;

      this.#state = "playing";
      if (!this.autostart) this.showCurrentItem();
      else this.playCurrentItem();

      this.#dispatchEvent("anuncio-start");
    }
  }

  /**
   * 1. Hides the instance and sets the current item to null.
   * 2. Resets the progress of each item to 0.
   */
  close() {
    if (this.#state === "playing" || this.#state === "paused") {
      Fullscreen.tryLeave(this.#container, this.nativeFullScreen);

      this.#state = "closed";
      this.closeCurrentItem();
      this.#container.style.display = "none";

      this.#items.forEach((item) => {
        item.progress.value = 0;
      });

      this.#dispatchEvent("anuncio-close", { maxProgressMap: this.maxProgressMap });
    }
  }

  /**
   * Resumes the instance.
   */
  resume() {
    if (this.#state === "paused") {
      this.#state = "playing";
      this.currentItem?.resume();
      this.#dispatchEvent("anuncio-item-resume");
    }
  }

  /**
   * Pauses the instance.
   */
  pause() {
    if (this.#state === "playing") {
      this.#state = "paused";
      this.currentItem?.pause();
      this.#dispatchEvent("anuncio-item-pause");
    }
  }

  /**
   * Makes the current item visible and starts the current item
   */
  playCurrentItem() {
    if (this.#state === "playing") {
      if (this.currentItem && this.currentItem.type === "video") this.currentItem.muted = this.#muted;
      this.currentItem?.start();
      this.showCurrentItem();

      this.#dispatchEvent("anuncio-item-start", { startedItem: this.currentItem! });
    }
  }

  /**
   * plays the next item in order and closes the current item
   */
  playNextItem() {
    if (this.#state === "playing") {
      this.closeCurrentItem();

      if (this.#currentIndex < this.#items.size - 1) {
        this.#currentIndex += 1;
        this.playCurrentItem();
      } else {
        this.close();
      }
    }
  }

  /**
   * plays the previous item in order and closes the current item
   */
  playPreviousItem() {
    if (this.#state === "playing") {
      if (this.#currentIndex > 0) {
        this.closeCurrentItem();
        this.#currentIndex -= 1;
        this.playCurrentItem();
      }
    }
  }

  /**
   * Closes the instance and leaves the items to garbage collect
   */
  destroy() {
    this.close();
    // @ts-expect-error cleanup
    this.#items = null;

    // @ts-expect-error cleanup
    this.#container = null;

    this.#state = "destroyed";

    AnuncioInstances.delete(this.container.id);
  }

  addEventListener<E extends AnuncioEventType>(name: E, listener: AnuncioEventListenerMap[E]) {
    this.#container.addEventListener(name, listener as EventListener);
  }

  removeEventListener<E extends AnuncioEventType>(name: E, listener: AnuncioEventListenerMap[E]) {
    this.#container.removeEventListener(name, listener as EventListener);
  }

  #dispatchEvent<E extends AnuncioEventType>(type: E, payload?: AnuncioPayloadByType<E>) {
    window.setTimeout(() => {
      const event = new CustomEvent(type, { detail: payload });
      this.#container.dispatchEvent(event);
    });
  }

  static getInstance(containerId: string) {
    return AnuncioInstances.get(containerId);
  }
}
