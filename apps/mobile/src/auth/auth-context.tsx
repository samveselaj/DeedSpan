import * as React from "react";

import {
  Credentials,
  loginRequest,
  logoutRequest,
  meRequest,
  registerRequest,
} from "../api/auth";
import { ApiError, setUnauthorizedHandler } from "../api/client";
import type { User } from "../api/types";

import { clearSessionToken, readSessionToken, writeSessionToken } from "./session-store";

type Status = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: Status;
  user: User | null;
  signIn: (creds: Credentials) => Promise<void>;
  signUp: (creds: Credentials) => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = React.useState<Status>("loading");
  const [user, setUser] = React.useState<User | null>(null);

  const clearLocal = React.useCallback(async () => {
    await clearSessionToken();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  // Wire the API client's 401 hook → drop local session.
  // Re-arm on every render since the closure captures clearLocal.
  React.useEffect(() => {
    setUnauthorizedHandler(() => {
      void clearLocal();
    });
    return () => setUnauthorizedHandler(null);
  }, [clearLocal]);

  // Bootstrap: read stored token, validate via /me.
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = await readSessionToken();
      if (!token) {
        if (!cancelled) setStatus("unauthenticated");
        return;
      }
      try {
        const me = await meRequest();
        if (cancelled) return;
        setUser(me);
        setStatus("authenticated");
      } catch (e) {
        // 401 already triggers clearLocal via the hook; fall through.
        if (!cancelled && !(e instanceof ApiError && e.status === 401)) {
          await clearLocal();
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [clearLocal]);

  const signIn = React.useCallback(async (creds: Credentials) => {
    const out = await loginRequest(creds);
    await writeSessionToken(out.session_id);
    setUser(out.user);
    setStatus("authenticated");
  }, []);

  const signUp = React.useCallback(async (creds: Credentials) => {
    const out = await registerRequest(creds);
    await writeSessionToken(out.session_id);
    setUser(out.user);
    setStatus("authenticated");
  }, []);

  const signOut = React.useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      /* server might already have invalidated; clear locally anyway */
    }
    await clearLocal();
  }, [clearLocal]);

  const value = React.useMemo<AuthContextValue>(
    () => ({ status, user, signIn, signUp, signOut }),
    [status, user, signIn, signUp, signOut],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
