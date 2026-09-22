import axios from "axios";
import { companyJobs, updateJob } from "../../api/jobs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { JobStatus } from "../../types";
import { Spinner } from "../../components/ui/Spinner";
import { getErrorMessage } from "../../api/client";
import { Link } from "react-router-dom";
import { EmptyState } from "../../components/ui/EmptyState";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { formatSalary, jobStatusColor, jobTypeLabel } from "../../utils/format";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCompany } from "../../api/company";
import { createCompanySchema, type CreateCompanyFormValues } from "../../utils/schemas";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Input } from "../../components/ui/Input";

export default function CompanyJobsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["company-jobs"],
    queryFn: companyJobs,
  });

  const isNoCompany = isError && axios.isAxiosError(error) && error.response?.status === 403;
  const toggleMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: JobStatus }) => updateJob(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["company-jobs"] }),
  });

  if (isLoading) return <Spinner />;

  if (isNoCompany) return <CompanyOnboarding />;

  if (isError || !data) {
    return <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{getErrorMessage(error)}</p>;
  }
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Lowongan Saya</h1>
        <Link to="/company/jobs/new" className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
          + Buat Lowongan
        </Link>
      </div>

      {data.data.length === 0 ? (
        <EmptyState message="Belum ada lowongan. Klik 'Buat Lowongan' untuk mulai." />
      ) : (
        <div className="mt-6 space-y-3">
          {data.data.map((job) => (
            <div key={job.id} className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">{job.title}</h2>
                  <p className="mt-0.5 text-sm text-gray-600">
                    {job.location} · {jobTypeLabel(job.jobType)}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">{formatSalary(job.salaryMin, job.salaryMax)}</p>
                </div>
                <Badge color={jobStatusColor(job.status)}>{job.status === "OPEN" ? "Buka" : "Tutup"}</Badge>
              </div>

              <div className="mt-3 flex items-center gap-2 text-sm">
                <Link to={`/company/jobs/${job.id}/applicants`} className="font-medium text-emerald-600 hover:underline">
                  {job._count.applications} pelamar
                </Link>
                {job.status === "OPEN" ? (
                  <Button variant="outline" className="ml-auto" loading={toggleMutation.isPending && toggleMutation.variables?.id === job.id} onClick={() => toggleMutation.mutate({ id: job.id, status: "CLOSED" })}>
                    Tutup
                  </Button>
                ) : (
                  <Button variant="outline" className="ml-auto" loading={toggleMutation.isPending && toggleMutation.variables?.id === job.id} onClick={() => toggleMutation.mutate({ id: job.id, status: "OPEN" })}>
                    Buka lagi
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CompanyOnboarding() {
  const queryClient = useQueryClient();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<CreateCompanyFormValues>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: { name: "", description: "", location: "" },
  });

  const mutation = useMutation({
    mutationFn: createCompany,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["company-jobs"] }),
    onError: (err) => setErrorMsg(getErrorMessage(err, "Gagal membuat profil")),
  });

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-xl font-semibold text-gray-900">Buat Profil Perusahaan</h1>
      <p className="mt-1 text-sm text-gray-500">Diperlukan sebelum memasang lowongan.</p>

      {errorMsg && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errorMsg}</p>}

      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="mt-6 space-y-4" noValidate>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Nama Perusahaan</label>
          <Input {...register("name")} />
          {formState.errors.name && <p className="mt-1 text-xs text-red-600">{formState.errors.name.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Deskripsi</label>
          <textarea rows={3} {...register("description")} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Lokasi</label>
          <Input placeholder="cth: Jakarta" {...register("location")} />
        </div>
        <Button type="submit" loading={mutation.isPending} className="w-full">
          Simpan Profil
        </Button>
      </form>
    </div>
  );
}
