import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AuthMeDto, LoginRequestDto, SwitchRoleRequestDto, WorkbenchRole } from "@shared/auth/me";
import { apiGet, apiPost } from "@/shared/api/client";

const authMeKey = ["/api/auth/me"] as const;

export const useAuthMe = () =>
  useQuery({
    queryKey: authMeKey,
    queryFn: () => apiGet<AuthMeDto>("/api/auth/me"),
    retry: false,
    staleTime: 20_000,
  });

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginRequestDto) => apiPost<AuthMeDto>("/api/auth/login", input),
    onSuccess: (session) => queryClient.setQueryData(authMeKey, session),
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiPost<void>("/api/auth/logout"),
    onSuccess: () => queryClient.removeQueries({ queryKey: authMeKey }),
  });
};

export const useSwitchRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (activeRole: WorkbenchRole) =>
      apiPost<AuthMeDto>("/api/auth/active-role", { activeRole } satisfies SwitchRoleRequestDto),
    onSuccess: (session) => queryClient.setQueryData(authMeKey, session),
  });
};
