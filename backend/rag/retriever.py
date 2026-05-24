import os
# from langchain_community.vectorstores import FAISS
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
# INDEX_PATH = os.path.join(os.path.dirname(__file__), "faiss-cv-v1")
CHROMA_PATH = os.path.join(os.path.dirname(__file__), "chroma-cv-v2")

_vectorstore = None

def load_retriever():
    global _vectorstore
    print("  creating embeddings model...")
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2",
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True},
    )
    print("  loading Chroma index...")
    _vectorstore = Chroma(
        persist_directory=CHROMA_PATH,
        embedding_function=embeddings,
        collection_name="cv_knowledge",
    )
    print("RAG retriever loaded")


def search(query: str, k: int = 3) -> str:
    docs = _vectorstore.similarity_search(query, k=k)
    chunks = []
    for doc in docs:
        header = " > ".join(doc.metadata.values())
        chunks.append(f"{header}\n{doc.page_content}" if header else doc.page_content)
    return "\n\n".join(chunks)
