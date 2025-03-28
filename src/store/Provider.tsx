"use client";

import { store } from "@/store";
import { Provider } from "react-redux";
import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { setTokens } from "@/store/slices/authSlice";
import { setAuthorizationHeader } from "@/services/apiClients/usersApiClient";

function TokenInitializer() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const cookies = document.cookie.split("; ");
    const accessToken = cookies
      .find((row) => row.startsWith("accessToken="))
      ?.split("=")[1];

    const refreshToken = cookies
      .find((row) => row.startsWith("refreshToken="))
      ?.split("=")[1];

    if (accessToken) {
      setAuthorizationHeader(accessToken);

      dispatch(
        setTokens({
          accessToken,
          refreshToken: refreshToken || "",
        })
      );
    }
  }, [dispatch]);

  return null;
}

export default function ReduxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <TokenInitializer />
      {children}
    </Provider>
  );
}
