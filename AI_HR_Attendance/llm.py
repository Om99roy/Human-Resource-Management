from langchain_ollama import ChatOllama

llm = ChatOllama(
    model="phi3:mini",
    temperature=0,
    num_predict=80
)


def main() -> None:
    from .prompts import ask_hr_copilot

    print(ask_hr_copilot("Explain attendance summaries."))


if __name__ == "__main__":
    main()