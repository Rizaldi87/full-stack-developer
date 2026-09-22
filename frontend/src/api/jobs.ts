import type { ApiRsp, CompanyJob, CreateJobPayload, JobBase, JobDetail, JobListItem, JobQuery, PaginatedRsp, UpdateJobPayload } from "../types";
import { api } from "./client";

export async function listJobs(query: JobQuery) {
  const { data } = await api.get<PaginatedRsp<JobListItem>>("/jobs", {
    params: query,
  });
  return data;
}

export async function getJob(id: string) {
  const { data } = await api.get<ApiRsp<JobDetail>>(`/jobs/${id}`);
  return data;
}

export async function createJob(payload: CreateJobPayload) {
  const { data } = await api.post<ApiRsp<JobBase>>("/jobs", payload);
  return data;
}

export async function updateJob(id: string, payload: UpdateJobPayload) {
  const { data } = await api.patch<ApiRsp<JobBase>>(`/jobs/${id}`, payload);
  return data;
}

export async function companyJobs() {
  const { data } = await api.get<ApiRsp<CompanyJob[]>>("/company/jobs");
  return data;
}
