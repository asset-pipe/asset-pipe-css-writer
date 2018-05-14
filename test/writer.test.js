'use strict';

const fs = require('fs');
const path = require('path');
const { hasher } = require('@asset-pipe/common');
const { identifyCssModule, bundleCssModule } = require('../lib/util.js');
const Writer = require('..');

afterEach(() => {
    jest.unmock('../lib/util.js');
    jest.resetModules();
});

function clean(message) {
    return message
        .split('\n')
        .map(line => line.replace(__dirname, '<root>'))
        .join('\n');
}

test('identifyCssModule(filePath)', async () => {
    expect.assertions(1);
    const filePath = path.join(__dirname, 'test-assets/my-module-1/main.css');
    const fileRef = 'my-module-1/main.css';

    const result = await identifyCssModule(filePath);

    const identifier = {
        name: 'my-module-1',
        version: '1.0.1',
        file: fileRef,
    };
    expect(result).toEqual(identifier);
});

test('identifyCssModule(filePath) css in nested directory', async () => {
    expect.assertions(1);
    const filePath = path.join(
        __dirname,
        'test-assets/my-module-2/css/main.css'
    );
    const fileRef = 'my-module-2/css/main.css';

    const result = await identifyCssModule(filePath);

    const identifier = {
        name: 'my-module-2',
        version: '1.0.1',
        file: fileRef,
    };
    expect(result).toEqual(identifier);
});

test('bundleCssModule(filePath)', async () => {
    expect.assertions(3);
    const filePath = path.join(
        __dirname,
        'test-assets/my-module-3/css/main.css'
    );

    const result = await bundleCssModule(filePath);

    expect(result).toMatch('my-module-3/main.css');
    expect(result).toMatch('my-module-3/dep.css');
    expect(result).toMatch('dep/main.css');
});

test('new Writer(filePath)', done => {
    expect.assertions(2);
    const filePath = path.join(__dirname, 'test-assets/my-module-1/main.css');

    const writer = new Writer(filePath).bundle();
    const items = [];

    writer.on('data', item => {
        items.push(item);
    });

    writer.on('end', () => {
        const result1 = items[0];
        const result2 = items[1];
        expect(result1.id).toBe(hasher(result1.content));
        expect(result2).toBeFalsy();
        done();
    });
});

test('new Writer(filePath) can be reused', done => {
    expect.assertions(2);
    const filePath = path.join(__dirname, 'test-assets/my-module-1/main.css');
    const dataMock = jest.fn();

    const writer = new Writer(filePath);
    const bundle1 = writer.bundle();

    bundle1.on('data', dataMock);

    bundle1.on('end', () => {
        expect(dataMock).toHaveBeenCalledTimes(1);

        const bundle2 = writer.bundle();

        bundle2.on('data', dataMock);

        bundle2.on('end', () => {
            expect(dataMock).toHaveBeenCalledTimes(2);

            done();
        });
    });
});

test('new Writer(filePath) relative paths throw error', () => {
    expect.assertions(1);
    const filePath = './test-assets/my-module-1/main.css';

    const result = () => new Writer(filePath);

    expect(result).toThrowErrorMatchingSnapshot();
});

test('new Writer([filePath])', done => {
    expect.assertions(2);
    const filePath = path.join(__dirname, 'test-assets/my-module-1/main.css');

    const writer = new Writer([filePath]).bundle();
    const items = [];

    writer.on('data', item => {
        items.push(item);
    });

    writer.on('end', () => {
        const result1 = items[0];
        const result2 = items[1];
        expect(result1.id).toBe(hasher(result1.content));
        expect(result2).toBeFalsy();
        done();
    });
});

test('Writer processes @import statements', done => {
    expect.assertions(5);
    const filePath = path.join(
        __dirname,
        'test-assets/my-module-3/css/main.css'
    );

    const writer = new Writer([filePath]).bundle();
    const items = [];

    writer.on('data', item => {
        items.push(item);
    });

    writer.on('end', () => {
        const result1 = items[0];
        const result2 = items[1];

        expect(result1.id).toBe(hasher(result1.content));
        expect(result1.content).toMatch('my-module-3/main.css');
        expect(result1.content).toMatch('my-module-3/dep.css');
        expect(result1.content).toMatch('dep/main.css');
        expect(result2).toBeFalsy();
        done();
    });
});

test('new Writer([filePath1, filePath2]) ensures correct order', done => {
    expect.assertions(3);
    const filePath1 = path.join(__dirname, 'test-assets/my-module-1/main.css');
    const filePath2 = path.join(
        __dirname,
        'test-assets/my-module-2/css/main.css'
    );

    const writer = new Writer([filePath1, filePath2]).bundle();
    const items = [];

    writer.on('data', item => {
        items.push(item);
    });

    writer.on('end', () => {
        const result1 = items[0];
        const result2 = items[1];
        const result3 = items[2];

        expect(result1.id).toBe(hasher(result1.content));
        expect(result2.id).toBe(hasher(result2.content));
        expect(result3).toBeFalsy();
        done();
    });
});

test('new Writer([filePath]) ensures filePath[] is not null', () => {
    expect.assertions(1);
    const filePath = null;

    const result = () => new Writer(filePath);

    expect(result).toThrowErrorMatchingSnapshot();
});

test('new Writer([filePath]) ensures filePath[] is not a number', () => {
    expect.assertions(1);
    const filePath = 2;

    const result = () => new Writer(filePath);

    expect(result).toThrowErrorMatchingSnapshot();
});

test('new Writer([filePath]) ensures filePath is not an object', () => {
    expect.assertions(1);
    const filePath = {};

    const result = () => new Writer(filePath);

    expect(result).toThrowErrorMatchingSnapshot();
});

test('new Writer([filePath]) ensures filePath[] is an array of strings', () => {
    expect.assertions(1);
    const filePath = null;

    const result = () => new Writer([filePath]);

    expect(result).toThrowErrorMatchingSnapshot();
});

test('new Writer([filePath]) ensures valid filePath provided', () => {
    expect.assertions(1);
    const filePath = 'fake.css';

    const result = () => new Writer(filePath);

    expect(result).toThrowErrorMatchingSnapshot();
});

test('new Writer([filePath]) ensures valid filePaths provided in array', () => {
    expect.assertions(1);
    const filePath = 'fake.css';

    const result = () => new Writer([filePath]);

    expect(result).toThrowErrorMatchingSnapshot();
});

test('writer emits error', done => {
    expect.assertions(1);
    jest.mock('../lib/util.js', () => ({
        bundleCssModule() {
            throw new Error();
        },
        identifyCssModule() {
            throw new Error();
        },
    }));
    const CssWriter = require('..');
    const filePath = path.join(__dirname, 'test-assets/my-module-1/main.css');

    const writer = new CssWriter(filePath).bundle();

    writer.on('error', error => {
        expect(error).toBeInstanceOf(Error);
        done();
    });
    writer.on('data', () => {});
});

test('underlying writer error bubbles up', done => {
    expect.assertions(1);
    const CssWriter = require('..');
    const filePath = path.join(__dirname, 'test-assets/bogus.css');

    const writer = new CssWriter(filePath, true).bundle();

    writer.on('error', error => {
        expect(clean(error.message)).toMatchSnapshot();
        done();
    });
    writer.on('data', () => {});
});

test('new Writer() emits nothing but does not break', done => {
    const writer = new Writer().bundle();
    const items = [];

    writer.on('data', item => {
        items.push(item);
    });

    writer.on('end', () => {
        expect(items.length).toBe(0);
        done();
    });
});

test('new Writer(filepath, bundle: true) emits a bundle', done => {
    expect.assertions(1);
    const filePath = path.join(__dirname, 'test-assets/my-module-1/main.css');

    const writer = new Writer([filePath], true).bundle();

    writer.on('error', e => {
        done.fail(e);
    });
    const items = [];

    writer.on('data', item => {
        items.push(item);
    });

    writer.on('end', () => {
        expect(items).toEqual([fs.readFileSync(filePath, 'utf8')]);

        done();
    });
});
