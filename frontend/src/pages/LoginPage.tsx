import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { type LoginFormValues, loginSchema } from "../utils/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { getErrorMessage } from "../api/client";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { register, handleSubmit, formState } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registered = (location.state as { registered?: boolean } | null)?.registered;

  async function onSubmit(values: LoginFormValues) {
    setSubmitError(null);
    try {
      await login(values.email, values.password);
      const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
      navigate(from ?? "/", { replace: true });
    } catch (error) {
      setSubmitError(getErrorMessage(error, "Login gagal. Periksa email dan password"));
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-emerald-600">IndoKerja</h1>
        <p className="mt-1 text-sm text-gray-500">Masuk ke akun Anda</p>

        {registered && <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Registrasi berhasil. Silakan masuk.</p>}
        {submitError && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</p>}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <Input type="email" autoComplete="email" {...register("email")} />
            {formState.errors.email && <p className="mt-1 text-xs text-red-600">{formState.errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
            <Input type="password" autoComplete="current-password" {...register("password")} />
            {formState.errors.password && <p className="mt-1 text-xs text-red-600">{formState.errors.password.message}</p>}
          </div>

          <Button type="submit" loading={formState.isSubmitting} className="w-full">
            Masuk
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Belum punya akun?{" "}
          <Link to="/register" className="font-medium text-emerald-600 hover:underline">
            Daftar
          </Link>
        </p>
      </div>
    </div>
  );
}
