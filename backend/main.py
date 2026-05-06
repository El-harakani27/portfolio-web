import os
import pyarrow  # must be imported before asyncio starts (Windows access violation fix)
from contextlib import asynccontextmanager
from fastapi import FastAPI
from routers import health, interview
from models import whisper
from agent import graph
from rag import retriever
from dotenv import load_dotenv
load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Loading retriever...")
    retriever.load_retriever()
    print("Loading whisper...")
    whisper.load_model(name=os.getenv("STT_MODEL", "whisper"))
    print("Loading agent...")
    graph.load_agent()
    yield


app = FastAPI(title="Portfolio AI Interview API", lifespan=lifespan)

app.include_router(health.router)
app.include_router(interview.router)
