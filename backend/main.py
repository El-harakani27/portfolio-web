import os
import pyarrow  # must be imported before asyncio starts (Windows access violation fix)
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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
    whisper.load_model(name=os.getenv("STT_MODEL", "whisper-large-v3-turbo"))
    print("Loading agent...")
    graph.load_agent()
    yield


app = FastAPI(title="Portfolio AI Interview API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(interview.router)
