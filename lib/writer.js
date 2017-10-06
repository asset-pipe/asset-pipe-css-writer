'use strict';

const { Readable } = require('stream');
const { identifyCssModule, bundleCssModule } = require('./util');
const { existsSync } = require('fs');
const assert = require('assert');

module.exports = class Writer extends Readable {
    constructor (files = []) {
        assert(Array.isArray(files), `Expected 'files' to be of type 'Array', instead got '${typeof files}'`);
        for (const file of files) {
            assert(typeof file === 'string', `Expected 'file' (${file}) to be of type 'string', instead got '${typeof file}'`);
            assert(existsSync(file), `Expected 'file' (${file}) to exist on file system but it did not`);
        }

        super({ objectMode: true });
        this.files = files;
    }

    _read () {
        const file = this.files.shift();
        if (!file) {
            this.push(null);
            return;
        }
        Promise.all([bundleCssModule(file), identifyCssModule(file)])
            .then(([css, meta]) => {
                meta.content = css;
                this.push(meta);
            })
            .catch(err => {
                process.nextTick(() => this.emit('error', err));
            });
    }
};
