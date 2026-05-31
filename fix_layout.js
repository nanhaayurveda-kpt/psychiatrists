const fs = require("fs");
const path = require("path");

const BASE = "F:\\psychiatrists";

// layout.js
const layoutPath = path.join(BASE, "app\\layout.js");
let layout = fs.readFileSync(layoutPath, "utf8");
layout = layout.replace("max-w-2xl mx-auto px-4 pt-16 pb-8", "max-w-5xl mx-auto px-4 pt-16 pb-8");
fs.writeFileSync(layoutPath, layout, "utf8");
console.log("DONE: app\\layout.js");

// TopBar.js
const topbarPath = path.join(BASE, "components\\TopBar.js");
let topbar = fs.readFileSync(topbarPath, "utf8");
topbar = topbar.replace("max-w-2xl mx-auto flex items-center gap-1 px-3 py-2 overflow-x-auto scrollbar-none", "max-w-5xl mx-auto flex items-center gap-1 px-3 py-2 overflow-x-auto scrollbar-none");
fs.writeFileSync(topbarPath, topbar, "utf8");
console.log("DONE: components\\TopBar.js");

console.log("\nसब हो गया!");