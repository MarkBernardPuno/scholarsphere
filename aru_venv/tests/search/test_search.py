import json
from lib2to3.pytree import LeafPattern
from pydantic_core import Url
import requests
import string
# import { BASE_URL } '

def test_search_query():
    url = "http://127.0.0.1:5000/v1/search"
    response = requests.get(url, params={"q": "test"})
    assert response.status_code == 200
    assert response.json()  # Check if there is any JSON content returned

# def test_search_endpoint():
#     url = "http://127.0.0.1:5000/v1/search"
#     response = requests.get(url)

#     assert response.status_code == 200
#     assert response.json()  # Check if there is any JSON content returned
#     print(response.json())

#     # data = json.dumps(response.json())
#     data = response.json()['data'][0]['inst_agenda']
#     # print(data[0]['inst_agenda'])
#     assert data ==