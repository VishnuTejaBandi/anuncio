import { ImageItem, VideoItem } from "./items";
export interface CommonOptions {
    /**
     * Unique id to identify the media item. {@link Anuncio.order | order} will contain these ids.
     */
    id: string;
    /**
     * Overlay element that will be shown on top of media when this media is displayed.
     * stopping event bubbling in overlay is upto the developer.
     */
    overlay?: HTMLElement;
}
export interface ImageOptions extends CommonOptions {
    /**
     * URL of the image.
     */
    imageUrl: string;
    videoUrl?: undefined;
    type: "image";
    /**
     * How long should the image be displayed ?
     */
    duration: number;
}
export interface VideoOptions extends CommonOptions {
    /**
     * URL of the video
     */
    videoUrl: string;
    imageUrl?: undefined;
    type: "video";
}
export type AnuncioItemOptions = VideoOptions | ImageOptions;
export interface AnuncioConfigOptions {
    /**
     * Element that will be shown when current media is loading, if not se a default loader will be used.
     *  @example
     * ```javascript
     * import { Anuncio } from "anuncio";
     * import "anuncio/styles/index.css";
     *
     * const loader = document.createElement("div");
     * loader.classList.add("custom-loader-element")
     * loader.innerHTML = "loading..."
     * const anuncio = new Anuncio(
     *   [
     *     {
     *       id: "item1",
     *       videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
     *       type: "video",
     *     }
     *   ],
     *   {
     *     containerId: "anuncio-container",
     *     muted:true,
     *     loader
     *   }
     * );
     * anuncio.start();
     *
     * ```
     * styles for the loader
     * ```scss
     * .custom-loader-element {
     *   display: none;
     * }
     *
     * .active-anuncio-item[data-loading="true"] {
     *  & ~ .custom-loader-element {
     *     display: block;
     *     position: absolute;
     *     top: 50%;
     *     left: 50%;
     *     transform: translate(-50%, -50%);
     *   }
     * }
     *
     * ```
     */
    loader?: HTMLElement;
    /**
     * Id for the container, if not set a uniqueid will be generated which can be accessed later using {@link Anuncio.container | anuncio.container.id}
     */
    containerId?: string;
    /**
     * {@link Anuncio.order | order} in which the media should be played. If not set order will default to the order of {@link AnuncioItemOptions}.
     */
    order?: (ImageItem["id"] | VideoItem["id"])[];
    /**
     * @see {@link Anuncio.autostart}
     */
    autostart?: boolean;
    /**
     * Anuncio instance will be closed on click of this element. Click handler will be attached by anuncio. If not set a defaiult close button will be used.
     */
    closeButton?: HTMLElement;
    /**
     * If this is not set, anuncio will occupy whole viewport instead of going native full screen. @see {@link Anuncio.nativeFullScreen}
     */
    nativeFullScreen?: boolean;
    /**
     * @see {@link Anuncio.muted}
     */
    muted?: boolean;
    /**
     * Anuncio will be appended as a direct descendant to the root. If not set defaults to HTMLBodyElement
     */
    root?: HTMLElement;
    /**
     * Anuncio instance will be muted on click of this element if {@link AnuncioConfigOptions.handleMuteButtonClick} is set to true. If muteButton is unset a default element will be used.\
     * Example below creates a anuncio instance with a custom mute button and custom click handling of the custom mute button(since handleMuteButtonClick is set to false).
     *  @example
     * ```javascript
     * import { Anuncio } from "anuncio";
     * import "anuncio/styles/index.css";
     *
     * const muteButton = document.createElement("button");
     * muteButton.classList.add("custom-mute-button")
     * muteButton.innerHTML = `
     *  <span class="mute"> mute </span>
     *  <span class="unmute"> unmute </span>
     * `
     * const anuncio = new Anuncio(
     *   [
     *     {
     *       id: "item1",
     *       videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
     *       type: "video",
     *     }
     *   ],
     *   {
     *     containerId: "anuncio-container",
     *     muted:true,
     *     handleMuteButtonClick: false,
     *     muteButton
     *   }
     * );
     * muteButton.onclick = () => {console.log("toggling mute"); anuncio.muted = !anuncio.muted;}
     * anuncio.start();
     * ```
     * styles for the mute button
     * ```scss
     * #anuncio-container{
     *   .custom-mute-button {
     *     cursor: pointer;
     *     position: absolute;
     *     left: 10px;
     *     top: 25px;
     *     z-index: 20;
     *     span {
     *       display:none;
     *     }
     *   }
     *
     *   &[data-muted="true"] {
     *     .unmute {
     *       display: block;
     *     }
     *   }
     *
     *   &[data-muted="false"] {
     *     .mute {
     *       display: block;
     *     }
     *   }
     *
     *   img.active-anuncio-item {
     *     & ~ .custom-mute-button {
     *       display: none;
     *     }
     *   }
     * }
     *
     * ```
     */
    muteButton?: HTMLElement;
    /**
     * If this is set to true, on click of {@link AnuncioConfigOptions.closeButton} instance will be closed. To handle the click in a custom way set this to false.
     */
    handleCloseButtonClick?: boolean;
    /**
     * If this is set to true, on click of {@link AnuncioConfigOptions.muteButton} instance will be muted. To handle the click in a custom way set this to false.
     * @see {@link AnuncioConfigOptions.muteButton | Here } for example usage
     */
    handleMuteButtonClick?: boolean;
    /**
     * If set to true, defaults to true.
     * 1. Next item starts playing after completion of first item.
     * 2. Adds these gestures -
     *    - Tap on right side of instance to play next item, closes if current item is last item in order.
     *    - Tap on left side of instance to play previous item.
     *    - Long press anwhere on instance to pause the current item and release to resume.
     */
    defaultNavigation?: boolean;
}
export interface ProgressOptions {
    max?: number;
    id: string;
}
//# sourceMappingURL=options.d.ts.map