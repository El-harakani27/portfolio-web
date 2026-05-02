from fastapi import FastAPI

app = FastAPI(title="Portfolio AI Interview API")


@app.get("/health")
def health():
    return {"status": "ok"}
