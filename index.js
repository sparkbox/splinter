'use strict';

const fs = require('fs');
const readline = require('readline');
const parse = require('./parseSCSS');

module.exports = (params) => {
  const splitter = new Promise((resolve) => {
    const promises = [];

    const rl = readline.createInterface({
      input: fs.createReadStream(params.base),
    });

    rl.on('line', (line) => {
      const match = line.match(/@import "(.*)"/);
      if (match) {
        const name = `src/scss/_${match[1]}.scss`;
        const file = fs.readFileSync(name).toString();
        promises.push(parse(file));
      }
    });

    rl.on('close', () => {
      Promise.all(promises).then((data) => {
        const global = data.map((x) => {
          const css = x.css;
          return css;
        });
        const splits = data.map((x) => {
          const split = x.splits.join('');
          return split;
        });
        fs.writeFileSync(params.partial, splits.join(''));
        resolve(global.join(''));
      });
    });
  });

  return splitter;
};
