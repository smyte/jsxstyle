import React from 'react';
import ReactDOM from 'react-dom';
import { cache } from 'jsxstyle';

import App from './App';

import './style.css';

cache.injectOptions({
  getClassName: (key) => key.replace(/[^a-zA-Z0-9-_]/g, '_'),
});

const appRoot = document.getElementById('.jsxstyle-demo');

function load() {
  ReactDOM.render(<App />, appRoot);
}

if (module.hot) {
  module.hot.accept('./App', load);
}

load();
