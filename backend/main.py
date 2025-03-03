from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from controllers import auth,agent_controller
app = FastAPI(
    title="API Project",
    description="Work in progress",
    version='0.1',
    swagger_ui_parameters={"docExpansion": "none"},
)
routers = [
    auth.router,
    agent_controller.router
]

for router in routers:  # routers_test
    app.include_router(router)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"],
                   allow_credentials=True)

@app.get("/")
def read_root():
    return {"message": "Welcome to FastAPI!"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "q": q}


if __name__ == "__main__":
    import uvicorn
    from os import getenv

    host = getenv("HOST", "0.0.0.0")
    port = int(getenv("PORT", "8080"))  # Default port is 8080 if not specified
    uvicorn.run(app, host=host, port=port)