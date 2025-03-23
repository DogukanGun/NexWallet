from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from controllers import auth_controller,agent_controller, twitter_controller, page_manager_controller, clone_voice_controller
from starlette.middleware.sessions import SessionMiddleware

app = FastAPI(
    title="API Project",
    description="Work in progress",
    version='0.1',
    swagger_ui_parameters={"docExpansion": "none"},
)
routers = [
    auth_controller.router,
    agent_controller.router,
    clone_voice_controller.router,
    twitter_controller.router,
    page_manager_controller.router
]

app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000","https://ai.nexarb.com"]
, allow_methods=["*"], allow_headers=["*"],
                   allow_credentials=True)
app.add_middleware(SessionMiddleware, secret_key='your_secret_key',session_cookie="session")

for router in routers:  # routers_test
    app.include_router(router)

@app.get("/")
def read_root():
    return {"message": "App is running"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "q": q}


if __name__ == "__main__":
    import uvicorn
    from os import getenv

    host = getenv("HOST", "0.0.0.0")
    port = int(getenv("PORT", "8080"))  # Default port is 8080 if not specified
    uvicorn.run(app, host=host, port=port)