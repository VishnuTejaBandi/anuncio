import { AnuncioItemEvent } from "src/types";

let mouseDownElement: HTMLElement | null = null;

export class Item {
  mediaEl: HTMLElement | null = null;
  longPressTimeout: number | null = null;

  addEventListener(name: AnuncioItemEvent, handler: () => void) {
    this.mediaEl?.addEventListener(name, handler);
  }

  removeEventListener(name: AnuncioItemEvent, handler: () => void) {
    this.mediaEl?.removeEventListener(name, handler);
  }

  protected dispatchEvent(name: AnuncioItemEvent) {
    const event = new Event(name);
    this.mediaEl?.dispatchEvent(event);
  }

  protected addNavigationEvents() {
    // returns true if a longpress has been cleared
    const clearLongpress = () => {
      if (this.longPressTimeout != null) {
        window.clearTimeout(this.longPressTimeout);
        this.longPressTimeout = null;
      }

      if (this.mediaEl?.classList.contains("longpress")) {
        this.mediaEl.classList.remove("longpress");
        return true;
      }
      return false;
    };

    const mousedown = (event: MouseEvent | TouchEvent) => {
      event.preventDefault();
      mouseDownElement = this.mediaEl;

      this.longPressTimeout = window.setTimeout(() => {
        this.dispatchEvent("longpress-start");
        this.mediaEl?.classList.add("longpress");
      }, 300);
    };
    this.mediaEl?.addEventListener("mousedown", mousedown);
    this.mediaEl?.addEventListener("touchstart", mousedown);

    const mouseleave = (event: MouseEvent | TouchEvent) => {
      event.preventDefault();
      mouseDownElement = null;
      if (clearLongpress()) this.dispatchEvent("longpress-end");
    };
    this.mediaEl?.addEventListener("mouseleave", mouseleave);
    this.mediaEl?.addEventListener("touchcancel", mouseleave);

    const mouseup = (event: MouseEvent | TouchEvent) => {
      event.preventDefault();

      if (mouseDownElement !== this.mediaEl) return;
      mouseDownElement = null;

      if (clearLongpress()) {
        this.dispatchEvent("longpress-end");
      } else {
        let x;
        if (event instanceof MouseEvent) {
          x = event.clientX;
        } else {
          x = event.changedTouches[0].clientX;
        }

        const { left, right } = this.mediaEl!.getBoundingClientRect();
        const position = ((x - left) / (right - left)) * 100;
        if (position > 30) this.dispatchEvent("tap-right");
        else this.dispatchEvent("tap-left");
      }
    };
    this.mediaEl?.addEventListener("mouseup", mouseup);
    this.mediaEl?.addEventListener("touchend", mouseup);
  }
}
