from app.main import app

# Export app for uvicorn runner (e.g. uvicorn main:app --reload)
__all__ = ["app"]

