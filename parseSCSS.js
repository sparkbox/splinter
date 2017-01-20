'use strict';

const postcss = require('postcss');
const syntax = require('postcss-scss');
const nest = require('postcss-nested');

const parser = (css) => {
  const splits = [];

  /**
  * @param {object} at - an at rule, e.g. @media
  */
  const parseAtRule = (at) => {
    if (/brand/.test(at.params)) {
      if (at.parent.type === 'atrule') {
        if (!/brand/.test(at.parent.params)) {
          splits.push(`@${at.parent.name} ${at.parent.params} {`);
          splits.push(at.toString());
          splits.push('}');
        }
      } else {
        splits.push(`${at.parent.selector} {`);
        splits.push(at.toString());
        splits.push('}');
      }

      at.remove();
    }
  };

  /**
  * @param {object} rule - a CSS rule: a selector followed by a declaration block
  */
  const parseDecl = (rule) => {
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
  };

  /**
  * @returns {Function}  - PostCSS function
  */
  const brandParse = postcss.plugin('brand-parse', (options) => {
    return (global, result) => {
      global.walkAtRules(x => parseAtRule(x));
      global.walkRules(x => parseDecl(x));
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

    return processor.process(css, { syntax })
    .then(x => ({ css: x.css, splits: splits }));
  };

  return parseSCSS(css);
};


module.exports = parser;
