import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { type CreateJobFormValues, createJobSchema } from "../../utils/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { createJob } from "../../api/jobs";
import { getErrorMessage } from "../../api/client";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";

export default function CreateJobPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { register, handleSubmit, formState } = useForm<CreateJobFormValues>({
    resolver: zodResolver(createJobSchema),
    defaultValues: { title: "", description: "", location: "", jobType: "FULL_TIME", salaryMin: undefined, salaryMax: undefined },
  });

  const mutation = useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-jobs"] });
      navigate("/company/jobs");
    },
    onError: (err) => setSubmitError(getErrorMessage(err, "Gagal membuat lowongan")),
  });

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-semibold text-gray-900">Buat Lowongan Baru</h1>

      {submitError && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</p>}

      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="mt-6 space-y-4 rounded-lg border bg-white p-5 shadow-sm" noValidate>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Judul</label>
          <Input {...register("title")} />
          {formState.errors.title && <p className="mt-1 text-xs text-red-600">{formState.errors.title.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Deskripsi</label>
          <textarea rows={5} {...register("description")} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
          {formState.errors.description && <p className="mt-1 text-xs text-red-600">{formState.errors.description.message}</p>}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Lokasi</label>
            <Input {...register("location")} />
            {formState.errors.location && <p className="mt-1 text-xs text-red-600">{formState.errors.location.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Tipe</label>
            <Select {...register("jobType")}>
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Kontrak</option>
              <option value="INTERNSHIP">Magang</option>
              <option value="FREELANCE">Freelance</option>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Gaji Min (opsional)</label>
            <Input type="number" placeholder="cth: 5000000" {...register("salaryMin", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Gaji Maks (opsional)</label>
            <Input type="number" placeholder="cth: 10000000" {...register("salaryMax", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })} />
          </div>
        </div>
        {formState.errors.salaryMax && <p className="text-xs text-red-600">{formState.errors.salaryMax.message}</p>}

        <Button type="submit" loading={mutation.isPending}>
          Simpan Lowongan
        </Button>
      </form>
    </div>
  );
}
