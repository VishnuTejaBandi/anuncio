import type { AnuncioItemOptions, ImageOptions, VideoOptions, CommonOptions, AnuncioConfigOptions } from "src/types";
/**
 * @private
 */
export declare const Validator: {
    validateItemOptions(itemOptionsList: AnuncioItemOptions[]): void;
    validateConfigOptions(options: AnuncioConfigOptions): void;
    validateCommonOptions(options: CommonOptions): string | null;
    validateImageOptions(options: ImageOptions): string | null;
    validateVideoOptions(options: VideoOptions): string | null;
    validateForNonEmptyString(item: unknown): boolean;
    isNumber(x: unknown): x is number;
    isString(x: unknown): x is string;
    isNumeric(str: unknown): boolean;
    isObject(item: unknown): boolean;
};
//# sourceMappingURL=validator.d.ts.map