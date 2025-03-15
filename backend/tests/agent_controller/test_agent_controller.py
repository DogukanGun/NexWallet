from fastapi.testclient import TestClient
from unittest import TestCase
from main import app
from models import TwitterUsers
from models.chain import Agents
from utils.database import Database


class TestAgentController(TestCase):

    def setUp(self):
        self.user = TwitterUsers(id=0, user_id="test_id", username="test_username", name="test_name")
        self.client = TestClient(app)
        self.db = Database().get_session()
        self.create_user()
        res = self.client.post(
            "auth/token",
            json={
                "user_id":"test_id"
            }
        )
        data_as_json = res.json()
        self.token = data_as_json["token"]

    def create_user(self):
        self.db.add(self.user)
        self.db.commit()

    def delete_user(self):
        self.db.delete(self.user)
        self.db.commit()

    def test_save_agent_controller(self):
        # ACT
        self.client.post(
            "/agent/save",
            json={
                "agent_id": "test_id",
                "agent_name": "test_name"
            },
            headers={"Authorization": f"Bearer {self.token}"}
        )

        # ASSERT
        agent = self.db.query(Agents).filter(Agents.id == "test_id").first()
        assert agent.name == "test_name"
