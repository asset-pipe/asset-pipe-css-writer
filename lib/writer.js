'use strict';

const { Readable } = require('stream');
const { identifyCssModule, bundleCssModule } = require('./util');
const { existsSync } = require('fs');
const { isAbsolute } = require('path');
const assert = require('assert');

module.exports = class Writer extends Readable {
    constructor (files = []) {
        super({ objectMode: true });

        assert(
            Array.isArray(files) || typeof files === 'string',
            `Expected 'files' to be of type 'Array' or a 'string', instead got '${typeof this.files}'`
        );
        this.files = Array.isArray(files) ? files : [files];
        for (const file of this.files) {
            assert(typeof file === 'string', `Expected 'file' (${file}) to be of type 'string', instead got '${typeof file}'`);
            assert(isAbsolute(file), `Expected 'file' (${file}) to be an absolute path to a file but it was not`);
            assert(existsSync(file), `Expected 'file' (${file}) to exist on file system but it did not`);
        }
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
