'use strict';

const postcss = require('postcss');
const syntax = require('postcss-scss');
const nest = require('postcss-nested');
const vars = require('postcss-simple-vars');
const atImports = require('postcss-import');

let params = {};

const parser = (css) => {
  const splits = [];

  /**
  * @param {object} at - an at rule, e.g. @media
  */
  const parseAtRule = (at) => {
    const regex = new RegExp(params.keyword);
    if (regex.test(at.params)) {
      if (at.parent.type === 'atrule') {
        if (!regex.test(at.parent.params)) {
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
      const regex = new RegExp(`${params.keyword}-`);
      if (regex.test(decl.value)) {
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
  * @param {object} config - contains the css string and an optional keyword to search for.
  * @returns {Promise} object - containing the global css and the split code
  */
  const parseSCSS = (config) => {
    params = config;
    params.keyword = config.keyword || 'brand';

    // remove any line where the first non-space character is `//`
    css = params.css.replace(/^\s*\/\/.*/gm, '');

    //https://github.com/postcss/postcss-nested#options
    //use the bubble option to specify mixins to unwrap
    const processor = postcss([atImports, vars, nest({bubble: [params.keyword]}), brandParse()]);

    return processor.process(css, { from: undefined, syntax })
    .then(x => ({ css: x.css, splits: splits }));
  };

  return parseSCSS(css);
};


module.exports = parser;
