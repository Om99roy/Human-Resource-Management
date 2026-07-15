import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type RoleTab = "HR" | "Admin";

const FIELDS = [
  { id: "email", label: "Email", type: "email", placeholder: "admin@company.com", autocomplete: "email" },
  { id: "name", label: "Name", type: "text", placeholder: "Your full name", autocomplete: "name" },
  { id: "workingTime", label: "Working Time", type: "text", placeholder: "e.g. 9AM – 6PM", autocomplete: "off" },
  { id: "joiningYear", label: "Joining Year", type: "number", placeholder: "e.g. 2021", autocomplete: "off" },
  { id: "password", label: "Password", type: "password", placeholder: "••••••••", autocomplete: "current-password" },
] as const;

type FieldId = (typeof FIELDS)[number]["id"];

const AdminLoginModal = ({ isOpen, onClose }: AdminLoginModalProps) => {
  const navigate = useNavigate();
  const overlayRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<RoleTab>("Admin");
  const [sliderLeft, setSliderLeft] = useState(0);
  const hrRef = useRef<HTMLButtonElement>(null);
  const adminRef = useRef<HTMLButtonElement>(null);

  const [form, setForm] = useState<Record<FieldId, string>>({
    email: "",
    name: "",
    workingTime: "",
    joiningYear: "",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Move the tab slider
  useEffect(() => {
    const target = activeTab === "HR" ? hrRef.current : adminRef.current;
    if (target) setSliderLeft(target.offsetLeft);
  }, [activeTab]);

  // Close on overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const handleChange = (id: FieldId, value: string) => {
    setForm((prev) => ({ ...prev, [id]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.email || !form.password) {
      setError("Email and password are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/v1/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          selectedRole: activeTab === "HR" ? "HR" : "ADMIN",
        }),
      });

      const data = (await res.json()) as {
        success: boolean;
        message: string;
        data?: { accessToken: string; user: { role: string } };
      };

      if (!res.ok || !data.success) {
        // Friendly messages for the two expected failure modes
        if (res.status === 403) {
          setError(
            "Access denied. Only Admin and HR Managers can open this dashboard. Employees must use the standard portal."
          );
        } else {
          setError("Invalid credentials. Please try again.");
        }
        return;
      }

      // Store access token for downstream API calls
      if (data.data?.accessToken) {
        sessionStorage.setItem("adminToken", data.data.accessToken);
        sessionStorage.setItem("adminRole", data.data.user.role);
      }

      onClose();
      navigate("/admin");
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="admin-login-title"
    >
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#111114] p-7 shadow-2xl shadow-black/40">

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-text-muted transition hover:border-primary hover:text-primary"
        >
          ✕
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-primary mb-2">Restricted Access</p>
          <h2 id="admin-login-title" className="text-2xl font-bold text-text">
            Select if you're a real<br />
            <span className="text-primary">HR Manager</span> or an <span className="text-primary">Admin</span>
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            Employees cannot open this dashboard.
          </p>
        </div>

        {/* Swapping role tab */}
        <div className="relative mb-6 flex rounded-full border border-white/10 bg-surface-2 p-1">
          {/* Animated slider */}
          <div
            className="absolute top-1 h-[calc(100%-8px)] rounded-full bg-primary transition-all duration-300 ease-in-out"
            style={{
              left: sliderLeft,
              width: activeTab === "HR" ? hrRef.current?.offsetWidth ?? 80 : adminRef.current?.offsetWidth ?? 80,
            }}
          />

          <button
            ref={hrRef}
            type="button"
            onClick={() => setActiveTab("HR")}
            className={`relative z-10 flex-1 rounded-full py-2 text-sm font-semibold transition-colors duration-200 ${
              activeTab === "HR" ? "text-white" : "text-text-muted hover:text-text"
            }`}
          >
            HR Manager
          </button>

          <button
            ref={adminRef}
            type="button"
            onClick={() => setActiveTab("Admin")}
            className={`relative z-10 flex-1 rounded-full py-2 text-sm font-semibold transition-colors duration-200 ${
              activeTab === "Admin" ? "text-white" : "text-text-muted hover:text-text"
            }`}
          >
            Admin
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

          {FIELDS.map(({ id, label, type, placeholder, autocomplete }) => (
            <div key={id}>
              <label
                htmlFor={id}
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted"
              >
                {label}
              </label>
              <input
                id={id}
                type={type}
                placeholder={placeholder}
                autoComplete={autocomplete}
                value={form[id]}
                onChange={(e) => handleChange(id, e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-xl border border-white/10 bg-surface px-4 py-2.5 text-sm text-text placeholder-text-muted/50 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
              />
            </div>
          ))}

          {/* Role display (read-only, driven by tab) */}
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
              Selected Role
            </label>
            <div className="w-full rounded-xl border border-primary/40 bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary">
              {activeTab === "HR" ? "HR Manager" : "Admin"}
            </div>
          </div>

          {/* Error message */}
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
            disabled={isSubmitting}
            className="mt-1 w-full rounded-full bg-primary py-3 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Verifying…" : "Submit"}
          </button>

        </form>

        {/* Security notice */}
        <p className="mt-5 text-center text-xs text-text-muted/60">
          🔒 This access point is monitored. Unauthorized attempts are logged.
        </p>

      </div>
    </div>
  );
};

export default AdminLoginModal;
