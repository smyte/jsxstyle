import { getRulesForStyleProps } from '../../../jsxstyle-utils';

const getClassNameDebug = (key: string) =>
  '_' + key.replace(/[^a-zA-Z0-9_-]/g, '_');

describe('getRulesForStyleProps', () => {
  it('returns null when given an empty style object', () => {
    const keyObj = getRulesForStyleProps({}, getClassNameDebug);
    expect(keyObj).toBeNull();
  });

  it('converts a style object to a style string that only contains valid styles', () => {
    class Useless {
      constructor(public stuff: string) {}
      toString(): string {
        return this.stuff;
      }
    }

    function prototypeTest(stuff: string) {
      return new Useless(stuff);
    }

    const keyObj = getRulesForStyleProps(
      {
        prop1: 'string',
        prop2: 1234,
        prop3: 0,
        prop4: prototypeTest('wow'),
        prop5: null,
        prop6: undefined,
        prop7: false,
      },
      getClassNameDebug
    );

    expect(keyObj).toMatchInlineSnapshot(`
      Object {
        "className": "_prop1_string _prop2_1234px _prop3_0 _prop4_wow",
        "rules": Array [
          "._prop1_string { prop1:string }",
          "._prop2_1234px { prop2:1234px }",
          "._prop3_0 { prop3:0 }",
          "._prop4_wow { prop4:wow }",
        ],
      }
    `);
  });

  it('splits out pseudoelements and pseudoclasses', () => {
    const keyObj = getRulesForStyleProps(
      {
        activeColor: 'purple',
        hoverColor: 'orange',
        placeholderColor: 'blue',
        selectionBackgroundColor: 'red',
      },
      getClassNameDebug
    );

    expect(keyObj).toMatchInlineSnapshot(`
      Object {
        "className": "___placeholder_color_blue ___selection_background-color_red __active_color_purple __hover_color_orange",
        "rules": Array [
          ".__active_color_purple:active { color:purple }",
          ".__hover_color_orange:hover { color:orange }",
          ".___placeholder_color_blue::placeholder { color:blue }",
          ".___selection_background-color_red::selection { background-color:red }",
        ],
      }
    `);
  });

  it('generates identical classNameKeys for identical styles objects', () => {
    const keyObj1 = getRulesForStyleProps(
      { color: 'red', fooColor: 'blue', mediaQueries: { foo: 'test mq' } },
      getClassNameDebug
    );

    const keyObj2 = getRulesForStyleProps(
      { color: 'red', barColor: 'blue', mediaQueries: { bar: 'test mq' } },
      getClassNameDebug
    );

    expect(keyObj1).toMatchInlineSnapshot(`
      Object {
        "className": "_color_red _test_mq_color_blue",
        "rules": Array [
          "._color_red { color:red }",
          "@media test mq { ._test_mq_color_blue._test_mq_color_blue { color:blue } }",
        ],
      }
    `);
    expect(keyObj1!.className).toEqual(keyObj2!.className);
    expect(keyObj1!.rules.slice().sort()).toEqual(
      keyObj2!.rules.slice().sort()
    );
  });

  it('generates different classNameKeys for styles objects with different content', () => {
    const keyObj1 = getRulesForStyleProps(
      { color: 'red', fooColor: 'blue', mediaQueries: { foo: 'test mq1' } },
      getClassNameDebug
    );

    const keyObj2 = getRulesForStyleProps(
      { color: 'red', fooColor: 'blue', mediaQueries: { foo: 'test mq2' } },
      getClassNameDebug
    );

    expect(keyObj1).toMatchInlineSnapshot(`
      Object {
        "className": "_color_red _test_mq1_color_blue",
        "rules": Array [
          "._color_red { color:red }",
          "@media test mq1 { ._test_mq1_color_blue._test_mq1_color_blue { color:blue } }",
        ],
      }
    `);
    expect(keyObj2).toMatchInlineSnapshot(`
      Object {
        "className": "_color_red _test_mq2_color_blue",
        "rules": Array [
          "._color_red { color:red }",
          "@media test mq2 { ._test_mq2_color_blue._test_mq2_color_blue { color:blue } }",
        ],
      }
    `);
  });

  it('expands horizontal/vertical margin/padding shorthand props', () => {
    const keyObj1 = getRulesForStyleProps(
      {
        aaa: 123,
        zzz: 123,
        margin: 1, // least specific
        marginH: 2, // expands to marginLeft + marginRight
        marginLeft: 3, // most specific
      },
      getClassNameDebug
    );

    expect(keyObj1).toMatchInlineSnapshot(`
      Object {
        "className": "_aaa_123px _margin-left_2px _margin-left_3px _margin-right_2px _margin_1px _zzz_123px",
        "rules": Array [
          "._aaa_123px { aaa:123px }",
          "._margin_1px { margin:1px }",
          "._margin-left_2px { margin-left:2px }",
          "._margin-right_2px { margin-right:2px }",
          "._margin-left_3px { margin-left:3px }",
          "._zzz_123px { zzz:123px }",
        ],
      }
    `);
  });

  it('supports pseudo-prefixed horizontal/vertical margin/padding shorthand props', () => {
    const keyObj1 = getRulesForStyleProps(
      {
        mediaQueries: { sm: 'test' },
        margin: 1,
        marginH: 2,
        marginLeft: 3,
        // unsupported
        hoverMarginLeft: 4,
        activeMarginV: 5,
        // should be supported
        smMarginH: 6,
      },
      getClassNameDebug
    );

    expect(keyObj1).toMatchInlineSnapshot(`
      Object {
        "className": "__active_margin-bottom_5px __active_margin-top_5px __hover_margin-left_4px _margin-left_2px _margin-left_3px _margin-right_2px _margin_1px _test_margin-left_6px _test_margin-right_6px",
        "rules": Array [
          ".__active_margin-top_5px:active { margin-top:5px }",
          ".__active_margin-bottom_5px:active { margin-bottom:5px }",
          ".__hover_margin-left_4px:hover { margin-left:4px }",
          "._margin_1px { margin:1px }",
          "._margin-left_2px { margin-left:2px }",
          "._margin-right_2px { margin-right:2px }",
          "._margin-left_3px { margin-left:3px }",
          "@media test { ._test_margin-left_6px._test_margin-left_6px { margin-left:6px } }",
          "@media test { ._test_margin-right_6px._test_margin-right_6px { margin-right:6px } }",
        ],
      }
    `);
  });

  it('generates identical classNameKeys for style objects with duplicate media queries', () => {
    const mediaQueries = { foo: 'test mq', bar: 'test mq' };

    const keyObj1 = getRulesForStyleProps(
      { fooProp1: 'blue', barProp2: 'red', mediaQueries },
      getClassNameDebug
    );

    const keyObj2 = getRulesForStyleProps(
      { barProp1: 'blue', fooProp2: 'red', mediaQueries },
      getClassNameDebug
    );

    expect(keyObj1!.className).toEqual(
      '_test_mq_prop1_blue _test_mq_prop2_red'
    );
    expect(keyObj1!.className).toEqual(keyObj2!.className);
  });

  it('supports object-type animation syntax', () => {
    const styleObj = {
      color: 'red',
      animation: {
        from: { opacity: 0 },
        to: { padding: 123 },
      },
    };

    const keyObj1 = getRulesForStyleProps(styleObj, getClassNameDebug);
    const keyObj2 = getRulesForStyleProps(styleObj, getClassNameDebug);

    expect(keyObj1).toMatchInlineSnapshot(`
      Object {
        "className": "_color_red _from___opacity_0____to___padding_123px___",
        "rules": Array [
          "@keyframes _from___opacity_0____to___padding_123px___ { from { opacity:0; } to { padding:123px; } }",
          "._from___opacity_0____to___padding_123px___ { animation-name:_from___opacity_0____to___padding_123px___ }",
          "._color_red { color:red }",
        ],
      }
    `);

    expect(keyObj2).toMatchInlineSnapshot(`
      Object {
        "className": "_color_red _from___opacity_0____to___padding_123px___",
        "rules": Array [
          "@keyframes _from___opacity_0____to___padding_123px___ { from { opacity:0; } to { padding:123px; } }",
          "._from___opacity_0____to___padding_123px___ { animation-name:_from___opacity_0____to___padding_123px___ }",
          "._color_red { color:red }",
        ],
      }
    `);
  });
});
