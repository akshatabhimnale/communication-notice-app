import ReduxProvider from '@/store/Provider';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { NextAppProvider } from '@toolpad/core/nextjs';
import * as React from 'react';

import type { Navigation } from "@toolpad/core/AppProvider";
const NAVIGATION: Navigation = [
  {
    kind: "header",
    title: "Main items",
  },
  {
    title: "Dashboard",
    icon: <DashboardIcon />,
    segment: "",
  },
  {
    title: "Notice Types",
    icon: <AssignmentIcon />,
    segment: "notices",
  },
];

const BRANDING = {
  title: "⚡CN",
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-toolpad-color-scheme="light">
      <body>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ReduxProvider>
            <NextAppProvider navigation={NAVIGATION} branding={BRANDING}>
              {props.children}
            </NextAppProvider>
          </ReduxProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
