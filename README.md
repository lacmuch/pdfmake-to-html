pdfmakeToHTML
==========
[![travis](https://travis-ci.org/Astrocoders/pdfmake-to-html.svg?branch=develop)](https://travis-ci.org/Astrocoders/pdfmake-to-html)

Convert pdfmake's JSON tree into a DOM tree

# Usage
```js
require.config({
    baseUrl: '.',
    paths: {
        'pdfToHTML': '.../pdfmake-to-html/src/index',
        'lodash': '.../lodash.min'
    },
    shim: {
        pdfToHTML: {
            deps: ['lodash'],
            exports: 'pdfToHTML'
        }
    }
})
define(['pdfmake','pdfToHTML'], function(pdfMake,pdfToHTML) {
    const documentDefinition = {
        content: {
            table: {
                body: [
                  [ `I'm a column`, `I'm a column` ]
                ]
            }
        }
    }
    const dom = pdfmakeToHTML(documentDefinition)
}
```

Not all structures are supported until this very moment and there are a lot of specifics for my usage now (semantic UI, table renders actually to a grid).
But I intend to make it more general purpose in the near future.
