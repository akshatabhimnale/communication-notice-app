import * as React from "react";
import { NextAppProvider } from "@toolpad/core/nextjs";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import type { Navigation } from "@toolpad/core/AppProvider";
import ReduxProvider from "@/store/Provider"; // Import your Redux Provider
import AssignmentIcon from "@mui/icons-material/Assignment";
const NAVIGATION: Navigation = [
  {
    kind: "header",
    title: "Main items",
  },
  {
    title: "Dashboard",
    icon: <DashboardIcon />,
    segment: "dashboard",
  },
  {
    title: "Notice Types",
    icon: <AssignmentIcon />,
    segment: "dashboard/notices",
  },
];

const BRANDING = {
  title: "My Toolpad Core Next.js App",
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
