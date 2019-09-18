'use strict';

const path = require('path');
const prettier = require('prettier');
const { bundleCssModule } = require('../lib/util.js');

describe('should use cssnano to dedupe and minify', () => {
    test('nybygg.css', async () => {
        expect.assertions(1);
        const filePath = path.join(__dirname, 'test-assets/nybygg.css');

        let result = await bundleCssModule(filePath);
        // cssnano compacts all the css to a single line, prettier expands it again so the diffs are easier to read
        result = prettier.format(result, {
            parser: 'css',
        });

        expect(result).toMatchSnapshot();
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

        expect(result).toMatchSnapshot();
        expect(result.split('.modal--is-active').length).toBe(1);
    });
});
