import { ImageItem, VideoItem } from ".";

export type AnuncioItemCloseEventPayload = { closedItem: ImageItem | VideoItem };
export type AnuncioItemStartEventPayload = { startedItem: ImageItem | VideoItem };
export type AnuncioCloseEventPayload = { maxProgressMap: Record<ImageItem["id"] | VideoItem["id"], { percentage: number; value: number }> };

export type AnuncioEventListenerMap = {
  "anuncio-close": (evt: CustomEvent<AnuncioCloseEventPayload>) => void;
  "anuncio-item-start": (evt: CustomEvent<AnuncioItemStartEventPayload>) => void;
  "anuncio-item-close": (evt: CustomEvent<AnuncioItemCloseEventPayload>) => void;
  "anuncio-item-pause": () => void;
  "anuncio-item-resume": () => void;
  "anuncio-start": () => void;
  "anuncio-mute": () => void;
  "anuncio-unmute": () => void;
};

export type AnuncioEventType = keyof AnuncioEventListenerMap;
export type AnuncioPayloadByType<T extends AnuncioEventType> = Parameters<AnuncioEventListenerMap[T]>[0] extends CustomEvent<infer P>
  ? P
  : undefined;

/**
 * @private
 */
export type AnuncioItemEvent = "play-complete" | "longpress-start" | "longpress-end" | "tap-left" | "tap-right";
