import os
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
import torch
INDEX_PATH = os.path.join(os.path.dirname(__file__), "faiss_index")

_vectorstore = None
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

def load_retriever():
    global _vectorstore
    print("  creating embeddings model...")
    embeddings = HuggingFaceEmbeddings(
        model_name="intfloat/multilingual-e5-large",
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True},
    )
    print("  loading FAISS index...")
    _vectorstore = FAISS.load_local(
        INDEX_PATH,
        embeddings,
        allow_dangerous_deserialization=True,
    )
    print("RAG retriever loaded")


def search(query: str, k: int = 3) -> str:
    docs = _vectorstore.similarity_search(query, k=k)
    chunks = []
    for doc in docs:
        header = " > ".join(doc.metadata.values())
        chunks.append(f"{header}\n{doc.page_content}" if header else doc.page_content)
    return "\n\n".join(chunks)
