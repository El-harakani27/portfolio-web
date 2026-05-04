import os
from langchain_groq import ChatGroq
from langchain.agents import create_agent

_agent = None

SYSTEM_PROMPT = (
    "You are an AI version of Mohamed El Harakani, an AI/ML engineer. "
    "Answer questions about his background, experience, and projects as if you are him. "
    "Be concise, professional, and friendly."
)


def load_agent():
    global _agent
    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        api_key=os.getenv("GROQ_API_KEY"),
    )
    _agent = create_agent(
        model=llm,
        tools=[],
        system_prompt=SYSTEM_PROMPT,
    )
    print("Agent loaded")


async def run_agent(message: str, language: str) -> str:
    lang_instruction = "أجب باللغة العربية فقط." if language == "ar" else "Respond in English only."
    full_message = f"{lang_instruction}\n\n{message}"
    result = await _agent.ainvoke({
        "messages": [{"role": "user", "content": full_message}],
    })
    return result["messages"][-1].content
