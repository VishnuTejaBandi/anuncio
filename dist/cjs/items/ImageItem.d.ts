import { ImageItem, ImageOptions } from "../types";
import { PAnuncioProgress } from "../utils";
import { Item } from "./item";
export declare class PImageItem extends Item implements ImageItem {
    #private;
    mediaEl: HTMLImageElement;
    progress: PAnuncioProgress;
    overlayEl?: HTMLElement;
    constructor(options: ImageOptions);
    get loading(): boolean;
    get progressEl(): HTMLDivElement;
    get id(): string;
    get type(): "image";
    get state(): "playing" | "paused" | "play-queued" | "closed";
    get duration(): number;
    close(): void;
    pause(): void;
    resume(): void;
    start(): void;
}
//# sourceMappingURL=ImageItem.d.ts.map