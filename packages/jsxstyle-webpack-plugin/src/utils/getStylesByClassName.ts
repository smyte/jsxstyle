import invariant = require('invariant');
import { CSSProperties } from 'jsxstyle-utils';

import { CacheObject } from '../types';
import { getClassNameFromCache } from './getClassNameFromCache';

const nonStyleProps = {
  children: true,
  className: true,
  component: true,
  props: true,
  style: true,
};

interface JsxstyleProps extends CSSProperties {
  mediaQueries?: Record<string, string>;
  props?: Record<string, any>;
}

export interface StylesByClassName {
  [key: string]: JsxstyleProps;
}

export function getStylesByClassName(
  staticAttributes: Record<string, any>,
  cacheObject: CacheObject,
  classNameFormat?: 'hash'
): StylesByClassName {
  if (typeof staticAttributes !== 'undefined') {
    invariant(
      staticAttributes != null,
      'getStylesByClassName expects an object as its second parameter'
    );
  }

  invariant(
    cacheObject != null,
    'getStylesByClassName expects an object as its third parameter'
  );

  const stylesByClassName: StylesByClassName = {};

  let hasItems = false;
  const styleProps: Record<string, any> = {};
  for (const item in staticAttributes) {
    if (
      nonStyleProps.hasOwnProperty(item) ||
      !staticAttributes.hasOwnProperty(item)
    ) {
      continue;
    }
    hasItems = true;
    styleProps[item] = staticAttributes[item];
  }

  if (!hasItems) {
    return stylesByClassName;
  }

  if (Object.keys(styleProps).length > 0) {
    const className = getClassNameFromCache(
      styleProps,
      cacheObject,
      classNameFormat
    );
    if (className) {
      stylesByClassName[className] = styleProps;
      if (staticAttributes.mediaQueries) {
        stylesByClassName[className].mediaQueries =
          staticAttributes.mediaQueries;
      }
    }
  }

  return stylesByClassName;
}
