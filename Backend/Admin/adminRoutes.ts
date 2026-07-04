import { Router } from "express";

const router = Router();

router.get("/dashboard", (_req, res) => {
  res.json({
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
  });
});

export default router;
