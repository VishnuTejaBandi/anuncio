type ProgressOptions = {
  max?: number;
  id: string;
};

const PROGRESS_CSS_VAR = "--progress-percentage" as const;

export class AnuncioProgress {
  #value: number = 0;
  #max: number;

  element: HTMLDivElement;

  constructor(options: ProgressOptions) {
    this.#max = options.max ?? 100;
    this.element = this.createProgressElement(options.id);
    // invokes the setter with value 0
    this.value = 0;
  }

  get value() {
    return this.#value;
  }

  set value(value: number) {
    const percentage = value < this.#max ? (value * 100) / this.#max : 100;
    this.element.dataset.value = percentage.toString();
    this.element.style.setProperty(PROGRESS_CSS_VAR, `${percentage.toString()}%`);

    this.#value = value;
  }

  get max() {
    return this.#max;
  }

  set max(max) {
    this.element.dataset.max = this.#max.toString();
    this.#max = max;
  }

  createProgressElement(id: string) {
    const element = document.createElement("div");
    element.classList.add("anuncio-progress-element");
    element.id = id;

    element.dataset.max = this.#max.toString();

    return element;
  }
}
