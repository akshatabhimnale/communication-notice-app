'use client';
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { RootState } from "@/store";
import * as userSlice from "@/store/slices/usersSlice";
import { useRouter } from "next/navigation";
import UsersTable from '@/components/Usersdetails/UsersTable';
import UsersTableSkeleton from '@/components/Usersdetails/UsersTableSkeleton';
import { UserWithDelete } from "@/components/Usersdetails/UsersTable"; // Import the interface
import { updateUser, removeUser } from "@/store/slices/usersSlice";

export default function UsersList() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const {
    users,
    loading: usersLoading,
    nextPageUrl,
    prevPageUrl,
    error: usersError,
  } = useAppSelector((state: RootState) => state.users);

  const {
    accessToken,
    loading: authLoading,
    error: authError,
  } = useAppSelector((state: RootState) => state.auth);

  // Fetch users on mount only if not already loaded
  useEffect(() => {
    if (!accessToken && !authLoading) {
      router.push("/auth/login");
      return;
    }
    // Only fetch if accessToken is present AND users array is empty
    // used redux as cache to avoid refetching and hitting api every time
    if (accessToken && users.length === 0) {
      dispatch(userSlice.fetchUsersThunk(undefined));
    }
  }, [accessToken, authLoading, dispatch, router, users.length]); 

  // Pagination handler
  const handlePageChange = (url: string | null) => {
    if (url && !usersLoading) {
      dispatch(userSlice.fetchUsersThunk(url));
    }
  };

  const handleUserUpdate = (updatedUser: UserWithDelete) => {
    if (!accessToken) return;
    if (updatedUser.deleted) {
      // Optimistically remove the user from the store
      dispatch(removeUser(updatedUser.id));
    } else {
      // Optimistically update the user in the store
      dispatch(updateUser(updatedUser));
      // setTimeout(() => {
      dispatch(userSlice.fetchUsersThunk(undefined));
      // }, 200);
    }
  };

  return (
    <div>
      {authLoading && <p>Authenticating...</p>}
      {authError && <p>Auth Error: {authError}</p>}
      {/* Display error only if not loading */}
      {usersError && !usersLoading && <p>Error: {usersError}</p>}
      {/* Show skeleton while loading OR if users haven't been fetched yet and there's no error */}
      {(usersLoading || (users.length === 0 && !usersError))
        ? <UsersTableSkeleton />
        : <UsersTable
            users={users}
            loading={false} // Pass false as loading is handled above
            error={null} // Pass null as error is handled above
            nextPageUrl={nextPageUrl}
            prevPageUrl={prevPageUrl}
            onPageChange={handlePageChange}
            onUserUpdated={handleUserUpdate}
          />
      }
    </div>
  );
}