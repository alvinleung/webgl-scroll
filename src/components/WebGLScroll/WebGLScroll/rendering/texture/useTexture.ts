import { useEffect, useState } from "react";
import { Texture } from "./Texture";

export function useTexture(url: string) {
  const [textureImage, setTextureImage] = useState<Texture>();
  useEffect(() => {
    const tex = new Texture({
      src: url,
      flipY: -1,
    });
    setTextureImage(tex);
    return () => {
      tex.cleanup();
    };
  }, [url]);

  return textureImage;
}
