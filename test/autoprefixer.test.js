'use strict';

const path = require('path');
const prettier = require('prettier');
const { bundleCssModule } = require('../lib/util.js');

describe('should use autoprefixer to remove old syntax', () => {
    test('nybygg.css', async () => {
        expect.assertions(3);
        const filePath = path.join(__dirname, 'test-assets/nybygg.css');

        let result = await bundleCssModule(filePath);
        // cssnano compacts all the css to a single line, prettier expands it again so the diffs are easier to read
        result = prettier.format(result, {
            parser: 'css',
        });

        expect(result).toMatchSnapshot();
        expect(result).not.toMatch('-webkit-box-shadow');
        expect(result).toMatch('box-shadow');
    });
    test('frontpage-podium.css', async () => {
        expect.assertions(3);
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
        expect(result).not.toMatch('-webkit-box-shadow');
        expect(result).toMatch('box-shadow');
    });
});
