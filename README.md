[![CircleCI](https://circleci.com/gh/sparkbox/splinter.svg?style=shield)](https://circleci.com/gh/sparkbox/splinter)

scss-splinter enables the creation of multiple stylesheets from a common set of modules with minimal effort via SCSS mixins and functions.

## Usage

scss-splinter accepts an options object that specifies a `partial` and a `base`.

```js
  const parse = require('scss-splinter');

  parse({
    partial: 'src/scss/_brands.scss',
    base: 'src/scss/_base.scss',
  })
```

1. Partial is the name of the file that scss-splinter will generate with "split" code, e.g. code that is specified in the matching mixin or sass-function.

2. Base is the name of the main `sass` index file in a project. This is the file scss-splinter will use to find all the files it needs to parse.

scss-splinter fills the `partial` file with "split" `scss` and returns a promise that contains "global" `scss`. It's up to the project to determine what to do with this global string. One approach would be to run the string through `node-sass` and write the compiled `css` to a file.

```js
  const fs = require('fs');
  const parse = require('scss-splinter');
  const nodeSass = require('node-sass');

  parse({
    partial: 'src/scss/_brands.scss',
    base: 'src/scss/_base.scss',
  })
  .then((scss) => {
    const compiledGlobal = nodeSass.renderSync({
      data: scss,
    });

    fs.writeFileSync('global.css', compiledGlobal.css.toString());
  });
```
