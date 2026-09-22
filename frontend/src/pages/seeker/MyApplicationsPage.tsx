import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { myApplications } from "../../api/applications";
import { getErrorMessage } from "../../api/client";
import { Badge } from "../../components/ui/Badge";

import { applicationStatusColor, formatDate } from "../../utils/format";
import type { ApplicationStatus } from "../../types";
import { Select } from "../../components/ui/Select";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { Pagination } from "../../components/ui/Pagination";

const statusOptions: Array<{ value: "" | ApplicationStatus; label: string }> = [
  { value: "", label: "Semua status" },
  { value: "APPLIED", label: "Terlamar" },
  { value: "REVIEWING", label: "Direview" },
  { value: "SHORTLISTED", label: "Shortlisted" },
  { value: "REJECTED", label: "Ditolak" },
  { value: "ACCEPTED", label: "Diterima" },
];

export default function MyApplicationsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<"" | ApplicationStatus>("");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["my-applications", page, status],
    queryFn: () => myApplications({ page, limit: 10, status: status || undefined }),
  });

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">Lamaran Saya</h1>

      <div className="mt-4 max-w-xs">
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as "" | ApplicationStatus);
            setPage(1);
          }}
        >
          {statusOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </div>

      {isError && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{getErrorMessage(error)}</p>}

      {isLoading ? (
        <Spinner />
      ) : !data || data.data.length === 0 ? (
        <EmptyState message="Belum ada lamaran. Lihat lowongan di menu Cari Kerja." />
      ) : (
        <div className="mt-6 space-y-3">
          {data.data.map((app) => (
            <Link key={app.id} to={`/jobs/${app.job.id}`} className="block rounded-lg border bg-white p-4 shadow-sm transition hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">{app.job.title}</h2>
                  <p className="mt-0.5 text-sm text-gray-600">
                    {app.job.company.name} · {app.job.location}
                  </p>
                </div>
                <Badge color={applicationStatusColor(app.status)}>{app.status}</Badge>
              </div>
              <p className="mt-2 text-xs text-gray-400">Dilamar {formatDate(app.createdAt)}</p>
            </Link>
          ))}
        </div>
      )}

      <Pagination page={data?.meta.page ?? 1} totalPages={data?.meta.totalPages ?? 1} onChange={setPage} />
    </div>
  );
}
