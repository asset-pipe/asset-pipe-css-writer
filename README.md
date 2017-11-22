<!-- TITLE/ -->

<h1>@asset-pipe/css-writer</h1>

<!-- /TITLE -->


<!-- BADGES/ -->

<span class="badge-travisci"><a href="http://travis-ci.org/asset-pipe/asset-pipe-css-writer" title="Check this project's build status on TravisCI"><img src="https://img.shields.io/travis/asset-pipe/asset-pipe-css-writer/master.svg" alt="Travis CI Build Status" /></a></span>
<span class="badge-npmversion"><a href="https://npmjs.org/package/@asset-pipe/css-writer" title="View this project on NPM"><img src="https://img.shields.io/npm/v/@asset-pipe/css-writer.svg" alt="NPM version" /></a></span>
<span class="badge-daviddm"><a href="https://david-dm.org/asset-pipe/asset-pipe-css-writer" title="View the status of this project's dependencies on DavidDM"><img src="https://img.shields.io/david/asset-pipe/asset-pipe-css-writer.svg" alt="Dependency Status" /></a></span>
<span class="badge-daviddmdev"><a href="https://david-dm.org/asset-pipe/asset-pipe-css-writer#info=devDependencies" title="View the status of this project's development dependencies on DavidDM"><img src="https://img.shields.io/david/dev/asset-pipe/asset-pipe-css-writer.svg" alt="Dev Dependency Status" /></a></span>

<!-- /BADGES -->


[![Greenkeeper badge](https://badges.greenkeeper.io/asset-pipe/asset-pipe-css-writer.svg)](https://greenkeeper.io/)

A module that takes any number of css file entry points and packages them together with meta data before providing them as a readable stream.

## Overview

Given any number of css file paths, for each file path, this module will:
1. fetch the file at the path
2. fetch a name and version from the nearest package.json to the file
3. bundle the css found in the file (resolving any @import statements and inlining them)
4. put all this together in an object (See Output data format below)

The module provides a readable stream of the resulting objects.

### Output data format

```js
{
    // Unique id for entry. Created by hashing together name, version and file
    id: '4f32a8e1c6cf6e5885241f3ea5fee583560b2dfde38b21ec3f9781c91d58f42e',
    // 'name' from nearest package.json file found by working up from the css file's directory
    name: 'my-module-1',
    // 'version' from nearest package.json file found by working up from the css file's directory
    version: '1.0.1',
    // path to file on disk relative to nearest package.json file found by working up from the css file's directory
    file: 'my-module-1/main.css',
    // bundled css content with any @import statements inlined
    content: '/* ... */'
}
```

## Installation

```bash
npm install asset-pipe-css-writer
```

## Usage

### Require the writer
```js
const CssWriter = require('asset-pipe-css-writer')
```

### Instantiating the writer

Either pass a path to a single css file:
```js
const writer = new CssWriter('/path/to/css/file.css')
```

Or pass an array of paths to css files:
```js
const writer = new CssWriter(['/path/to/css/file1.css', '/path/to/css/file2.css'])
```

### Consuming content from the writer

The writer is a readable stream in object mode so in order to access the data you may register a data handler
and listen for objects to be passed to the handler:
```js
writer.on('data', data => {
    // { id, name, version, file, content }
})
```

You might also pipe the writer into a writeable or transform stream (with input in object mode):
```js
const { Writable } = require('stream')
const consumer = new Writeable({
    objectMode: true,
    write(chunk, encoding, callback) {
        // chunk will be an object of the shape: { id, name, version, file, content }
        console.log(chunk)
        callback()
    }
})

writer.pipe(consumer)
```
