import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

type AttendanceStatus = "PRESENT" | "ABSENT" | "HALF_DAY" | "LEAVE";
type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

interface Profile {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string | null;
  department: string | null;
  designation: string | null;
  role: string;
  profilePicture: string | null;
  isVerified: boolean;
}

interface AttendanceRecord {
  id: number;
  attendanceDate: string;
  checkIn: string | null;
  checkOut: string | null;
  status: AttendanceStatus;
}

interface LeaveRequest {
  id: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  remarks: string | null;
  status: LeaveStatus;
  adminComment: string | null;
  createdAt: string;
}

interface PayrollRecord {
  id: number;
  month: number;
  year: number;
  basicSalary: string;
  bonus: string;
  deductions: string;
  netSalary: string;
}

const MONTHS = [
  "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const formatCurrency = (v: string | number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(v));

const statusStyles: Record<string, string> = {
  PRESENT: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  ABSENT: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  HALF_DAY: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  LEAVE: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  APPROVED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  REJECTED: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

const LEAVE_TYPES = ["CASUAL", "SICK", "PAID", "UNPAID"];

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("adminToken");

  const authHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  const [activeTab, setActiveTab] = useState<"profile" | "attendance" | "leave" | "salary">("profile");

  // Profile
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editProfile, setEditProfile] = useState({ phone: "", address: "", profilePicture: "" });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Attendance
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  // Leave
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [leaveForm, setLeaveForm] = useState({
    leaveType: "CASUAL",
    startDate: "",
    endDate: "",
    remarks: "",
  });
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);

  // Payroll
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  // ── Fetch all data on mount ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [profRes, attRes, leaveRes, payRes] = await Promise.all([
          fetch(`${API}/api/v1/employees/profile`, { headers: authHeaders, credentials: "include" }),
          fetch(`${API}/api/v1/attendance/me`, { headers: authHeaders, credentials: "include" }),
          fetch(`${API}/api/v1/leave/me`, { headers: authHeaders, credentials: "include" }),
          fetch(`${API}/api/v1/payroll/me`, { headers: authHeaders, credentials: "include" }),
        ]);

        if (profRes.ok) {
          const d = (await profRes.json()) as { data: Profile };
          setProfile(d.data);
          setEditProfile({
            phone: d.data.phone ?? "",
            address: d.data.address ?? "",
            profilePicture: d.data.profilePicture ?? "",
          });
        }
        if (attRes.ok) {
          const d = (await attRes.json()) as { data: AttendanceRecord[] };
          setAttendance(d.data);
        }
        if (leaveRes.ok) {
          const d = (await leaveRes.json()) as { data: LeaveRequest[] };
          setLeaves(d.data);
        }
        if (payRes.ok) {
          const d = (await payRes.json()) as { data: PayrollRecord[] };
          setPayroll(d.data);
        }
      } finally {
        setIsLoading(false);
      }
    };
    void fetchAll();
  }, [authHeaders]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      const res = await fetch(`${API}/api/v1/attendance/checkin`, {
        method: "POST",
        headers: authHeaders,
        credentials: "include",
      });
      const d = (await res.json()) as { data: AttendanceRecord; message?: string };
      if (res.ok) setAttendance((prev) => [d.data, ...prev]);
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckingOut(true);
    try {
      const res = await fetch(`${API}/api/v1/attendance/checkout`, {
        method: "POST",
        headers: authHeaders,
        credentials: "include",
      });
      if (res.ok) {
        const d = (await res.json()) as { data: AttendanceRecord };
        setAttendance((prev) => prev.map((r) => (r.id === d.data.id ? d.data : r)));
      }
    } finally {
      setCheckingOut(false);
    }
  };

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    setProfileError(null);
    try {
      const res = await fetch(`${API}/api/v1/employees/profile`, {
        method: "PATCH",
        headers: authHeaders,
        credentials: "include",
        body: JSON.stringify(editProfile),
      });
      if (res.ok) {
        const d = (await res.json()) as { data: Profile };
        setProfile(d.data);
        setIsEditingProfile(false);
      } else {
        setProfileError("Failed to update profile.");
      }
    } finally {
      setProfileSaving(false);
    }
  };

  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeaveError(null);
    setLeaveSubmitting(true);
    try {
      const res = await fetch(`${API}/api/v1/leave`, {
        method: "POST",
        headers: authHeaders,
        credentials: "include",
        body: JSON.stringify(leaveForm),
      });
      if (res.ok) {
        const d = (await res.json()) as { data: LeaveRequest };
        setLeaves((prev) => [d.data, ...prev]);
        setLeaveForm({ leaveType: "CASUAL", startDate: "", endDate: "", remarks: "" });
      } else {
        const d = (await res.json()) as { message?: string };
        setLeaveError(d.message ?? "Failed to submit leave request.");
      }
    } finally {
      setLeaveSubmitting(false);
    }
  };

  const tabs = [
    { id: "profile" as const, label: "My Profile" },
    { id: "attendance" as const, label: "My Attendance" },
    { id: "leave" as const, label: "My Leave" },
    { id: "salary" as const, label: "My Salary" },
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(91,33,182,0.18),_transparent_40%),radial-gradient(circle_at_bottom_left,_rgba(233,30,99,0.12),_transparent_40%)] px-4 py-6 text-text sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">

        {/* Header */}
        <header className="rounded-3xl border border-white/10 bg-surface/80 p-6 shadow-2xl backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-primary">Employee Portal</p>
              <h1 className="mt-1 text-2xl font-semibold">
                {isLoading ? "Loading…" : profile ? `${profile.firstName} ${profile.lastName}` : "My Dashboard"}
              </h1>
              {profile && (
                <p className="text-sm text-text-muted mt-0.5">
                  {profile.designation ?? profile.role} {profile.department ? `• ${profile.department}` : ""}
                </p>
              )}
            </div>
            <Link
              to="/home"
              className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-text-muted transition hover:border-primary hover:text-primary"
            >
              ← Back to Home
            </Link>
          </div>
        </header>

        {/* Tabs */}
        <nav className="flex gap-1 rounded-2xl border border-white/10 bg-surface/80 p-1.5 backdrop-blur">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-white shadow-lg"
                  : "text-text-muted hover:text-text"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* ── Profile Tab ───────────────────────────────────────────────────── */}
        {activeTab === "profile" && (
          <div className="rounded-3xl border border-white/10 bg-surface/80 p-6 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Profile Details</h2>
              {!isEditingProfile ? (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="rounded-full border border-primary/40 px-4 py-1.5 text-sm text-primary transition hover:bg-primary hover:text-white"
                >
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="rounded-full border border-white/10 px-4 py-1.5 text-sm text-text-muted transition hover:text-text"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={profileSaving}
                    className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-secondary disabled:opacity-50"
                  >
                    {profileSaving ? "Saving…" : "Save"}
                  </button>
                </div>
              )}
            </div>

            {profile ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: "Employee ID", value: profile.employeeId, editable: false },
                  { label: "Email", value: profile.email, editable: false },
                  { label: "Role", value: profile.role, editable: false },
                  { label: "Department", value: profile.department ?? "—", editable: false },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-background/50 p-4">
                    <p className="text-xs text-text-muted uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-sm font-medium">{value}</p>
                  </div>
                ))}

                {/* Editable fields */}
                {[
                  { label: "Phone", field: "phone" as const, placeholder: "+91 98765 43210" },
                  { label: "Address", field: "address" as const, placeholder: "123 Street, City" },
                ].map(({ label, field, placeholder }) => (
                  <div key={field} className="rounded-2xl border border-white/10 bg-background/50 p-4">
                    <p className="text-xs text-text-muted uppercase tracking-wider mb-1">{label}</p>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={editProfile[field]}
                        placeholder={placeholder}
                        onChange={(e) => setEditProfile((prev) => ({ ...prev, [field]: e.target.value }))}
                        className="w-full bg-transparent text-sm text-text outline-none border-b border-primary/40 pb-0.5"
                      />
                    ) : (
                      <p className="text-sm font-medium">{(profile as any)[field] ?? "—"}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted">Loading profile…</p>
            )}

            {profileError && (
              <p className="mt-4 text-sm text-rose-400">{profileError}</p>
            )}
          </div>
        )}

        {/* ── Attendance Tab ──────────────────────────────────────────────── */}
        {activeTab === "attendance" && (
          <div className="rounded-3xl border border-white/10 bg-surface/80 p-6 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">My Attendance</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleCheckIn}
                  disabled={checkingIn}
                  className="rounded-full bg-emerald-500/90 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-50"
                >
                  {checkingIn ? "…" : "Check In"}
                </button>
                <button
                  onClick={handleCheckOut}
                  disabled={checkingOut}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-text-muted transition hover:border-primary hover:text-primary disabled:opacity-50"
                >
                  {checkingOut ? "…" : "Check Out"}
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {attendance.length === 0 ? (
                <p className="text-sm text-text-muted">No attendance records yet.</p>
              ) : (
                attendance.map((r) => (
                  <div key={r.id} className="rounded-2xl border border-white/10 bg-background/50 p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(r.attendanceDate).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">
                        In: {r.checkIn ? new Date(r.checkIn).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}
                        {" "}• Out: {r.checkOut ? new Date(r.checkOut).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs ${statusStyles[r.status]}`}>
                      {r.status.replace("_", " ")}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── Leave Tab ────────────────────────────────────────────────────── */}
        {activeTab === "leave" && (
          <div className="flex flex-col gap-5">
            {/* New request form */}
            <div className="rounded-3xl border border-white/10 bg-surface/80 p-6 shadow-xl backdrop-blur">
              <h2 className="text-xl font-semibold mb-4">Request Leave</h2>
              <form onSubmit={handleLeaveSubmit} className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">Leave Type</label>
                  <select
                    value={leaveForm.leaveType}
                    onChange={(e) => setLeaveForm((p) => ({ ...p, leaveType: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-surface px-4 py-2.5 text-sm text-text outline-none focus:border-primary"
                  >
                    {LEAVE_TYPES.map((t) => (
                      <option key={t} value={t} className="bg-surface">{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">Start Date</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm((p) => ({ ...p, startDate: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-surface px-4 py-2.5 text-sm text-text outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">End Date</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm((p) => ({ ...p, endDate: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-surface px-4 py-2.5 text-sm text-text outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">Remarks</label>
                  <input
                    type="text"
                    placeholder="Optional reason"
                    value={leaveForm.remarks}
                    onChange={(e) => setLeaveForm((p) => ({ ...p, remarks: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-surface px-4 py-2.5 text-sm text-text outline-none focus:border-primary"
                  />
                </div>
                {leaveError && (
                  <div className="sm:col-span-2 text-sm text-rose-400">{leaveError}</div>
                )}
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={leaveSubmitting}
                    className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-secondary disabled:opacity-50"
                  >
                    {leaveSubmitting ? "Submitting…" : "Submit Request"}
                  </button>
                </div>
              </form>
            </div>

            {/* Leave history */}
            <div className="rounded-3xl border border-white/10 bg-surface/80 p-6 shadow-xl backdrop-blur">
              <h2 className="text-xl font-semibold mb-4">Leave History</h2>
              <div className="space-y-3">
                {leaves.length === 0 ? (
                  <p className="text-sm text-text-muted">No leave requests yet.</p>
                ) : (
                  leaves.map((l) => (
                    <div key={l.id} className="rounded-2xl border border-white/10 bg-background/50 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{l.leaveType}</p>
                          <p className="text-sm text-text-muted mt-0.5">
                            {new Date(l.startDate).toLocaleDateString("en-IN")} – {new Date(l.endDate).toLocaleDateString("en-IN")}
                          </p>
                          {l.remarks && <p className="text-sm text-text-muted mt-1">{l.remarks}</p>}
                          {l.adminComment && (
                            <p className="text-xs text-text-muted mt-1 italic">Note: {l.adminComment}</p>
                          )}
                        </div>
                        <span className={`rounded-full border px-3 py-1 text-xs ${statusStyles[l.status]}`}>
                          {l.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Salary Tab ────────────────────────────────────────────────────── */}
        {activeTab === "salary" && (
          <div className="rounded-3xl border border-white/10 bg-surface/80 p-6 shadow-xl backdrop-blur">
            <h2 className="text-xl font-semibold mb-6">My Salary Details</h2>
            {payroll.length === 0 ? (
              <p className="text-sm text-text-muted">No payroll records available.</p>
            ) : (
              <div className="space-y-4">
                {payroll.map((p) => (
                  <div key={p.id} className="rounded-2xl border border-white/10 bg-background/50 p-5">
                    <p className="text-sm font-semibold text-primary mb-4">
                      {MONTHS[p.month]} {p.year}
                    </p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {[
                        { label: "Basic Salary", value: p.basicSalary, accent: false },
                        { label: "Bonus", value: p.bonus, accent: false },
                        { label: "Deductions", value: p.deductions, accent: false },
                        { label: "Net Salary", value: p.netSalary, accent: true },
                      ].map(({ label, value, accent }) => (
                        <div
                          key={label}
                          className={`rounded-xl border p-3 ${accent ? "border-primary/30 bg-primary/10" : "border-white/10"}`}
                        >
                          <p className="text-xs text-text-muted mb-1">{label}</p>
                          <p className={`text-base font-semibold ${accent ? "text-primary" : ""}`}>
                            {formatCurrency(value)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default EmployeeDashboard;
