import type { ApiRsp, ApplicationHistory, ApplicationQuery, ApplicationStatus, ApplyJobPayload, JobApplicant, MyApplication, PaginatedRsp, UpdateApplicationStatusPayload } from "../types";
import { api } from "./client";

export async function apply(jobId: string, payload: ApplyJobPayload) {
  const { data } = await api.post<ApiRsp<MyApplication>>(`/jobs/${jobId}/applications`, payload);
  return data;
}

export async function myApplications(query: ApplicationQuery) {
  const { data } = await api.get<PaginatedRsp<MyApplication>>("/applications/me", { params: query });
  return data;
}

export async function jobApplicants(jobId: string, query: ApplicationQuery) {
  const { data } = await api.get<PaginatedRsp<JobApplicant>>(`/jobs/${jobId}/applications`, { params: query });
  return data;
}

export async function updateStatus(applicationId: string, payload: UpdateApplicationStatusPayload) {
  const { data } = await api.patch<ApiRsp<{ id: string; status: ApplicationStatus; updatedAt: string }>>(`/applications/${applicationId}/status`, payload);
  return data;
}

export async function getHistory(applicationId: string) {
  const { data } = await api.get<ApiRsp<ApplicationHistory>>(`/applications/${applicationId}/history`);
  return data;
}
