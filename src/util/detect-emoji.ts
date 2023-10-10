import cast from "@/util/cast";

function supportsEmojis(): boolean {
  if (supportsEmojis.cache !== null) {
    return supportsEmojis.cache;
  }

  if (typeof window === "undefined") {
    return false;
  }

  const node = document.createElement("canvas");
  const ctx = cast<any>(node.getContext("2d"));
  if (!ctx) {
    return false;
  }

  const backingStoreRatio =
    ctx.webkitBackingStorePixelRatio ||
    ctx.mozBackingStorePixelRatio ||
    ctx.msBackingStorePixelRatio ||
    ctx.oBackingStorePixelRatio ||
    ctx.backingStorePixelRatio ||
    1;
  const offset = 12 * backingStoreRatio;

  ctx.fillStyle = "#f00";
  ctx.textBaseline = "top";
  ctx.font = "32px Arial";
  ctx.fillText("\ud83d\udc28", 0, 0); // U+1F428 KOALA

  const support = ctx.getImageData(offset, offset, 1, 1).data[0] !== 0;

  supportsEmojis.cache = support;

  return support;
}

supportsEmojis.cache = cast<boolean>(null);

export default supportsEmojis;
