"""
Run once to build the Chroma index from the knowledge base.
Usage: python rag/build_index.py
"""
import sys
print("Python:", sys.executable)
import os
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import MarkdownHeaderTextSplitter
# from langchain_community.vectorstores import FAISS
from langchain_chroma import Chroma
from langchain_community.embeddings import FastEmbedEmbeddings

KB_PATH = os.path.join(os.path.dirname(__file__), "../knowledge_base/cv.md")
# INDEX_PATH = os.path.join(os.path.dirname(__file__), "faiss-cv-v1")
CHROMA_PATH = os.path.join(os.path.dirname(__file__), "chroma-cv-v3")


def build():
    # Load the markdown file
    loader = TextLoader(KB_PATH, encoding="utf-8")
    docs = loader.load()
    embeddings = FastEmbedEmbeddings(model_name="BAAI/bge-small-en-v1.5")
    print(embeddings)
    # Split only at section level (##) so all experiences stay together,
    # all projects stay together, etc. Splitting at ### fragments them into
    # individual chunks which causes incomplete retrieval.
    splitter = MarkdownHeaderTextSplitter(
        headers_to_split_on=[
            ("#", "title"),
            ("##", "section"),
        ]
    )
    chunks = splitter.split_text(docs[0].page_content)

    print(f"Total chunks: {len(chunks)}")
    for i, chunk in enumerate(chunks):
        print(f"  [{i}] {chunk.metadata} — {len(chunk.page_content)} chars")


    # # Build and save FAISS index
    # vectorstore = FAISS.from_documents(chunks, embeddings)
    # vectorstore.save_local(INDEX_PATH)
    # print(f"Index saved to {INDEX_PATH}")

    if not chunks:
        raise ValueError("No chunks produced — check KB_PATH and markdown headers")

    Chroma.from_documents(
        chunks,
        embeddings,
        persist_directory=CHROMA_PATH,
        collection_name="cv_knowledge",
    )
    print(f"Chroma index saved to {CHROMA_PATH}")


if __name__ == "__main__":
    build()
