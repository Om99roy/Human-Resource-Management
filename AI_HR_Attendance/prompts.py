from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages([
    ("system", 
     """
You are HR Copilot.

Answer HR, attendance and leave questions professionally.

Never invent employee data.

Keep answers under 100 words.
"""
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

