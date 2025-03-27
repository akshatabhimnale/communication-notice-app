import ReduxProvider from "@/store/Provider";
import AssignmentIcon from "@mui/icons-material/Assignment";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { NextAppProvider } from "@toolpad/core/nextjs";
import * as React from "react";
import { Suspense } from "react";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DescriptionIcon from "@mui/icons-material/Description";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SendIcon from "@mui/icons-material/Send";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LayersIcon from "@mui/icons-material/Layers";
import BarChartIcon from "@mui/icons-material/BarChart";
import GroupIcon from "@mui/icons-material/Group";
import SettingsIcon from "@mui/icons-material/Settings";

import type { Navigation } from "@toolpad/core/AppProvider";

const NAVIGATION: Navigation = [
  {
    kind: "header",
    title: "Main Navigation",
  },
  {
    title: "Dashboard",
    icon: <DashboardIcon />,
    segment: "",
  },
  {
    title: "Notice Management",
    icon: <NotificationsIcon />,
    segment: "notice-management",
    children: [
      {
        title: "Notice Types",
        icon: <AssignmentIcon />,
        segment: "notice-types",
      },
      {
        title: "Notices",
        icon: <DescriptionIcon />,
        segment: "notices",
        children: [
          {
            title: "Bulk Upload",
            icon: <CloudUploadIcon />,
            segment: "bulk-upload",
          },
          {
            title: "Bulk Send",
            icon: <SendIcon />,
            segment: "bulk-send",
          },
          {
            title: "View Notices",
            icon: <VisibilityIcon />,
            segment: "view-notices",
          },
        ],
      },
    ],
  },
  {
    title: "Templates",
    icon: <LayersIcon />,
    segment: "templates",
  },
  {
    title: "Reports",
    icon: <BarChartIcon />,
    segment: "reports",
  },
  {
    title: "User Management",
    icon: <GroupIcon />,
    segment: "admin/dashboard/users",
  },
  {
    title: "Settings",
    icon: <SettingsIcon />,
    segment: "settings",
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
            <Suspense fallback={<div>Loading layout...</div>}>
              <NextAppProvider navigation={NAVIGATION} branding={BRANDING}>
                {props.children}
              </NextAppProvider>
            </Suspense>
          </ReduxProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
