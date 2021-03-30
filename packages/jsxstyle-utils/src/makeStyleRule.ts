import { hyphenateStyleName } from './hyphenateStyleName';

export const makeStyleRule = (
  styleProp: string,
  styleValue: any,
  getClassNameForKey: (key: string) => string,
  pseudoelement: string = '',
  pseudoclass: string = '',
  mediaQuery: string = ''
): { className: string; rule: string } => {
  const hyphenatedProp = hyphenateStyleName(styleProp);
  const value = hyphenatedProp + ':' + styleValue;

  const pseudos =
    (pseudoclass ? ':' + pseudoclass : '') +
    (pseudoelement ? '::' + pseudoelement : '');

  const key =
    (mediaQuery ? mediaQuery + '~' : '') +
    (pseudos ? pseudos + '~' : '') +
    value;

  const className = getClassNameForKey(key);

  const rule =
    '.' +
    className +
    (pseudoclass && ':' + pseudoclass) +
    (pseudoelement && '::' + pseudoelement) +
    ' { ' +
    value +
    ' }';

  if (mediaQuery) {
    // doubling up on className here to slightly increase specificity
    return { className, rule: `@media ${mediaQuery} { .${className}${rule} }` };
  } else {
    return { className, rule };
  }
};
