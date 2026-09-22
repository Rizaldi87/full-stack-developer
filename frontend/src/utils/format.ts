import type { ApplicationStatus, JobStatus, JobType } from "../types";

const rupiah = new Intl.NumberFormat("id-ID");

export function formatSalary(min: number | null | undefined, max: number | null | undefined): string {
  if (min == null && max == null) return "Dirahasiakan/Negotiable";
  if (min != null && max != null && min !== max) {
    return `Rp ${rupiah.format(min)} – Rp ${rupiah.format(max)}`;
  }
  return `Rp ${rupiah.format(min ?? max ?? 0)}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const applicationColors: Record<ApplicationStatus, string> = {
  APPLIED: "bg-gray-100 text-gray-700",
  REVIEWING: "bg-blue-100 text-blue-700",
  SHORTLISTED: "bg-amber-100 text-amber-700",
  REJECTED: "bg-red-100 text-red-700",
  ACCEPTED: "bg-emerald-100 text-emerald-700",
};

const jobStatusColors: Record<JobStatus, string> = {
  OPEN: "bg-emerald-100 text-emerald-700",
  CLOSED: "bg-gray-200 text-gray-600",
};

const jobTypeLabels: Record<JobType, string> = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  CONTRACT: "Kontrak",
  INTERNSHIP: "Magang",
  FREELANCE: "Freelance",
};

export function applicationStatusColor(status: ApplicationStatus): string {
  return applicationColors[status];
}

export function jobStatusColor(status: JobStatus): string {
  return jobStatusColors[status];
}

export function jobTypeLabel(type: JobType): string {
  return jobTypeLabels[type];
}

//company
const NEXT_STATUSES: Record<ApplicationStatus, ApplicationStatus[]> = {
  APPLIED: ["REVIEWING", "REJECTED"],
  REVIEWING: ["SHORTLISTED", "REJECTED"],
  SHORTLISTED: ["ACCEPTED", "REJECTED"],
  REJECTED: [],
  ACCEPTED: [],
};

const statusLabels: Record<ApplicationStatus, string> = {
  APPLIED: "Terlamar",
  REVIEWING: "Direview",
  SHORTLISTED: "Shortlist",
  REJECTED: "Ditolak",
  ACCEPTED: "Diterima",
};

export function getNextStatuses(status: ApplicationStatus): ApplicationStatus[] {
  return NEXT_STATUSES[status];
}

export function statusLabel(status: ApplicationStatus): string {
  return statusLabels[status];
}
