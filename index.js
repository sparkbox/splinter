'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const parse = require('./parseSCSS');

module.exports = (params) => {
  const workingDir = parms.cwd || 'src/scss/';

  return new Promise((resolve, reject) => {
    let promises = [];
    const content = fs.readFileSync(params.base).toString();

    const rl = readline.createInterface({
      input: fs.createReadStream(params.base)
    });

    rl.on('line', (line) => {
      const match = line.match(/@import "(.*)"/);
      if (match) {
        const name = path.join(workingDir, `_${match[1]}.scss`);
        const file = fs.readFileSync(name).toString();
        promises.push(parse({
          css: file,
          keyword: params.keyword || null,
        }));
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
