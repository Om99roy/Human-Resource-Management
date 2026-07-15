from fastapi.testclient import TestClient
from main import app


def run():
    client = TestClient(app)

    unique = "tc"
    email = f"{unique}@example.com"
    password = "Password1"

    r = client.post("/auth/register", json={"email": email, "full_name": "TC", "password": password})
    print('register', r.status_code, r.json())

    r = client.post("/auth/login", json={"email": email, "password": password})
    print('login', r.status_code, r.json())
    if r.status_code == 200:
        token = r.json().get('access_token')
        h = {"Authorization": f"Bearer {token}"}
        r2 = client.get('/api/me', headers=h)
        print('me', r2.status_code, r2.json())


if __name__ == '__main__':
    run()
