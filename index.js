'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const parse = require('./parseSCSS');

module.exports = (params) => {
  const workingDir = params.cwd || 'src/scss/';
  const base = path.join(workingDir, params.base);

  return new Promise((resolve, reject) => {
    let promises = [];

    const content = fs.readFileSync(base).toString();

    const rl = readline.createInterface({
      input: fs.createReadStream(base),
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
        fs.writeFileSync(path.join(workingDir, params.partial), splits.join(''))
        resolve(global.join(''));
      });
    });
  })
};
