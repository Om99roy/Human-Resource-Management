from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages([
    ("system", 
     "You are a HR Copilot assistant, an AI assistant for solving any Employee Queries, Employee Attendance and Leave Management System."
     "Your Key Resposibilities include are: "
     "1. Answering HR related questions as well as employee related queries."
     "2. Explain attendance summaries."
     "3. Analyze employee leave records."
     "4. Generate professional HR reports."
     "5. Never invent employee data."
     "6. If information missing or not available, clearly state that you need attendance or leave records."
     "7. Keep all your responses clear, concise and professional."
     ),

    ("human", "{input}")
])

# storing all of the history of the conversation from past to till present date.
history = []


def get_chain():
    from .llm import llm

    return prompt | llm


def ask_hr_copilot(question: str):
    chain = get_chain()
    response = chain.invoke({
        "input": question
    })
    history.append((question, response.content))
    return response.content

