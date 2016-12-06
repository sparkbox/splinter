'use strict';

const postcss = require('postcss');
const syntax = require('postcss-scss');
const nest = require('postcss-nested');

const parser = (css) => {
  const splits = [];

  /**
  * @returns {Function}  - PostCSS function
  */
  const brandParse = postcss.plugin('brand-parse', () => {
    const result = (global) => {
      global.walkRules((rule) => {
        rule.walkAtRules((at) => {
          if (/brand/.test(at.params)) {
            splits.push(`${rule.selector} {`);
            splits.push(at.toString());
            splits.push('}');

            at.remove();
          }
        });

        rule.walkDecls((decl) => {
          if (/brand-/.test(decl.value)) {
            splits.push(`${rule.selector} { ${decl.toString()}; }`);

            decl.remove();
          }
        });
      });
    };

    return result;
  });

  /**
  * @param {string} css - the css string to parse.
  * @returns {Promise} object - containing the global css and the split code
  */
  const parseSCSS = (cssString) => {
    /*
     * https://github.com/postcss/postcss-nested#options
     * use the bubble option to specify mixins to unwrap
     */
    const processor = postcss([nest({ bubble: ['brand'] }), brandParse()]);

    return processor.process(cssString, { syntax })
      .then((x) => {
        const result = {
          css: x.cssString,
          splits,
        };

        return result;
      });
  };

  return parseSCSS(css);
};


module.exports = parser;
