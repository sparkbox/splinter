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
    const parsed = parse({ css:sassString });

    return parsed.then(x => {
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
    const parsed = parse({ css: sassString });

    return parsed.then(x => {
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
    const parsed = parse({ css: sassString });

    return parsed.then(x => {
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
    const parsed = parse({ css: sassString });

    return parsed.then(x => {
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
    const parsed = parse({ css: sassString });

    return parsed.then(x => {
      expect(x.splits[0]).to.equal('@media (min-width: 40em) {');
      expect(x.splits[1]).to.equal('div span span { color: brand-color(c4); }');
    });
  });

  it('does not unwrap doubly nested brand mixins', function () {
    const sassString = `
body {
  margin: 0;

  @include brand(foo) {
    @include brand-text();
  }
}
`;
    const parsed = parse({ css: sassString });

    return parsed.then(x => {
      expect(x.splits[1]).to.equal('@include brand(foo) {\n    @include brand-text();\n  }');
    });
  });

  it('does not orphan one-line includes', function () {
    const sassString = `
.foo {
  @media (min-width: 40em) {
    @include clearfix;
  }
}
`;
    const parsed = parse({ css: sassString });

    return parsed.then(x => {
      expect(x.css).to.equal(`
@media (min-width: 40em) {
    .foo {
        @include clearfix
    }
}
`);
    });
  });

  it('will search for custom keywords in declarations', function () {
    const sassString = `
  h1 {
    foo: bar;
    color: split-color(c4);
  }
  `;
    const parsed = parse({
      css: sassString,
      keyword: 'split'
    });

    return parsed.then(x => {
      expect(x.splits[0]).to.equal('h1 { color: split-color(c4); }');
    });
  });

  it('will search for custom keywords in mixin names', function () {
    const sassString = `
  h1 {
    foo: bar;

    @include split(foo) {
      margin: 0;
    }
  }
  `;
    const parsed = parse({
      css: sassString,
      keyword: 'split',
    });

    return parsed.then(x => {
      expect(x.splits[1])
        .to.equal('@include split(foo) {\n      margin: 0;\n    }');
    });
  });

  it('strips comments', function () {
    const sassString = `
h1 {
  // comment
  foo: bar;
  // another comment
}
  `;
    const parsed = parse({ css: sassString });

    return parsed.then(x => {
      expect(x.css)
        .to.equal('\nh1 {\n\n  foo: bar;\n\n}\n  ');
    });
  });

  it('don\'t strip URLs', function () {
    const sassString = `
  h1 {
  foo: "http://google.com";
  }
  `;
    const parsed = parse({ css: sassString });

    return parsed.then(x => {
      expect(x.css)
        .to.equal('\n  h1 {\n  foo: "http://google.com";\n  }\n  ');
    });
  });

  it.only('handles nested variables', function () {
    const sassString = `
h1 {
  $size: 1rem;
  div {
    top: $size;
  }
}`;
    const parsed = parse({ css: sassString });

    return parsed.then(x => {
      expect(x.css)
        .to.equal(`
h1 {
  $size: 1rem
}
h1 div {
  $size: 1rem;
  top: $size;
}`);
    });
  });

  it('handles @imports', function () {
    const sassString = `@import 'specs/import.scss';`;
    const parsed = parse({ css: sassString });

    return parsed.then(x => {
      expect(x.css)
        .to.equal('h1 {\n  color: red;\n}');
    });
  });

  it('handles variables in @imports', function () {
    const sassString = `
  @import 'specs/imported-vars.scss';

  h1 {
    div {
      top: $size;
    }
  }`;
    const parsed = parse({ css: sassString });

    return parsed.then(x => {
      expect(x.css)
        .to.equal('h1 div {\n    top: 16px;\n}');
    });
  });

});
