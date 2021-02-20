module.exports = {
  arrowParens: "avoid",
  bracketSpacing: true,
  printWidth: 100,
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: "all",
  jsxSingleQuote: false,
  jsxBracketSameLine: false,
  useTabs: false,
  overrides: [
    {
      files: "*.{html}",
      options: {
        parser: "angular",
        htmlWhitespaceSensitivity: "ignore",
        printWidth: 150,
        tabWidth: 2,
      },
    },
    {
      files: "*.wxss",
      options: {
        parser: "css",
      },
    },
  ],
};
