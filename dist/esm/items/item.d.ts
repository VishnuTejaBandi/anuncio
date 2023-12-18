import { AnuncioItemEvent } from "src/types";
export declare class Item {
    mediaEl: HTMLElement | null;
    longPressTimeout: number | null;
    addEventListener(name: AnuncioItemEvent, handler: () => void): void;
    removeEventListener(name: AnuncioItemEvent, handler: () => void): void;
    protected dispatchEvent(name: AnuncioItemEvent): void;
    protected addNavigationEvents(): void;
}
//# sourceMappingURL=item.d.ts.map