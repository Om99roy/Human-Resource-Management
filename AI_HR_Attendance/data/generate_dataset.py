import random
from datetime import date, timedelta, datetime
from pathlib import Path
import pandas as pd
from faker import Faker

fake=Faker("en_IN")
random.seed(42); Faker.seed(42)

OUT=Path("output"); OUT.mkdir(exist_ok=True)

departments=[("Engineering","Rohan Gupta"),("HR","Asha Patel"),("Finance","Amit Verma"),
("Marketing","Ritika Das"),("Sales","Priya Singh"),("Support","Akash Yadav")]

holidays=[
("2025-01-26","Republic Day"),("2025-03-14","Holi"),("2025-04-18","Good Friday"),
("2025-08-15","Independence Day"),("2025-10-02","Gandhi Jayanti"),("2025-10-20","Diwali"),
("2025-12-25","Christmas")]
hol_df=pd.DataFrame(holidays,columns=["date","holiday"])
hol_df.to_csv(OUT/"holidays.csv",index=False)

mgrs=pd.DataFrame([{"manager":m,"department":d} for d,m in departments])
mgrs.to_csv(OUT/"managers.csv",index=False)
pd.DataFrame([{"department":d,"manager":m} for d,m in departments]).to_csv(OUT/"departments.csv",index=False)

desigs={"Engineering":["Software Engineer","Backend Developer","Frontend Developer","QA Engineer","Data Engineer","ML Engineer"],
"HR":["HR Executive","Recruiter"],"Finance":["Accountant","Financial Analyst"],
"Marketing":["SEO Specialist","Content Strategist"],"Sales":["Sales Executive"],"Support":["IT Support","System Administrator"]}

emps=[]
for i in range(1,101):
    dept,man=random.choice(departments)
    emps.append({
        "employee_id":f"EMP{i:03d}",
        "first_name":fake.first_name(),
        "last_name":fake.last_name(),
        "gender":random.choice(["Male","Female"]),
        "email":f"user{i}@company.com",
        "phone":"9"+''.join(str(random.randint(0,9)) for _ in range(9)),
        "department":dept,
        "designation":random.choice(desigs[dept]),
        "manager":man,
        "joining_date":fake.date_between("-3y","-30d"),
        "employment_type":"Full-Time",
        "basic_salary":random.randrange(30000,120001,1000),
        "status":"Active"
    })
emp_df=pd.DataFrame(emps)
emp_df.to_csv(OUT/"employees.csv",index=False)

leave_rows=[]
approved={}
types=["Annual","Sick","Casual"]
for _ in range(250):
    emp=random.choice(emps)["employee_id"]
    start=date(2025,1,1)+timedelta(days=random.randint(0,59))
    dur=random.randint(1,3)
    status=random.choices(["Approved","Pending","Rejected"],[0.6,0.2,0.2])[0]
    end=start+timedelta(days=dur-1)
    leave_rows.append([emp,start,end,random.choice(types),status])
    if status=="Approved":
        approved.setdefault(emp,set())
        for j in range(dur): approved[emp].add(start+timedelta(days=j))
leave_df=pd.DataFrame(leave_rows,columns=["employee_id","start_date","end_date","leave_type","status"])
leave_df.to_csv(OUT/"leave_requests.csv",index=False)

holiday_dates={datetime.strptime(d,"%Y-%m-%d").date() for d,_ in holidays}
att=[]
for e in emps:
    for off in range(60):
        d=date(2025,1,1)+timedelta(days=off)
        if d.weekday()>=5 or d in holiday_dates: continue
        if d in approved.get(e["employee_id"],set()): continue
        ci=datetime.combine(d,datetime.min.time()).replace(hour=9,minute=random.randint(0,35))
        hrs=round(random.uniform(7.2,9.8),2)
        co=ci+timedelta(hours=hrs)
        att.append([e["employee_id"],d,ci.time(),co.time(),hrs,"Yes" if ci.minute>15 else "No","Present"])
att_df=pd.DataFrame(att,columns=["employee_id","date","check_in","check_out","working_hours","late","status"])
att_df.to_csv(OUT/"attendance.csv",index=False)

pay=[]
for e in emps:
    b=e["basic_salary"]; hra=0.2*b; allow=0.1*b; pf=0.12*b; tax=0.08*b
    net=b+hra+allow-pf-tax
    pay.append([e["employee_id"],b,hra,allow,pf,tax,round(net,2)])
pd.DataFrame(pay,columns=["employee_id","basic_salary","hra","allowance","pf","tax","net_salary"]).to_csv(OUT/"payroll.csv",index=False)

print("Generated:")
for f in OUT.iterdir():
    print("-",f)
