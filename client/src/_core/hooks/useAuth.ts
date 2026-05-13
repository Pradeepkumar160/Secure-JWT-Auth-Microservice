import { useMemo, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export interface UseAuthOptions {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
}

export function useAuth(options: UseAuthOptions = {}) {
  const { redirectOnUnauthenticated = false, redirectPath = "/login" } = options;
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  // Use the new getCurrentUser query from authRouter
  const meQuery = trpc.auth.getCurrentUser.useQuery(undefined, {
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      utils.auth.getCurrentUser.setData(undefined, null as any);
      navigate("/login");
      toast.success("Logged out successfully");
    },
  });

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      try {
        await logoutMutation.mutateAsync({ refreshToken });
      } catch (error) {
        console.error("Logout failed", error);
      }
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    utils.auth.getCurrentUser.setData(undefined, null as any);
    navigate("/login");
  }, [logoutMutation, navigate, utils.auth.getCurrentUser]);

  const user = meQuery.data?.user || null;
  const loading = meQuery.isLoading;
  const error = meQuery.error;
  const isAuthenticated = !!user;

  useEffect(() => {
    if (redirectOnUnauthenticated && !loading && !isAuthenticated) {
      navigate(redirectPath);
    }
  }, [redirectOnUnauthenticated, loading, isAuthenticated, navigate, redirectPath]);

  return {
    user,
    loading,
    error,
    isAuthenticated,
    logout,
  };
}
