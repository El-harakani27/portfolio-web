"""
Run once to build the FAISS index from the knowledge base.
Usage: python rag/build_index.py
"""
import os
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import MarkdownHeaderTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings

KB_PATH = os.path.join(os.path.dirname(__file__), "../knowledge_base/cv.md")
INDEX_PATH = os.path.join(os.path.dirname(__file__), "faiss_index-small")


def build():
    # Load the markdown file
    loader = TextLoader(KB_PATH, encoding="utf-8")
    docs = loader.load()

    # Split by markdown headers so each section stays meaningful
    splitter = MarkdownHeaderTextSplitter(
        headers_to_split_on=[
            ("#", "title"),
            ("##", "section"),
            ("###", "subsection"),
        ]
    )
    chunks = splitter.split_text(docs[0].page_content)

    print(f"Total chunks: {len(chunks)}")
    for i, chunk in enumerate(chunks):
        print(f"  [{i}] {chunk.metadata} — {len(chunk.page_content)} chars")

    # Embed with multilingual-e5-large
    embeddings = HuggingFaceEmbeddings(
        model_name="intfloat/multilingual-e5-small"
    )

    # Build and save FAISS index
    vectorstore = FAISS.from_documents(chunks, embeddings)
    vectorstore.save_local(INDEX_PATH)
    print(f"Index saved to {INDEX_PATH}")


if __name__ == "__main__":
    build()
