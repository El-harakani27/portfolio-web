import os
from langchain_groq import ChatGroq
from langchain_core.tools import tool
from langchain.agents import create_agent
from langgraph.checkpoint.memory import MemorySaver
from tavily import TavilyClient
from rag import retriever

_agent = None

SYSTEM_PROMPT = (
    "You are Mohamed El Harakani. Respond exactly as Mohamed would in a casual text or chat conversation — "
    "first person, no AI disclaimers, no 'As Mohamed' or 'As an AI'. Just speak as him naturally.\n\n"

    "Tone & style:\n"
    "- Professional but human — like a confident engineer in a job interview who is also easy to talk to\n"
    "- Warm and direct, not stiff or corporate, not overly casual either\n"
    "- Keep answers focused — 2 to 4 sentences is usually enough; only go longer when the question needs real depth\n"
    "- Avoid bullet-point lists and bold headers unless the user explicitly asks for a structured breakdown\n"
    "- Avoid filler phrases like 'Great question!', 'Certainly!', 'Of course!'\n"
    "- It's fine to say 'I', 'me', 'my' — you are Mohamed\n"
    "- When talking about your work, show quiet confidence — highlight impact and decisions, not just tasks\n\n"

    "Knowledge:\n"
    "- Don't depend on history you must use search_cv every time"
    "- Call *search_cv* on EVERY new user question — to have the best answer for questions related to experiences and projects **DO NOT COUNT ON HISTORY MESSAGES ONLY**.\n"
    "- If the CV results are empty, irrelevant, or don't answer the question well, then use search_web or answer from your own knowledge\n"
    "- If you don't know something even after searching, say so briefly and honestly — don't make things up\n"
)


@tool(parse_docstring=True)
def search_cv(query: str) -> str:
    """Search Mohamed's CV and knowledge base for information about his background, experience, skills, and projects.

    Args:
        query: A specific question or topic to look up, e.g. 'work experience', 'machine learning projects', 'education'.
    """
    return retriever.search(query)


@tool
def search_web(query: str) -> str:
    """Search the web for current events, recent AI/ML news, or any topic not covered in Mohamed's CV."""
    api_key = os.getenv("TAVILY_API_KEY")
    if not api_key:
        return "Web search is unavailable right now."
    try:
        client = TavilyClient(api_key=api_key)
        results = client.search(query, max_results=3)
        return "\n\n".join(r.get("content", "") for r in results.get("results", []))
    except Exception as e:
        return f"Web search failed: {e}"


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


async def run_agent(message: str, session_id: str = "default") -> str:
    result = await _agent.ainvoke(
        {"messages": [{"role": "user", "content": message}]},
        config={"configurable": {"thread_id": session_id}},
    )
    return result["messages"][-1].content
