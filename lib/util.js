'use strict';

const path = require('path');
const { promisify } = require('util');
const fs = require('fs');
const readFile = promisify(fs.readFile);
const { hasher } = require('asset-pipe-common');
const readPkgUp = require('read-pkg-up');
const postcss = require('postcss');
const atImport = require('postcss-import');

module.exports.identifyCssModule = function identifyCssModule (filePath) {
    return readPkgUp({
        normalize: false,
        cwd: path.dirname(filePath),
    }).then(result => {
        const { name, version } = result.pkg;
        const ref = filePath.replace(path.dirname(result.path), name);

        return {
            id: hasher(`${name}|${version}|${ref}`),
            name,
            version,
            file: ref,
        };
    });
};

module.exports.bundleCssModule = function bundleCssModule (filePath) {
    return readFile(filePath, 'utf8').then(css =>
        postcss()
            .use(atImport())
            .process(css, {
                from: filePath,
            })
            .then(({ css }) => css)
    );
};
