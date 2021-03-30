import { dangerousStyleValue } from './dangerousStyleValue';
import { hyphenateStyleName } from './hyphenateStyleName';

export const makeAnimationRule = (
  styleValue: Record<string, any>,
  getClassNameForKey: (key: string) => string
): { className: string; animation: string; rule: string } | null => {
  let animationValue = '';
  const styleKeys = Object.keys(styleValue);
  // bail if the object is empty
  if (styleKeys.length === 0) return null;

  for (const key of styleKeys) {
    const obj = styleValue[key];
    animationValue += (animationValue === '' ? '' : ' ') + key + ' { ';
    const keys = Object.keys(obj).sort();
    for (const childPropName of keys) {
      const value = dangerousStyleValue(childPropName, obj[childPropName]);
      if (value === '') {
        continue;
      }
      animationValue += hyphenateStyleName(childPropName) + ':' + value + ';';
    }
    animationValue += ' }';
  }

  // animation name and className are the same
  const className = getClassNameForKey(animationValue);
  const rule = `.${className} { animation-name:${className} }`;

  return {
    className,
    animation: `@keyframes ${className} { ${animationValue} }`,
    rule,
  };
};
