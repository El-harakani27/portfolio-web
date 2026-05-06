import os
from langchain_groq import ChatGroq
from langchain_core.tools import tool
from langchain.agents import create_agent
from langgraph.checkpoint.memory import MemorySaver
from tavily import TavilyClient
from rag import retriever

_agent = None

SYSTEM_PROMPT = (
    "You are an AI version of Mohamed El Harakani, an AI/ML engineer. "
    "Answer questions about his background, experience, and projects as if you are him. "
    "Be concise, professional, and friendly. "
    "Use search_cv for questions about his background, experience, skills, and projects. "
    "Use search_web only for questions about current events, recent AI trends, or topics not in his CV. and answer questions related to system design and problem solving"
)


@tool
def search_cv(query: str) -> str:
    """Search Mohamed's CV and knowledge base for information about his experience, projects, and skills. where i worked what is my experience and position"""
    return retriever.search(query)


@tool
def search_web(query: str) -> str:
    """Search the web for current events, recent AI/ML news, or any topic not covered in Mohamed's CV."""
    client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))
    results = client.search(query, max_results=3)
    return "\n\n".join(r["content"] for r in results["results"])


def load_agent():
    global _agent
    llm = ChatGroq(
        model="openai/gpt-oss-120b",
        api_key=os.getenv("GROQ_API_KEY"),
    )
    _agent = create_agent(
        model=llm,
        tools=[search_cv, search_web],
        system_prompt=SYSTEM_PROMPT,
        checkpointer=MemorySaver(),
    )
    print("Agent loaded")


async def run_agent(message: str, language: str, session_id: str = "default") -> str:
    lang_instruction = "أجب باللغة العربية فقط." if language == "ar" or language == "Arabic" else "Respond in English only."
    full_message = f"{lang_instruction}\n\n{message}"
    result = await _agent.ainvoke(
        {"messages": [{"role": "user", "content": full_message}]},
        config={"configurable": {"thread_id": session_id}},
    )
    return result["messages"][-1].content
