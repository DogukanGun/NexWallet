from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_app_is_running():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "App is running"}