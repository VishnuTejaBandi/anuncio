let counter = 0;

export function generateUniqueId(): string {
  counter += 1;
  return `anuncio-stories-${counter}`;
}
