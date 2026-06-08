import fs from "fs";
import { describe, it, expect } from "vitest";
import { createConfig } from "../eslint.config.mjs";
import prettierConfig from "../prettier.config.mjs";

describe("eslint config", () => {
  it("exports createConfig as a function", () => {
    expect(typeof createConfig).toBe("function");
  });

  it("createConfig returns an array", () => {
    const config = createConfig();
    expect(Array.isArray(config)).toBe(true);
  });

  it("createConfig returns a non-empty array", () => {
    const config = createConfig();
    expect(config.length).toBeGreaterThan(0);
  });

  it("accepts tsconfigRootDir option", () => {
    const config = createConfig({ tsconfigRootDir: "/custom/path" });
    expect(Array.isArray(config)).toBe(true);
  });

  it("accepts extraIgnores option", () => {
    const config = createConfig({ extraIgnores: ["**/generated/**"] });
    expect(Array.isArray(config)).toBe(true);
  });

  it("accepts extraRules option", () => {
    const config = createConfig({ extraRules: { "no-console": "warn" } });
    expect(Array.isArray(config)).toBe(true);
  });

  it("accepts extraGlobals option", () => {
    const config = createConfig({ extraGlobals: { MY_GLOBAL: "readonly" } });
    expect(Array.isArray(config)).toBe(true);
  });

  it("accepts custom testFiles option", () => {
    const config = createConfig({ testFiles: ["**/*.spec.ts"] });
    expect(Array.isArray(config)).toBe(true);
  });
});

describe("prettier config", () => {
  it("exports a config object", () => {
    expect(typeof prettierConfig).toBe("object");
  });

  it("sets printWidth to 120", () => {
    expect(prettierConfig.printWidth).toBe(120);
  });

  it("uses double quotes", () => {
    expect(prettierConfig.singleQuote).toBe(false);
  });

  it("uses 2-space tabs", () => {
    expect(prettierConfig.tabWidth).toBe(2);
    expect(prettierConfig.useTabs).toBe(false);
  });

  it("uses semicolons", () => {
    expect(prettierConfig.semi).toBe(true);
  });

  it("uses no trailing commas", () => {
    expect(prettierConfig.trailingComma).toBe("none");
  });

  it("uses auto end of line", () => {
    expect(prettierConfig.endOfLine).toBe("auto");
  });

  it("always uses arrow parens", () => {
    expect(prettierConfig.arrowParens).toBe("always");
  });
});

describe("tsconfig", () => {
  it("base.json exists and is valid JSON", () => {
    const raw = fs.readFileSync(new URL("../tsconfig/base.json", import.meta.url), "utf8");
    const config = JSON.parse(raw);
    expect(config.compilerOptions).toBeDefined();
  });

  it("enables strict mode", () => {
    const raw = fs.readFileSync(new URL("../tsconfig/base.json", import.meta.url), "utf8");
    const config = JSON.parse(raw);
    expect(config.compilerOptions.strict).toBe(true);
  });

  it("targets ES2022", () => {
    const raw = fs.readFileSync(new URL("../tsconfig/base.json", import.meta.url), "utf8");
    const config = JSON.parse(raw);
    expect(config.compilerOptions.target).toBe("ES2022");
  });

  it("uses ESNext modules", () => {
    const raw = fs.readFileSync(new URL("../tsconfig/base.json", import.meta.url), "utf8");
    const config = JSON.parse(raw);
    expect(config.compilerOptions.module).toBe("ESNext");
  });

  it("uses Bundler module resolution", () => {
    const raw = fs.readFileSync(new URL("../tsconfig/base.json", import.meta.url), "utf8");
    const config = JSON.parse(raw);
    expect(config.compilerOptions.moduleResolution).toBe("Bundler");
  });

  it("enables declaration and declaration maps", () => {
    const raw = fs.readFileSync(new URL("../tsconfig/base.json", import.meta.url), "utf8");
    const config = JSON.parse(raw);
    expect(config.compilerOptions.declaration).toBe(true);
    expect(config.compilerOptions.declarationMap).toBe(true);
  });

  it("rejects unused locals and parameters", () => {
    const raw = fs.readFileSync(new URL("../tsconfig/base.json", import.meta.url), "utf8");
    const config = JSON.parse(raw);
    expect(config.compilerOptions.noUnusedLocals).toBe(true);
    expect(config.compilerOptions.noUnusedParameters).toBe(true);
  });

  it("excludes dist directory", () => {
    const raw = fs.readFileSync(new URL("../tsconfig/base.json", import.meta.url), "utf8");
    const config = JSON.parse(raw);
    expect(config.exclude).toContain("dist");
  });
});
