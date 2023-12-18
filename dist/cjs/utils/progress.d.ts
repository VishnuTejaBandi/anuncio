import { AnuncioProgress, ProgressOptions } from "src/types";
export declare class PAnuncioProgress implements AnuncioProgress {
    #private;
    element: HTMLDivElement;
    constructor(options: ProgressOptions);
    get value(): number;
    set value(value: number);
    get max(): number;
    set max(max: number);
}
//# sourceMappingURL=progress.d.ts.map