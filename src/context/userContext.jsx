import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { getCurrentUser } from "../api-services/users";
import { refreshToken } from "../lib/helpers/index";

// Create the context
const UserContext = createContext();

// Create the provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  /**
   * @param {boolean} onlyFetchUser if there is already a user, just refetch the user's details without actually refreshing the token. It also does not set the loading state to true while fetching the user's details
   */
  const fetchCurrentUser = useCallback(
    async (onlyFetchUser = false) => {
      const isRefreshing = onlyFetchUser && !!user;

      // only reload if we are not trying to refresh
      if (!isRefreshing) setLoading(true);
      try {
        if (isRefreshing) {
          const fetchedUser = await getCurrentUser();
          setUser(fetchedUser);

          // setLoading(false);

          return;
        }

        const authorization = await refreshToken();
        if (authorization && !user) {
          const fetchedUser = await getCurrentUser();
          setUser(fetchedUser);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    },

    // changed from `user` to `user.id` so that when i manually change `user` (the object's reference) the `fetchCurrentUser` function does not rerun. Though i don't know why the whole `user` object was used before but i hope mine does not break anything
    [user?.id]
  );

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // i do not know why the previous dev did not use react query here, maybe he had a valid reason, so in order for me to add a refetch feature without messing with his code i decided to just add it manually.

  /**
   *
   * @description Refetches the currentUsers data without refreshing the token. I recommend calling this function whenever major details of the user has been updated
   */

  const refetch = () => fetchCurrentUser(true);

  /**
   *
   * @description Changes/Updates the currentUsers (`user`) details. Be careful to pass correct and expected `user` details when calling function because setting `user` fields to incorrect values could crash the whole site.
   */
  const forceFullySetUser = (newUserDetails) => setUser(newUserDetails);

  // i did not put refetch as a dependency in this memo because the `fetchCurrentUser` function gets recreated only when `user` changes, and `user` is a dependency here too
  const contextValue = React.useMemo(
    () => ({ user, setUser, loading, refetch, forceFullySetUser }),
    [user, loading]
  );

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

export default UserContext;

export const useAuth = () => {
  const userContext = useContext(UserContext);
  if (!userContext) {
    throw new Error("useAuth must be used within a UserProvider");
  }

  return userContext;
};
