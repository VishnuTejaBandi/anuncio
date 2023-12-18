/**
 * This module exports all the items listed down below
 *
 * @module
 */
import type { ImageItem, VideoItem, AnuncioConfigOptions, AnuncioItemOptions, AnuncioEventType, AnuncioEventListenerMap } from "./types";
export * from "./types";
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
export declare class Anuncio {
    #private;
    /**
     * If autostart is set to true, during the next start of anuncio using anuncio.start() the current media(first item in the order) will start automatically.
     * Set this to false to disable this behaviour and you can start the current media using anuncio.playCurrentItem() whenever you need.
     *
     * Defaults to true
     */
    autostart: boolean;
    nativeFullScreen: boolean;
    /**
     * creates a anuncio instance.
     * @param { (AnuncioItemOptions[]) } itemOptionsList  list of options for video or image
     * @param { AnuncioConfigOptions } configOptions  configuration for anuncio
     */
    constructor(itemOptionsList: AnuncioItemOptions[], configOptions: AnuncioConfigOptions);
    /**
     * Get the container for the instance.\
     * Mutating this is not advised, may lead to undefined behaviour.
     */
    get container(): HTMLDivElement;
    /**
     * Get the current state of the instance
     */
    get state(): "playing" | "closed" | "destroyed" | "paused";
    /**
     * Get a structuredClone of the current order. To mutate this property use the order setter.\
     * Order defines the position of media in the player.
     */
    get order(): string[];
    /**
     * You can only set the order when anuncio is "closed".
     * @property {string[]} newOrder The new order of media for the player.
     */
    set order(newOrder: string[]);
    /**
     * Get the items in the instance as a object in {id : item} format. \
     * Mutating the item object is not advised.
     */
    get items(): Record<string, ImageItem | VideoItem>;
    /**
     * Get the current item. Mutation is not advised.
     */
    get currentItem(): ImageItem | VideoItem | null;
    /**
     * is anuncio muted now ?
     */
    get muted(): boolean;
    get maxProgressMap(): Record<string, {
        percentage: number;
        value: number;
    }>;
    /**
     * setting this to true mutes the instance, sets data-muted attribute on the container according to the value given.
     * @param {boolean} value - mutes and unmutes the instance if value is true and false respectively
     */
    set muted(value: boolean);
    /**
     * Makes the current item visible.\
     * !!! DOES NOT START THE CURRENT ITEM, ONLY SHOWS IT !!!
     */
    showCurrentItem(): void;
    /**
     * Closes the current item and hides it.
     */
    closeCurrentItem(): void;
    /**
     * 1. Makes the instance visible and sets the current item as the first item in order
     * 2. Displays the current item.
     * 3. Starts the current item if autostart is set to true.
     */
    start(): Promise<void>;
    /**
     * 1. Hides the instance and sets the current item to null.
     * 2. Resets the progress of each item to 0.
     */
    close(): void;
    /**
     * Resumes the instance.
     */
    resume(): void;
    /**
     * Pauses the instance.
     */
    pause(): void;
    /**
     * Makes the current item visible and starts the current item
     */
    playCurrentItem(): void;
    /**
     * plays the next item in order and closes the current item
     */
    playNextItem(): void;
    /**
     * plays the previous item in order and closes the current item
     */
    playPreviousItem(): void;
    /**
     * Closes the instance and leaves the items to garbage collect
     */
    destroy(): void;
    addEventListener<E extends AnuncioEventType>(name: E, listener: AnuncioEventListenerMap[E]): void;
    removeEventListener<E extends AnuncioEventType>(name: E, listener: AnuncioEventListenerMap[E]): void;
    static getInstance(containerId: string): Anuncio | undefined;
}
//# sourceMappingURL=index.d.ts.map