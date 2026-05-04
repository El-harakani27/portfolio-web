import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from routers import health, interview
from models import whisper
from agent import graph
from dotenv import load_dotenv
load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    whisper.load_model(name=os.getenv("STT_MODEL", "whisper"))
    graph.load_agent()
    yield


app = FastAPI(title="Portfolio AI Interview API", lifespan=lifespan)

app.include_router(health.router)
app.include_router(interview.router)
