import * as React from 'react';
import * as ReactDOM from 'react-dom';

import App from './App';

const reactRoot = document.getElementById('.jsx-dot-style');

function renderApp() {
  ReactDOM.render(<App />, reactRoot);
}
renderApp();

if (module.hot) {
  module.hot.accept('./App', renderApp);
}
