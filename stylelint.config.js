module.exports = {
  "extends": [
    "stylelint-config-standard"
  ],
  "plugins": [
    // Plugin with a specialized bunch of rules specifically for SCSS.
    "stylelint-scss"
  ],
  "rules": {
    // Disabled, since it conflicts with SCSS/SASS stuff like `@include`.
    "at-rule-no-unknown": null,
    // The corresponding rule for SCSS.
    "scss/at-rule-no-unknown": true,

    // Personal style decision about how hex-colors should be formatted.
    "color-hex-case": "upper",
    "color-hex-length": "long",

    /*
      Function calls should be lowercase regularly. However, there are some
      browser-specific functions that might be case sensitive, so they
      should be ignored.
     */
    "function-name-case": [
      "lower",
      {
        "ignoreFunctions": [
          "Alpha",
          "progid:DXImageTransform.Microsoft.BasicImage",
          "DXImageTransform.Microsoft.BasicImage"
        ]
      }
    ],

    // Enforcing a newline at the end of a file could not be less important.
    "no-missing-end-of-source-newline": null,

    /*
      There are quite a lot of cases where its perfectly suitable to use
      multiple selectors in the same row. Thus, adding a newline after the
      separating `,` should only be required in case of multiline declarations.
    */
    "selector-list-comma-newline-after": "always-multi-line",

    // Opinionated list of allowed units.
    "unit-whitelist": [
      "vh",
      "em",
      "rem",
      "%",
      "s",
      "px",
      "deg"
    ],

    /*
      Ignore some non-standard properties that got added for specific browsers
      supporting them.
     */
    "property-no-unknown": [
      true,
      {
        "ignoreProperties": [
          "font-smooth",
          "local"
        ]
      }
    ],

    // Extended rule to ignore custom elements (e.g. angular or web components).
    "selector-type-no-unknown": [
      true,
      {
        ignore: ["default-namespace"]
      }
    ]
  }
};
