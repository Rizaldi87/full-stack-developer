import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerSchema, type RegisterFormValues } from "../utils/schemas";
import { useForm } from "react-hook-form";
import { getErrorMessage } from "../api/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select } from "../components/ui/Select";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { register as apiRegister } from "../api/auth";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [passwordType, setPaswrodType] = useState<string>("password");

  const { register, handleSubmit, formState } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", role: "JOB_SEEKER" },
  });

  async function onSubmit(values: RegisterFormValues) {
    setSubmitError(null);
    try {
      await apiRegister(values);
      navigate("/login", { replace: true, state: { registered: true } });
    } catch (error) {
      setSubmitError(getErrorMessage(error, "Registrasi gagal. Silakan coba lagi"));
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-emerald-600">IndoKerja</h1>
        <p className="mt-1 text-sm text-gray-500">Buat akun baru</p>

        {submitError && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</p>}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Nama Lengkap</label>
            <Input autoComplete="name" {...register("name")} />
            {formState.errors.name && <p className="mt-1 text-xs text-red-600">{formState.errors.name.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <Input type="email" autoComplete="email" {...register("email")} />
            {formState.errors.email && <p className="mt-1 text-xs text-red-600">{formState.errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
            <div className="flex items-center justify-between gap-3">
              <Input type={passwordType} autoComplete="new-password" {...register("password")} />
              <Button
                type="button"
                onClick={() => {
                  setPaswrodType(passwordType == "password" ? "text" : "password");
                }}
              >
                {passwordType == "password" ? "lihat" : "sembunyi"}
              </Button>
            </div>
            {formState.errors.password && <p className="mt-1 text-xs text-red-600">{formState.errors.password.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Saya ingin …</label>
            <Select {...register("role")}>
              <option value="JOB_SEEKER">Mencari kerja</option>
              <option value="COMPANY">Memasang lowongan (perusahaan)</option>
            </Select>
          </div>

          <Button type="submit" loading={formState.isSubmitting} className="w-full">
            Daftar
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Sudah punya akun?{" "}
          <Link to="/login" className="font-medium text-emerald-600 hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
