import { AnuncioEvent } from "src/types";

export class Item {
  mediaEl: HTMLElement | null = null;

  addEventListener(name: AnuncioEvent, handler: () => void) {
    this.mediaEl?.addEventListener(name, handler);
  }

  removeEventListener(name: AnuncioEvent, handler: () => void) {
    this.mediaEl?.removeEventListener(name, handler);
  }

  protected dispatchEvent(name: AnuncioEvent) {
    const event = new Event(name);
    this.mediaEl?.dispatchEvent(event);
  }
}
