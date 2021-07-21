# jsxstyle

## 3.0.0

### Minor Changes

- f6408ad: Allow a few common props (`type`, `name`, and a few other) to be set at the top level of a jsxstyle component as well as being set in the props prop. This should make styling and configuring commonly-used components a bit less painful. For additional context, see #147.

### Patch Changes

- Updated dependencies [f6408ad]
  - jsxstyle-utils@3.0.0

## 2.5.1

### Patch Changes

- a504a4a: Added a `key` prop to the `JsxstyleProps` interface in `jsxstyle/preact`

## 2.5.0

### Minor Changes

- 5c7973f: Mark generated components (`Block`, `Row`, etc.) as pure to allow them to be pruned if unused.

### Patch Changes

- Updated dependencies [a294cf4]
  - jsxstyle-utils@2.5.0
