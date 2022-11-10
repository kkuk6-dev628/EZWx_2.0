import React from 'react';
import { NextPage } from 'next';

const New: NextPage<{ data: string }> = (props) => {
  const { data } = props;

  return (
    <div>
      <h1>Hello from NextJS! - New</h1>
      {data}
    </div>
  );
};

New.getInitialProps = ({ query }) => {
  return {
    data: `some initial props including query params and controller data: ${JSON.stringify(
      query,
    )}`,
  };
};

export default New;
