import type { AnuncioItemOptions, ImageOptions, VideoOptions, CommonOptions } from "src/types";

export const Validator = {
  validateItemOptions(itemOptionsList: AnuncioItemOptions[]) {
    if (!Array.isArray(itemOptionsList)) throw new Error("itemOptionsList must be an array");

    itemOptionsList.forEach((itemOptions, index) => {
      if (!this.isObject(itemOptions)) throw new Error(`invalid options at ${index}`);

      const { type } = itemOptions;
      let error: string | null = this.validateCommonOptions(itemOptions);

      if (!error)
        if (type === "image") {
          error = Validator.validateImageOptions(itemOptions);
        } else if (type === "video") {
          error = Validator.validateVideoOptions(itemOptions);
        } else {
          error = `Unknown item type ${type}`;
        }

      if (error) {
        throw new Error(`${error} at index ${index}`);
      }
    });
  },

  validateCommonOptions(options: CommonOptions): string | null {
    const { id, overlay } = options;

    if (!this.validateForNonEmptyString(id)) return "id must be a string";

    if (overlay !== undefined && !(overlay instanceof HTMLElement)) return "overlay if present must be a HTML element";

    return null;
  },

  validateImageOptions(options: ImageOptions): string | null {
    const { imageUrl, duration } = options;
    if (!this.validateForNonEmptyString(imageUrl)) return "imageUrl is not a valid string";

    if (!this.isNumber(duration) || duration <= 0) return "duration must be a positive integer";

    return null;
  },

  validateVideoOptions(options: VideoOptions): string | null {
    const { videoUrl } = options;
    if (!this.validateForNonEmptyString(videoUrl)) return "videoUrl is not a valid string";

    return null;
  },

  validateForNonEmptyString(item: unknown) {
    return this.isString(item) && item.length !== 0;
  },

  isNumber(x: unknown): x is number {
    return typeof x === "number";
  },

  isString(x: unknown): x is string {
    return typeof x === "string";
  },

  isNumeric(str: unknown) {
    if (typeof str === "number") return true;
    if (typeof str === "string") return Number.isFinite(parseFloat(str));
    return false;
  },

  isObject(item: unknown) {
    return typeof item === "object" && item !== null;
  },
};
