export const Fullscreen = {
  tryEnter(el: HTMLDivElement) {
    if (this.getCurrentFullScreenElement()) return;

    if ("requestFullscreen" in el && typeof el.requestFullscreen == "function") {
      return el.requestFullscreen();
    } else if ("mozRequestFullScreen" in el && typeof el.mozRequestFullScreen == "function") {
      return el.mozRequestFullScreen();
    } else if ("webkitRequestFullScreen" in el && typeof el.webkitRequestFullScreen == "function") {
      return el.webkitRequestFullScreen();
    } else if ("msRequestFullscreen" in el && typeof el.msRequestFullscreen == "function") {
      return el.msRequestFullscreen();
    }
  },
  tryLeave(element: Element) {
    if (this.getCurrentFullScreenElement() !== element) return;

    if ("exitFullscreen" in document && typeof document.exitFullscreen == "function") {
      return document.exitFullscreen();
    } else if ("webkitExitFullscreen" in document && typeof document.webkitExitFullscreen == "function") {
      return document.webkitExitFullscreen();
    } else if ("mozCancelFullScreen" in document && typeof document.mozCancelFullScreen == "function") {
      return document.mozCancelFullScreen();
    } else if ("msExitFullscreen" in document && typeof document.msExitFullscreen == "function") {
      document.msExitFullscreen();
    }
  },

  getCurrentFullScreenElement() {
    return (
      document.fullscreenElement ||
      ("webkitFullscreenElement" in document && document.webkitFullscreenElement) ||
      ("mozFullScreenElement" in document && document.mozFullScreenElement) ||
      ("msFullscreenElement" in document && document.msFullscreenElement)
    );
  },
};
