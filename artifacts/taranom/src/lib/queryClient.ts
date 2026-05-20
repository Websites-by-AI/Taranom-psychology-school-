import { QueryClient } from "@tanstack/react-query";
import { getNationalCode, getAdminToken } from "./auth";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60,
    },
  },
});

export function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const nc = getNationalCode();
  if (nc) headers["x-national-code"] = nc;
  const adminToken = getAdminToken();
  if (adminToken) headers["x-admin-token"] = adminToken;
  return headers;
}
