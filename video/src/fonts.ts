// @remotion/fonts delays rendering until each face has loaded.
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const fontsReady = Promise.all([
  loadFont({ family: "Archivo Black", url: staticFile("fonts/Archivo-Black.woff"), weight: "400" }),
  loadFont({ family: "JetBrains Mono", url: staticFile("fonts/JetBrainsMono-Bold.woff"), weight: "700" }),
]);
