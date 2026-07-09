from langchain_ollama import ChatOllama
from langchain.agents import create_agent, Agent_Executor

llm = ChatOllama(
    model="phi3:mini",
    temperature=0,
    output_parser = StrOutputParser()
    num_predict=120
)
# Add tools
tools = [employee_summary,
         attendance_percent,
         total_days,
         present_days,
         late_days,
         absent_days,
         half_days,
         leave_days,

]


def main() -> None:
    from .prompts import ask_hr_copilot

    print(ask_hr_copilot("Explain attendance summaries."))


if __name__ == "__main__":
    main()