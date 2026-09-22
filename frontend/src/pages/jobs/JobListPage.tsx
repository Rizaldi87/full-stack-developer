import { useState } from "react";
import type { JobQuery, JobType } from "../../types";
import { useQuery } from "@tanstack/react-query";
import { listJobs } from "../../api/jobs";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { Link } from "react-router-dom";
import { Badge } from "../../components/ui/Badge";
import { Pagination } from "../../components/ui/Pagination";
import { formatDate, formatSalary, jobTypeLabel } from "../../utils/format";
import { getErrorMessage } from "../../api/client";

const jobTypeOptions: Array<{ value: "" | JobType; label: string }> = [
  { value: "", label: "Semua tipe" },
  { value: "FULL_TIME", label: "Full Time" },
  { value: "PART_TIME", label: "Part Time" },
  { value: "CONTRACT", label: "Kontrak" },
  { value: "INTERNSHIP", label: "Magang" },
  { value: "FREELANCE", label: "Freelance" },
];

export default function JobListPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [filters, setFilters] = useState<JobQuery>({ page: 1, limit: 10 });
  const [jobType, setJobType] = useState<"" | JobType>("");

  const query: JobQuery = { page, limit: 10 };
  if (filters.search) query.search = filters.search;
  if (filters.location) query.location = filters.location;
  if (jobType) query.jobType = jobType;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["jobs", query],
    queryFn: () => listJobs(query),
  });

  function applySearch() {
    setPage(1);
    setFilters({ page: 1, limit: 10, search: searchInput.trim() || undefined, location: locationInput.trim() || undefined });
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">Cari Kerja</h1>

      <div className="mt-4 flex flex-col gap-2 md:flex-row">
        <Input placeholder="Kata kunci (judul, deskripsi)" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
        <Input placeholder="Lokasi" value={locationInput} onChange={(e) => setLocationInput(e.target.value)} />
        <Select value={jobType} onChange={(e) => setJobType(e.target.value as "" | JobType)}>
          {jobTypeOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
        <Button type="button" onClick={applySearch} className="shrink-0">
          Cari
        </Button>
      </div>

      {isError && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{getErrorMessage(error)}</p>}

      {isLoading ? (
        <Spinner />
      ) : !data || data.data.length === 0 ? (
        <EmptyState message="Tidak ada lowongan yang cocok" />
      ) : (
        <div className="mt-6 grid gap-4">
          {data.data.map((job) => (
            <Link key={job.id} to={`/jobs/${job.id}`} className="rounded-lg border bg-white p-4 shadow-sm transition hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">{job.title}</h2>
                  <p className="mt-0.5 text-sm text-gray-600">
                    {job.company.name} · {job.location}
                  </p>
                </div>
                <Badge color="bg-emerald-100 text-emerald-700">{jobTypeLabel(job.jobType)}</Badge>
              </div>
              <p className="mt-2 text-sm text-gray-500">{formatSalary(job.salaryMin, job.salaryMax)}</p>
              <p className="mt-1 text-xs text-gray-400">Diposting {formatDate(job.createdAt)}</p>
            </Link>
          ))}
        </div>
      )}

      <Pagination page={data?.meta.page ?? 1} totalPages={data?.meta.totalPages ?? 1} onChange={setPage} />
    </div>
  );
}
