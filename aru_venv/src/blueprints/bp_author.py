from db.engine import get_session
from flask import Blueprint, jsonify, request
from models.Author import Author
from models.AuthorResearch import AuthorResearch
from models.Category import Category
from models.Departments import Departments
from models.IncentivesApplication import IncentivesApplication
from models.Research import Research
from models.Users import Users

bp = Blueprint("bp_author", __name__, url_prefix="/v1/author")


def test(x):
    session = get_session(autocommit=False, autoflush=False)()
    return session.get(Users, x).role


@bp.route("/main", methods=["GET", "POST"])
# @jwt_required()
def handleAuthorGetPost():
    session = get_session(autocommit=False, autoflush=False)()
    if request.method == "GET":
        try:
            result = session.query(Author).all()
            data = []

            for i in result:
                try:
                    dept = session.get(
                        Departments, session.get(Users, i.author_id).dept_id
                    ).dept_name
                except:
                    dept = ""

                data.append(
                    {
                        "author_id": i.author_id,
                        "author_name": i.author_name,
                        "department": dept,
                    }
                )

            return jsonify(
                {"success": True, "message": f"Fetched all Authors", "data": data}
            ), 200
        except Exception as e:
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == "POST":
        author_name = request.get_json().get("author_name")
        new_data = Author(author_name)
        try:
            session.add(new_data)
            session.commit()
            return jsonify(
                {
                    "success": True,
                    "message": str(new_data),
                    "author_id": new_data.author_id,
                }
            ), 201
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    else:
        return jsonify({"success": False, "message": "Invalid request"}), 400


@bp.route("/<int:id>", methods=["GET", "PUT", "DELETE"])
# @jwt_required()
def handleAuthorItemRequests(id):
    session = get_session(autocommit=False, autoflush=False)()
    if request.method == "GET":
        try:
            result = session.query(Author).get(id)
            if result:
                return jsonify(
                    {
                        "success": True,
                        "message": f"Fetched record.",
                        "data": [
                            {
                                "author_id": result.author_id,
                                "author_name": result.author_name,
                            }
                        ],
                    }
                ), 200
            else:
                return jsonify({"success": False, "message": f"No result"}), 404
        except Exception as e:
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == "PUT":
        try:
            result = session.query(Author).get(id)
            if result:
                result.author_name = request.get_json().get("author_name")
                session.commit()
                return jsonify({"success": True, "message": f"Updated record."}), 200
            else:
                return jsonify({"success": False, "message": f"No result"}), 404
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == "DELETE":
        try:
            result = session.query(Author).get(id)
            if not result:
                return jsonify({"success": False, "error": "Author not found"}), 404
            session.delete(result)
            session.commit()
            return jsonify({"message": "Author deleted successfully"})
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    else:
        return jsonify({"success": False, "message": "Invalid request"}), 400


@bp.route("/researches/<int:author_id>", methods=["GET"])
def handleAuthorResearch(author_id):
    session = get_session(autocommit=False, autoflush=False)()
    try:
        query = (
            session.query(
                Research.research_id,
                Author.author_name,
                Departments.dept_name,
                Research.title,
                Research.presented_where,
                Research.presentation_location,
                Research.presentation_date,
                Research.published_where,
                Research.publication_date,
                Research.doi_or_full,
                Category.category_description,
            )
            .outerjoin(
                AuthorResearch, AuthorResearch.research_id == Research.research_id
            )
            .outerjoin(Author, Author.author_id == AuthorResearch.author_id)
            .outerjoin(Users, Users.user_id == Research.user_id)
            .outerjoin(Departments, Departments.dept_id == Users.dept_id)
            .outerjoin(
                IncentivesApplication,
                IncentivesApplication.research_id == Research.research_id,
            )
            .outerjoin(
                Category, Category.category_id == IncentivesApplication.category_id
            )
            .filter(AuthorResearch.author_id == author_id)
            .all()
        )

        if query:
            data = [
                {
                    "research_id": i.research_id,
                    "title": i.title,
                    "authors": i.author_name,
                    "publication": i.published_where,
                    "citations": "N/A",
                    "year": i.publication_date,
                }
                for i in query
            ]
            return jsonify(
                {
                    "success": True,
                    "message": "AuthorResearch is fetched succesfully",
                    "data": data,
                }
            ), 200
        else:
            return jsonify(
                {
                    "success": True,
                    "message": "AuthorResearch has no records",
                    "data": [],
                }
            ), 401
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"success": False, "message": str(e)}), 500


if __name__ == "__main__":
    print(test(4))
