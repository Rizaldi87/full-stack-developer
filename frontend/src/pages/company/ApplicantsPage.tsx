import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { jobApplicants, updateStatus } from "../../api/applications";
import { getErrorMessage } from "../../api/client";
import { Pagination } from "../../components/ui/Pagination";
import { EmptyState } from "../../components/ui/EmptyState";
import { Spinner } from "../../components/ui/Spinner";
import type { ApplicationStatus, JobApplicant } from "../../types";
import { applicationStatusColor, getNextStatuses, statusLabel } from "../../utils/format";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";

export default function ApplicantsPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [errorMsg, setErrorMsg] = useState<String | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["applicants", id, page],
    queryFn: () => jobApplicants(id as string, { page, limit: 10 }),
    enabled: !!id,
  });

  const statusMutation = useMutation({
    mutationFn: ({ applicationId, status }: { applicationId: string; status: ApplicationStatus }) => updateStatus(applicationId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applicants", id, page] });
      queryClient.invalidateQueries({ queryKey: ["company-jobs"] });
    },
    onError: (err) => setErrorMsg(getErrorMessage(err, "Gagal ubah status")),
  });

  return (
    <div>
      <p className="text-sm text-gray-500">
        <Link to="/company/jobs" className="text-emerald-600 hover:underline">
          ← Kembali ke lowongan
        </Link>
      </p>
      <h1 className="mt-2 text-xl font-semibold text-gray-900">Pelamar</h1>

      {errorMsg && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errorMsg}</p>}
      {isError && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{getErrorMessage(error)}</p>}

      {isLoading ? (
        <Spinner />
      ) : !data || data.data.length === 0 ? (
        <EmptyState message="Belum ada pelamar untuk lowongan ini." />
      ) : (
        <div className="mt-6 space-y-3">
          {data.data.map((app) => (
            <ApplicantCard key={app.id} applicant={app} onStatus={(status) => statusMutation.mutate({ applicationId: app.id, status })} busy={statusMutation.isPending} />
          ))}
        </div>
      )}

      <Pagination page={data?.meta.page ?? 1} totalPages={data?.meta.totalPages ?? 1} onChange={setPage} />
    </div>
  );
}

function ApplicantCard({ applicant, onStatus, busy }: { applicant: JobApplicant; onStatus: (status: ApplicationStatus) => void; busy: boolean }) {
  const next = getNextStatuses(applicant.status);
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900">{applicant.applicant.name}</h2>
          <p className="text-sm text-gray-500">{applicant.applicant.email}</p>
          <Badge color={applicationStatusColor(applicant.status)}>{statusLabel(applicant.status)}</Badge>
        </div>
      </div>
      {applicant.coverLetter && <p className="mt-3 whitespace-pre-line rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700">{applicant.coverLetter}</p>}
      {next.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {next.map((s) => (
            <Button key={s} variant={s === "REJECTED" ? "danger" : "primary"} disabled={busy} onClick={() => onStatus(s)}>
              {statusLabel(s)}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
