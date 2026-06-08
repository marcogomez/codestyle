import fs from "fs";
import os from "os";
import path from "path";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { VSCODE_SETTINGS, ZED_SETTINGS, mergeSettings, runInit } from "../lib/init.mjs";

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "codestyle-test-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true });
});

function readVscodeResult() {
  return JSON.parse(fs.readFileSync(path.join(tmpDir, ".vscode", "settings.json"), "utf8"));
}

function readZedResult() {
  return JSON.parse(fs.readFileSync(path.join(tmpDir, ".zed", "settings.json"), "utf8"));
}

describe("VSCODE_SETTINGS", () => {
  it("sets editor.tabSize to 2 at top level", () => {
    expect(VSCODE_SETTINGS["editor.tabSize"]).toBe(2);
  });

  it("sets tabSize 2 in all language-scoped blocks", () => {
    expect(VSCODE_SETTINGS["[typescript]"]["editor.tabSize"]).toBe(2);
    expect(VSCODE_SETTINGS["[typescriptreact]"]["editor.tabSize"]).toBe(2);
    expect(VSCODE_SETTINGS["[json][jsonc]"]["editor.tabSize"]).toBe(2);
    expect(VSCODE_SETTINGS["[html]"]["editor.tabSize"]).toBe(2);
  });

  it("uses prettier as formatter for all managed languages", () => {
    expect(VSCODE_SETTINGS["[typescript]"]["editor.defaultFormatter"]).toBe("esbenp.prettier-vscode");
    expect(VSCODE_SETTINGS["[typescriptreact]"]["editor.defaultFormatter"]).toBe("esbenp.prettier-vscode");
    expect(VSCODE_SETTINGS["[json][jsonc]"]["editor.defaultFormatter"]).toBe("esbenp.prettier-vscode");
    expect(VSCODE_SETTINGS["[html]"]["editor.defaultFormatter"]).toBe("esbenp.prettier-vscode");
  });

  it("enables format on save for typescript and typescriptreact", () => {
    expect(VSCODE_SETTINGS["[typescript]"]["editor.formatOnSave"]).toBe(true);
    expect(VSCODE_SETTINGS["[typescriptreact]"]["editor.formatOnSave"]).toBe(true);
  });

  it("enables eslint fix on save", () => {
    expect(VSCODE_SETTINGS["editor.codeActionsOnSave"]["source.fixAll.eslint"]).toBe("explicit");
  });

  it("enables monorepo eslint working directories", () => {
    expect(VSCODE_SETTINGS["eslint.workingDirectories"]).toEqual([{ mode: "auto" }]);
  });

  it("trims trailing whitespace", () => {
    expect(VSCODE_SETTINGS["files.trimTrailingWhitespace"]).toBe(true);
  });
});

describe("ZED_SETTINGS", () => {
  it("sets tab_size to 2", () => {
    expect(ZED_SETTINGS.tab_size).toBe(2);
  });

  it("uses prettier as formatter", () => {
    expect(ZED_SETTINGS.formatter).toBe("prettier");
  });

  it("enables format on save", () => {
    expect(ZED_SETTINGS.format_on_save).toBe("on");
  });

  it("removes trailing whitespace on save", () => {
    expect(ZED_SETTINGS.remove_trailing_whitespace_on_save).toBe(true);
  });

  it("configures TypeScript language settings", () => {
    expect(ZED_SETTINGS.languages.TypeScript.formatter).toBe("prettier");
    expect(ZED_SETTINGS.languages.TypeScript.tab_size).toBe(2);
  });

  it("configures TSX language settings", () => {
    expect(ZED_SETTINGS.languages.TSX.formatter).toBe("prettier");
    expect(ZED_SETTINGS.languages.TSX.tab_size).toBe(2);
  });

  it("configures JSON language settings", () => {
    expect(ZED_SETTINGS.languages.JSON.formatter).toBe("prettier");
    expect(ZED_SETTINGS.languages.JSON.tab_size).toBe(2);
  });

  it("configures HTML language settings", () => {
    expect(ZED_SETTINGS.languages.HTML.formatter).toBe("prettier");
    expect(ZED_SETTINGS.languages.HTML.tab_size).toBe(2);
  });
});

describe("mergeSettings", () => {
  it("returns codestyle settings when no existing settings", () => {
    const result = mergeSettings({}, VSCODE_SETTINGS);
    expect(result["editor.tabSize"]).toBe(2);
    expect(result["[typescript]"]["editor.defaultFormatter"]).toBe("esbenp.prettier-vscode");
  });

  it("preserves user keys that codestyle does not manage", () => {
    const existing = { "editor.fontSize": 14, "workbench.colorTheme": "One Dark Pro" };
    const result = mergeSettings(existing, VSCODE_SETTINGS);
    expect(result["editor.fontSize"]).toBe(14);
    expect(result["workbench.colorTheme"]).toBe("One Dark Pro");
  });

  it("overwrites top-level keys that codestyle manages", () => {
    const existing = { "editor.tabSize": 4, "editor.renderWhitespace": "none" };
    const result = mergeSettings(existing, VSCODE_SETTINGS);
    expect(result["editor.tabSize"]).toBe(2);
    expect(result["editor.renderWhitespace"]).toBe("trailing");
  });

  it("overwrites conflicting keys inside language-scoped blocks", () => {
    const existing = { "[typescript]": { "editor.tabSize": 4, "editor.formatOnSave": false } };
    const result = mergeSettings(existing, VSCODE_SETTINGS);
    expect(result["[typescript]"]["editor.tabSize"]).toBe(2);
    expect(result["[typescript]"]["editor.formatOnSave"]).toBe(true);
  });

  it("preserves user keys inside language-scoped blocks that codestyle does not set", () => {
    const existing = { "[typescript]": { "editor.wordWrap": "on", "editor.tabSize": 4 } };
    const result = mergeSettings(existing, VSCODE_SETTINGS);
    expect(result["[typescript]"]["editor.wordWrap"]).toBe("on");
    expect(result["[typescript]"]["editor.tabSize"]).toBe(2);
  });

  it("does not touch language blocks that codestyle does not manage", () => {
    const existing = { "[python]": { "editor.tabSize": 4, "editor.defaultFormatter": "ms-python.black-formatter" } };
    const result = mergeSettings(existing, VSCODE_SETTINGS);
    expect(result["[python]"]["editor.tabSize"]).toBe(4);
    expect(result["[python]"]["editor.defaultFormatter"]).toBe("ms-python.black-formatter");
  });

  it("overwrites arrays entirely (does not merge array elements)", () => {
    const existing = { "eslint.workingDirectories": ["/custom/path"] };
    const result = mergeSettings(existing, VSCODE_SETTINGS);
    expect(result["eslint.workingDirectories"]).toEqual([{ mode: "auto" }]);
  });

  it("works with Zed settings", () => {
    const existing = { tab_size: 4, theme: "One Dark" };
    const result = mergeSettings(existing, ZED_SETTINGS);
    expect(result.tab_size).toBe(2);
    expect(result.theme).toBe("One Dark");
    expect(result.formatter).toBe("prettier");
  });

  it("overwrites conflicting Zed language settings", () => {
    const existing = { languages: { TypeScript: { tab_size: 4, formatter: "biome" } } };
    const result = mergeSettings(existing, ZED_SETTINGS);
    expect(result.languages.TypeScript.tab_size).toBe(2);
    expect(result.languages.TypeScript.formatter).toBe("prettier");
  });

  it("preserves unmanaged Zed language blocks", () => {
    const existing = { languages: { Python: { tab_size: 4, formatter: "black" } } };
    const result = mergeSettings(existing, ZED_SETTINGS);
    expect(result.languages.Python.tab_size).toBe(4);
    expect(result.languages.Python.formatter).toBe("black");
  });
});

describe("runInit — VS Code (default)", () => {
  it("creates .vscode/settings.json in an empty directory", () => {
    runInit(tmpDir);
    const result = readVscodeResult();
    expect(result["editor.tabSize"]).toBe(2);
    expect(result["[typescript]"]["editor.defaultFormatter"]).toBe("esbenp.prettier-vscode");
  });

  it("creates the .vscode directory if it does not exist", () => {
    expect(fs.existsSync(path.join(tmpDir, ".vscode"))).toBe(false);
    runInit(tmpDir);
    expect(fs.existsSync(path.join(tmpDir, ".vscode"))).toBe(true);
  });

  it("does not create .zed directory by default", () => {
    runInit(tmpDir);
    expect(fs.existsSync(path.join(tmpDir, ".zed"))).toBe(false);
  });

  it("merges with existing settings.json", () => {
    fs.mkdirSync(path.join(tmpDir, ".vscode"));
    fs.writeFileSync(path.join(tmpDir, ".vscode", "settings.json"), JSON.stringify({ "editor.fontSize": 16 }));
    runInit(tmpDir);
    const result = readVscodeResult();
    expect(result["editor.fontSize"]).toBe(16);
    expect(result["editor.tabSize"]).toBe(2);
  });

  it("overwrites conflicting values in existing settings", () => {
    fs.mkdirSync(path.join(tmpDir, ".vscode"));
    fs.writeFileSync(
      path.join(tmpDir, ".vscode", "settings.json"),
      JSON.stringify({
        "editor.tabSize": 4,
        "[typescript]": { "editor.tabSize": 4, "editor.formatOnSave": false }
      })
    );
    runInit(tmpDir);
    const result = readVscodeResult();
    expect(result["editor.tabSize"]).toBe(2);
    expect(result["[typescript]"]["editor.tabSize"]).toBe(2);
    expect(result["[typescript]"]["editor.formatOnSave"]).toBe(true);
  });

  it("produces valid JSON with trailing newline", () => {
    runInit(tmpDir);
    const raw = fs.readFileSync(path.join(tmpDir, ".vscode", "settings.json"), "utf8");
    expect(raw.endsWith("\n")).toBe(true);
    expect(() => JSON.parse(raw)).not.toThrow();
  });

  it("produces 2-space indented JSON", () => {
    runInit(tmpDir);
    const raw = fs.readFileSync(path.join(tmpDir, ".vscode", "settings.json"), "utf8");
    const lines = raw.split("\n");
    const indentedLine = lines.find((l) => l.startsWith("  ") && !l.startsWith("    "));
    expect(indentedLine).toBeDefined();
  });

  it("is idempotent — running twice produces the same result", () => {
    runInit(tmpDir);
    const first = fs.readFileSync(path.join(tmpDir, ".vscode", "settings.json"), "utf8");
    runInit(tmpDir);
    const second = fs.readFileSync(path.join(tmpDir, ".vscode", "settings.json"), "utf8");
    expect(second).toBe(first);
  });

  it("returns an object with vscode key", () => {
    const result = runInit(tmpDir);
    expect(result.vscode).toBeDefined();
    expect(result.vscode["editor.tabSize"]).toBe(2);
  });
});

describe("runInit — Zed", () => {
  it("creates .zed/settings.json", () => {
    runInit(tmpDir, { editor: "zed" });
    const result = readZedResult();
    expect(result.tab_size).toBe(2);
    expect(result.formatter).toBe("prettier");
  });

  it("creates the .zed directory if it does not exist", () => {
    expect(fs.existsSync(path.join(tmpDir, ".zed"))).toBe(false);
    runInit(tmpDir, { editor: "zed" });
    expect(fs.existsSync(path.join(tmpDir, ".zed"))).toBe(true);
  });

  it("does not create .vscode directory when editor is zed", () => {
    runInit(tmpDir, { editor: "zed" });
    expect(fs.existsSync(path.join(tmpDir, ".vscode"))).toBe(false);
  });

  it("merges with existing .zed/settings.json", () => {
    fs.mkdirSync(path.join(tmpDir, ".zed"));
    fs.writeFileSync(
      path.join(tmpDir, ".zed", "settings.json"),
      JSON.stringify({ theme: "Catppuccin Mocha" })
    );
    runInit(tmpDir, { editor: "zed" });
    const result = readZedResult();
    expect(result.theme).toBe("Catppuccin Mocha");
    expect(result.tab_size).toBe(2);
  });

  it("overwrites conflicting Zed values", () => {
    fs.mkdirSync(path.join(tmpDir, ".zed"));
    fs.writeFileSync(
      path.join(tmpDir, ".zed", "settings.json"),
      JSON.stringify({ tab_size: 4, formatter: "biome" })
    );
    runInit(tmpDir, { editor: "zed" });
    const result = readZedResult();
    expect(result.tab_size).toBe(2);
    expect(result.formatter).toBe("prettier");
  });

  it("returns an object with zed key", () => {
    const result = runInit(tmpDir, { editor: "zed" });
    expect(result.zed).toBeDefined();
    expect(result.zed.tab_size).toBe(2);
  });

  it("is idempotent", () => {
    runInit(tmpDir, { editor: "zed" });
    const first = fs.readFileSync(path.join(tmpDir, ".zed", "settings.json"), "utf8");
    runInit(tmpDir, { editor: "zed" });
    const second = fs.readFileSync(path.join(tmpDir, ".zed", "settings.json"), "utf8");
    expect(second).toBe(first);
  });
});

describe("runInit — all editors", () => {
  it("creates both .vscode and .zed directories", () => {
    runInit(tmpDir, { editor: "all" });
    expect(fs.existsSync(path.join(tmpDir, ".vscode", "settings.json"))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, ".zed", "settings.json"))).toBe(true);
  });

  it("returns both vscode and zed results", () => {
    const result = runInit(tmpDir, { editor: "all" });
    expect(result.vscode["editor.tabSize"]).toBe(2);
    expect(result.zed.tab_size).toBe(2);
  });

  it("writes correct content to both files", () => {
    runInit(tmpDir, { editor: "all" });
    const vscode = readVscodeResult();
    const zed = readZedResult();
    expect(vscode["[typescript]"]["editor.defaultFormatter"]).toBe("esbenp.prettier-vscode");
    expect(zed.languages.TypeScript.formatter).toBe("prettier");
  });
});
