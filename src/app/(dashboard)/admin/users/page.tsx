'use client';
import { useState, useEffect, useCallback, useRef } from "react";
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { RootState } from "@/store";
import * as userSlice from "@/store/slices/usersSlice";
import * as authSlice from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import UsersTable from '@/components/Usersdetails/UsersTable';
import { setAuthorizationHeader } from "@/services/apiClients/usersApiClient";
import { UserWithDelete } from "@/components/Usersdetails/UsersTable"; // Import the interface
// or define it locally if you prefer
import { updateUser, removeUser } from "@/store/slices/usersSlice";

export default function UsersList() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { 
    users, 
    loading: usersLoading, 
    nextPageUrl, 
    prevPageUrl 
  } = useAppSelector((state: RootState) => state.users, (left, right) => 
    left.users === right.users && 
    left.loading === right.loading && 
    left.nextPageUrl === right.nextPageUrl && 
    left.prevPageUrl === right.prevPageUrl
  );

  const { 
    accessToken, 
    refreshToken, 
    loading: authLoading, 
    error: authError 
  } = useAppSelector((state: RootState) => state.auth, (left, right) => 
    left.accessToken === right.accessToken && 
    left.refreshToken === right.refreshToken && 
    left.loading === right.loading && 
    left.error === right.error
  );

  // State and refs
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);
  const isFetchingRef = useRef(false);
  const latestAccessTokenRef = useRef(accessToken);

  const refreshTokenAndRetry = useCallback(async () => {
    if (!refreshToken || isRefreshing) {
      return null;
    }
    
    setIsRefreshing(true);
    try {
      const newAccessToken = await dispatch(authSlice.refreshTokenThunk(refreshToken)).unwrap();
      setAuthorizationHeader(newAccessToken);
      document.cookie = `accessToken=${newAccessToken}; path=/; Secure`;
      return newAccessToken;
    } catch (refreshErr) {
      console.error("Token refresh failed:", refreshErr);
      return null;
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshToken, dispatch, isRefreshing]);

  // Memoized fetch users callback
  const fetchUsersWithRefresh = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    const currentAccessToken = latestAccessTokenRef.current;
    if (!currentAccessToken) {
      console.log("No access token available, redirecting to login");
      router.push("/auth/login");
      isFetchingRef.current = false;
      return;
    }

    setError(null);
    setAuthorizationHeader(currentAccessToken);

    try {
      const result = await dispatch(userSlice.fetchUsersThunk(undefined)).unwrap();
      console.log("Fetch Users Success:", result);
      hasFetchedRef.current = true;
    } catch (err: unknown) {
      console.warn("Fetch Users Error:", err);
      
      if (
        typeof err === "object" &&
        err !== null &&
        "status" in err &&
        (err as { status?: number }).status === 401
      ) {
        const newAccessToken = await refreshTokenAndRetry();
        if (newAccessToken) {
          setAuthorizationHeader(newAccessToken);
          try {
            const retryResult = await dispatch(userSlice.fetchUsersThunk(undefined)).unwrap();
            console.log("Retry Fetch Success:", retryResult);
            hasFetchedRef.current = true;
          } catch (retryErr) {
            console.log("Retry fetch failed:", retryErr);
            setError("Failed to fetch users after token refresh. Please try again.");
          }
        } else {
          setError("Session expired. Please log in again.");
          router.push("/auth/login");
        }
      } else {
        setError(`Failed to fetch users: ${(err as Error).message || 'Unknown error'}`);
      }
    } finally {
      isFetchingRef.current = false;
    }
  }, [dispatch, router, refreshTokenAndRetry]);

  //  Update latest access token ref
  useEffect(() => {
    latestAccessTokenRef.current = accessToken;
  }, [accessToken]);

  // Handle authentication and initial data fetch
  useEffect(() => {
    console.log("UsersList Initial State:", { 
      accessToken: latestAccessTokenRef.current, 
      authLoading, 
      refreshToken 
    });
    
  
    if (!latestAccessTokenRef.current && !authLoading) {
      console.log("No token and not loading, redirecting to login");
      router.push("/auth/login");
      return;
    }

    if (
      latestAccessTokenRef.current && 
      !hasFetchedRef.current && 
      !usersLoading && 
      !isRefreshing
    ) {
      fetchUsersWithRefresh();
    }
  }, [
    authLoading, 
    fetchUsersWithRefresh, 
    router, 
    usersLoading, 
    isRefreshing, 
    refreshToken
  ]);

  // Pagination handler
  const handlePageChange = useCallback((url: string | null) => {
    if (url && !usersLoading) {
      dispatch(userSlice.fetchUsersThunk(url));
    }
  }, [dispatch, usersLoading]);

  // Render nothing if no access token
  if (!latestAccessTokenRef.current) {
    return null;
  }
  const handleUserUpdate = useCallback((updatedUser: UserWithDelete) => {
    if (updatedUser.deleted) {
      // Handle deletion
      dispatch(removeUser(updatedUser.id));
    } else {
      // Handle update
      dispatch(updateUser(updatedUser));
    }
  }, [dispatch]);

  return (
    <div>
      {authLoading && <p>Authenticating...</p>}
      {authError && <p>Auth Error: {authError}</p>}
      {error && <p>Error: {error}</p>}
      
      <UsersTable
        users={users}
        loading={usersLoading || isRefreshing}
        error={error}
        nextPageUrl={nextPageUrl}
        prevPageUrl={prevPageUrl}
        onPageChange={handlePageChange}
        onUserUpdated={handleUserUpdate}
      />
    </div>
  );
}