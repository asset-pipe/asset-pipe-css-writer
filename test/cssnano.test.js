'use strict';

const path = require('path');
const prettier = require('prettier');
const { bundleCssModule } = require('../lib/util.js');

describe('should use cssnano to dedupe and minify', () => {
    test('nybygg.css', async () => {
        expect.assertions(2);
        const filePath = path.join(__dirname, 'test-assets/nybygg.css');

        let result = await bundleCssModule(filePath);
        // cssnano compacts all the css to a single line, prettier expands it again so the diffs are easier to read
        result = prettier.format(result, {
            parser: 'css',
        });

        // Snapshots are included to make the effects of updating the config and browserslist concrete and obvious
        expect(result).toMatchSnapshot();
        // These comments will be stripped out if cssnano is running correctly
        expect(result).not.toMatch('autoprefixer: ignore next');
    });
    test('frontpage-podium.css', async () => {
        expect.assertions(2);
        const filePath = path.join(
            __dirname,
            'test-assets/frontpage-podium.css'
        );

        let result = await bundleCssModule(filePath);
        // cssnano compacts all the css to a single line, prettier expands it again so the diffs are easier to read
        result = prettier.format(result, {
            parser: 'css',
        });

        // Snapshots are included to make the effects of updating the config and browserslist concrete and obvious
        expect(result).toMatchSnapshot();
        // There are 3 different versions of troika-css-modal included, if the length is 2 then it means there's just 1 hit.
        expect(result.split('.modal--is-active').length).toBe(2);
    });
});
