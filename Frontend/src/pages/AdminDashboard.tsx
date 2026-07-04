import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

type EmployeeStatus = "Present" | "Absent" | "Late" | "On Leave";
type AttendanceStatus = "Present" | "Absent" | "Late" | "Half Day";
type LeaveStatus = "Pending" | "Approved" | "Rejected";

type Employee = {
  id: number;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  status: EmployeeStatus;
  manager: string;
};

type AttendanceRecord = {
  id: number;
  employeeId: number;
  employee: string;
  department: string;
  date: string;
  status: AttendanceStatus;
  checkIn: string;
  checkOut: string;
};

type LeaveApproval = {
  id: number;
  employee: string;
  department: string;
  type: string;
  days: number;
  reason: string;
  requestedOn: string;
  status: LeaveStatus;
};

type DashboardData = {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  pendingLeaves: number;
  monthlyPayroll: number;
  employees: Employee[];
  attendance: AttendanceRecord[];
  leaveApprovals: LeaveApproval[];
  insights: string[];
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const defaultDashboardData: DashboardData = {
  totalEmployees: 28,
  presentToday: 24,
  absentToday: 4,
  pendingLeaves: 3,
  monthlyPayroll: 540000,
  employees: [
    {
      id: 1,
      name: "Asha Patel",
      role: "Operations Lead",
      department: "HR",
      email: "asha@acme.com",
      phone: "+91 98765 43210",
      status: "Present",
      manager: "Mina Rao",
    },
    {
      id: 2,
      name: "Ravi Menon",
      role: "Senior Developer",
      department: "Engineering",
      email: "ravi@acme.com",
      phone: "+91 87654 32109",
      status: "Late",
      manager: "Nisha Singh",
    },
    {
      id: 3,
      name: "Meera Shah",
      role: "Finance Analyst",
      department: "Finance",
      email: "meera@acme.com",
      phone: "+91 76543 21098",
      status: "On Leave",
      manager: "Lalit Verma",
    },
    {
      id: 4,
      name: "Karan Dey",
      role: "Sales Manager",
      department: "Sales",
      email: "karan@acme.com",
      phone: "+91 65432 10987",
      status: "Absent",
      manager: "Sanya Bose",
    },
  ],
  attendance: [
    { id: 1, employeeId: 1, employee: "Asha Patel", department: "HR", date: "2026-07-04", status: "Present", checkIn: "09:02", checkOut: "18:10" },
    { id: 2, employeeId: 2, employee: "Ravi Menon", department: "Engineering", date: "2026-07-04", status: "Late", checkIn: "10:15", checkOut: "19:00" },
    { id: 3, employeeId: 3, employee: "Meera Shah", department: "Finance", date: "2026-07-04", status: "Half Day", checkIn: "09:30", checkOut: "13:30" },
    { id: 4, employeeId: 4, employee: "Karan Dey", department: "Sales", date: "2026-07-04", status: "Absent", checkIn: "—", checkOut: "—" },
  ],
  leaveApprovals: [
    { id: 1, employee: "Meera Shah", department: "Finance", type: "Sick Leave", days: 2, reason: "Flu and rest", requestedOn: "2026-07-02", status: "Pending" },
    { id: 2, employee: "Ravi Menon", department: "Engineering", type: "Personal", days: 1, reason: "Family event", requestedOn: "2026-07-03", status: "Pending" },
    { id: 3, employee: "Asha Patel", department: "HR", type: "Casual", days: 3, reason: "Travel", requestedOn: "2026-07-01", status: "Approved" },
  ],
  insights: [
    "Attendance improved by 8% this month.",
    "2 employees have been late more than 5 times.",
    "Sales department has the highest absenteeism.",
    "3 leave requests are awaiting approval.",
  ],
};

const statusStyles: Record<EmployeeStatus | AttendanceStatus | LeaveStatus, string> = {
  Present: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Late: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Absent: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  "Half Day": "bg-sky-500/10 text-sky-400 border-sky-500/20",
  "On Leave": "bg-violet-500/10 text-violet-400 border-violet-500/20",
  Pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Rejected: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>(defaultDashboardData);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(defaultDashboardData.employees[0]?.id ?? null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch("/api/admin/dashboard");
        if (!response.ok) {
          throw new Error("Unable to load dashboard data");
        }
        const payload = (await response.json()) as DashboardData;
        setDashboardData(payload);
        setSelectedEmployeeId(payload.employees[0]?.id ?? null);
      } catch {
        setDashboardData(defaultDashboardData);
        setSelectedEmployeeId(defaultDashboardData.employees[0]?.id ?? null);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchDashboard();
  }, []);

  const activeEmployee = useMemo(() => {
    return dashboardData.employees.find((employee) => employee.id === selectedEmployeeId) ?? dashboardData.employees[0];
  }, [dashboardData.employees, selectedEmployeeId]);

  const employeeAttendance = useMemo(() => {
    return dashboardData.attendance.filter((record) => record.employeeId === activeEmployee?.id);
  }, [activeEmployee?.id, dashboardData.attendance]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(233,30,99,0.15),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(91,33,182,0.18),_transparent_35%)] px-4 py-6 text-text sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-3xl border border-white/10 bg-surface/80 p-6 shadow-2xl shadow-black/20 backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-primary">Admin / HR Dashboard</p>
              <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Manage people, attendance, and approvals from one view.</h1>
              <p className="mt-3 max-w-2xl text-sm text-text-muted sm:text-base">
                Keep your team aligned with a responsive control center tailored for HR operations, leave approvals, and daily attendance insights.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/home" className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-text-muted transition hover:border-primary hover:text-primary">
                View landing page
              </Link>
              <button className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-secondary">
                Export report
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            { label: "Total employees", value: dashboardData.totalEmployees, hint: "+3 new this month" },
            { label: "Present today", value: dashboardData.presentToday, hint: "Healthy attendance" },
            { label: "Absent today", value: dashboardData.absentToday, hint: "Follow up needed" },
            { label: "Pending leaves", value: dashboardData.pendingLeaves, hint: "Awaiting review" },
            { label: "Monthly payroll", value: formatCurrency(dashboardData.monthlyPayroll), hint: "Auto-generated" },
          ].map((card) => (
            <div key={card.label} className="rounded-2xl border border-white/10 bg-surface/80 p-4 shadow-lg shadow-black/10">
              <p className="text-sm text-text-muted">{card.label}</p>
              <p className="mt-3 text-2xl font-semibold">{card.value}</p>
              <p className="mt-2 text-sm text-primary">{card.hint}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-white/10 bg-surface/80 p-5 shadow-2xl shadow-black/20">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold">Employee list</h2>
                <p className="text-sm text-text-muted">Switch profiles and review their current status in one step.</p>
              </div>
              <label className="flex items-center gap-2 rounded-full border border-white/10 bg-surface-2 px-3 py-2 text-sm text-text-muted">
                <span>Switch employee</span>
                <select
                  className="bg-transparent outline-none"
                  value={selectedEmployeeId ?? ""}
                  onChange={(event) => setSelectedEmployeeId(Number(event.target.value))}
                >
                  {dashboardData.employees.map((employee) => (
                    <option key={employee.id} value={employee.id} className="bg-surface text-text">
                      {employee.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-2xl border border-white/10 bg-background/70 p-4">
                <p className="text-sm text-text-muted">Selected employee</p>
                {isLoading ? (
                  <p className="mt-3 text-sm text-text-muted">Loading employee profile...</p>
                ) : activeEmployee ? (
                  <>
                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        <p className="text-lg font-semibold">{activeEmployee.name}</p>
                        <p className="text-sm text-text-muted">{activeEmployee.role} • {activeEmployee.department}</p>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-sm ${statusStyles[activeEmployee.status]}`}>
                        {activeEmployee.status}
                      </span>
                    </div>
                    <div className="mt-4 space-y-2 text-sm text-text-muted">
                      <p>Email: {activeEmployee.email}</p>
                      <p>Phone: {activeEmployee.phone}</p>
                      <p>Manager: {activeEmployee.manager}</p>
                    </div>
                  </>
                ) : null}
              </div>

              <div className="rounded-2xl border border-white/10 bg-background/70 p-4">
                <p className="text-sm text-text-muted">Attendance snapshot</p>
                <div className="mt-4 space-y-3">
                  {employeeAttendance.length > 0 ? employeeAttendance.map((record) => (
                    <div key={record.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-surface/60 px-3 py-2">
                      <div>
                        <p className="text-sm font-medium">{record.date}</p>
                        <p className="text-xs text-text-muted">{record.checkIn} – {record.checkOut}</p>
                      </div>
                      <span className={`rounded-full border px-2.5 py-1 text-xs ${statusStyles[record.status]}`}>
                        {record.status}
                      </span>
                    </div>
                  )) : <p className="text-sm text-text-muted">No recent records yet.</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-surface/80 p-5 shadow-2xl shadow-black/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Attendance records</h2>
                <p className="text-sm text-text-muted">Daily presence trends for the current week.</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {dashboardData.attendance.map((record) => (
                <div key={record.id} className="rounded-2xl border border-white/10 bg-background/70 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{record.employee}</p>
                      <p className="text-sm text-text-muted">{record.department} • {record.date}</p>
                    </div>
                    <span className={`rounded-full border px-2.5 py-1 text-xs ${statusStyles[record.status]}`}>
                      {record.status}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-text-muted">
                    Check-in {record.checkIn} • Check-out {record.checkOut}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-surface/80 p-5 shadow-2xl shadow-black/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Leave approvals</h2>
                <p className="text-sm text-text-muted">Approve or reject requests from the HR desk.</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {dashboardData.leaveApprovals.map((leave) => (
                <div key={leave.id} className="rounded-2xl border border-white/10 bg-background/70 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-medium">{leave.employee}</p>
                      <p className="text-sm text-text-muted">{leave.department} • {leave.type} • {leave.days} day(s)</p>
                      <p className="mt-2 text-sm text-text-muted">{leave.reason}</p>
                    </div>
                    <span className={`rounded-full border px-2.5 py-1 text-xs ${statusStyles[leave.status]}`}>
                      {leave.status}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button className="rounded-full bg-emerald-500/90 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-400">
                      Approve
                    </button>
                    <button className="rounded-full border border-white/10 px-3 py-1.5 text-sm font-medium text-text-muted transition hover:border-primary hover:text-primary">
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-surface/80 p-5 shadow-2xl shadow-black/20">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-primary">HR Copilot</p>
              <h2 className="mt-2 text-xl font-semibold">AI-driven insights for the admin team</h2>
            </div>
            <div className="mt-5 space-y-3">
              {dashboardData.insights.map((insight) => (
                <div key={insight} className="rounded-2xl border border-white/10 bg-background/70 p-3 text-sm text-text-muted">
                  {insight}
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-primary/30 bg-primary/10 p-4">
              <p className="text-sm font-medium text-primary">Ask HR Copilot</p>
              <textarea
                className="mt-3 h-24 w-full rounded-xl border border-white/10 bg-background/70 p-3 text-sm text-text outline-none"
                placeholder="Summarize attendance risks for this week..."
              />
              <button className="mt-3 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-secondary">
                Generate insight
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default AdminDashboard;
