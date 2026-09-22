export type Role = "JOB_SEEKER" | "COMPANY";

export type JobType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP" | "FREELANCE";

export type JobStatus = "OPEN" | "CLOSED";

export type ApplicationStatus = "APPLIED" | "REVIEWING" | "SHORTLISTED" | "REJECTED" | "ACCEPTED";

export interface AuthUser {
  sub: string;
  email: string;
  role: Role;
}

export interface Company {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JobBase {
  id: string;
  title: string;
  description: string;
  location: string;
  salaryMin: number | null;
  salaryMax: number | null;
  jobType: JobType;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyRef {
  id: string;
  name: string;
  location: string | null;
}

export interface JobListItem extends JobBase {
  company: CompanyRef;
}

export interface JobDetail extends JobBase {
  company: CompanyRef;
  hasApplied?: boolean;
}

export interface CompanyJob extends JobBase {
  _count: {
    applications: number;
  };
}

export interface ApplicationJobRef {
  id: string;
  title: string;
  location: string;
  salaryMin: number | null;
  salaryMax: number | null;
  jobType: JobType;
  status: JobStatus;
  company: {
    id: string;
    name: string;
  };
}

export interface ApplicantRef {
  id: string;
  name: string;
  email: string;
}

export interface MyApplication {
  id: string;
  coverLetter: string | null;
  status: ApplicationStatus;
  createdAt: string;
  job: ApplicationJobRef;
}

export interface JobApplicant {
  id: string;
  coverLetter: string | null;
  status: ApplicationStatus;
  createdAt: string;
  applicant: ApplicantRef;
}

export interface HistoryItem {
  id: string;
  fromStatus: ApplicationStatus | null;
  toStatus: ApplicationStatus;
  note: string | null;
  createdAt: string;
  changedBy: {
    name: string;
  };
}

export interface ApplicationHistory {
  id: string;
  status: ApplicationStatus;
  job: {
    id: string;
    title: string;
  };
  applicant: {
    id: string;
    name: string;
  };
  history: HistoryItem[];
}

export interface ApiRsp<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedRsp<T> extends ApiRsp<T[]> {
  meta: PaginationMeta;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResult {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface JobQuery {
  page?: number;
  limit?: number;
  search?: string;
  location?: string;
  jobType?: JobType;
}

export interface ApplicationQuery {
  page?: number;
  limit?: number;
  status?: ApplicationStatus;
}

export interface CompanyPayload {
  name: string;
  description?: string;
  location?: string;
}

export interface CreateJobPayload {
  title: string;
  description: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  jobType: JobType;
  status?: JobStatus;
}

export type UpdateJobPayload = Partial<CreateJobPayload>;

export interface ApplyJobPayload {
  coverLetter?: string;
}

export interface UpdateApplicationStatusPayload {
  status: ApplicationStatus;
  note?: string;
}
export interface DataRsp<T> {
  data: T;
}
