'use strict';

const postcss = require('postcss');
const syntax = require('postcss-scss');
const nest = require("postcss-nested");

const parser = (css) => {
  const splits = [];

  /**
  * @returns {Function}  - PostCSS function
  */
  const brandParse = postcss.plugin('brand-parse', (options) => {
    return (global, result) => {
      global.walkAtRules(at => {
        if (/brand/.test(at.params)) {
          if (at.parent.type === 'atrule') {
            splits.push(`@${at.parent.name} ${at.parent.params} {`);
            splits.push(at.toString());
            splits.push('}');
          } else {
            splits.push(`${at.parent.selector} {`);
            splits.push(at.toString());
            splits.push('}');
          }

          at.remove();
        }
      });

      global.walkRules(rule => {
        rule.walkDecls(decl => {
          if (/brand-/.test(decl.value)) {
            if (rule.parent.type === 'atrule') {
              splits.push(`@${rule.parent.name} ${rule.parent.params} {`);
              splits.push(`${rule.selector} { ${decl.toString()}; }`);
              splits.push('}');
            } else {
              splits.push(`${rule.selector} { ${decl.toString()}; }`);
            }
            decl.remove();
          }
        });
      });
    };
  });

  /**
  * @param {string} css - the css string to parse.
  * @returns {Promise} object - containing the global css and the split code
  */
  const parseSCSS = (css) => {
    //https://github.com/postcss/postcss-nested#options
    //use the bubble option to specify mixins to unwrap
    const processor = postcss([nest({bubble: ['brand']}), brandParse()]);

    return processor.process(css, {syntax})
    .then(x => {
      return {css: x.css, splits: splits};
    });
  };

  return parseSCSS(css);
};


module.exports = parser;
