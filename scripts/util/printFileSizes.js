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
const getRelativeChunkName = require("./getRelativeChunkName");
const {
  relevantSizeComparisonRegex
} = require("./determineFileSizesBeforeBuild");
const { log } = require("../../config/logger");

function colorizeDiffLabel(difference, currentLabel, alertLimit) {
  let label = currentLabel;
  if (difference > 0) {
    label = `+${label}`;
  } else if (difference == 0) {
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

function determineSizeDiff(
  previousFileSizes,
  buildFolder,
  assetName,
  currentSize,
  type,
  alertLimit
) {
  const relativeName = getRelativeChunkName(buildFolder, assetName);
  const previousInfo = previousFileSizes.sizes[relativeName];
  if (previousInfo) {
    const difference = currentSize - previousInfo[type];
    const label = colorizeDiffLabel(
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
 * Prints file stats about a particular set of assets, depending on the
 * categorization config.
 *
 * @param buildFolder The output folder. Required for determining stats.
 * @param previousFileSizes File sizes from a previous build.
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
function formatFileSizesOnAssetCategory(
  buildFolder,
  previousFileSizes,
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
  const missingPreviousVersion = [];

  const assets = assetsStats.map(asset => {
    const filePath = path.join(buildFolder, asset.name);
    const fileContents = fs.readFileSync(filePath);
    const originalFileSize = fs.statSync(filePath).size;
    const gzipSize = gzipSizeOf(fileContents);

    const originalSizeDiff = determineSizeDiff(
      previousFileSizes,
      buildFolder,
      asset.name,
      originalFileSize,
      "original",
      1024 * 50 * 3
    );
    const gzipSizeDiff = determineSizeDiff(
      previousFileSizes,
      buildFolder,
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
        src: `${filesize(originalFileSize)}${originalSizeDiff} (src)`,
        gzip: `${filesize(gzipSize)}${gzipSizeDiff} (gzip)`
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

  const formattedAssetsLabels = assets.map(asset => {
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

    return (
      chalk.dim(asset.folder + path.sep) +
      assetName +
      " @ " +
      sizeLabelSrc +
      " => " +
      sizeLabelGzip
    );
  });

  return [formattedAssetsLabels, missingPreviousVersion];
}

/**
 * Utility function to print output file stats for a build.
 *
 * @param previousFileSizes File sizes from a previous build step.
 * @param buildConfig The build config. See config/build.config for details.
 * @param webpackStats The stats received from webpack.
 * @param staticAssets Additional static assets, got copied from `public`
 */
function printFileSizes(
  previousFileSizes,
  buildConfig,
  webpackStats,
  staticAssets = []
) {
  // Prints a detailed summary of build files.
  const jsonStats = webpackStats.toJson();
  const assetsStats = jsonStats.assets;
  staticAssets = staticAssets.map(s => ({ name: s }));
  assetsStats.push(...staticAssets);

  const missingPreviousVersion = [];

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

  log._stream.write("\n");
  log.note(
    `Emitted assets in ${chalk.cyan(
      path.resolve(buildConfig.outputDir)
    )} (displayed gzip sizes refer to compression ${chalk.cyan(
      "level=" + gzipOpts.level
    )}):`
  );
  log._stream.write("\n");

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
        const [
          formattedAssetsLabels,
          missingPrevious
        ] = formatFileSizesOnAssetCategory(
          buildConfig.outputDir,
          previousFileSizes,
          _relevantAssets,
          exceptionalAssetCnt,
          assetsSizeWarnLimit,
          potentiallyExtractedChunkSizeLimit
        );
        log.category(
          [chalk.bgCyan.white.bold(c)].concat(formattedAssetsLabels).join("\n")
        );
        missingPreviousVersion.push(...missingPrevious);
        log._stream.write("\n");
      }
      return nextAssets;
    },
    assetsStats
  );

  // If there are any assets left, they are summarized in a special "Others" category.
  if (remainingAssets.length > 0) {
    const [
      formattedAssetsLabels,
      missingPrevious
    ] = formatFileSizesOnAssetCategory(
      buildConfig.outputDir,
      previousFileSizes,
      remainingAssets,
      exceptionalAssetCnt,
      assetsSizeWarnLimit,
      potentiallyExtractedChunkSizeLimit
    );
    log.category(
      [chalk.bgCyan.white.bold("Others")]
        .concat(formattedAssetsLabels)
        .join("\n")
    );
    missingPreviousVersion.push(...missingPrevious);
    log._stream.write("\n");
  }

  // Print an information about the amount of too large assets, and how they are marked.
  if (exceptionalAssetCnt.tooLarge > 0) {
    log.warn(
      `${exceptionalAssetCnt.tooLarge === 1 ? "There is" : "There are"} ${
        exceptionalAssetCnt.tooLarge
      } assets which exceed the configured size limit of ${filesize(
        assetsSizeWarnLimit
      )}. Affected asset(s) marked in ${chalk.yellow("yellow")}.`
    );
  }

  // Print an information about potential extraction remainings, and how they are marked.
  if (exceptionalAssetCnt.extracted > 0) {
    log.note(
      `${exceptionalAssetCnt.extracted === 1 ? "There is" : "There are"} ${
        exceptionalAssetCnt.extracted
      } assets which are smaller than the configured lower size limit of ${filesize(
        potentiallyExtractedChunkSizeLimit
      )}. Affected asset(s) should be considered remains of extracted chunks and are marked in ${chalk.grey(
        "grey"
      )}.`
    );
  }

  const relevantMissingPreviousVersion = missingPreviousVersion.filter(a =>
    relevantSizeComparisonRegex.test(a)
  );

  if (relevantMissingPreviousVersion.length > 0) {
    log.debug(
      `Some assets did not have a previous version: ${JSON.stringify(
        relevantMissingPreviousVersion,
        null,
        4
      )} in ${JSON.stringify(
        Object.getOwnPropertyNames(previousFileSizes.sizes),
        null,
        4
      )}`
    );
  }
}

module.exports = printFileSizes;
