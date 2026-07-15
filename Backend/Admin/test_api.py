import json
import uuid
from urllib import request, error

BASE = "http://127.0.0.1:8000"


def post_json(path: str, payload: dict):
    url = BASE + path
    data = json.dumps(payload).encode("utf-8")
    req = request.Request(url, data=data, headers={"Content-Type": "application/json"}, method="POST")
    try:
        with request.urlopen(req, timeout=10) as resp:
            return resp.getcode(), json.load(resp)
    except error.HTTPError as e:
        try:
            body = e.read().decode()
            return e.code, json.loads(body)
        except Exception:
            return e.code, {"error": str(e)}
    except Exception as e:
        return None, {"error": str(e)}


def get(path: str, token: str = None):
    url = BASE + path
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = request.Request(url, headers=headers, method="GET")
    try:
        with request.urlopen(req, timeout=10) as resp:
            return resp.getcode(), json.load(resp)
    except error.HTTPError as e:
        try:
            body = e.read().decode()
            return e.code, json.loads(body)
        except Exception:
            return e.code, {"error": str(e)}
    except Exception as e:
        return None, {"error": str(e)}


def main():
    unique = uuid.uuid4().hex[:8]
    email = f"test_{unique}@example.com"
    password = "Password1"

    print("== Registering user ==")
    status, res = post_json("/auth/register", {"email": email, "full_name": "Test User", "password": password})
    print(status, res)

    print("== Logging in ==")
    status, res = post_json("/auth/login", {"email": email, "password": password})
    print(status, res)

    if status == 200 and isinstance(res, dict) and "access_token" in res:
        token = res.get("access_token")
        print("== Calling /api/me ==")
        s2, r2 = get("/api/me", token)
        print(s2, r2)
    else:
        print("Login failed, skipping /api/me test")


if __name__ == "__main__":
    main()
