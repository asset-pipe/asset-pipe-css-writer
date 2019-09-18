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

        // Snapshots are included to make the effects of updating the config and browserslist concrete and obvious
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

        // Snapshots are included to make the effects of updating the config and browserslist concrete and obvious
        expect(result).toMatchSnapshot();
        expect(result).not.toMatch('-webkit-box-shadow');
        expect(result).toMatch('box-shadow');
    });
});

describe('overrideBrowserslist allows custom browserslist without relying on .browserslistrc requirements', () => {
    test('nybygg.css', async () => {
        expect.assertions(1);
        const filePath = path.join(__dirname, 'test-assets/nybygg.css');

        let result = await bundleCssModule(filePath, 'last 1 chrome version');
        // cssnano compacts all the css to a single line, prettier expands it again so the diffs are easier to read
        result = prettier.format(result, {
            parser: 'css',
        });

        // Snapshots are included to make the effects of updating the config and browserslist concrete and obvious
        expect(result).toMatchSnapshot();
        expect(result).not.toMatch('-moz-appearance');
        expect(result).not.toMatch('::-webkit-input-placeholder');
    });
    test('frontpage-podium.css', async () => {
        expect.assertions(1);
        const filePath = path.join(
            __dirname,
            'test-assets/frontpage-podium.css'
        );

        let result = await bundleCssModule(filePath, 'last 1 chrome version');
        // cssnano compacts all the css to a single line, prettier expands it again so the diffs are easier to read
        result = prettier.format(result, {
            parser: 'css',
        });

        // Snapshots are included to make the effects of updating the config and browserslist concrete and obvious
        expect(result).toMatchSnapshot();
        expect(result).not.toMatch('-moz-appearance');
        expect(result).not.toMatch('::-webkit-input-placeholder');
    });
});
