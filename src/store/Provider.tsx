"use client";
import { store } from "@/store";
import { Provider } from "react-redux";
import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { setTokens } from "@/store/slices/authSlice";

function TokenInitializer() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const cookies = document.cookie.split("; ");
    console.log("All Cookies:", document.cookie);
    const accessToken = cookies
      .find(row => row.startsWith("accessToken="))
      ?.split("=")[1];
    const refreshToken = cookies
      .find(row => row.startsWith("refreshToken="))
      ?.split("=")[1];
    
    console.log("Retrieved Tokens:", { accessToken, refreshToken }); 
    if (accessToken) {
      dispatch(setTokens({ 
        accessToken, 
        refreshToken: refreshToken || "" 
      }));
      console.log("Initialized tokens in store:", { accessToken, refreshToken });
    } else {
      console.log("No access token found in cookies");
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