'use strict';

const EventEmitter = require('events');
const { Readable, Transform } = require('stream');
const { identifyCssModule, bundleCssModule } = require('./util');
const { existsSync } = require('fs');
const { isAbsolute } = require('path');
const assert = require('assert');
const { hasher } = require('@asset-pipe/common');
const { name } = require('../package.json');

class Stream extends Readable {
    constructor(files, options = {}) {
        super({ objectMode: true });

        this.files = files;
        this.options = options;
    }

    async _read() {
        const file = this.files.shift();
        if (!file) {
            this.push(null);
            return;
        }

        try {
            const [css, meta] = await Promise.all([
                bundleCssModule(file, this.options),
                identifyCssModule(file),
            ]);
            meta.id = hasher(css);
            meta.content = css;
            this.push(meta);
        } catch (err) {
            this.emit('error', err);
        }
    }
}

module.exports = class Writer extends EventEmitter {
    constructor(files = [], options = {}, bundle = false) {
        super({ objectMode: true });
        this.shouldBundle = bundle;
        this.options = options;

        assert(
            Array.isArray(files) || typeof files === 'string',
            `Expected 'files' argument to ${name} constructor to be either a string or an array. Instead got '${typeof files}'`
        );
        assert(
            typeof options === 'object',
            `Expected optional 'options' argument to ${name} constructor to be an object. Instead got '${typeof options}'`
        );
        assert(
            typeof bundle === 'boolean',
            `Expected optional 'bundle' argument to ${name} constructor to be a boolean. Instead got '${typeof bundle}'`
        );

        this.files = Array.isArray(files) ? files : [files];
        for (const file of this.files) {
            assert(
                typeof file === 'string',
                `Expected 'file' (${file}) to be of type 'string', instead got '${typeof file}'`
            );
            assert(
                isAbsolute(file),
                `Expected 'file' (${file}) to be an absolute path to a file but it was not`
            );
            assert(
                existsSync(file),
                `Expected 'file' (${file}) to exist on file system but it did not`
            );
        }
    }

    bundle() {
        const cssStream = new Stream(this.files.slice(0), this.options);

        if (!this.shouldBundle) {
            return cssStream;
        }

        const transformStream = new Transform({
            objectMode: true,
            transform(chunk, enc, next) {
                next(null, chunk.content);
            },
        });

        cssStream.on('error', (...args) =>
            transformStream.emit('error', ...args)
        );

        return cssStream.pipe(transformStream);
    }
};
