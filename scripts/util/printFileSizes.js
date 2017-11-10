"use strict";

/*
  This file and the formatting functionality it provides was inspired by the FileSizeReporter from the react-dev-utils
  package.
  The additions and changes primarily aim at an improved overview of the results by separating the generated asset list to categories,
  and format these categories properly both by color and hierarchy.
 */

const fs = require("fs-extra");
const chalk = require("chalk");
const path = require("path");
const filesize = require("filesize");
const stripAnsi = require("strip-ansi");

const alignPad = require("./alignPad");
const partition = require("./partition");
const gzipSizeOf = require("./gzipsize");
const formatUtils = require("./formatUtil");

const writer = process.stdout.write.bind(process.stdout);

/**
 * Prints file stats about a particular set of assets, depending on the
 * categorization config.
 *
 * @param buildFolder The output folder. Required for determining stats.
 * @param assetsStats The stats to evaluate.
 * @param exceptionalAssetCnt An object to modify in case "exceptional" assets are found,
 *                            i.e. those that are too large (w.r.t. the build config) or
 *                            might be extracted. The object is updated in case those are
 *                            found, to provide proper statistics.
 * @param assetsSizeWarnLimit The file size cap before a warning about the size of that
 *                            file is emitted.
 * @param potentiallyExtractedChunkSizeLimit The lower file size limit before a file is
 *                                           categorized as "remain" of a style extraction.
 *                                           Note that this only affects .js files.
 */
function printFileSizesOnAssetCategory(
  buildFolder,
  assetsStats,
  exceptionalAssetCnt,
  assetsSizeWarnLimit,
  potentiallyExtractedChunkSizeLimit
) {
  /*
    Collect several assets stats:
    - The target folder.
    - The name.
    - The original size.
    - The size in gzipped form.
    - The generated size information labels.
   */
  const assets = assetsStats.map(asset => {
    const filePath = path.join(buildFolder, asset.name);
    const fileContents = fs.readFileSync(filePath);
    const originalFileSize = fs.statSync(filePath).size;
    const gzipSize = gzipSizeOf(fileContents);
    return {
      folder: path.join(path.dirname(asset.name)),
      name: path.basename(asset.name),
      originalFileSize,
      size: gzipSize,
      sizeLabel: {
        src: `${filesize(originalFileSize)} (src)`,
        gzip: `${filesize(gzipSize)} (gzip)`
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

  assets.forEach(asset => {
    const sizeLabelSrc = alignPad(
      asset.sizeLabel.src,
      longestSrcSizeLabelLength
    );
    const sizeLabelGzip = alignPad(
      asset.sizeLabel.gzip,
      longestGzipSizeLabelLength
    );
    const assetTooLarge = asset.originalFileSize > assetsSizeWarnLimit;
    const assetMayBeExtractedChunk =
      asset.originalFileSize < potentiallyExtractedChunkSizeLimit &&
      /\.js$/.test(asset.name);
    if (assetTooLarge) {
      exceptionalAssetCnt.tooLarge++;
    }
    if (assetMayBeExtractedChunk) {
      exceptionalAssetCnt.extracted++;
    }
    const colorer = assetTooLarge
      ? chalk.yellow
      : assetMayBeExtractedChunk ? chalk.grey : chalk.cyan;

    const assetName = colorer(
      alignPad(asset.name, longestFileNameSize - (asset.folder.length + 1))
    );

    writer(
      chalk.dim(asset.folder + path.sep) +
        assetName +
        " @ " +
        sizeLabelSrc +
        " => " +
        sizeLabelGzip +
        "\n"
    );
  });
}

/**
 * Utility function to print output file stats for a build.
 *
 * @param buildConfig The build config. See config/build.config for details.
 * @param webpackStats The stats received from webpack.
 * @param staticAssets Additional static assets, got copied from `public`
 */
function printFileSizes(buildConfig, webpackStats, staticAssets = []) {
  // Prints a detailed summary of build files.
  const jsonStats = webpackStats.toJson();
  const assetsStats = jsonStats.assets;
  staticAssets = staticAssets.map(s => ({ name: s }));
  assetsStats.push(...staticAssets);

  const assetCategories =
    buildConfig.categorizeAssets === false
      ? { "#": /.+/ } // Use arbitrary matcher in case we must not categorize the output.
      : buildConfig.categorizeAssets;

  const assetsSizeWarnLimit = buildConfig.assetsSizeWarnLimit;
  const potentiallyExtractedChunkSizeLimit =
    buildConfig.potentiallyExtractedChunkSizeLimit;
  const gzipOpts = buildConfig.gzipDisplayOpts;

  let exceptionalAssetCnt = {
    tooLarge: 0,
    extracted: 0
  };

  writer(
    "\n" +
      formatUtils.formatNote(
        `Emitted assets in ${chalk.cyan(
          path.resolve(buildConfig.outputDir)
        )} (displayed gzip sizes refer to compression ${chalk.cyan(
          "level=" + gzipOpts.level
        )}):`
      ) +
      "\n"
  );

  /*
    The assets will be consumed step by step w.r.t. the configured categorization.
    I.e. each categorization will only be performed on the remains of the previous
    iteration.
   */
  let remainingAssets = Object.getOwnPropertyNames(assetCategories).reduce(
    (relevantAssets, c) => {
      const [_relevantAssets, nextAssets] = partition(relevantAssets, asset =>
        assetCategories[c].test(asset.name)
      );
      if (_relevantAssets.length > 0) {
        if (c !== "#") {
          writer(formatUtils.formatIndicator("> " + c) + "\n");
        }
        printFileSizesOnAssetCategory(
          buildConfig.outputDir,
          _relevantAssets,
          exceptionalAssetCnt,
          assetsSizeWarnLimit,
          potentiallyExtractedChunkSizeLimit
        );
        writer("\n");
      }
      return nextAssets;
    },
    assetsStats
  );

  // If there are any assets left, they are summarized in a special "Others" category.
  if (remainingAssets.length > 0) {
    writer(formatUtils.formatIndicator("> Others") + "\n");
    printFileSizesOnAssetCategory(
      buildConfig.outputDir,
      remainingAssets,
      exceptionalAssetCnt,
      assetsSizeWarnLimit,
      potentiallyExtractedChunkSizeLimit
    );
    writer("\n");
  }

  // Print an information about the amount of too large assets, and how they are marked.
  if (exceptionalAssetCnt.tooLarge > 0) {
    writer(
      formatUtils.formatWarning(
        `${exceptionalAssetCnt.tooLarge === 1 ? "There is" : "There are"} ${
          exceptionalAssetCnt.tooLarge
        } assets which exceed the configured size limit of ${filesize(
          assetsSizeWarnLimit
        )}. Affected asset(s) marked in ${chalk.yellow("yellow")}.`
      ) + "\n"
    );
    writer("\n");
  }

  // Print an information about potential extraction remainings, and how they are marked.
  if (exceptionalAssetCnt.extracted > 0) {
    writer(
      formatUtils.formatNote(
        `${exceptionalAssetCnt.extracted === 1 ? "There is" : "There are"} ${
          exceptionalAssetCnt.extracted
        } assets which are smaller than the configured lower size limit of ${filesize(
          potentiallyExtractedChunkSizeLimit
        )}. Affected asset(s) should be considered remains of extracted chunks and are marked in ${chalk.grey(
          "grey"
        )}.`
      ) + "\n"
    );
    writer("\n");
  }
}

module.exports = printFileSizes;
