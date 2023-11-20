import { AnuncioItemOptions } from "src/types";

export const Validator = {
  validateItems(items: AnuncioItemOptions[]) {
    if (!Array.isArray(items)) throw new Error("Options must be an array");

    items.forEach((item, index) => {
      this.validateForNonEmptyString(item.id, new Error(`id at ${index} must be a non empty string`));
      if (this.isNumeric(item.id)) throw new Error("Item id must be non numeric at index " + index);

      if (item.type === "video")
        this.validateForNonEmptyString(
          item.videoUrl,
          new Error(`videoUrl at index ${index} must be a non empty string`)
        );

      if (item.type === "image")
        this.validateForNonEmptyString(
          item.imageUrl,
          new Error(`imageUrl at index ${index} must be a non empty string`)
        );
    });
  },

  validateForNonEmptyString(item: unknown, error: Error) {
    if (!this.isString(item) || item.length === 0) throw error;
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
};
