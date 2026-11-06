#!/usr/bin/env node
/*
  Ita Burger — build (arquivo único publicável)
  Uso:  node scripts/build.js
  Gera: dist/Ita Burger.html
        (js/data.js regenerado a partir de data/cardapio.json)
  O arquivo gerado é equivalente ao original: #ita-css + #ita-data + #ita-main,
  pronto para Artifact/Claude ou qualquer hospedagem estática em arquivo único.
*/
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const readBuf = (p) => fs.readFileSync(path.join(root, p));

const JS_FILES = [
  "js/utils.js",
  "js/supabase-config.js",
  "js/supabase.js",
  "js/assets.js",
  "js/data.js",
  "js/state.js",
  "js/cart.js",
  "js/render.js",
  "js/admin.js",
  "js/actions.js",
  "js/main.js",
];

// 1. dados: fonte é data/cardapio.json; js/data.js é gerado
const dataJson = read("data/cardapio.json");
const data = JSON.parse(dataJson);
const dataJs =
  "// Ita Burger — dados do cardápio/loja (fonte editável)\n" +
  "// Gerado automaticamente a partir de data/cardapio.json — não editar à mão.\n" +
  "// No arquivo único publicado, #ita-data tem prioridade sobre este arquivo.\n" +
  "window.ITA_DATA = " +
  JSON.stringify(data, null, 2) +
  ";\n";
fs.writeFileSync(path.join(root, "js/data.js"), dataJs);
console.log("js/data.js regenerado a partir de data/cardapio.json");

// 2. imagens -> data URLs (para embutir no arquivo único)
function dataUrl(file) {
  const ext = path.extname(file).slice(1).toLowerCase();
  const mime = ext === "png" ? "image/png" : "image/jpeg";
  return `data:${mime};base64,` + readBuf(file).toString("base64");
}
const imgMap = {
  "assets/images/logo.jpg": dataUrl("assets/images/logo.jpg"),
  "assets/images/hero.jpg": dataUrl("assets/images/hero.jpg"),
};

// 3. concatena JS (assets.js com imagens embutidas)
const mainJs = JS_FILES.map((f) => {
  let code = read(f);
  if (f === "js/assets.js") {
    for (const [p, url] of Object.entries(imgMap)) {
      code = code.split(`"${p}"`).join(`"${url}"`);
    }
  }
  return code;
}).join("\n\n");

// 4. CSS
const reset = read("css/reset.css");
const style = read("css/style.css");

// 4b. envolve no mesmo IIFE do original (escopo + "use strict")
const mainWrapped = "(function(){\n\"use strict\";\n" + mainJs + "\n})();\n";

// 5. monte o documento (mesma forma do original)
const dataInline = JSON.stringify(data).replace(/</g, "\\u003c");
const html =
  "<!doctype html><html><head><meta charset=utf8>" +
  '<meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover">' +
  "<style>" +
  reset +
  "</style></head><body>" +
  "<title>Ita Burger</title>" +
  '<meta name="claude:viewport-fit-sides" content="cover">' +
  '<link id="ita-fonts" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@500;600;700&family=Bowlby+One&display=swap">' +
  '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>' +
  '<style id="ita-css">' +
  style +
  '</style><div id="app"></div>' +
  '<script type="application/json" id="ita-data">' +
  dataInline +
  "<\/script>" +
  '<script id="ita-main">' +
  mainWrapped +
  "<\/script></body></html>\n";

const outDir = path.join(root, "dist");
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, "Ita Burger.html");
fs.writeFileSync(outFile, html);
console.log(`OK -> dist/Ita Burger.html (${(html.length / 1024).toFixed(1)} KB)`);
console.log("Sirva com:  npx serve .   ou   python3 -m http.server");
