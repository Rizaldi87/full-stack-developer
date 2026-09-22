import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apply } from "../../api/applications";
import { getJob } from "../../api/jobs";
import { getErrorMessage } from "../../api/client";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { Badge } from "../../components/ui/Badge";
import { formatSalary, jobTypeLabel } from "../../utils/format";

export default function JobDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [coverLetter, setCoverLetter] = useState("");
  const [applyError, setApplyError] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["job", id],
    queryFn: () => getJob(id as string),
    enabled: !!id,
  });

  const applyMutation = useMutation({
    mutationFn: () => apply(id as string, { coverLetter: coverLetter.trim() || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job", id] });
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
    },
    onError: (err) => setApplyError(getErrorMessage(err, "Gagal melamar. Coba lagi")),
  });

  if (isLoading) return <Spinner />;

  if (isError || !data) {
    return <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{isError ? getErrorMessage(error, "Gagal memuat lowongan") : "Lowongan tidak ditemukan"}</p>;
  }

  const job = data.data;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">
          <Link to="/jobs" className="text-emerald-600 hover:underline">
            ← Kembali ke daftar
          </Link>
        </p>

        <div className="mt-3 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{job.title}</h1>
            <p className="mt-1 text-sm text-gray-600">
              {job.company.name} · {job.location}
            </p>
          </div>
          <Badge color="bg-emerald-100 text-emerald-700">{jobTypeLabel(job.jobType)}</Badge>
        </div>

        <p className="mt-3 text-sm font-medium text-gray-800">{formatSalary(job.salaryMin, job.salaryMax)}</p>

        <div className="mt-4 whitespace-pre-line text-sm text-gray-700">{job.description}</div>
      </div>

      {job.hasApplied ? (
        <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Anda sudah melamar lowongan ini.</p>
      ) : job.status === "OPEN" ? (
        <div className="mt-4 rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">Kirim Lamaran</h2>
          <textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            rows={4}
            placeholder="Cover letter (opsional)"
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
          {applyError && <p className="mt-2 text-xs text-red-600">{applyError}</p>}
          <Button type="button" loading={applyMutation.isPending} onClick={() => applyMutation.mutate()} className="mt-3">
            Lamar Sekarang
          </Button>
        </div>
      ) : (
        <p className="mt-4 rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-500">Lowongan ini sudah ditutup.</p>
      )}
    </div>
  );
}
