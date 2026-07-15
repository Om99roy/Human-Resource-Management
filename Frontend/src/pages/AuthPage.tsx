import { useState } from "react";
import { useNavigate } from "react-router-dom";


interface ProfileForm {
  firstName: string;
  lastName: string;
  email: string;
  employeeId: string;
  dob: string;
  jobRole: string;
  department: string;
  joiningDate: string;
  password: string;
  role: "EMPLOYEE" | "HR" | "ADMIN";
}

const ROLES = ["EMPLOYEE", "HR", "ADMIN"] as const;

const AuthPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"idle" | "form" | "loading" | "error">("form");
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ProfileForm>({
    firstName: "",
    lastName: "",
    email: "",
    employeeId: "",
    dob: "",
    jobRole: "",
    department: "",
    joiningDate: "",
    password: "",
    role: "EMPLOYEE",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStep("loading");

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          department: form.department || undefined,
          joiningDate: form.joiningDate || undefined,
          role: form.role,
          designation: form.jobRole || undefined,
          phone: undefined,
          address: undefined,
        }),
      });

      const data = (await res.json()) as {
        success: boolean;
        data?: { user: { role: string }; accessToken: string };
        message?: string;
        errors?: { fieldErrors?: Record<string, string[]>; formErrors?: string[] };
      };

      if (!res.ok || !data.success) {
        setStep("error");
        // Surface specific Zod field errors when available
        if (data.errors?.fieldErrors) {
          const msgs = Object.entries(data.errors.fieldErrors)
            .map(([field, errs]) => `${field}: ${errs.join(", ")}`)
            .join(" · ");
          setError(msgs);
        } else {
          setError(data.message ?? "Registration failed. Please try again.");
        }
        return;
      }

      // Store token in sessionStorage for compatibility with AdminGuard
      if (data.data?.accessToken) {
        sessionStorage.setItem("adminToken", data.data.accessToken);
        sessionStorage.setItem("adminRole", data.data.user.role);
      }

      const role = data.data?.user.role;
      if (role === "ADMIN" || role === "HR") {
        navigate("/admin");
      } else {
        navigate("/employee");
      }
    } catch {
      setStep("error");
      setError("Network error. Please check your connection and try again.");
    }
  };

  return (
    <main className="min-h-screen bg-background text-text flex items-center justify-center px-4 py-10">
      {/* Background glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[180px]" />
        <div className="absolute left-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-tertiary/10 blur-[150px]" />
      </div>

      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-surface/80 p-8 shadow-2xl shadow-black/40 backdrop-blur">
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-primary mb-2">Employee Onboarding</p>
          <h1 className="text-3xl font-bold text-text">Create your account</h1>
          <p className="mt-2 text-sm text-text-muted">
            Join the HR Management System
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
                First Name
              </label>
              <input
                name="firstName"
                type="text"
                required
                placeholder="Asha"
                value={form.firstName}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-surface px-4 py-2.5 text-sm text-text placeholder-text-muted/50 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
                Last Name
              </label>
              <input
                name="lastName"
                type="text"
                required
                placeholder="Patel"
                value={form.lastName}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-surface px-4 py-2.5 text-sm text-text placeholder-text-muted/50 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
              Work Email
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="asha@company.com"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-surface px-4 py-2.5 text-sm text-text placeholder-text-muted/50 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              className="w-full rounded-xl border border-white/10 bg-surface px-4 py-2.5 text-sm text-text placeholder-text-muted/50 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <p className="mt-1.5 text-xs text-text-muted/70">
              Min 8 chars · uppercase · lowercase · number · special character (e.g. <span className="text-text-muted">P@ss1word!</span>)
            </p>
          </div>

          {/* Employee ID + DOB */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
                Employee ID
              </label>
              <input
                name="employeeId"
                type="text"
                placeholder="EMP0001 (auto)"
                value={form.employeeId}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-surface px-4 py-2.5 text-sm text-text placeholder-text-muted/50 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
                Date of Birth
              </label>
              <input
                name="dob"
                type="date"
                value={form.dob}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-surface px-4 py-2.5 text-sm text-text outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Job Role + Department */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
                Job Role
              </label>
              <input
                name="jobRole"
                type="text"
                required
                placeholder="Senior Developer"
                value={form.jobRole}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-surface px-4 py-2.5 text-sm text-text placeholder-text-muted/50 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
                Department
              </label>
              <input
                name="department"
                type="text"
                placeholder="Engineering"
                value={form.department}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-surface px-4 py-2.5 text-sm text-text placeholder-text-muted/50 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Joining Date + Role */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
                Joining Date
              </label>
              <input
                name="joiningDate"
                type="date"
                value={form.joiningDate}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-surface px-4 py-2.5 text-sm text-text outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
                Role
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-surface px-4 py-2.5 text-sm text-text outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r} className="bg-surface">
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400"
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={step === "loading"}
            className="mt-2 w-full rounded-full bg-primary py-3 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-secondary disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {step === "loading" ? "Creating account…" : "Create Account"}
          </button>

          <p className="text-center text-xs text-text-muted mt-1">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/home")}
              className="text-primary hover:underline"
            >
              Go back
            </button>
          </p>
        </form>
      </div>
    </main>
  );
};

export default AuthPage;
