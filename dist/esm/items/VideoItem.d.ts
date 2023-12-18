import { PAnuncioProgress } from "src/utils";
import { VideoItem, VideoOptions } from "../types";
import { Item } from "./item";
export declare class PVideoItem extends Item implements VideoItem {
    #private;
    mediaEl: HTMLVideoElement;
    progress: PAnuncioProgress;
    overlayEl?: HTMLElement;
    constructor(options: VideoOptions);
    get loading(): boolean;
    get progressEl(): HTMLDivElement;
    get id(): string;
    get type(): "video";
    get state(): "playing" | "paused" | "play-queued" | "closed";
    get muted(): boolean;
    set muted(value: boolean);
    get duration(): number;
    close(): void;
    pause(): void;
    resume(): void;
    start(): void;
}
//# sourceMappingURL=VideoItem.d.ts.map