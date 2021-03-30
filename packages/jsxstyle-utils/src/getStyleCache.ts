import { addStyleToHead } from './addStyleToHead';
import { getRulesForStyleProps } from './getStyleKeysForProps';
import { stringHash } from './stringHash';

type InsertRuleCallback = (
  rule: string,
  props?: Record<string, any>
) => boolean | void;

type GetClassNameFn = (key: string) => string;

function cannotInject() {
  throw new Error(
    'jsxstyle error: `injectOptions` must be called before any jsxstyle components mount.'
  );
}

function alreadyInjected() {
  throw new Error(
    'jsxstyle error: `injectOptions` should be called once and only once.'
  );
}

const getStringHash: GetClassNameFn = (key) => {
  return '_' + stringHash(key).toString(36);
};

export function getStyleCache() {
  let _classNameCache: Record<string, string> = {};
  let getClassNameForKey: GetClassNameFn = getStringHash;
  let onInsertRule: InsertRuleCallback;

  const memoizedGetClassName = (key: string): string => {
    if (!_classNameCache[key]) {
      _classNameCache[key] = getClassNameForKey(key);
    }
    return _classNameCache[key];
  };

  const styleCache = {
    reset() {
      _classNameCache = {};
    },

    injectOptions(options?: {
      onInsertRule?: InsertRuleCallback;
      /** @deprecated */
      pretty?: boolean;
      getClassName?: GetClassNameFn;
    }) {
      if (options) {
        if (options.getClassName) {
          getClassNameForKey = options.getClassName;
        }
        if (options.onInsertRule) {
          onInsertRule = options.onInsertRule;
        }
        if (process.env.NODE_ENV === 'development' && options.pretty) {
          console.error('The `pretty` option has been deprecated');
        }
      }
      styleCache.injectOptions = alreadyInjected;
    },

    getClassName(
      props: Record<string, any>,
      classNameProp?: string | null | false
    ): string | null {
      styleCache.injectOptions = cannotInject;

      const processedStyles = getRulesForStyleProps(
        props,
        memoizedGetClassName
      );
      if (processedStyles == null) {
        return classNameProp || null;
      }

      for (const rule of processedStyles.rules) {
        if (
          !onInsertRule ||
          // if the function returns false, bail.
          onInsertRule(rule, props) !== false
        ) {
          addStyleToHead(rule);
        }
      }

      return classNameProp
        ? classNameProp + ' ' + processedStyles.className
        : processedStyles.className;
    },
  };

  return styleCache;
}
