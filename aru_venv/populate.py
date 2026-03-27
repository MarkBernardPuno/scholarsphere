import json
import random

import requests # type: ignore
from faker import Faker

fake = Faker()


def generateCategories():
    categories = [
        "Research Paper presented in National or International Conferences held within the Philippines",
        "First prize winning entry",
        "Research paper presented internationally and/or published in the conference proceedings",
        "Research paper published in a national refereed journal",
        "Research paper published in an international refereed journal",
        "Citation in a national refereed journal",
        "Citation in an international refereed journal",
    ]

    for i in categories:
        print(
            i,
            requests.post(
                "http://127.0.0.1:5000/v1/category/main",
                json={"category_description": i},
            ).json(),
        )


def generateDepartments():
    departments = [
        "Academic Research Unit",
        "Computer Engineering",
        "Infomation Technology",
        "Computer Science",
        "Mechanical Engineering",
        "Electronics and Communication Engineering",
        "Architecture",
        "Civil Engineering",
        "Information Systems",
        "Electrical Engineering",
        "Industrial Engineering",
        "Data Science and Analytics",
    ]
    for i in departments:
        print(
            i,
            requests.post(
                "http://127.0.0.1:5000/v1/departments/main", json={"dept_name": i}
            ).json(),
        )


def generateCampus(num_campus=None):
    campus = [
        "TIP Quezon City",
        "TIP Manila",
    ]
    for i in campus:
        print(
            i,
            requests.post(
                "http://127.0.0.1:5000/v1/campus/main", json={"camp_name": i}
            ).json(),
        )


def generateStatus():
    for i in [
        "Pending",
        "Disappoved",
        "Approved with Major Recommendations/Revisions",
        "Approved with Minor Recommendations/Revisions",
        "Approved No Revision",
    ]:
        post_response = requests.post(
            "http://127.0.0.1:5000/v1/status/main", json={"status_desc": i}
        )
        print(post_response.text)


def generateDeptAgendas():
    dept_response = requests.get("http://127.0.0.1:5000/v1/departments/main")
    if dept_response.status_code != 200:
        print("Failed to fetch department data:", dept_response.status_code)
        return
    dept_data = dept_response.json().get("data", [])

    for dept in dept_data:
        dept_id = dept["dept_id"]
        for _ in range(2):  # Create two deptagendas per department
            deptagenda_name = fake.sentence(nb_words=4)
            data = {"deptagenda_name": deptagenda_name, "dept_id": dept_id}
            response = requests.post(
                "http://127.0.0.1:5000/v1/deptagenda/main",
                json=data,
                headers={"Content-Type": "application/json"},
            )
            print(response.text)


def generateInstAgenda(amount):
    for i in range(amount):
        data = {"instagenda_name": fake.sentence()}
        print(data)
        response = requests.post(
            "http://127.0.0.1:5000/v1/instagenda/main",
            json=data,
            headers={"Content-Type": "application/json"},
        )
        print(response.text)


def generateKeywords(amount):
    for i in range(amount):
        data = {"keywords_name": fake.word()}
        print(data)
        response = requests.post(
            "http://127.0.0.1:5000/v1/keywords/main",
            json=data,
            headers={"Content-Type": "application/json"},
        )
        print(response.text)


# List of predefined journal and conference names
journal_names = [
    "IEEE",
    "Journal of Science and Medicine",
    "International Journal of Technology",
    "Advances in Engineering",
    "Computing Research Review",
    "Environmental Studies Journal",
    "Health and Medical Sciences",
    "Educational Research and Reviews",
    "Economic Analysis and Policy",
]

conference_names = [
    "International Conference on Computer Science",
    "Global Summit on Health and Medicine",
    "World Congress on Environmental Science",
    "Annual Meeting of Technology Innovators",
    "Symposium on Advanced Engineering",
    "Conference on Emerging Educational Research",
    "Economic Forum for Policy Makers",
    "Medical and Health Science Expo",
    "International Symposium on Environmental Studies",
]

campus_ids = [1, 2]


def generateResearch(amount):
    user_ids = [
        i["user_id"]
        for i in requests.get("http://127.0.0.1:5000/v1/users/main").json()["data"]
    ]
    campus_data = requests.get("http://127.0.0.1:5000/v1/campus/main").json()["data"]
    campus_ids = [i["camp_id"] for i in campus_data]

    for _ in range(amount):
        journal_name = random.choice(journal_names)
        conference_name = random.choice(conference_names)
        year = fake.year()

        published_where = f"{journal_name} {year}"
        presented_where = f"{conference_name} {year}"

        # Ensure data length is within limits
        title = fake.sentence()[:255]
        abstract = fake.paragraph(nb_sentences=10)[:255]
        presentation_location = fake.city()[:255]
        cited_where = fake.company()[:255]
        doi_or_full = fake.url()[:255]

        camp_id = random.choice(campus_ids)

        data = {
            "title": title,
            "abstract": abstract,
            "presented_where": presented_where,
            "presentation_location": presentation_location,
            "presentation_date": fake.date(),
            "published_where": published_where,
            "publication_date": fake.date(),
            "cited_where": cited_where,
            "cited_date": fake.date(),
            "doi_or_full": doi_or_full,
            "user_id": random.choice(user_ids),
            "camp_id": camp_id,
        }

        print(data)
        response = requests.post(
            "http://127.0.0.1:5000/v1/researches/main",
            json=data,
            headers={"Content-Type": "application/json"},
        )
        print(response.text)


def generateUsers(amount):
    deptIds = [
        i["dept_id"]
        for i in requests.get("http://127.0.0.1:5000/v1/departments/main").json()[
            "data"
        ]
    ]

    campIds = [
        i["camp_id"]
        for i in requests.get("http://127.0.0.1:5000/v1/campus/main").json()["data"]
    ]

    for i in range(amount):
        data = json.dumps(
            {
                "name": fake.name(),
                "email": fake.email(),
                "password": fake.password(length=10),
                "role": random.choice(
                    ["Researcher", "Program Chair", "Research Admin"]
                ),
                "dept_id": random.choice(deptIds),
                "camp_id": random.choice(campIds),
                "activated": "False",
            }
        )
        print(data)
        print(
            requests.post(
                "http://127.0.0.1:5000/v1/auth/signup",
                data=data,
                headers={"Content-Type": "application/json"},
            ).text
        )


def generateAuthorResearch(author_index, research_index, limit):
    author_response = requests.get("http://127.0.0.1:5000/v1/author/main")
    if author_response.status_code != 200:
        print("Failed to fetch author data:", author_response.status_code)
        return
    author_data = author_response.json().get("data", [])
    num_authors = len(author_data)

    research_response = requests.get("http://127.0.0.1:5000/v1/researches/data")
    if research_response.status_code != 200:
        print("Failed to fetch research data:", research_response.status_code)
        return
    research_data = research_response.json().get("data", [])
    num_researches = len(research_data)

    for i in range(limit):
        author_id = author_data[(author_index + i) % num_authors]["author_id"]
        research_id = research_data[(research_index + i) % num_researches][
            "research_id"
        ]

        post_response = requests.post(
            "http://127.0.0.1:5000/v1/authorresearch/main",
            json={"author_id": author_id, "research_id": research_id},
        )
        print(post_response.text)


def generateResearchDepartment(dept_index, research_index, limit):
    dept_response = requests.get("http://127.0.0.1:5000/v1/departments/main")
    if dept_response.status_code != 200:
        print("Failed to fetch department data:", dept_response.status_code)
        return
    dept_data = dept_response.json().get("data", [])
    num_depts = len(dept_data)

    research_response = requests.get("http://127.0.0.1:5000/v1/researches/data")
    if research_response.status_code != 200:
        print("Failed to fetch research data:", research_response.status_code)
        return
    research_data = research_response.json().get("data", [])
    num_researches = len(research_data)

    for i in range(limit):
        dept_id = dept_data[(dept_index + i) % num_depts]["dept_id"]
        research_id = research_data[(research_index + i) % num_researches][
            "research_id"
        ]

        print(f"Assigning dept_id: {dept_id} to research_id: {research_id}")

        post_response = requests.post(
            "http://127.0.0.1:5000/v1/researchdepartment/main",
            json={"dept_id": dept_id, "research_id": research_id},
        )
        print(post_response.text)


def generateResearchKeywords(keyword_index, research_index, limit):
    keyword_response = requests.get("http://127.0.0.1:5000/v1/keywords/main")
    if keyword_response.status_code != 200:
        print("Failed to fetch keywords data:", keyword_response.status_code)
        return
    keyword_data = keyword_response.json().get("data", [])
    num_keywords = len(keyword_data)

    research_response = requests.get("http://127.0.0.1:5000/v1/researches/data")
    if research_response.status_code != 200:
        print("Failed to fetch research data:", research_response.status_code)
        return
    research_data = research_response.json().get("data", [])
    num_researches = len(research_data)

    for i in range(limit):
        keywords_id = keyword_data[(keyword_index + i) % num_keywords]["keywords_id"]
        research_id = research_data[(research_index + i) % num_researches][
            "research_id"
        ]

        post_response = requests.post(
            "http://127.0.0.1:5000/v1/researchkeywords/main",
            json={"keywords_id": keywords_id, "research_id": research_id},
        )
        print(post_response.text)


def generateResearchDeptAgenda(deptagenda_index, research_index, limit):
    deptagenda_response = requests.get("http://127.0.0.1:5000/v1/deptagenda/main")
    if deptagenda_response.status_code != 200:
        print("Failed to fetch keywords data:", deptagenda_response.status_code)
        return
    deptagenda_data = deptagenda_response.json().get("data", [])
    num_deptagenda = len(deptagenda_data)

    research_response = requests.get("http://127.0.0.1:5000/v1/researches/data")
    if research_response.status_code != 200:
        print("Failed to fetch research data:", research_response.status_code)
        return
    research_data = research_response.json().get("data", [])
    num_researches = len(research_data)

    for i in range(limit):
        deptagenda_id = deptagenda_data[(deptagenda_index + i) % num_deptagenda][
            "deptagenda_id"
        ]
        research_id = research_data[(research_index + i) % num_researches][
            "research_id"
        ]

        post_response = requests.post(
            "http://127.0.0.1:5000/v1/researchdeptagenda/main",
            json={"deptagenda_id": deptagenda_id, "research_id": research_id},
        )
        print(post_response.text)


def generateResearchInstAgenda(instagenda_index, research_index, limit):
    instagenda_response = requests.get("http://127.0.0.1:5000/v1/instagenda/main")
    if instagenda_response.status_code != 200:
        print("Failed to fetch keywords data:", instagenda_response.status_code)
        return
    instagenda_data = instagenda_response.json().get("data", [])
    num_instagenda = len(instagenda_data)

    research_response = requests.get("http://127.0.0.1:5000/v1/researches/data")
    if research_response.status_code != 200:
        print("Failed to fetch research data:", research_response.status_code)
        return
    research_data = research_response.json().get("data", [])
    num_researches = len(research_data)

    for i in range(limit):
        instagenda_id = instagenda_data[(instagenda_index + i) % num_instagenda][
            "instagenda_id"
        ]
        research_id = research_data[(research_index + i) % num_researches][
            "research_id"
        ]

        post_response = requests.post(
            "http://127.0.0.1:5000/v1/researchinstagenda/main",
            json={"instagenda_id": instagenda_id, "research_id": research_id},
        )
        print(post_response.text)


if __name__ == "__main__":
    # "CATEGORIES"
    generateCategories()

    # "DEPARTMENTS"
    generateDepartments()

    # "CAMPUS"
    generateCampus()

    # # "USERS AND AUTHORS"
    # generateUsers(10)

    # # "KEYWORDS"
    # generateKeywords(200)

    # # "DEPTAGENDA"
    # generateDeptAgendas()

    # # # "INSTAGENDA"
    # generateInstAgenda(10)

    # # # "RESEARCHES"
    # generateResearch(20)

    # # "STATUS"
    generateStatus()

    # research_index = 0
    # author_index = 0
    # dept_index = 0
    # keyword_index = 0
    # limit = 20

    # generateAuthorResearch(author_index, research_index, limit)

    # generateResearchDepartment(dept_index, research_index, limit)

    # generateResearchKeywords(keyword_index, research_index, limit)

    # generateResearchDeptAgenda(dept_index, research_index, limit)

    # generateResearchInstAgenda(dept_index, research_index, limit)
