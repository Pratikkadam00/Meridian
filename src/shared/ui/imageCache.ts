import { Image as ExpoImage } from "expo-image";
import { Image as NativeImage, type ImageSourcePropType } from "react-native";

const criticalImages: ImageSourcePropType[] = [
  require("../../../assets/icon.png"),
  require("../../../assets/splash-icon.png"),
];

let hasWarmedCriticalImages = false;

export function warmCriticalImageCache() {
  if (hasWarmedCriticalImages) {
    return;
  }

  hasWarmedCriticalImages = true;
  const uris = criticalImages.map((source) => NativeImage.resolveAssetSource(source)?.uri).filter((uri): uri is string => Boolean(uri));

  if (!uris.length) {
    return;
  }

  void ExpoImage.prefetch(uris, "memory-disk").catch(() => undefined);
}
