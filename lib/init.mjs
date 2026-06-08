import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

export const VSCODE_SETTINGS = {
  "editor.tabSize": 2,
  "editor.renderWhitespace": "trailing",
  "files.trimTrailingWhitespace": true,
  "eslint.workingDirectories": [{ mode: "auto" }],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true,
    "editor.tabSize": 2
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true,
    "editor.tabSize": 2
  },
  "[json][jsonc]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true,
    "editor.tabSize": 2
  },
  "[html]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.tabSize": 2
  }
};

export const ZED_SETTINGS = {
  tab_size: 2,
  formatter: "prettier",
  format_on_save: "on",
  remove_trailing_whitespace_on_save: true,
  languages: {
    TypeScript: { formatter: "prettier", tab_size: 2 },
    TSX: { formatter: "prettier", tab_size: 2 },
    JSON: { formatter: "prettier", tab_size: 2 },
    HTML: { formatter: "prettier", tab_size: 2 }
  }
};

export function mergeSettings(existing, incoming) {
  const merged = { ...existing };

  for (const key of Object.keys(incoming)) {
    if (typeof incoming[key] === "object" && !Array.isArray(incoming[key])) {
      if (typeof existing[key] === "object" && !Array.isArray(existing[key])) {
        merged[key] = { ...existing[key], ...incoming[key] };
      } else {
        merged[key] = incoming[key];
      }
    } else {
      merged[key] = incoming[key];
    }
  }

  return merged;
}

function writeEditorSettings(cwd, dirName, fileName, settings, editorName) {
  const dir = join(cwd, dirName);
  const settingsPath = join(dir, fileName);

  if (!existsSync(dir)) {
    mkdirSync(dir);
  }

  let existing = {};
  if (existsSync(settingsPath)) {
    try {
      const raw = readFileSync(settingsPath, "utf8");
      existing = JSON.parse(raw);
      console.log(`Found existing ${dirName}/${fileName} — merging...`);
    } catch {
      console.error(`Error: ${dirName}/${fileName} exists but is not valid JSON. Aborting.`);
      process.exit(1);
    }
  }

  const merged = mergeSettings(existing, settings);
  writeFileSync(settingsPath, JSON.stringify(merged, null, 2) + "\n");
  console.log(`${editorName}: ${dirName}/${fileName} is ready.`);

  return merged;
}

export function runInit(cwd, options = {}) {
  const { editor = "vscode" } = options;
  const results = {};

  if (editor === "vscode" || editor === "all") {
    results.vscode = writeEditorSettings(cwd, ".vscode", "settings.json", VSCODE_SETTINGS, "VS Code");
    console.log("Recommended VS Code extension: esbenp.prettier-vscode");
  }

  if (editor === "zed" || editor === "all") {
    if (editor === "all") {
      console.log("");
    }
    results.zed = writeEditorSettings(cwd, ".zed", "settings.json", ZED_SETTINGS, "Zed");
  }

  return results;
}
