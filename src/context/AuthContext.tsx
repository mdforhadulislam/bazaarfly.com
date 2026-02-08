"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  avatar?: string;
  role?: string;
  isEmailVerified?: boolean;
};

type SignUpPayload = {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
};

type SignInPayload = {
  identifier: string; // email or phone
  password: string;
};

type ApiResult<T = unknown> = {
  ok: boolean;
  message: string;
  data?: T;
};


type ErrorPayload = {
  message?: string;
  msg?: string;
  error?: string;
  errors?: { message?: string }[];
};

type AuthContextType = {
  user: AuthUser | null;

  // initial app load check (/me)
  loading: boolean;

  // submit loading (signin/signup/logout)
  actionLoading: boolean;

  isAuthenticated: boolean;
  error: string | null;

  signup: (payload: SignUpPayload) => Promise<ApiResult>;
  signin: (payload: SignInPayload) => Promise<ApiResult<AuthUser>>;
  signout: () => Promise<void>;

  refresh: () => Promise<void>; // check session again
};

const AuthContext = createContext<AuthContextType | null>(null);

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}


function pickMessage(payload: ErrorPayload | null | undefined, fallback: string) {
  return (
    payload?.message ??
    payload?.msg ??
    payload?.error ??
    payload?.errors?.[0]?.message ??
    fallback
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // prevent multiple refresh-token calls at once
  const refreshInFlight = useRef<Promise<boolean> | null>(null);

  // -----------------------------
  // Refresh token (cookie-based)
  // -----------------------------
  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (refreshInFlight.current) return refreshInFlight.current;

    refreshInFlight.current = (async () => {
      try {
        const res = await fetch("/api/auth/refresh-token", {
          method: "POST",
          cache: "no-store",
          credentials: "same-origin",
        });
        return res.ok;
      } catch {
        return false;
      } finally {
        refreshInFlight.current = null;
      }
    })();

    return refreshInFlight.current;
  }, []);

  // -----------------------------
  // Fetch current user from /me
  // If 401 -> try refresh-token once -> retry /me
  // -----------------------------
  const fetchMe = useCallback(async (): Promise<AuthUser | null> => {
    const res = await fetch("/api/auth/me", {
      method: "GET",
      cache: "no-store",
      credentials: "same-origin",
    });

    const data = await safeJson(res);

    if (res.ok) {
      return (data?.data ?? data?.user ?? null) as AuthUser | null;
    }

    if (res.status === 401) {
      const ok = await refreshToken();
      if (!ok) return null;

      const retry = await fetch("/api/auth/me", {
        method: "GET",
        cache: "no-store",
        credentials: "same-origin",
      });

      const retryData = await safeJson(retry);
      if (retry.ok) {
        return (retryData?.data ?? retryData?.user ?? null) as AuthUser | null;
      }
    }

    return null;
  }, [refreshToken]);

  // -----------------------------
  // Public refresh (used on load + after signin)
  // -----------------------------
  const refresh = useCallback(async () => {
    try {
      setError(null);
      const me = await fetchMe();
      setUser(me);
    } catch {
      setUser(null);
    }
  }, [fetchMe]);

  // -----------------------------
  // Initial load
  // -----------------------------
  useEffect(() => {
    (async () => {
      setLoading(true);
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  // -----------------------------
  // Signup
  // -----------------------------
  const signup = useCallback(async (payload: SignUpPayload): Promise<ApiResult> => {
    setActionLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "same-origin",
      });

      const data = await safeJson(res);

      return {
        ok: res.ok,
        message: pickMessage(data, res.ok ? "Signup successful" : "Signup failed"),
        data,
      };
    } catch {
      const msg = "Network error. Please try again.";
      setError(msg);
      return { ok: false, message: msg };
    } finally {
      setActionLoading(false);
    }
  }, []);

  // -----------------------------
  // Signin
  // -----------------------------
  const signin = useCallback(
    async (payload: SignInPayload): Promise<ApiResult<AuthUser>> => {
      setActionLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/auth/signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "same-origin",
        });

        const data = await safeJson(res);

        if (!res.ok) {
          const msg = pickMessage(data, "Login failed");
          setError(msg);
          return { ok: false, message: msg };
        }

        // ✅ cookies set হয়েছে—এখন /me দিয়ে reliable user load
        const me = await fetchMe();
        setUser(me);

        return {
          ok: true,
          message: pickMessage(data, "Login successful"),
          data: me ?? undefined,
        };
      } catch {
        const msg = "Network error. Please try again.";
        setError(msg);
        return { ok: false, message: msg };
      } finally {
        setActionLoading(false);
      }
    },
    [fetchMe]
  );

  // -----------------------------
  // Signout
  // -----------------------------
  const signout = useCallback(async () => {
    setActionLoading(true);
    setError(null);

    try {
      await fetch("/api/auth/signout", {
        method: "POST",
        credentials: "same-origin",
      });
    } finally {
      setUser(null);
      setActionLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      actionLoading,
      isAuthenticated: !!user,
      error,
      signup,
      signin,
      signout,
      refresh,
    }),
    [user, loading, actionLoading, error, signup, signin, signout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider />");
  return ctx;
}
