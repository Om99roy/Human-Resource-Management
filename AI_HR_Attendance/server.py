from __future__ import annotations
 
import inspect
from pathlib import Path
from typing import Optional

import uvicorn
 
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
 
from langgraph.checkpoint.memory import InMemorySaver
from langchain_ollama import ChatOllama
from deepagents import create_deep_agent
 
from analytics import (
    get_emps_summary,
    search_employee,
    generate_excel_report,
    get_payroll_summary,
    get_attendance_risk_report,
)
 
# ---------------------------------------------------------------------------
# Model
# ---------------------------------------------------------------------------
 
llm = ChatOllama(
    model="phi3:mini",
    temperature=0,
    num_predict=512,  # 120 was too tight for multi-step tool-calling reasoning
)
 
checkpointer = InMemorySaver()
 
# ---------------------------------------------------------------------------
# Sub-agents
# ---------------------------------------------------------------------------
 
chat_agent = {
    "name": "chat-agent",
    "description": (
        "General-purpose conversational agent. Use for greetings, small talk, "
        "clarifying questions, or any HR question that does not require "
        "looking at data."
    ),
    "system_prompt": (
        "You are the Chat sub-agent of HR Copilot. Answer conversationally and "
        "professionally. Never invent employee data. If the question actually "
        "needs data (attendance, payroll, leave, employee lookup), say so "
        "instead of guessing an answer."
    ),
    "tools": [],
}
 
search_agent = {
    "name": "search-agent",
    "description": (
        "Looks up employees, departments, or managers by name, ID, or "
        "department. Use whenever the user asks 'who is', 'find employee X', "
        "'which department is Y in', etc."
    ),
    "system_prompt": (
        "You are the Search sub-agent. Use the search_employee tool to find "
        "matching employees, departments, or managers. Never fabricate a "
        "match — if nothing is found, say so clearly and suggest the user "
        "check the spelling or ID."
    ),
    "tools": [search_employee],
}
 
attendance_agent = {
    "name": "attendance-agent",
    "description": (
        "Answers attendance, absenteeism, lateness, and leave-risk questions "
        "for a specific employee or across departments."
    ),
    "system_prompt": (
        "You are the Attendance-tracking sub-agent. Use get_emps_summary for "
        "a single employee's attendance stats, and get_attendance_risk_report "
        "for department-wide or company-wide attendance risk and flagged "
        "employees. Base every number on tool output — never estimate or "
        "round in your head."
    ),
    "tools": [get_emps_summary, get_attendance_risk_report],
}
 
excel_agent = {
    "name": "excel-generator-agent",
    "description": (
        "Generates downloadable Excel (.xlsx) reports of employee, "
        "attendance, payroll, or leave data. Use when the user asks to "
        "'export', 'download', or 'generate a spreadsheet/report'."
    ),
    "system_prompt": (
        "You are the Excel Generator sub-agent. Use the generate_excel_report "
        "tool to build the requested spreadsheet, then return the exact file "
        "path from the tool result to the user."
    ),
    "tools": [generate_excel_report],
}
 
payroll_agent = {
    "name": "payroll-agent",
    "description": (
        "Answers payroll, salary, and compensation questions for a specific "
        "employee."
    ),
    "system_prompt": (
        "You are the Payroll sub-agent. Use get_payroll_summary for payroll "
        "figures. Only look up payroll data when an employee ID is explicitly "
        "given — never guess an employee ID, and never invent salary figures."
    ),
    "tools": [get_payroll_summary],
}
 
# ---------------------------------------------------------------------------
# Router / top-level deep agent
# ---------------------------------------------------------------------------
 
ROUTER_INSTRUCTIONS = """
You are HR Copilot's Router Agent.
 
Read the user's question and delegate to the right sub-agent(s), then relay
their answer back to the user in your own words:
 
- chat-agent            general conversation / clarification
- search-agent          finding employees, departments, managers
- attendance-agent      attendance, lateness, absenteeism, leave risk
- excel-generator-agent exporting / generating spreadsheet reports
- payroll-agent         salary and compensation questions
 
Decision rules:
1. Never invent employee, attendance, or payroll data — every number must
   come from a tool call made by a sub-agent.
2. If a question spans more than one domain (e.g. "show me attendance risk
   and export it to Excel"), call the relevant sub-agents in sequence and
   combine their results into one coherent answer.
3. If required information is missing (e.g. an employee ID for a payroll
   question), ask the user for it instead of guessing.
4. Keep the final answer under 150 words unless the user explicitly asked
   for a full report or export.
5. If a sub-agent returns an error or "not_found" result, surface that
   plainly instead of papering over it.
"""
 
deep_agent_kwargs = {
    "model": llm,
    "tools": [
        get_emps_summary,
        search_employee,
        generate_excel_report,
        get_payroll_summary,
        get_attendance_risk_report,
    ],
    "subagents": [chat_agent, search_agent, attendance_agent, excel_agent, payroll_agent],
    "checkpointer": checkpointer,
}

if "system_prompt" in inspect.signature(create_deep_agent).parameters:
    deep_agent_kwargs["system_prompt"] = ROUTER_INSTRUCTIONS
elif "instructions" in inspect.signature(create_deep_agent).parameters:
    deep_agent_kwargs["instructions"] = ROUTER_INSTRUCTIONS
else:
    raise TypeError("Unsupported create_deep_agent signature")

deep_agent = create_deep_agent(**deep_agent_kwargs)
 
# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
#
# NOTE on langserve: `add_routes` expects a runnable whose input/output
# shape is simple (string in, string/object out). The deep agent is a
# langgraph StateGraph that takes/returns a `{"messages": [...]}` dict, and
# deepagents' subagent routing doesn't map cleanly onto langserve's default
# schema inference. Rather than fight that mismatch, this exposes a plain
# FastAPI endpoint (`/ask-hr-copilot`) that invokes the graph directly and
# extracts the final message — this is the reliable path end-to-end.
# If you specifically need a langserve-compatible endpoint too, that's a
# separate, narrower runnable and I can add it once the deep_agent wiring
# above is confirmed working against your real datasets.
 
app = FastAPI(title="HR Copilot Server")
 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
 
history: list[dict] = []
 
 
class AskRequest(BaseModel):
    question: str
    thread_id: Optional[str] = "default"
 
 
class AskResponse(BaseModel):
    answer: str
    thread_id: str
 
 
def ask_hr_copilot(question: str, thread_id: str = "default") -> str:
    """Invoke the router deep agent and return its final text answer."""
    config = {"configurable": {"thread_id": thread_id}}
    result = deep_agent.invoke(
        {"messages": [{"role": "user", "content": question}]},
        config=config,
    )
    final_message = result["messages"][-1]
    answer = getattr(final_message, "content", None)
    if answer is None and isinstance(final_message, dict):
        answer = final_message.get("content", "")
    answer = answer or ""
 
    history.append({"question": question, "answer": answer, "thread_id": thread_id})
    return answer
 
 
@app.post("/ask-hr-copilot", response_model=AskResponse)
def ask(request: AskRequest) -> AskResponse:
    answer = ask_hr_copilot(request.question, request.thread_id)
    return AskResponse(answer=answer, thread_id=request.thread_id)
 
 
@app.get("/history")
def get_history():
    return history
 
 
@app.get("/health")
def health():
    return {"status": "ok"}
 
 
def main() -> None:
    print(ask_hr_copilot("Summarize attendance risks for this week."))
 
 
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)