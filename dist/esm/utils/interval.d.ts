export declare class Interval {
    #private;
    duration: number;
    onInterval: (completion: number) => void;
    precision: number;
    /**
     *Starts a interval that can be paused.\
     *Destroys the timer on completion.
     */
    constructor(duration: number, onInterval: (completion: number) => void, precision?: number);
    pause(): void;
    resume(): void;
    destroy(): void;
}
//# sourceMappingURL=interval.d.ts.map