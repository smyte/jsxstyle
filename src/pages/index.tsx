import * as React from 'react';
import { Helmet } from 'react-helmet';

import Chrome from '../components/Chrome';

export default class IndexPage extends React.Component {
  render() {
    return (
      <Chrome>
        <Helmet title="jsxstyle" />
        <p>wip</p>
      </Chrome>
    );
  }
}
