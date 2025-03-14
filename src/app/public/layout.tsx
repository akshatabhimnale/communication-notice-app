import * as React from 'react';

export default async function DashboardPagesLayout(props: {
  children: React.ReactNode;
}) {
  return <div>{props.children}</div>;
}
