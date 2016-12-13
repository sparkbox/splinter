const chai = require('chai');
const expect = chai.expect;
const parse = require('../parseSCSS.js');

// don't use arrow functions https://mochajs.org/#arrow-functions
describe('scss split creation', function () {
  it('extracts scss function starting with brand-', function () {
    const sassString = `
  h1 {
    foo: bar;
    color: brand-color(c4);
  }
  `;
    const parsed = parse(sassString);

    parsed.then(x => {
      expect(x.splits[0]).to.equal('h1 { color: brand-color(c4); }');
    });
  });

  it('extracts scss mixin starting with brand', function () {
    const sassString = `
  h1 {
    foo: bar;

    @include brand(foo) {
      margin: 0;
    }
  }
  `;
    const parsed = parse(sassString);

    parsed.then(x => {
      expect(x.splits[1])
        .to.equal('@include brand(foo) {\n      margin: 0;\n    }');
    });
  });

  it('handles nesting by extracting the function and the parent selector chain', function () {
    const sassString = `
  div {
    foo: bar;

    h2 {
      color: brand-color(c4);
    }
  }
  `;
    const parsed = parse(sassString);

    parsed.then(x => {
      expect(x.splits[0]).to.equal('div h2 { color: brand-color(c4); }');
    });
  });

  it('handles brand mixins inside media queries', function () {
    const sassString = `
div {
  span {
    span {
      @media (min-width: 40em) {
        @include brand(foo) {
          color: red;
        }
      }
    }
  }
}`;
    const parsed = parse(sassString);

    parsed.then(x => {
      expect(x.splits[0]).to.equal('@media (min-width: 40em) {');
      expect(x.splits[1]).to.equal('@include brand(foo) {\n        div span span {\n            color: red\n        }\n    }');
    });
  });

  it('handles brand functions inside media queries', function () {
    const sassString = `
div {
  span {
    span {
      @media (min-width: 40em) {
        foo: bar;
        color: brand-color(c4);
      }
    }
  }
}`;
    const parsed = parse(sassString);

    parsed.then(x => {
      expect(x.splits[0]).to.equal('@media (min-width: 40em) {');
      expect(x.splits[1]).to.equal('div span span { color: brand-color(c4); }');
    });
  });
});
