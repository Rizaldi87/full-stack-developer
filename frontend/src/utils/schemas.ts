import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const registerSchema = z.object({
  name: z.string().trim().min(3, "Nama minimal 3 karakter"),
  email: z.email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["JOB_SEEKER", "COMPANY"]),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const createCompanySchema = z.object({
  name: z.string().trim().min(3, "Nama minimal 3 karakter"),
  description: z.string().trim().max(1000).optional(),
  location: z.string().trim().max(100).optional(),
});

export const createJobSchema = z
  .object({
    title: z.string().trim().min(3, "Judul minimal 3 karakter"),
    description: z.string().trim().min(10, "Deskripsi minimal 10 karakter"),
    location: z.string().trim().min(2, "Lokasi wajib diisi"),
    jobType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "FREELANCE"]),
    salaryMin: z.number().int().nonnegative("Berupa angka positif").optional(),
    salaryMax: z.number().int().nonnegative("Berupa angka positif").optional(),
  })
  .superRefine((v, ctx) => {
    if (v.salaryMin != null && v.salaryMax != null && v.salaryMin > v.salaryMax) {
      ctx.addIssue({
        code: "custom",
        path: ["salaryMax"],
        message: "Gaji maksimal tidak boleh lebih kecil dari gaji minimal",
      });
    }
  });

export type CreateCompanyFormValues = z.infer<typeof createCompanySchema>;
export type CreateJobFormValues = z.infer<typeof createJobSchema>;
