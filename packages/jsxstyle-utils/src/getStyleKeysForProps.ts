import { dangerousStyleValue } from './dangerousStyleValue';
import { makeAnimationRule } from './makeAnimationRule';
import { makeStyleRule } from './makeStyleRule';

// global flag makes subsequent calls of capRegex.test advance to the next match
const capRegex = /[A-Z]/g;

export const pseudoelements = {
  after: true,
  before: true,
  placeholder: true,
  selection: true,
};

export const pseudoclasses = {
  active: true,
  checked: true,
  disabled: true,
  empty: true,
  enabled: true,
  focus: true,
  hover: true,
  invalid: true,
  link: true,
  required: true,
  target: true,
  valid: true,
};

const specialCaseProps = {
  children: true,
  class: true,
  className: true,
  component: true,
  mediaQueries: true,
  props: true,
  style: true,
};

const sameAxisPropNames: Record<string, [string, string]> = {
  paddingH: ['paddingLeft', 'paddingRight'],
  paddingV: ['paddingTop', 'paddingBottom'],
  marginH: ['marginLeft', 'marginRight'],
  marginV: ['marginTop', 'marginBottom'],
};

export function getRulesForStyleProps(
  props: Record<string, any> & { mediaQueries?: Record<string, string> },
  getClassName: (key: string) => string
): { rules: string[]; className: string } | null {
  if (typeof props !== 'object' || props === null) {
    return null;
  }

  const propKeys = Object.keys(props).sort();
  const keyCount = propKeys.length;

  if (keyCount === 0) {
    return null;
  }

  const mediaQueries = props.mediaQueries;

  const rules: string[] = [];
  const classNames: string[] = [];

  for (let idx = -1; ++idx < keyCount; ) {
    const originalPropName = propKeys[idx];

    if (
      specialCaseProps.hasOwnProperty(originalPropName) ||
      !props.hasOwnProperty(originalPropName)
    ) {
      continue;
    }

    let propName: string = originalPropName;
    let propSansMQ: string | undefined;
    let pseudoelement: string | undefined;
    let pseudoclass: string | undefined;
    let mediaQuery: string | undefined;

    capRegex.lastIndex = 0;
    let splitIndex = 0;

    let prefix: string | false =
      capRegex.test(originalPropName) &&
      capRegex.lastIndex > 1 &&
      originalPropName.slice(0, capRegex.lastIndex - 1);

    // check for media query prefix
    if (prefix && mediaQueries != null && mediaQueries.hasOwnProperty(prefix)) {
      mediaQuery = mediaQueries[prefix];
      splitIndex = capRegex.lastIndex - 1;

      propSansMQ =
        originalPropName[splitIndex].toLowerCase() +
        originalPropName.slice(splitIndex + 1);

      prefix =
        capRegex.test(originalPropName) &&
        propSansMQ.slice(0, capRegex.lastIndex - splitIndex - 1);
    }

    // check for pseudoelement prefix
    if (prefix && pseudoelements.hasOwnProperty(prefix)) {
      pseudoelement = prefix;
      splitIndex = capRegex.lastIndex - 1;
      prefix =
        capRegex.test(originalPropName) &&
        originalPropName[splitIndex].toLowerCase() +
          originalPropName.slice(splitIndex + 1, capRegex.lastIndex - 1);
    }

    // check for pseudoclass prefix
    if (prefix && pseudoclasses.hasOwnProperty(prefix)) {
      pseudoclass = prefix;
      splitIndex = capRegex.lastIndex - 1;
    }

    // trim prefixes off propName
    if (splitIndex > 0) {
      propName =
        originalPropName[splitIndex].toLowerCase() +
        originalPropName.slice(splitIndex + 1);
    }

    let styleValue: any = props[originalPropName];
    if (
      propName === 'animation' &&
      styleValue &&
      typeof styleValue === 'object'
    ) {
      const rule = makeAnimationRule(styleValue, getClassName);
      if (!rule) continue;
      classNames.push(rule.className);
      rules.push(rule.animation, rule.rule);
      continue;
    }

    styleValue = dangerousStyleValue(propName, props[originalPropName]);
    if (styleValue === '') {
      continue;
    }

    const propArray = sameAxisPropNames[propName];
    if (propArray) {
      const rule1 = makeStyleRule(
        propArray[0],
        styleValue,
        getClassName,
        pseudoelement,
        pseudoclass,
        mediaQuery
      );

      const rule2 = makeStyleRule(
        propArray[1],
        styleValue,
        getClassName,
        pseudoelement,
        pseudoclass,
        mediaQuery
      );

      classNames.push(rule1.className, rule2.className);
      rules.push(rule1.rule, rule2.rule);
    } else {
      const rule = makeStyleRule(
        propName,
        styleValue,
        getClassName,
        pseudoelement,
        pseudoclass,
        mediaQuery
      );

      classNames.push(rule.className);
      rules.push(rule.rule);
    }
  }

  if (classNames.length === 0) {
    return null;
  }

  return { rules, className: classNames.sort().join(' ') };
}
