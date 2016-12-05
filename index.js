'use strict';

const fs = require('fs');
const readline = require('readline');
const parse = require('./parseSCSS');

module.exports = (params) => {
  return new Promise((resolve, reject) => {
    let promises = [];
    const content = fs.readFileSync(params.base).toString();

    const rl = readline.createInterface({
      input: fs.createReadStream(params.base)
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
        const global = data.map(x => x.css);
        const splits = data.map(x => x.splits.join(''));
        fs.writeFileSync(params.partial, splits.join(''))
        resolve(global.join(''));
      });
    });
  })
};
