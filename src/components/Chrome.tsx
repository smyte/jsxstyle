import * as React from 'react';
import Helmet from 'react-helmet';
import { Block } from 'jsxstyle';

import '../style.css';

const Chrome: React.SFC = ({ children }) => (
  <>
    <Helmet
      meta={[
        {
          name: 'description',
          content: 'An inline style system for React and Preact',
        },
        {
          name: 'keywords',
          content: 'css-in-js, jsx, css, jsxstyle, react, preact, webpack',
        },
      ]}
    />
    <Block margin="0 auto" padding={20}>
      {children}
    </Block>
  </>
);

export default Chrome;
