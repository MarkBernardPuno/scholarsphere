import pytest
import requests
from faker import Faker

SIGN_UP_URL = "http://127.0.0.1:5000/v1/auth/signup"
LOGIN_URL = "http://127.0.0.1:5000/v1/auth/login"

@pytest.fixture(scope="module")
def fake():
    return Faker()

@pytest.fixture(scope="module")
def signup_and_login(fake):
    # Generate random data using Faker for signup
    data = {
        "name": fake.name(),
        "email": fake.email(),
        "password": fake.password(length=10),
        "dept_id": fake.random_int(min=1, max=7),
        "role": fake.random_element(elements=("Researcher", "User", "Admin"))
    }

    try:
        # Perform signup
        response = requests.post(SIGN_UP_URL, json=data)
        response.raise_for_status()  # Raise an error for non-2xx responses
    except requests.exceptions.RequestException as e:
        pytest.fail(f"Failed to execute POST request: {e}")

    # Assert signup was successful
    assert response.status_code == 200, f"Expected status code 200 but got {response.status_code}"
    assert response.json()["success"] is True, f"Signup was not successful: {response.json()['message']}"
    assert "User created successfully" in response.json()["message"], \
        f"Expected message 'User created successfully' but got {response.json()['message']}"

    # Return email and password for login test
    email = data["email"]
    password = data["password"]
    return {"email": email, "password": password}

def test_login_after_signup(signup_and_login):
    # Use the credentials from signup_and_login fixture
    data = {
        "email": signup_and_login["email"],
        "password": signup_and_login["password"]
    }

    try:
        # Perform login
        response = requests.post(LOGIN_URL, json=data)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        pytest.fail(f"Failed to execute POST request: {e}")

    # Assert login was successful
    assert response.status_code == 200, f"Expected status code 200 but got {response.status_code}"
    assert response.json()["success"] is True, f"Login was not successful: {response.json()['message']}"
    assert "Token created successfuly" in response.json()["message"], \
        f"Expected message 'Token created successfully' but got {response.json()['message']}"
