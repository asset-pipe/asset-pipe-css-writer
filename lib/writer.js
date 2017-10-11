'use strict';

const { Readable } = require('stream');
const { identifyCssModule, bundleCssModule } = require('./util');
const { existsSync } = require('fs');
const { isAbsolute } = require('path');
const assert = require('assert');
const { hasher } = require('asset-pipe-common');

module.exports = class Writer extends Readable {
    constructor (files = []) {
        super({ objectMode: true });

        assert(
            Array.isArray(files) || typeof files === 'string',
            `Expected 'files' to be of type 'Array' or a 'string', instead got '${typeof files}'`
        );
        this.files = Array.isArray(files) ? files : [files];
        for (const file of this.files) {
            assert(typeof file === 'string', `Expected 'file' (${file}) to be of type 'string', instead got '${typeof file}'`);
            assert(isAbsolute(file), `Expected 'file' (${file}) to be an absolute path to a file but it was not`);
            assert(existsSync(file), `Expected 'file' (${file}) to exist on file system but it did not`);
        }
    }

    async _read () {
        const file = this.files.shift();
        if (!file) {
            this.push(null);
            return;
        }

        try {
            const [css, meta] = await Promise.all([bundleCssModule(file), identifyCssModule(file)]);
            meta.id = hasher(`${meta.name}|${meta.version}|${meta.file}|${css}`);
            meta.content = css;
            this.push(meta);
        } catch (err) {
            this.emit('error', err);
        }
    }
};
