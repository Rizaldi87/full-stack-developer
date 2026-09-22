import type { Company, CompanyPayload, DataRsp } from "../types";
import { api } from "./client";

export async function getMyCompany() {
  const { data } = await api.get<DataRsp<Company>>("/company/me");
  return data.data;
}

export async function createCompany(payload: CompanyPayload) {
  const { data } = await api.post<DataRsp<Company>>("/company", payload);
  return data.data;
}

export async function updateCompany(payload: CompanyPayload) {
  const { data } = await api.patch<DataRsp<Company>>("/company/me", payload);
  return data.data;
}
