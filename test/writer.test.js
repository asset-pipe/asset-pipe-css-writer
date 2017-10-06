'use strict';

const path = require('path');
const { hasher } = require('asset-pipe-common');
const { identifyCssModule, bundleCssModule } = require('../lib/util.js');
const Writer = require('..');

test('identifyCssModule(filePath)', async () => {
    const filePath = path.join(__dirname, 'test-assets/my-module-1/main.css');
    const fileRef = 'my-module-1/main.css';

    const result = await identifyCssModule(filePath);

    const identifier = {
        id: hasher(`my-module-1|1.0.1|${fileRef}`),
        name: 'my-module-1',
        version: '1.0.1',
        file: fileRef
    };
    expect(result).toEqual(identifier);
});

test('identifyCssModule(filePath) css in nested directory', async () => {
    const filePath = path.join(__dirname, 'test-assets/my-module-2/css/main.css');
    const fileRef = 'my-module-2/css/main.css';

    const result = await identifyCssModule(filePath);

    const identifier = {
        id: hasher(`my-module-2|1.0.1|${fileRef}`),
        name: 'my-module-2',
        version: '1.0.1',
        file: fileRef
    };
    expect(result).toEqual(identifier);
});

test('bundleCssModule(filePath)', async () => {
    const filePath = path.join(__dirname, 'test-assets/my-module-3/css/main.css');

    const result = await bundleCssModule(filePath);

    expect(result).toMatch('my-module-3/main.css');
    expect(result).toMatch('my-module-3/dep.css');
    expect(result).toMatch('dep/main.css');
});

test('new Writer([filePath])', () => {
    const filePath = path.join(__dirname, 'test-assets/my-module-1/main.css');
    const fileRef = 'my-module-1/main.css';

    const writer = new Writer([filePath]);
    const items = [];

    writer.on('data', item => {
        items.push(item);
    });

    writer.on('end', () => {
        const result1 = items[0];
        const result2 = items[1];

        expect(result1.id).toBe(hasher(`my-module-1|1.0.1|${fileRef}`));
        expect(result2).toBeFalsy();
    });
});

test('Writer processes @import statements', () => {
    const filePath = path.join(__dirname, 'test-assets/my-module-3/css/main.css');
    const fileRef = 'my-module-3/css/main.css';

    const writer = new Writer([filePath]);
    const items = [];

    writer.on('data', item => {
        items.push(item);
    });

    writer.on('end', () => {
        const result1 = items[0];
        const result2 = items[1];

        expect(result1.id).toBe(hasher(`my-module-3|1.0.1|${fileRef}`));
        expect(result1.content).toMatch('my-module-3/main.css');
        expect(result1.content).toMatch('my-module-3/dep.css');
        expect(result1.content).toMatch('dep/main.css');
        expect(result2).toBeFalsy();
    });
});

test('new Writer([filePath1, filePath2]) ensures correct order', () => {
    const filePath1 = path.join(__dirname, 'test-assets/my-module-1/main.css');
    const fileRef1 = 'my-module-1/main.css';
    const filePath2 = path.join(__dirname, 'test-assets/my-module-2/css/main.css');
    const fileRef2 = 'my-module-2/css/main.css';

    const writer = new Writer([filePath1, filePath2]);
    const items = [];

    writer.on('data', item => {
        items.push(item);
    });

    writer.on('end', () => {
        const result1 = items[0];
        const result2 = items[1];
        const result3 = items[2];

        expect(result1.id).toBe(hasher(`my-module-1|1.0.1|${fileRef1}`));
        expect(result2.id).toBe(hasher(`my-module-2|1.0.1|${fileRef2}`));
        expect(result3).toBeFalsy();
    });
});

test('new Writer([filePath]) ensures filePath[] is an array', () => {
    const filePath = null;

    const result = () => new Writer(filePath);

    expect(result).toThrow();
});

test('new Writer([filePath]) ensures filePath[] is an array of strings', () => {
    const filePath = null;

    const result = () => new Writer([filePath]);

    expect(result).toThrow();
});

test('new Writer([filePath]) ensures valid filePaths provided', () => {
    const filePath = 'fake.css';

    const result = () => new Writer([filePath]);

    expect(result).toThrow();
});
