/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol */


function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __classPrivateFieldGet(receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}

function __classPrivateFieldSet(receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

/**
 * @private
 */
const Validator = {
    validateItemOptions(itemOptionsList) {
        if (!Array.isArray(itemOptionsList))
            throw new Error("itemOptionsList must be an array");
        itemOptionsList.forEach((itemOptions, index) => {
            if (!this.isObject(itemOptions))
                throw new Error(`invalid options at ${index}`);
            const { type } = itemOptions;
            let error = this.validateCommonOptions(itemOptions);
            if (!error)
                if (type === "image") {
                    error = Validator.validateImageOptions(itemOptions);
                }
                else if (type === "video") {
                    error = Validator.validateVideoOptions(itemOptions);
                }
                else {
                    error = `Unknown item type ${type}`;
                }
            if (error) {
                throw new Error(`${error} at index ${index}`);
            }
        });
    },
    validateConfigOptions(options) {
        if (!options)
            return;
        if (!this.isObject(options))
            throw new Error("invalid config options");
        const { autostart, closeButton, containerId, loader, nativeFullScreen, muted, defaultNavigation, handleCloseButtonClick, handleMuteButtonClick, } = options;
        if (autostart !== undefined && typeof autostart !== "boolean")
            throw new Error("autostart if present must be a valid boolean");
        if (muted !== undefined && typeof muted !== "boolean")
            throw new Error("muted if present must be a valid boolean");
        if (nativeFullScreen !== undefined && typeof nativeFullScreen !== "boolean")
            throw new Error("nativeFullScreen if present must be a valid boolean");
        if (defaultNavigation !== undefined && typeof defaultNavigation !== "boolean")
            throw new Error("defaultNavigation if present must be a valid boolean");
        if (handleCloseButtonClick !== undefined && typeof handleCloseButtonClick !== "boolean")
            throw new Error("handleCloseButtonClick if present must be a valid boolean");
        if (handleMuteButtonClick !== undefined && typeof handleMuteButtonClick !== "boolean")
            throw new Error("handleMuteButtonClick if present must be a valid boolean");
        if (closeButton !== undefined && !(closeButton instanceof HTMLElement))
            throw new Error("closeButton if present must be a html element");
        if (loader !== undefined && !(loader instanceof HTMLElement))
            throw new Error("loader if present must be a html element");
        if (containerId !== undefined && !this.validateForNonEmptyString(containerId))
            throw new Error("containerId if present must be a non empty string");
        if (containerId) {
            options.containerId = containerId.replace(/ /g, "");
        }
    },
    validateCommonOptions(options) {
        const { id, overlay } = options;
        if (!this.validateForNonEmptyString(id))
            return "id must be a string";
        options.id = id.replace(/ /g, "");
        if (overlay !== undefined && !(overlay instanceof HTMLElement))
            return "overlay if present must be a HTML element";
        return null;
    },
    validateImageOptions(options) {
        const { imageUrl, duration } = options;
        if (!this.validateForNonEmptyString(imageUrl))
            return "imageUrl is not a valid string";
        if (!this.isNumber(duration) || duration <= 0)
            return "duration must be a positive integer";
        return null;
    },
    validateVideoOptions(options) {
        const { videoUrl } = options;
        if (!this.validateForNonEmptyString(videoUrl))
            return "videoUrl is not a valid string";
        return null;
    },
    validateForNonEmptyString(item) {
        return this.isString(item) && item.trim().length !== 0;
    },
    isNumber(x) {
        return typeof x === "number";
    },
    isString(x) {
        return typeof x === "string";
    },
    isNumeric(str) {
        if (typeof str === "number")
            return true;
        if (typeof str === "string")
            return Number.isFinite(parseFloat(str));
        return false;
    },
    isObject(item) {
        return typeof item === "object" && item !== null;
    },
};

let counter = 0;
function generateUniqueId() {
    counter += 1;
    return `anuncio-stories-${counter}`;
}

const Fullscreen = {
    tryEnter(el, nativeFullScreen) {
        if (!nativeFullScreen) {
            return el.classList.add("anuncio-span-full-screen");
        }
        if (this.getCurrentFullScreenElement())
            return;
        if ("requestFullscreen" in el && typeof el.requestFullscreen == "function") {
            return el.requestFullscreen();
        }
        else if ("mozRequestFullScreen" in el && typeof el.mozRequestFullScreen == "function") {
            return el.mozRequestFullScreen();
        }
        else if ("webkitRequestFullScreen" in el && typeof el.webkitRequestFullScreen == "function") {
            return el.webkitRequestFullScreen();
        }
        else if ("msRequestFullscreen" in el && typeof el.msRequestFullscreen == "function") {
            return el.msRequestFullscreen();
        }
    },
    tryLeave(el, nativeFullScreen) {
        if (!nativeFullScreen) {
            return el.classList.remove("anuncio-span-full-screen");
        }
        if (this.getCurrentFullScreenElement() !== el)
            return;
        if ("exitFullscreen" in document && typeof document.exitFullscreen == "function") {
            return document.exitFullscreen();
        }
        else if ("webkitExitFullscreen" in document && typeof document.webkitExitFullscreen == "function") {
            return document.webkitExitFullscreen();
        }
        else if ("mozCancelFullScreen" in document && typeof document.mozCancelFullScreen == "function") {
            return document.mozCancelFullScreen();
        }
        else if ("msExitFullscreen" in document && typeof document.msExitFullscreen == "function") {
            document.msExitFullscreen();
        }
    },
    getCurrentFullScreenElement() {
        return (document.fullscreenElement ||
            ("webkitFullscreenElement" in document && document.webkitFullscreenElement) ||
            ("mozFullScreenElement" in document && document.mozFullScreenElement) ||
            ("msFullscreenElement" in document && document.msFullscreenElement));
    },
};

var _Interval_instances, _Interval_startingTime, _Interval_intervalId, _Interval_state, _Interval_pausedAt, _Interval_offset, _Interval_start;
class Interval {
    /**
     *Starts a interval that can be paused.\
     *Destroys the timer on completion.
     */
    constructor(duration, 
    /**
     * callback that will be called when interval is elapsed
     * @param {number} completion - duration in ms
     */
    onInterval, precision = 30) {
        _Interval_instances.add(this);
        this.duration = duration;
        this.onInterval = onInterval;
        this.precision = precision;
        _Interval_startingTime.set(this, -1);
        _Interval_intervalId.set(this, -1);
        _Interval_state.set(this, "stopped");
        _Interval_pausedAt.set(this, -1);
        _Interval_offset.set(this, 0);
        __classPrivateFieldGet(this, _Interval_instances, "m", _Interval_start).call(this);
    }
    pause() {
        if (__classPrivateFieldGet(this, _Interval_state, "f") === "paused")
            throw new Error("Timer is already paused");
        if (__classPrivateFieldGet(this, _Interval_state, "f") === "destroyed")
            throw new Error("cannot call pause method on a destroyed timer");
        __classPrivateFieldSet(this, _Interval_state, "paused", "f");
        __classPrivateFieldSet(this, _Interval_pausedAt, +new Date(), "f");
    }
    resume() {
        if (__classPrivateFieldGet(this, _Interval_state, "f") === "destroyed")
            throw new Error("cannot call resume method on a destroyed timer");
        if (__classPrivateFieldGet(this, _Interval_state, "f") !== "paused")
            throw new Error("cannot resume timer that has not started and running");
        __classPrivateFieldSet(this, _Interval_state, "running", "f");
        __classPrivateFieldSet(this, _Interval_offset, __classPrivateFieldGet(this, _Interval_offset, "f") + (+new Date() - __classPrivateFieldGet(this, _Interval_pausedAt, "f")), "f");
    }
    destroy() {
        if (__classPrivateFieldGet(this, _Interval_state, "f") === "destroyed")
            return;
        window.clearInterval(__classPrivateFieldGet(this, _Interval_intervalId, "f"));
        __classPrivateFieldSet(this, _Interval_state, "destroyed", "f");
    }
}
_Interval_startingTime = new WeakMap(), _Interval_intervalId = new WeakMap(), _Interval_state = new WeakMap(), _Interval_pausedAt = new WeakMap(), _Interval_offset = new WeakMap(), _Interval_instances = new WeakSet(), _Interval_start = function _Interval_start() {
    __classPrivateFieldSet(this, _Interval_startingTime, +new Date(), "f");
    __classPrivateFieldSet(this, _Interval_state, "running", "f");
    __classPrivateFieldSet(this, _Interval_intervalId, window.setInterval(() => {
        if (__classPrivateFieldGet(this, _Interval_state, "f") === "paused")
            return;
        const currentTime = +new Date();
        const completion = currentTime - __classPrivateFieldGet(this, _Interval_startingTime, "f") - __classPrivateFieldGet(this, _Interval_offset, "f");
        this.onInterval(completion);
        if (completion >= this.duration) {
            this.destroy();
        }
    }, this.precision), "f");
};

var _PAnuncioProgress_instances, _PAnuncioProgress_value, _PAnuncioProgress_max, _PAnuncioProgress_createProgressElement;
const PROGRESS_CSS_VAR = "--progress-percentage";
class PAnuncioProgress {
    constructor(options) {
        var _a;
        _PAnuncioProgress_instances.add(this);
        _PAnuncioProgress_value.set(this, 0);
        _PAnuncioProgress_max.set(this, void 0);
        __classPrivateFieldSet(this, _PAnuncioProgress_max, (_a = options.max) !== null && _a !== void 0 ? _a : 100, "f");
        this.element = __classPrivateFieldGet(this, _PAnuncioProgress_instances, "m", _PAnuncioProgress_createProgressElement).call(this, options.id);
        // invokes the setter with value 0
        this.value = 0;
    }
    get value() {
        return __classPrivateFieldGet(this, _PAnuncioProgress_value, "f");
    }
    set value(value) {
        const percentage = value < __classPrivateFieldGet(this, _PAnuncioProgress_max, "f") ? (value * 100) / __classPrivateFieldGet(this, _PAnuncioProgress_max, "f") : 100;
        this.element.dataset.value = percentage.toString();
        this.element.style.setProperty(PROGRESS_CSS_VAR, `${percentage.toString()}%`);
        __classPrivateFieldSet(this, _PAnuncioProgress_value, value, "f");
    }
    get max() {
        return __classPrivateFieldGet(this, _PAnuncioProgress_max, "f");
    }
    set max(max) {
        this.element.dataset.max = __classPrivateFieldGet(this, _PAnuncioProgress_max, "f").toString();
        __classPrivateFieldSet(this, _PAnuncioProgress_max, max, "f");
    }
}
_PAnuncioProgress_value = new WeakMap(), _PAnuncioProgress_max = new WeakMap(), _PAnuncioProgress_instances = new WeakSet(), _PAnuncioProgress_createProgressElement = function _PAnuncioProgress_createProgressElement(id) {
    const element = document.createElement("div");
    element.classList.add("anuncio-progress-element");
    element.id = id;
    element.dataset.max = __classPrivateFieldGet(this, _PAnuncioProgress_max, "f").toString();
    return element;
};

let mouseDownElement = null;
class Item {
    constructor() {
        this.mediaEl = null;
        this.longPressTimeout = null;
    }
    addEventListener(name, handler) {
        var _a;
        (_a = this.mediaEl) === null || _a === void 0 ? void 0 : _a.addEventListener(name, handler);
    }
    removeEventListener(name, handler) {
        var _a;
        (_a = this.mediaEl) === null || _a === void 0 ? void 0 : _a.removeEventListener(name, handler);
    }
    dispatchEvent(name) {
        var _a;
        const event = new Event(name);
        (_a = this.mediaEl) === null || _a === void 0 ? void 0 : _a.dispatchEvent(event);
    }
    addNavigationEvents() {
        var _a, _b, _c, _d, _e, _f;
        // returns true if a longpress has been cleared
        const clearLongpress = () => {
            var _a;
            if (this.longPressTimeout != null) {
                window.clearTimeout(this.longPressTimeout);
                this.longPressTimeout = null;
            }
            if ((_a = this.mediaEl) === null || _a === void 0 ? void 0 : _a.classList.contains("longpress")) {
                this.mediaEl.classList.remove("longpress");
                return true;
            }
            return false;
        };
        const mousedown = (event) => {
            event.preventDefault();
            mouseDownElement = this.mediaEl;
            this.longPressTimeout = window.setTimeout(() => {
                var _a;
                this.dispatchEvent("longpress-start");
                (_a = this.mediaEl) === null || _a === void 0 ? void 0 : _a.classList.add("longpress");
            }, 300);
        };
        (_a = this.mediaEl) === null || _a === void 0 ? void 0 : _a.addEventListener("mousedown", mousedown);
        (_b = this.mediaEl) === null || _b === void 0 ? void 0 : _b.addEventListener("touchstart", mousedown);
        const mouseleave = (event) => {
            event.preventDefault();
            mouseDownElement = null;
            if (clearLongpress())
                this.dispatchEvent("longpress-end");
        };
        (_c = this.mediaEl) === null || _c === void 0 ? void 0 : _c.addEventListener("mouseleave", mouseleave);
        (_d = this.mediaEl) === null || _d === void 0 ? void 0 : _d.addEventListener("touchcancel", mouseleave);
        const mouseup = (event) => {
            event.preventDefault();
            if (mouseDownElement !== this.mediaEl)
                return;
            mouseDownElement = null;
            if (clearLongpress()) {
                this.dispatchEvent("longpress-end");
            }
            else {
                let x;
                if (event instanceof MouseEvent) {
                    x = event.clientX;
                }
                else {
                    x = event.changedTouches[0].clientX;
                }
                const { left, right } = this.mediaEl.getBoundingClientRect();
                const position = ((x - left) / (right - left)) * 100;
                if (position > 30)
                    this.dispatchEvent("tap-right");
                else
                    this.dispatchEvent("tap-left");
            }
        };
        (_e = this.mediaEl) === null || _e === void 0 ? void 0 : _e.addEventListener("mouseup", mouseup);
        (_f = this.mediaEl) === null || _f === void 0 ? void 0 : _f.addEventListener("touchend", mouseup);
    }
}

var _PImageItem_instances, _PImageItem_duration, _PImageItem_id, _PImageItem_state, _PImageItem_type, _PImageItem_createImageEl;
let imagePlayerInterval = null;
class PImageItem extends Item {
    constructor(options) {
        var _a;
        super();
        _PImageItem_instances.add(this);
        _PImageItem_duration.set(this, void 0);
        _PImageItem_id.set(this, void 0);
        _PImageItem_state.set(this, "closed");
        _PImageItem_type.set(this, "image");
        __classPrivateFieldSet(this, _PImageItem_id, options.id, "f");
        __classPrivateFieldSet(this, _PImageItem_duration, (_a = options.duration) !== null && _a !== void 0 ? _a : 5, "f");
        this.overlayEl = options.overlay;
        this.progress = new PAnuncioProgress({ id: "anuncio-progress-for-" + __classPrivateFieldGet(this, _PImageItem_id, "f"), max: 100 });
        this.mediaEl = __classPrivateFieldGet(this, _PImageItem_instances, "m", _PImageItem_createImageEl).call(this, options.imageUrl);
        this.addNavigationEvents();
    }
    get loading() {
        return this.mediaEl.dataset.loading === "true";
    }
    get progressEl() {
        return this.progress.element;
    }
    get id() {
        return __classPrivateFieldGet(this, _PImageItem_id, "f");
    }
    get type() {
        return __classPrivateFieldGet(this, _PImageItem_type, "f");
    }
    get state() {
        return __classPrivateFieldGet(this, _PImageItem_state, "f");
    }
    get duration() {
        return __classPrivateFieldGet(this, _PImageItem_duration, "f");
    }
    close() {
        __classPrivateFieldSet(this, _PImageItem_state, "closed", "f");
        // garbage collect interval
        imagePlayerInterval === null || imagePlayerInterval === void 0 ? void 0 : imagePlayerInterval.destroy();
        imagePlayerInterval = null;
    }
    pause() {
        if (__classPrivateFieldGet(this, _PImageItem_state, "f") === "playing") {
            imagePlayerInterval === null || imagePlayerInterval === void 0 ? void 0 : imagePlayerInterval.pause();
            __classPrivateFieldSet(this, _PImageItem_state, "paused", "f");
        }
    }
    resume() {
        if (__classPrivateFieldGet(this, _PImageItem_state, "f") === "paused") {
            imagePlayerInterval === null || imagePlayerInterval === void 0 ? void 0 : imagePlayerInterval.resume();
            __classPrivateFieldSet(this, _PImageItem_state, "playing", "f");
        }
    }
    start() {
        if (__classPrivateFieldGet(this, _PImageItem_state, "f") === "closed" && this.loading) {
            __classPrivateFieldSet(this, _PImageItem_state, "play-queued", "f");
        }
        else if (__classPrivateFieldGet(this, _PImageItem_state, "f") === "closed" || __classPrivateFieldGet(this, _PImageItem_state, "f") === "play-queued") {
            __classPrivateFieldSet(this, _PImageItem_state, "playing", "f");
            this.progress.value = 0;
            imagePlayerInterval = new Interval(__classPrivateFieldGet(this, _PImageItem_duration, "f") * 1000, (completion) => {
                if (completion >= __classPrivateFieldGet(this, _PImageItem_duration, "f") * 1000) {
                    this.progress.value = 100;
                    this.dispatchEvent("play-complete");
                }
                else {
                    // updating the progress value with completion percentage
                    this.progress.value = completion / (__classPrivateFieldGet(this, _PImageItem_duration, "f") * 10);
                }
            }, 1000 / 60);
        }
    }
}
_PImageItem_duration = new WeakMap(), _PImageItem_id = new WeakMap(), _PImageItem_state = new WeakMap(), _PImageItem_type = new WeakMap(), _PImageItem_instances = new WeakSet(), _PImageItem_createImageEl = function _PImageItem_createImageEl(imageUrl) {
    const image = document.createElement("img");
    image.src = imageUrl;
    image.dataset.loading = "true";
    image.id = "anuncio-image-for-" + __classPrivateFieldGet(this, _PImageItem_id, "f");
    image.addEventListener("load", () => {
        image.dataset.loading = "false";
        if (__classPrivateFieldGet(this, _PImageItem_state, "f") === "play-queued")
            this.start();
    });
    return image;
};

var _PVideoItem_instances, _PVideoItem_muted, _PVideoItem_id, _PVideoItem_state, _PVideoItem_type, _PVideoItem_createVideoEl;
class PVideoItem extends Item {
    constructor(options) {
        super();
        _PVideoItem_instances.add(this);
        _PVideoItem_muted.set(this, false);
        _PVideoItem_id.set(this, void 0);
        _PVideoItem_state.set(this, "closed");
        _PVideoItem_type.set(this, "video");
        __classPrivateFieldSet(this, _PVideoItem_id, options.id, "f");
        this.overlayEl = options.overlay;
        this.progress = new PAnuncioProgress({ id: "anuncio-progress-for-" + __classPrivateFieldGet(this, _PVideoItem_id, "f"), max: 100 });
        this.mediaEl = __classPrivateFieldGet(this, _PVideoItem_instances, "m", _PVideoItem_createVideoEl).call(this, options.videoUrl);
        this.addNavigationEvents();
    }
    get loading() {
        return this.mediaEl.dataset.loading === "true";
    }
    get progressEl() {
        return this.progress.element;
    }
    get id() {
        return __classPrivateFieldGet(this, _PVideoItem_id, "f");
    }
    get type() {
        return __classPrivateFieldGet(this, _PVideoItem_type, "f");
    }
    get state() {
        return __classPrivateFieldGet(this, _PVideoItem_state, "f");
    }
    get muted() {
        return __classPrivateFieldGet(this, _PVideoItem_muted, "f");
    }
    set muted(value) {
        this.mediaEl.muted = value;
        __classPrivateFieldSet(this, _PVideoItem_muted, value, "f");
    }
    get duration() {
        return this.mediaEl.duration;
    }
    close() {
        this.mediaEl.pause();
        __classPrivateFieldSet(this, _PVideoItem_state, "closed", "f");
    }
    pause() {
        if (__classPrivateFieldGet(this, _PVideoItem_state, "f") === "playing") {
            this.mediaEl.pause();
            __classPrivateFieldSet(this, _PVideoItem_state, "paused", "f");
        }
    }
    resume() {
        if (__classPrivateFieldGet(this, _PVideoItem_state, "f") === "paused") {
            this.mediaEl.play();
            __classPrivateFieldSet(this, _PVideoItem_state, "playing", "f");
        }
    }
    start() {
        if (__classPrivateFieldGet(this, _PVideoItem_state, "f") === "closed" && this.loading) {
            __classPrivateFieldSet(this, _PVideoItem_state, "play-queued", "f");
        }
        else if (__classPrivateFieldGet(this, _PVideoItem_state, "f") === "closed" || __classPrivateFieldGet(this, _PVideoItem_state, "f") === "play-queued") {
            this.mediaEl.currentTime = 0;
            this.progress.value = 0;
            this.mediaEl.play();
            __classPrivateFieldSet(this, _PVideoItem_state, "playing", "f");
        }
    }
}
_PVideoItem_muted = new WeakMap(), _PVideoItem_id = new WeakMap(), _PVideoItem_state = new WeakMap(), _PVideoItem_type = new WeakMap(), _PVideoItem_instances = new WeakSet(), _PVideoItem_createVideoEl = function _PVideoItem_createVideoEl(videoUrl) {
    const video = document.createElement("video");
    video.src = videoUrl;
    video.dataset.loading = "true";
    video.id = "anuncio-video-for-" + __classPrivateFieldGet(this, _PVideoItem_id, "f");
    video.addEventListener("canplay", () => {
        if (__classPrivateFieldGet(this, _PVideoItem_state, "f") === "play-queued")
            this.start();
        video.dataset.loading = "false";
    });
    video.addEventListener("waiting", () => {
        video.dataset.loading = "true";
    });
    video.addEventListener("ended", () => {
        this.dispatchEvent("play-complete");
    });
    video.addEventListener("timeupdate", () => {
        if (__classPrivateFieldGet(this, _PVideoItem_state, "f") === "playing")
            this.progress.value = (video.currentTime * 100) / video.duration;
    });
    return video;
};

/**
 * This module exports all the items listed down below
 *
 * @module
 */
var _Anuncio_instances, _Anuncio_container, _Anuncio_currentIndex, _Anuncio_items, _Anuncio_order, _Anuncio_state, _Anuncio_muted, _Anuncio_maxProgressTrackers, _Anuncio_createItemMap, _Anuncio_createLoader, _Anuncio_createMuteButton, _Anuncio_createCloseButton, _Anuncio_createContainer, _Anuncio_dispatchEvent;
const AnuncioInstances = new Map();
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
class Anuncio {
    /**
     * creates a anuncio instance.
     * @param { (AnuncioItemOptions[]) } itemOptionsList  list of options for video or image
     * @param { AnuncioConfigOptions } configOptions  configuration for anuncio
     */
    constructor(itemOptionsList, configOptions) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        _Anuncio_instances.add(this);
        _Anuncio_container.set(this, void 0);
        _Anuncio_currentIndex.set(this, -1);
        _Anuncio_items.set(this, void 0);
        _Anuncio_order.set(this, void 0);
        _Anuncio_state.set(this, "closed");
        _Anuncio_muted.set(this, false);
        _Anuncio_maxProgressTrackers.set(this, {});
        Validator.validateItemOptions(itemOptionsList);
        Validator.validateConfigOptions(configOptions);
        const containerId = (_a = configOptions === null || configOptions === void 0 ? void 0 : configOptions.containerId) !== null && _a !== void 0 ? _a : generateUniqueId();
        const loader = (_b = configOptions === null || configOptions === void 0 ? void 0 : configOptions.loader) !== null && _b !== void 0 ? _b : __classPrivateFieldGet(this, _Anuncio_instances, "m", _Anuncio_createLoader).call(this, containerId);
        const closeButton = (_c = configOptions === null || configOptions === void 0 ? void 0 : configOptions.closeButton) !== null && _c !== void 0 ? _c : __classPrivateFieldGet(this, _Anuncio_instances, "m", _Anuncio_createCloseButton).call(this, containerId);
        const root = (_d = configOptions === null || configOptions === void 0 ? void 0 : configOptions.root) !== null && _d !== void 0 ? _d : document.body;
        const muteButton = (_e = configOptions === null || configOptions === void 0 ? void 0 : configOptions.muteButton) !== null && _e !== void 0 ? _e : __classPrivateFieldGet(this, _Anuncio_instances, "m", _Anuncio_createMuteButton).call(this, containerId);
        const handleMuteButtonClick = (_f = configOptions === null || configOptions === void 0 ? void 0 : configOptions.handleMuteButtonClick) !== null && _f !== void 0 ? _f : true;
        const defaultNavigation = (_g = configOptions === null || configOptions === void 0 ? void 0 : configOptions.defaultNavigation) !== null && _g !== void 0 ? _g : true;
        const handleCloseButtonClick = (_h = configOptions === null || configOptions === void 0 ? void 0 : configOptions.handleCloseButtonClick) !== null && _h !== void 0 ? _h : true;
        const configOptionsWithDefaults = Object.assign(Object.assign({}, (configOptions !== null && configOptions !== void 0 ? configOptions : {})), { containerId,
            loader,
            closeButton,
            muteButton,
            handleMuteButtonClick,
            handleCloseButtonClick,
            defaultNavigation });
        this.nativeFullScreen = (_j = configOptions === null || configOptions === void 0 ? void 0 : configOptions.nativeFullScreen) !== null && _j !== void 0 ? _j : false;
        this.autostart = (_k = configOptions === null || configOptions === void 0 ? void 0 : configOptions.autostart) !== null && _k !== void 0 ? _k : true;
        __classPrivateFieldSet(this, _Anuncio_items, __classPrivateFieldGet(this, _Anuncio_instances, "m", _Anuncio_createItemMap).call(this, itemOptionsList), "f");
        __classPrivateFieldSet(this, _Anuncio_order, (_l = configOptions === null || configOptions === void 0 ? void 0 : configOptions.order) !== null && _l !== void 0 ? _l : Array.from(__classPrivateFieldGet(this, _Anuncio_items, "f").keys()), "f");
        __classPrivateFieldSet(this, _Anuncio_container, __classPrivateFieldGet(this, _Anuncio_instances, "m", _Anuncio_createContainer).call(this, configOptionsWithDefaults), "f");
        // invokes the muted setter, this line must be after container is defined
        this.muted = (_m = configOptions === null || configOptions === void 0 ? void 0 : configOptions.muted) !== null && _m !== void 0 ? _m : false;
        root.appendChild(__classPrivateFieldGet(this, _Anuncio_container, "f"));
        AnuncioInstances.set(containerId, this);
    }
    /**
     * Get the container for the instance.\
     * Mutating this is not advised, may lead to undefined behaviour.
     */
    get container() {
        return __classPrivateFieldGet(this, _Anuncio_container, "f");
    }
    /**
     * Get the current state of the instance
     */
    get state() {
        return __classPrivateFieldGet(this, _Anuncio_state, "f");
    }
    /**
     * Get a structuredClone of the current order. To mutate this property use the order setter.\
     * Order defines the position of media in the player.
     */
    get order() {
        return structuredClone(__classPrivateFieldGet(this, _Anuncio_order, "f"));
    }
    /**
     * You can only set the order when anuncio is "closed".
     * @property {string[]} newOrder The new order of media for the player.
     */
    set order(newOrder) {
        if (__classPrivateFieldGet(this, _Anuncio_state, "f") !== "closed") {
            throw new Error("Order cannot be set when anuncio is " + __classPrivateFieldGet(this, _Anuncio_state, "f"));
        }
        __classPrivateFieldSet(this, _Anuncio_order, newOrder, "f");
        __classPrivateFieldGet(this, _Anuncio_order, "f").forEach((itemId, index) => {
            const item = __classPrivateFieldGet(this, _Anuncio_items, "f").get(itemId);
            if (item)
                item.progressEl.style.order = index.toString();
        });
    }
    /**
     * Get the items in the instance as a object in {id : item} format. \
     * Mutating the item object is not advised.
     */
    get items() {
        const items = {};
        __classPrivateFieldGet(this, _Anuncio_items, "f").forEach((value, key) => {
            items[key] = value;
        });
        return items;
    }
    /**
     * Get the current item. Mutation is not advised.
     */
    get currentItem() {
        var _a;
        if (__classPrivateFieldGet(this, _Anuncio_currentIndex, "f") >= 0 && __classPrivateFieldGet(this, _Anuncio_currentIndex, "f") < __classPrivateFieldGet(this, _Anuncio_items, "f").size) {
            return (_a = __classPrivateFieldGet(this, _Anuncio_items, "f").get(__classPrivateFieldGet(this, _Anuncio_order, "f")[__classPrivateFieldGet(this, _Anuncio_currentIndex, "f")])) !== null && _a !== void 0 ? _a : null;
        }
        return null;
    }
    /**
     * is anuncio muted now ?
     */
    get muted() {
        return __classPrivateFieldGet(this, _Anuncio_muted, "f");
    }
    get maxProgressMap() {
        const maxProgressMap = {};
        for (const key in __classPrivateFieldGet(this, _Anuncio_maxProgressTrackers, "f")) {
            const item = __classPrivateFieldGet(this, _Anuncio_items, "f").get(key);
            const percentage = __classPrivateFieldGet(this, _Anuncio_maxProgressTrackers, "f")[key];
            const duration = Number.isFinite(item.duration) ? item.duration : 0;
            maxProgressMap[key] = { value: (duration * percentage) / 100, percentage };
        }
        return maxProgressMap;
    }
    /**
     * setting this to true mutes the instance, sets data-muted attribute on the container according to the value given.
     * @param {boolean} value - mutes and unmutes the instance if value is true and false respectively
     */
    set muted(value) {
        __classPrivateFieldSet(this, _Anuncio_muted, value, "f");
        __classPrivateFieldGet(this, _Anuncio_container, "f").dataset.muted = value.toString();
        if (__classPrivateFieldGet(this, _Anuncio_state, "f") === "playing" && this.currentItem && this.currentItem.type === "video") {
            this.currentItem.muted = __classPrivateFieldGet(this, _Anuncio_muted, "f");
        }
        __classPrivateFieldGet(this, _Anuncio_instances, "m", _Anuncio_dispatchEvent).call(this, __classPrivateFieldGet(this, _Anuncio_muted, "f") ? "anuncio-mute" : "anuncio-unmute");
    }
    /**
     * Makes the current item visible.\
     * !!! DOES NOT START THE CURRENT ITEM, ONLY SHOWS IT !!!
     */
    showCurrentItem() {
        if (this.currentItem) {
            if (this.currentItem.overlayEl)
                this.currentItem.overlayEl.style.display = "block";
            this.currentItem.mediaEl.style.display = "block";
            this.currentItem.mediaEl.classList.add("active-anuncio-item");
            this.currentItem.progressEl.classList.add("active-progress-item");
        }
    }
    /**
     * Closes the current item and hides it.
     */
    closeCurrentItem() {
        var _a;
        if (this.currentItem) {
            __classPrivateFieldGet(this, _Anuncio_maxProgressTrackers, "f")[this.currentItem.id] = Math.max((_a = __classPrivateFieldGet(this, _Anuncio_maxProgressTrackers, "f")[this.currentItem.id]) !== null && _a !== void 0 ? _a : 0, this.currentItem.progress.value);
            this.currentItem.progress.value = this.currentItem.progress.max;
            this.currentItem.progressEl.classList.remove("active-progress-item");
            this.currentItem.close();
            this.currentItem.mediaEl.style.display = "none";
            this.currentItem.mediaEl.classList.remove("active-anuncio-item");
            if (this.currentItem.overlayEl)
                this.currentItem.overlayEl.style.display = "none";
            __classPrivateFieldGet(this, _Anuncio_instances, "m", _Anuncio_dispatchEvent).call(this, "anuncio-item-close", { closedItem: this.currentItem });
        }
    }
    /**
     * 1. Makes the instance visible and sets the current item as the first item in order
     * 2. Displays the current item.
     * 3. Starts the current item if autostart is set to true.
     */
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            if (__classPrivateFieldGet(this, _Anuncio_state, "f") === "closed") {
                __classPrivateFieldGet(this, _Anuncio_container, "f").style.display = "block";
                yield Fullscreen.tryEnter(__classPrivateFieldGet(this, _Anuncio_container, "f"), this.nativeFullScreen);
                __classPrivateFieldSet(this, _Anuncio_currentIndex, 0, "f");
                __classPrivateFieldSet(this, _Anuncio_state, "playing", "f");
                if (!this.autostart)
                    this.showCurrentItem();
                else
                    this.playCurrentItem();
                __classPrivateFieldGet(this, _Anuncio_instances, "m", _Anuncio_dispatchEvent).call(this, "anuncio-start");
            }
        });
    }
    /**
     * 1. Hides the instance and sets the current item to null.
     * 2. Resets the progress of each item to 0.
     */
    close() {
        if (__classPrivateFieldGet(this, _Anuncio_state, "f") === "playing" || __classPrivateFieldGet(this, _Anuncio_state, "f") === "paused") {
            Fullscreen.tryLeave(__classPrivateFieldGet(this, _Anuncio_container, "f"), this.nativeFullScreen);
            __classPrivateFieldSet(this, _Anuncio_state, "closed", "f");
            this.closeCurrentItem();
            __classPrivateFieldGet(this, _Anuncio_container, "f").style.display = "none";
            __classPrivateFieldGet(this, _Anuncio_items, "f").forEach((item) => {
                item.progress.value = 0;
            });
            __classPrivateFieldGet(this, _Anuncio_instances, "m", _Anuncio_dispatchEvent).call(this, "anuncio-close", { maxProgressMap: this.maxProgressMap });
        }
    }
    /**
     * Resumes the instance.
     */
    resume() {
        var _a;
        if (__classPrivateFieldGet(this, _Anuncio_state, "f") === "paused") {
            __classPrivateFieldSet(this, _Anuncio_state, "playing", "f");
            (_a = this.currentItem) === null || _a === void 0 ? void 0 : _a.resume();
            __classPrivateFieldGet(this, _Anuncio_instances, "m", _Anuncio_dispatchEvent).call(this, "anuncio-item-resume");
        }
    }
    /**
     * Pauses the instance.
     */
    pause() {
        var _a;
        if (__classPrivateFieldGet(this, _Anuncio_state, "f") === "playing") {
            __classPrivateFieldSet(this, _Anuncio_state, "paused", "f");
            (_a = this.currentItem) === null || _a === void 0 ? void 0 : _a.pause();
            __classPrivateFieldGet(this, _Anuncio_instances, "m", _Anuncio_dispatchEvent).call(this, "anuncio-item-pause");
        }
    }
    /**
     * Makes the current item visible and starts the current item
     */
    playCurrentItem() {
        var _a;
        if (__classPrivateFieldGet(this, _Anuncio_state, "f") === "playing") {
            if (this.currentItem && this.currentItem.type === "video")
                this.currentItem.muted = __classPrivateFieldGet(this, _Anuncio_muted, "f");
            (_a = this.currentItem) === null || _a === void 0 ? void 0 : _a.start();
            this.showCurrentItem();
            __classPrivateFieldGet(this, _Anuncio_instances, "m", _Anuncio_dispatchEvent).call(this, "anuncio-item-start", { startedItem: this.currentItem });
        }
    }
    /**
     * plays the next item in order and closes the current item
     */
    playNextItem() {
        if (__classPrivateFieldGet(this, _Anuncio_state, "f") === "playing") {
            if (__classPrivateFieldGet(this, _Anuncio_currentIndex, "f") < __classPrivateFieldGet(this, _Anuncio_items, "f").size - 1) {
                this.closeCurrentItem();
                __classPrivateFieldSet(this, _Anuncio_currentIndex, __classPrivateFieldGet(this, _Anuncio_currentIndex, "f") + 1, "f");
                this.playCurrentItem();
            }
            else {
                this.close();
            }
        }
    }
    /**
     * plays the previous item in order and closes the current item
     */
    playPreviousItem() {
        if (__classPrivateFieldGet(this, _Anuncio_state, "f") === "playing") {
            if (__classPrivateFieldGet(this, _Anuncio_currentIndex, "f") > 0) {
                this.closeCurrentItem();
                __classPrivateFieldSet(this, _Anuncio_currentIndex, __classPrivateFieldGet(this, _Anuncio_currentIndex, "f") - 1, "f");
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
        __classPrivateFieldSet(this, _Anuncio_items, null, "f");
        // @ts-expect-error cleanup
        __classPrivateFieldSet(this, _Anuncio_container, null, "f");
        __classPrivateFieldSet(this, _Anuncio_state, "destroyed", "f");
        AnuncioInstances.delete(this.container.id);
    }
    addEventListener(name, listener) {
        __classPrivateFieldGet(this, _Anuncio_container, "f").addEventListener(name, listener);
    }
    removeEventListener(name, listener) {
        __classPrivateFieldGet(this, _Anuncio_container, "f").removeEventListener(name, listener);
    }
    static getInstance(containerId) {
        return AnuncioInstances.get(containerId);
    }
}
_Anuncio_container = new WeakMap(), _Anuncio_currentIndex = new WeakMap(), _Anuncio_items = new WeakMap(), _Anuncio_order = new WeakMap(), _Anuncio_state = new WeakMap(), _Anuncio_muted = new WeakMap(), _Anuncio_maxProgressTrackers = new WeakMap(), _Anuncio_instances = new WeakSet(), _Anuncio_createItemMap = function _Anuncio_createItemMap(itemOptions) {
    const items = new Map();
    itemOptions.forEach((options) => {
        let item;
        if (options.type == "image") {
            item = new PImageItem(options);
        }
        else {
            item = new PVideoItem(options);
        }
        items.set(item.id, item);
    });
    return items;
}, _Anuncio_createLoader = function _Anuncio_createLoader(containerId) {
    const loader = document.createElement("div");
    loader.classList.add("anuncio-loader-element");
    loader.id = "anuncio-loader-for" + containerId;
    return loader;
}, _Anuncio_createMuteButton = function _Anuncio_createMuteButton(containerId) {
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
}, _Anuncio_createCloseButton = function _Anuncio_createCloseButton(containerId) {
    const button = document.createElement("button");
    button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" >
      <path d="M376.6 84.5c11.3-13.6 9.5-33.8-4.1-45.1s-33.8-9.5-45.1 4.1L192 206 56.6 43.5C45.3 29.9 25.1 28.1 11.5 39.4S-3.9 70.9 7.4 84.5L150.3 256 7.4 427.5c-11.3 13.6-9.5 33.8 4.1 45.1s33.8 9.5 45.1-4.1L192 306 327.4 468.5c11.3 13.6 31.5 15.4 45.1 4.1s15.4-31.5 4.1-45.1L233.7 256 376.6 84.5z"/>
    </svg>`;
    button.id = "anuncio-close-button-for-" + containerId;
    button.classList.add("anuncio-close-button");
    return button;
}, _Anuncio_createContainer = function _Anuncio_createContainer(configOptions) {
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
    __classPrivateFieldGet(this, _Anuncio_items, "f").forEach((item) => {
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
    this.order = __classPrivateFieldGet(this, _Anuncio_order, "f");
    container.append(overlayContainer);
    container.append(configOptions.loader);
    container.append(configOptions.muteButton);
    container.addEventListener("fullscreenchange", () => {
        if (!document.fullscreenElement)
            this.close();
    });
    if (configOptions.handleCloseButtonClick)
        configOptions.closeButton.addEventListener("click", (event) => {
            event.stopPropagation();
            this.close();
        });
    if (configOptions.handleMuteButtonClick)
        configOptions.muteButton.addEventListener("click", (event) => {
            event.stopPropagation();
            this.muted = !__classPrivateFieldGet(this, _Anuncio_muted, "f");
        });
    return container;
}, _Anuncio_dispatchEvent = function _Anuncio_dispatchEvent(type, payload) {
    window.setTimeout(() => {
        const event = new CustomEvent(type, { detail: payload });
        __classPrivateFieldGet(this, _Anuncio_container, "f").dispatchEvent(event);
    });
};

export { Anuncio };
