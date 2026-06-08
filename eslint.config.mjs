import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import prettier from "eslint-plugin-prettier/recommended";
import importPlugin from "eslint-plugin-import";
import jest from "eslint-plugin-jest";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export function createConfig(options = {}) {
  const {
    tsconfigRootDir = process.cwd(),
    extraIgnores = [],
    extraGlobals = {},
    extraRules = {},
    testFiles = [
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.spec.ts",
      "**/*.spec.tsx",
      "**/jest-setup.ts",
      "**/jest.setup.ts",
      "**/setupMocks.ts"
    ]
  } = options;

  return defineConfig(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    prettier,
    {
      ignores: [
        "**/node_modules/",
        "**/build/",
        "**/dist/",
        "**/temp/",
        "**/demo/",
        "**/manual/",
        "**/test/",
        "**/*.js",
        "**/*.cjs",
        "**/*.mjs",
        "**/*.d.ts",
        "**/vite.config.ts",
        "**/build.ts",
        "**/tsup.config.ts",
        ...extraIgnores
      ]
    },
    {
      files: ["**/*.ts", "**/*.tsx"],
      languageOptions: {
        parser: tseslint.parser,
        parserOptions: {
          project: true,
          tsconfigRootDir
        },
        globals: {
          ...globals.browser,
          ...globals.node,
          ...globals.es2021,
          ...extraGlobals
        }
      },
      plugins: {
        import: importPlugin
      },
      rules: {
        curly: ["error", "all"],
        eqeqeq: ["error", "always"],
        "for-direction": "error",
        "getter-return": "error",
        "no-async-promise-executor": "error",
        "no-case-declarations": "error",
        "no-class-assign": "error",
        "no-compare-neg-zero": "error",
        "no-cond-assign": "error",
        "no-const-assign": "error",
        "no-constant-condition": "error",
        "no-control-regex": "error",
        "no-debugger": "error",
        "no-delete-var": "error",
        "no-dupe-args": "error",
        "no-dupe-class-members": "error",
        "no-dupe-else-if": "error",
        "no-dupe-keys": "error",
        "no-duplicate-case": "error",
        "no-empty": "error",
        "no-empty-character-class": "error",
        "no-empty-function": "error",
        "no-empty-pattern": "error",
        "no-ex-assign": "error",
        "no-extra-boolean-cast": "error",
        "no-extra-semi": "error",
        "no-fallthrough": "error",
        "no-func-assign": "error",
        "no-global-assign": "error",
        "no-import-assign": "error",
        "no-inner-declarations": "error",
        "no-invalid-regexp": "error",
        "no-irregular-whitespace": "error",
        "no-loss-of-precision": "error",
        "no-misleading-character-class": "error",
        "no-mixed-spaces-and-tabs": "error",
        "no-new-symbol": "error",
        "no-nonoctal-decimal-escape": "error",
        "no-obj-calls": "error",
        "no-octal": "error",
        "no-prototype-builtins": "error",
        "no-redeclare": "error",
        "no-regex-spaces": "error",
        "no-self-assign": "error",
        "no-setter-return": "error",
        "no-shadow-restricted-names": "error",
        "no-sparse-arrays": "error",
        "no-this-before-super": "error",
        "no-undef": "error",
        "no-unexpected-multiline": "error",
        "no-unreachable": "error",
        "no-unsafe-finally": "error",
        "no-unsafe-negation": "error",
        "no-unsafe-optional-chaining": "error",
        "no-unused-labels": "error",
        "no-unused-vars": "off",
        "no-useless-backreference": "error",
        "no-useless-catch": "error",
        "no-useless-escape": "error",
        "no-with": "error",
        "require-yield": "error",
        "use-isnan": "error",
        "valid-typeof": "error",

        "prettier/prettier": "error",
        "max-len": ["error", { code: 120 }],

        "@typescript-eslint/no-inferrable-types": "off",
        "@typescript-eslint/no-non-null-assertion": "error",
        "@typescript-eslint/no-unused-vars": [
          "error",
          {
            vars: "all",
            varsIgnorePattern: "React",
            args: "after-used",
            argsIgnorePattern: "^_",
            ignoreRestSiblings: true,
            caughtErrors: "all"
          }
        ],

        "sort-imports": [
          "error",
          {
            ignoreDeclarationSort: true,
            ignoreMemberSort: false,
            allowSeparatedGroups: true
          }
        ],
        "import/order": [
          "error",
          {
            groups: [
              ["builtin", "external"],
              ["internal", "parent", "sibling", "index"],
              ["object", "type"]
            ],
            "newlines-between": "always",
            alphabetize: {
              order: "asc",
              caseInsensitive: true
            }
          }
        ],

        ...extraRules
      }
    },
    {
      files: ["**/*.tsx", "**/*.jsx"],
      plugins: {
        react,
        "react-hooks": reactHooks
      },
      settings: {
        react: {
          version: "detect"
        }
      },
      rules: {
        "react/jsx-key": "error",
        "react/jsx-no-duplicate-props": "error",
        "react/jsx-no-undef": "error",
        "react/jsx-uses-react": "error",
        "react/jsx-uses-vars": "error",
        "react/no-children-prop": "error",
        "react/no-danger-with-children": "error",
        "react/no-deprecated": "error",
        "react/no-direct-mutation-state": "error",
        "react/no-find-dom-node": "error",
        "react/no-is-mounted": "error",
        "react/no-render-return-value": "error",
        "react/no-string-refs": "error",
        "react/no-unescaped-entities": "error",
        "react/no-unknown-property": "error",
        "react/require-render-return": "error",
        "react/self-closing-comp": "error",
        "react/react-in-jsx-scope": "off",
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "error"
      }
    },
    {
      files: testFiles,
      ...jest.configs["flat/recommended"]
    }
  );
}

export default createConfig();
