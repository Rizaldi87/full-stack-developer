import type { ApiRsp, AuthUser, LoginPayload, RegisterPayload, RegisterResult, TokenPair } from "../types";
import { api } from "./client";

export async function register(payload: RegisterPayload) {
  const { data } = await api.post<ApiRsp<RegisterResult>>("/auth/register", payload);
  return data;
}

export async function login(payload: LoginPayload): Promise<TokenPair> {
  const { data } = await api.post<ApiRsp<TokenPair>>("/auth/login", payload);
  return data.data;
}

export async function fetchMe(): Promise<AuthUser> {
  const { data } = await api.get<AuthUser>("/auth/me");
  return data;
}
