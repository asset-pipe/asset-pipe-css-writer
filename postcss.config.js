'use strict';

module.exports = {
    plugins: [
        require('cssnano')({
            preset: [
                'default',
                {
                    autoprefixer: true,
                },
            ],
        }),
    ],
};
