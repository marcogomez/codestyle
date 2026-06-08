#!/usr/bin/env node

import { runInit } from "../lib/init.mjs";

const args = process.argv.slice(2);
const command = args[0];

if (command !== "init") {
  console.log(`Usage: codestyle init [--editor <vscode|zed|all>]

Commands:
  init    Create or update editor settings with format-on-save and ESLint integration

Options:
  --editor vscode   VS Code / VSCodium (default)
  --editor zed      Zed
  --editor all      All supported editors`);
  process.exit(command ? 1 : 0);
}

let editor = "vscode";
const editorFlagIndex = args.indexOf("--editor");
if (editorFlagIndex !== -1 && args[editorFlagIndex + 1]) {
  editor = args[editorFlagIndex + 1];
  if (!["vscode", "zed", "all"].includes(editor)) {
    console.error(`Unknown editor: ${editor}. Supported: vscode, zed, all`);
    process.exit(1);
  }
} else if (args.includes("--all")) {
  editor = "all";
}

runInit(process.cwd(), { editor });
