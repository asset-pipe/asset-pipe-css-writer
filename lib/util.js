'use strict';

const path = require('path');
const { promisify } = require('util');
const fs = require('fs');
const readFile = promisify(fs.readFile);
const readPkgUp = require('read-pkg-up');
const postcss = require('postcss');
const atImport = require('postcss-import');
const resolve = require('postcss-import/lib/resolve-id');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

module.exports.identifyCssModule = async function identifyCssModule(filePath) {
    const {
        pkg: { name, version },
        path: packagePath,
    } = await readPkgUp({
        normalize: false,
        cwd: path.dirname(filePath),
    });
    const file = filePath.replace(path.dirname(packagePath), name);

    return { name, version, file };
};

module.exports.bundleCssModule = async function bundleCssModule(
    filePath,
    overrideBrowserslist
) {
    const fileContents = await readFile(filePath, 'utf8');
    const { css } = await postcss([
        autoprefixer({ overrideBrowserslist }),
        cssnano(),
    ])
        .use(
            atImport({
                resolve(id, basedir, options) {
                    id = id.replace(/^~/, '');
                    return resolve(id, basedir, options);
                },
            })
        )
        .process(fileContents, { from: filePath, map: false });
    return css;
};
