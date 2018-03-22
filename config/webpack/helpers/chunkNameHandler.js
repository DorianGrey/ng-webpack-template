// Based on https://github.com/angular/angular-cli/blob/d22c2bcc11ff285f500fabc869b28862c17dd6ef/packages/%40angular/cli/plugins/named-lazy-chunks-webpack-plugin.ts
// Just made a bit simpler, and provides a function instead of a class

const AsyncDependenciesBlock = require("webpack/lib/AsyncDependenciesBlock");
const ContextElementDependency = require("webpack/lib/dependencies/ContextElementDependency");
const ImportDependency = require("webpack/lib/dependencies/ImportDependency");
const path = require("path");

function getUniqueName(nameMap, baseName, request) {
  let name = baseName;
  let num = 0;
  while (nameMap.has(name) && nameMap.get(name) !== request) {
    name = `${baseName}.${num++}`;
  }
  nameMap.set(name, request);
  return name;
}

function chunkNameHandler() {
  const nameMap = new Map();
  return function nameChunk(chunk) {
    // Entry chunks have a name already, use it.
    if (chunk.name) {
      return chunk.name;
    }

    // Check for lazy loaded routes or import() statements.
    // The latter only require a name in case that one is NOT
    // yet provided via the special webpack comment `webpackChunkName`.
    // Note that the check below also skips concatenated modules, since
    // those do not require a name.
    // TODO: This seems extremely hairy ... see if we can do better.
    const blocks = Array.from(chunk.groupsIterable.values())[0].getBlocks(); // chunk.blocks;

    if (
      blocks &&
      blocks.length > 0 &&
      blocks[0] instanceof AsyncDependenciesBlock &&
      blocks[0].dependencies.length === 1 &&
      (blocks[0].dependencies[0] instanceof ContextElementDependency ||
        blocks[0].dependencies[0] instanceof ImportDependency)
    ) {
      // Create chunkname from file request, stripping ngfactory and extension.
      const request = blocks[0].dependencies[0].request;
      const chunkName = path
        .basename(request)
        .replace(/(\.ngfactory)?\.(js|ts)$/, "");
      if (!chunkName || chunkName === "") {
        // Bail out if something went wrong with the name.
        return null;
      }
      return getUniqueName(nameMap, chunkName, request);
    }

    return null;
  };
}

module.exports = chunkNameHandler;
