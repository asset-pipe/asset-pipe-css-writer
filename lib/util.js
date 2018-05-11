'use strict';

const path = require('path');
const { promisify } = require('util');
const fs = require('fs');
const readFile = promisify(fs.readFile);
const readPkgUp = require('read-pkg-up');
const postcss = require('postcss');
const atImport = require('postcss-import');

const removeTilde = postcss.plugin(
    'postcss-import-remove-tilde',
    () =>
        function(css) {
            css.walkAtRules('import', rule => {
                rule.params = rule.params.replace(
                    /((?:url\s*\(\s*)?['"])~/,
                    '$1'
                );
            });
        }
);

module.exports.identifyCssModule = async function identifyCssModule(filePath) {
    const { pkg: { name, version }, path: packagePath } = await readPkgUp({
        normalize: false,
        cwd: path.dirname(filePath),
    });
    const file = filePath.replace(path.dirname(packagePath), name);

    return { name, version, file };
};

module.exports.bundleCssModule = async function bundleCssModule(filePath) {
    const fileContents = await readFile(filePath, 'utf8');
    const { css } = await postcss()
        .use(removeTilde())
        .use(atImport())
        .process(fileContents, { from: filePath });
    return css;
};
