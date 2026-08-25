import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setUser, MOCK_AUTH, getMockCurrentUser } from "@/features/auth/authSlice";
import { getStoredTokens, clearStoredTokens } from "@/lib/tokenStorage";
import { api } from "@/lib/axios";
import type { AuthUser } from "@/types/auth";

// On initial load, if an access token exists but Redux has no user yet
// (e.g. after a page refresh), re-fetch the current user from /auth/me.
// In MOCK_AUTH mode there's no real backend to ask, so the last mock user
// is read straight out of localStorage instead.
export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { accessToken } = getStoredTokens();

    if (!accessToken || user) {
      setReady(true);
      return;
    }

    if (MOCK_AUTH) {
      const mockUser = getMockCurrentUser();
      if (mockUser) {
        dispatch(setUser(mockUser));
      } else {
        clearStoredTokens();
      }
      setReady(true);
      return;
    }

    api
      .get<{ user: AuthUser }>("/auth/me")
      .then((res) => dispatch(setUser(res.data.user)))
      .catch(() => clearStoredTokens())
      .finally(() => setReady(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) return null;

  return <>{children}</>;
}
