import { getStyleCache } from '..';

const kitchenSink = {
  mediaQueries: { test: 'test' },
  flex: 1,
  placeholderFlex: 2,
  activeFlex: 3,
  hoverFlex: 4,
  placeholderHoverFlex: 5,
  testFlex: 6,
  testPlaceholderFlex: 7,
  testActiveFlex: 8,
  testHoverFlex: 9,
  testPlaceholderHoverFlex: 10,
};

const getClassNameAndRules = (
  styleObj: Record<string, any>,
  classNameProp?: string
) => {
  const styleCache = getStyleCache();
  const rules: string[] = [];
  styleCache.injectOptions({
    onInsertRule: (css) => {
      rules.push(css);
    },
  });
  const className = styleCache.getClassName(styleObj, classNameProp);
  return { rules, className };
};

describe('styleCache', () => {
  it('combines class names if `className` prop is present', () => {
    expect(getClassNameAndRules({ display: 'inline', color: 'red' }, 'bla'))
      .toMatchInlineSnapshot(`
      Object {
        "className": "bla _1jvcvsh _1lvn9cc",
        "rules": Array [
          "._1jvcvsh { color:red }",
          "._1lvn9cc { display:inline }",
        ],
      }
    `);
  });

  it('generates deterministic class names', () => {
    expect(getClassNameAndRules({ wow: 'cool' })).toMatchInlineSnapshot(`
      Object {
        "className": "_1b8zaqn",
        "rules": Array [
          "._1b8zaqn { wow:cool }",
        ],
      }
    `);
  });

  it('generates a classname hash of `_d3bqdr` for the specified style object', () => {
    expect(
      getClassNameAndRules({
        color: 'red',
        display: 'block',
        hoverColor: 'green',
        mediaQueries: {
          test: 'example media query',
        },
        testActiveColor: 'blue',
      })
    ).toMatchInlineSnapshot(`
      Object {
        "className": "_1jvcvsh _1vzzc6z _cmecz0 _fmtdho",
        "rules": Array [
          "._1jvcvsh { color:red }",
          "._cmecz0 { display:block }",
          "._1vzzc6z:hover { color:green }",
          "@media example media query { ._fmtdho._fmtdho:active { color:blue } }",
        ],
      }
    `);
  });

  it('returns null when given an empty style object', () => {
    expect(getClassNameAndRules({}).className).toBeNull();
  });

  it('converts a style object to a sorted object of objects', () => {
    expect(getClassNameAndRules(kitchenSink)).toMatchInlineSnapshot(`
      Object {
        "className": "_132f3qi _17qtbum _1qo33y1 _1reeka8 _1twewn0 _3xv2tv _5veahi _8rmbh7 _o55ibr _w6ph40",
        "rules": Array [
          "._3xv2tv:active { flex:3 }",
          "._1qo33y1 { flex:1 }",
          "._17qtbum:hover { flex:4 }",
          "._o55ibr::placeholder { flex:2 }",
          "._1twewn0:hover::placeholder { flex:5 }",
          "@media test { ._1reeka8._1reeka8:active { flex:8 } }",
          "@media test { ._5veahi._5veahi { flex:6 } }",
          "@media test { ._8rmbh7._8rmbh7:hover { flex:9 } }",
          "@media test { ._132f3qi._132f3qi::placeholder { flex:7 } }",
          "@media test { ._w6ph40._w6ph40:hover::placeholder { flex:10 } }",
        ],
      }
    `);
  });

  it('respects media query order', () => {
    expect(
      getClassNameAndRules({
        mediaQueries: {
          zzzz: 'zzzz',
          aaaa: 'aaaa',
        },
        aaaaFlex: 3,
        flex: 1,
        zzzzFlex: 2,
      })
    ).toMatchInlineSnapshot(`
      Object {
        "className": "_13e76ud _1qo33y1 _8ehkv8",
        "rules": Array [
          "@media aaaa { ._13e76ud._13e76ud { flex:3 } }",
          "._1qo33y1 { flex:1 }",
          "@media zzzz { ._8ehkv8._8ehkv8 { flex:2 } }",
        ],
      }
    `);
  });

  it('works with classname strategy injection', () => {
    const styleCache = getStyleCache();
    let idx = -1;
    styleCache.injectOptions({ getClassName: () => 'jsxstyle' + ++idx });

    const classNames = [
      styleCache.getClassName({ a: 1 }),
      styleCache.getClassName({ b: 2 }),
      styleCache.getClassName({ c: 3 }),
      styleCache.getClassName({ a: 1 }),
    ];

    expect(classNames).toEqual([
      'jsxstyle0',
      'jsxstyle1',
      'jsxstyle2',
      'jsxstyle0',
    ]);
  });

  it('resets', () => {
    const styleCache = getStyleCache();
    let idx = -1;
    styleCache.injectOptions({ getClassName: () => 'jsxstyle' + ++idx });

    expect(styleCache.getClassName({ a: 1 })).toEqual('jsxstyle0');
    expect(styleCache.getClassName({ a: 1 })).toEqual('jsxstyle0');
    styleCache.reset();
    expect(styleCache.getClassName({ a: 1 })).toEqual('jsxstyle1');
  });

  it('throws an errors when injections are added incorrectly', () => {
    const styleCache = getStyleCache();

    expect(() => styleCache.injectOptions()).not.toThrow();

    // no repeated injections
    expect(() => styleCache.injectOptions()).toThrowErrorMatchingInlineSnapshot(
      `"jsxstyle error: \`injectOptions\` should be called once and only once."`
    );

    styleCache.getClassName({ a: 1 });

    // no injections after getClassName is called
    expect(() => styleCache.injectOptions()).toThrowErrorMatchingInlineSnapshot(
      `"jsxstyle error: \`injectOptions\` must be called before any jsxstyle components mount."`
    );
  });
});
