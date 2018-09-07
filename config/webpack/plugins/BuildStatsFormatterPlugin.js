const fs = require("fs-extra");
const glob = require("globby");
const chalk = require("chalk");
const path = require("path");
const filesize = require("filesize");
const stripAnsi = require("strip-ansi");
const zlib = require("zlib");

const relevantSizeComparisonRegex = /\.(js|css|json|webmanifest)$/;
const catchAllCategories = "#";

/**
 * Helper function to determine the gzipped size of a content.
 *
 * @param src {String|Buffer} Content to determine the size for.
 * @param gzipOpts {Object} Gzip options to apply - esp. the `level` affects the output size.
 *                          Should fit the `ZlibOptions` shape.
 * @returns {number} The size of the gzipped content in bytes.
 */
function gzipSizeOf(src, gzipOpts) {
  return zlib.gzipSync(src, gzipOpts).length;
}

/**
 * Aligns a string to fit a particular minimal width. The width is expanded
 * with spaces in case the adjustment is required, otherwise, this function
 * does nothing.
 * The size of the provided input is determined without any bytes that refer
 * to text coloring, i.e. those that do not affect the required text space.
 * See the `strip-ansi` library for details.
 *
 * @param originalLabel {String} Label to adjust.
 * @param to {number} Target size to adjust the label to.
 * @returns {String} The aligned string.
 */
function alignPad(originalLabel, to) {
  let sizeLength = stripAnsi(originalLabel).length;
  if (sizeLength < to) {
    const rightPadding = " ".repeat(to - sizeLength);
    originalLabel += rightPadding;
  }
  return originalLabel;
}

/**
 * Helper function that partitions an array via a predicate.
 *
 * @param src {Array}
 * @param predicate {Function}
 * @returns {Array[]} An array with two elements:
 *                    - The first element is an array with every element that fulfills the predicate.
 *                    - The second element contains every other entry.
 */
function partition(src, predicate) {
  const res1 = [],
    res2 = [];

  for (let e of src) {
    if (predicate(e)) {
      res1.push(e);
    } else {
      res2.push(e);
    }
  }

  return [res1, res2];
}

/**
 * Helper function to create a headline for an assets category.
 *
 * @param longestFileNameSize {number} The length of the longest file path.
 * @param longestSrcSizeLabelLength {number} The length of the longest "minified size" value.
 * @param longestGzipSizeLabelLength {number} The length of the longest "gzipped size" value.
 * @param colorer {Function} Coloring function to apply on the headline labels.
 * @returns {string} The generated headline.
 */
function createHeadline(
  longestFileNameSize,
  longestSrcSizeLabelLength,
  longestGzipSizeLabelLength,
  colorer
) {
  return [
    alignPad("", longestFileNameSize),
    alignPad(withTableCellPadding(colorer("min.")), longestSrcSizeLabelLength),
    alignPad(colorer("gzip"), longestGzipSizeLabelLength)
  ].join(" ");
}

/**
 * Minimal helper function to apply a padding to a table cell.
 * Should only be applied on cells without an outer border.
 *
 * @param src {String} The table cell content to pad.
 * @returns {string} The padded content.
 */
function withTableCellPadding(src) {
  return `  ${src}  `;
}

/**
 * Helper function to validate the plugin options - check if a provided value is a `RegExp`.
 *
 * @param src {Object} The object to test for being a `RegExp`.
 * @returns {boolean} `true` if the provided value is a `RegExp`, `false` otherwise.
 */
function isRegExp(src) {
  return !!(src.constructor && src.constructor.name === "RegExp");
}

/**
 * Validates a set of provided options for being valid for usage by the plugin.
 * Throws an error if anything is malformed.
 *
 * @param options {Object} The options to validate.
 */
function validateOptions(options) {
  // `log` is an object that has to provide the following functions:
  // `debug`, `note`, `warn`, `error` , `category`.
  {
    const hasLogProperty = options.hasOwnProperty("log");
    const expectedFunctions = ["debug", "note", "category", "warn", "error"];
    const hasValidShape =
      hasLogProperty &&
      expectedFunctions.every(
        k => !!options.log[k] && typeof options.log[k] === "function"
      );

    if (!hasValidShape) {
      throw new Error(
        `'log' has to contain at least these functions: ${expectedFunctions.join()}.`
      );
    }
  }
  // .categorizeAssets has to be either `false` or an object with entries like {'string', 'RegExp'}.
  {
    const isFalse = options.categorizeAssets === false;
    const isValidObject =
      !isFalse &&
      Object.entries(options.categorizeAssets).every(
        ([key, value]) => typeof key === "string" && isRegExp(value)
      );

    if (!isFalse && !isValidObject) {
      throw new Error(
        "'categorizeAssets' has to be either 'false' or an object of shape {'string', 'RegExp'}."
      );
    }
  }
  const isPositiveNumber = num => typeof num === "number" && num >= 0;
  const isPositiveInteger = num =>
    isPositiveNumber(num) && Number.isInteger(num);
  // `assetsSizeWarnLimit` has to be a positive numeric value.
  {
    if (!isPositiveNumber(options.assetsSizeWarnLimit)) {
      throw new Error(
        "'assetsSizeWarnLimit' has to be a positive numeric value."
      );
    }
  }
  // `potentiallyExtractedChunkSizeLimit` has to be a positive numeric value.
  {
    if (!isPositiveNumber(options.potentiallyExtractedChunkSizeLimit)) {
      throw new Error(
        "'potentiallyExtractedChunkSizeLimit' has to be a positive numeric value."
      );
    }
  }
  // `gzipDisplayOpts` should match a subset of `ZlibOptions` (see `zlib` standard library).
  // Is should at least contain a `level` property, a positive integer value.
  {
    const isObject = typeof options.gzipDisplayOpts === "object";
    const hasNumericLevelProperty =
      isObject && isPositiveInteger(options.gzipDisplayOpts.level);

    if (!isObject || !hasNumericLevelProperty) {
      throw new Error(
        "'gzipDisplayOpts' has to match `Partial<ZlibOptions>`, but at least has to contain a 'level'  property."
      );
    }
  }
}

/**
 * Plugin to generate an overview of the emitted output of your build.
 * Displays paths, sizes (both w/ and w/o gzip applied to it), size differences to the previous build
 * and optionally categories.
 * In general, this is only useful in production builds, since sizes are quite irrelevant in
 * development mode.
 *
 * Note: If you're using `clean-webpack-plugin` along with this one and clear the build output directory with it,
 * you have to set its `beforeEmit` to `true` if you want to use the size difference feature.
 */
class BuildStatsFormatterPlugin {
  /**
   * Constructor of the plugin.
   *
   * @param options {Object} Configuration object for the plugin. Validated via `validateOptions`, which also defines the required shape.
   */
  constructor(options) {
    validateOptions(options);

    this.log = options.log;

    this.assetCategories =
      options.categorizeAssets === false
        ? { [catchAllCategories]: /.+/ } // Use arbitrary matcher in case we must not categorize the output.
        : options.categorizeAssets;

    this.assetsSizeWarnLimit = options.assetsSizeWarnLimit;
    this.potentiallyExtractedChunkSizeLimit =
      options.potentiallyExtractedChunkSizeLimit;
    this.gzipDisplayOpts = options.gzipDisplayOpts;
  }

  /**
   * Function called by webpack when this plugin is applied to its compiler.
   *
   * @param compiler {Object} The webpack compiler object.
   */
  apply(compiler) {
    this.sourcePath = compiler.options.output.path;
    compiler.hooks.environment.tap("BuildStatsFormatterPlugin", () => {
      this.determineFileSizesBeforeBuild();
    });

    compiler.hooks.done.tap("BuildStatsFormatterPlugin", stats => {
      this.printFileSizes(stats);
    });
  }

  /**
   * Helper function to determine the asset sizes from the previous build, if available.
   * Note that it only picks up js, css, json and webmanifest files, since their size has the highest chance to
   * vary between builds.
   */
  determineFileSizesBeforeBuild() {
    const globbed = glob.sync(["**/*.{js,css,json,webmanifest}"], {
      cwd: this.sourcePath,
      absolute: true
    });

    try {
      this.previousFileSizes = globbed.reduce((result, fileName) => {
        const contents = fs.readFileSync(fileName);
        const key = this.getRelativeChunkName(fileName);
        const originalSize = fs.statSync(fileName).size;
        result[key] = {
          original: originalSize,
          gzip: gzipSizeOf(contents, this.gzipDisplayOpts)
        };
        return result;
      }, {});
    } catch (e) {
      this.log.error(
        `Determining file sizes before build failed, due to ${e}, going ahead with empty object.`
      );
      this.previousFileSizes = {};
    }
  }

  /**
   * Prints file stats about a particular set of assets, depending on the
   * categorization config.
   *
   * @param previousFileSizes File sizes from a previous build.
   * @param assetsStats The stats to evaluate.
   * @param exceptionalAssetCnt An object to modify in case "exceptional" assets are found,
   *                            i.e. those that are too large (w.r.t. the build config) or
   *                            might be extracted. The object is updated in case those are
   *                            found, to provide proper statistics.
   */
  formatFileSizesOnAssetCategory(
    previousFileSizes,
    assetsStats,
    exceptionalAssetCnt
  ) {
    /*
      Collect several assets stats:
      - The target folder.
      - The name.
      - The original size.
      - The size in gzipped form.
      - The generated size information labels.
     */
    const missingPreviousVersion = [];

    const assets = assetsStats.map(asset => {
      const filePath = path.join(this.sourcePath, asset.name);
      const fileContents = fs.readFileSync(filePath);
      const originalFileSize = fs.statSync(filePath).size;
      const gzipSize = gzipSizeOf(fileContents, this.gzipDisplayOpts);

      const originalSizeDiff = this.determineSizeDiff(
        previousFileSizes,
        asset.name,
        originalFileSize,
        "original",
        1024 * 50 * 3
      );
      const gzipSizeDiff = this.determineSizeDiff(
        previousFileSizes,
        asset.name,
        gzipSize,
        "gzip",
        1024 * 50
      );

      if (!originalSizeDiff || !gzipSizeDiff) {
        missingPreviousVersion.push(asset.name);
      }

      return {
        folder: path.join(path.dirname(asset.name)),
        name: path.basename(asset.name),
        originalFileSize,
        size: gzipSize,
        sizeLabel: {
          // We only have to pad the "src" entry here, since it is the only non-edge field.
          src: withTableCellPadding(
            `${filesize(originalFileSize)}${originalSizeDiff}`
          ),
          gzip: `${filesize(gzipSize)}${gzipSizeDiff}`
        }
      };
    });

    // The output should be sorted by the gzip size of that file.
    assets.sort((a, b) => b.size - a.size);

    // Readability optimization: Ensure that labels have equivalent length,
    // so that all formatting is properly aligned.
    const longestSrcSizeLabelLength = Math.max.apply(
      null,
      assets.map(a => stripAnsi(a.sizeLabel.src).length)
    );
    const longestGzipSizeLabelLength = Math.max.apply(
      null,
      assets.map(a => stripAnsi(a.sizeLabel.gzip).length)
    );
    const longestFileNameSize = Math.max.apply(
      null,
      assets.map(a => stripAnsi(a.folder + path.sep + a.name).length)
    );

    const headline = createHeadline(
      longestFileNameSize,
      longestSrcSizeLabelLength,
      longestGzipSizeLabelLength,
      chalk.grey
    );

    const formattedAssetsLabels = assets.map(asset => {
      const sizeLabelSrc = alignPad(
        asset.sizeLabel.src,
        longestSrcSizeLabelLength
      );
      const sizeLabelGzip = alignPad(
        asset.sizeLabel.gzip,
        longestGzipSizeLabelLength
      );
      const assetTooLarge = asset.originalFileSize > this.assetsSizeWarnLimit;
      const assetMayBeExtractedChunk =
        asset.originalFileSize < this.potentiallyExtractedChunkSizeLimit &&
        /\.js$/.test(asset.name) &&
        !/service-worker/.test(asset.name);
      if (assetTooLarge) {
        exceptionalAssetCnt.tooLarge++;
      }
      if (assetMayBeExtractedChunk) {
        exceptionalAssetCnt.extracted++;
      }
      const colorer = assetTooLarge
        ? chalk.yellow
        : assetMayBeExtractedChunk
          ? chalk.grey
          : chalk.cyan;

      const assetName = colorer(
        alignPad(asset.name, longestFileNameSize - (asset.folder.length + 1))
      );

      return `${chalk.dim(
        asset.folder + path.sep
      )}${assetName} ${sizeLabelSrc} ${sizeLabelGzip}`;
      /*assetName +
        " @ " +
        sizeLabelSrc +
        " => " +
        sizeLabelGzip*/
    });

    return [headline, formattedAssetsLabels, missingPreviousVersion];
  }

  /**
   * Determines the file differences of the current and the previous build output.
   * This functions is called twice per asset, once for basic and once for gzip size.
   *
   * @param previousFileSizes {Object} The set of file stats of the previous build.
   * @param assetName {String} Path of the assets to check the size difference for.
   * @param currentSize {number} The current file size.
   * @param type {"original"|"gzip"} Reference type of the provided size value.
   * @param alertLimit {number} Size difference limit above which the difference label gets colored in red, indicating an alert.
   * @returns {string} The formatted file size difference.
   */
  determineSizeDiff(
    previousFileSizes,
    assetName,
    currentSize,
    type,
    alertLimit
  ) {
    const relativeName = this.getRelativeChunkName(assetName);
    const previousInfo = previousFileSizes[relativeName];
    if (previousInfo) {
      const difference = currentSize - previousInfo[type];
      const label = this.colorizeDiffLabel(
        difference,
        filesize(difference),
        alertLimit
      );
      return !Number.isNaN(difference) && label ? ` ${label}` : "";
    } else {
      return "";
    }
  }

  /**
   * Colorizes a size difference label.
   *
   * @param difference {number} The determined file size difference.
   * @param currentLabel {String} The current label.
   * @param alertLimit {number} The alert limit - if the difference exceeds the limit, the indicator is colored in red.
   * @returns {String} The colorized difference label. Note: A zero difference is replaced with a simple `=` sign.
   */
  colorizeDiffLabel(difference, currentLabel, alertLimit) {
    let label = currentLabel;
    if (difference > 0) {
      label = `+${label}`;
    } else if (difference === 0) {
      label = "=";
    }

    let coloring;
    switch (true) {
      case difference >= alertLimit:
        coloring = chalk.red;
        break;
      case difference > 0 && difference < alertLimit:
        coloring = chalk.yellow;
        break;
      case difference < 0:
        coloring = chalk.green;
        break;
      default:
        coloring = chalk.grey;
        break;
    }

    return coloring(`(${label})`);
  }

  /**
   * Function to print output file stats for a build.
   *
   * @param webpackStats The stats received from webpack.
   */
  printFileSizes(webpackStats) {
    // If the build is configured to no emit any assets on errors and the build contains some,
    // we have to stop here - no emitted assets, no stats about it.
    if (
      webpackStats.compilation.compiler.options.optimization.noEmitOnErrors &&
      webpackStats.hasErrors()
    ) {
      return;
    }
    // Prints a detailed summary of build files.
    const jsonStats = webpackStats.toJson({}, true);
    const assetsStats = jsonStats.assets;

    const missingPreviousVersion = [];

    let exceptionalAssetCnt = {
      tooLarge: 0,
      extracted: 0
    };
    this.log.note(`Build hash: ${jsonStats.hash}`);
    this.log.note(
      `Emitted assets in ${chalk.cyan(
        path.resolve(this.sourcePath)
      )} (displayed gzip sizes refer to compression ${chalk.cyan(
        "level=" + this.gzipDisplayOpts.level
      )}):`
    );

    /*
      The assets will be consumed step by step w.r.t. the configured categorization.
      I.e. each categorization will only be performed on the remains of the previous
      iteration.
     */
    let remainingAssets = Object.getOwnPropertyNames(
      this.assetCategories
    ).reduce((relevantAssets, c) => {
      const [_relevantAssets, nextAssets] = partition(relevantAssets, asset =>
        this.assetCategories[c].test(asset.name)
      );
      if (_relevantAssets.length > 0) {
        const [
          headline,
          formattedAssetsLabels,
          missingPrevious
        ] = this.formatFileSizesOnAssetCategory(
          this.previousFileSizes,
          _relevantAssets,
          exceptionalAssetCnt
        );
        const highlightedCategoryName =
          c === catchAllCategories ? "" : chalk.bgCyan.white.bold(c);
        this.log.category(
          [highlightedCategoryName, headline]
            .concat(formattedAssetsLabels)
            .join("\n")
        );
        missingPreviousVersion.push(...missingPrevious);
      }
      return nextAssets;
    }, assetsStats);

    // If there are any assets left, they are summarized in a special "Others" category.
    if (remainingAssets.length > 0) {
      const [
        headline,
        formattedAssetsLabels,
        missingPrevious
      ] = this.formatFileSizesOnAssetCategory(
        this.previousFileSizes,
        remainingAssets,
        exceptionalAssetCnt
      );
      this.log.category(
        [chalk.bgCyan.white.bold("Others"), headline]
          .concat(formattedAssetsLabels)
          .join("\n")
      );
      missingPreviousVersion.push(...missingPrevious);
    }

    // Print an information about the amount of too large assets, and how they are marked.
    if (exceptionalAssetCnt.tooLarge > 0) {
      this.log.warn(
        `${exceptionalAssetCnt.tooLarge === 1 ? "There is" : "There are"} ${
          exceptionalAssetCnt.tooLarge
        } assets which exceed the configured size limit of ${filesize(
          this.assetsSizeWarnLimit
        )}. Affected asset(s) marked in ${chalk.yellow("yellow")}.`
      );
    }

    // Print an information about potential extraction remainings, and how they are marked.
    if (exceptionalAssetCnt.extracted > 0) {
      this.log.note(
        `${exceptionalAssetCnt.extracted === 1 ? "There is" : "There are"} ${
          exceptionalAssetCnt.extracted
        } assets which are smaller than the configured lower size limit of ${filesize(
          this.potentiallyExtractedChunkSizeLimit
        )}. Affected asset(s) should be considered remains of extracted chunks and are marked in ${chalk.grey(
          "grey"
        )}.`
      );
    }

    const relevantMissingPreviousVersion = missingPreviousVersion.filter(a =>
      relevantSizeComparisonRegex.test(a)
    );

    if (relevantMissingPreviousVersion.length > 0) {
      this.log.debug(
        `Some assets did not have a previous version: ${JSON.stringify(
          relevantMissingPreviousVersion,
          null,
          4
        )} in ${JSON.stringify(
          Object.getOwnPropertyNames(this.previousFileSizes),
          null,
          4
        )}`
      );
    }
  }

  /**
   * Gets the relative name of a file chunk, excluding potentially existing hashes in the file name.
   * Used to match current assets with their potential predecessors.
   *
   * @param fileName
   * @returns {string}
   */
  getRelativeChunkName(fileName) {
    // Replacing by relative path is more stable, but not always usable regarding
    // provided relative file names...
    // In case `fileName` is an absolute path, using `path.relative` is favorable,
    // since it also avoids problems with potentially leading path separators.
    const targetFileName = path.isAbsolute(fileName)
      ? path.relative(this.sourcePath, fileName)
      : fileName.replace(this.sourcePath, "");

    const filenameWithoutHash = targetFileName.replace(
      /\/?(.*)(\.[0-9a-f]{8,})(\.chunk)?\.(js|css|json|webmanifest)/,
      (match, p1, p2, p3, p4) => p1 + p4
    );

    // The path has to be normalized to properly handle different path separators on Windows vs the rest of the world.
    return path.normalize(filenameWithoutHash);
  }
}

module.exports = BuildStatsFormatterPlugin;
