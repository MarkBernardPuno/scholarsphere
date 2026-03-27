from flask import Blueprint, request, jsonify, current_app

from db.engine import get_session
from models.Author import Author
from models.Users import Users
from models.Departments import Departments
from models.Research import Research
from models.Category import Category
from models.IncentivesApplication import IncentivesApplication
from models.AuthorResearch import AuthorResearch
from sqlalchemy import or_
from sqlalchemy import func

bp = Blueprint("bp_researchers", __name__, url_prefix="/v1/researchers")


def getResearchAuthorsName(research_id):
    try:
        session = get_session(autocommit=False, autoflush=False)()
        result = session.query(AuthorResearch).filter(
            AuthorResearch.research_id == research_id
        )
        return [
            {
                "author_id": session.get(Author, i.author_id).author_id,
                "author_name": session.get(Author, i.author_id).author_name,
            }
            for i in result
        ]
    except Exception as e:
        print(e)


def getCoAuthors(author_id):
    try:
        session = get_session(autocommit=False, autoflush=False)()
        result = session.query(AuthorResearch).filter(
            AuthorResearch.author_id == author_id
        )
        coauthors = []
        for i in result:
            for x in getResearchAuthorsName(i.research_id):
                if x["author_id"] not in coauthors:
                    coauthors.append(x["author_id"])
        coauthors.remove(author_id)

        return [
            {
                "name": session.get(Author, i).author_name,
                "role": session.query(Users)
                .join(Author, Author.user_id == Users.user_id)
                .filter(Author.author_id == i)
                .first()
                .role,
                "department": session.query(Departments)
                .join(Users, Users.dept_id == Departments.dept_id)
                .join(Author, Author.user_id == Users.user_id)
                .filter(Author.author_id == i)
                .first()
                .dept_name,
            }
            for i in coauthors
        ]

    except Exception as e:
        print(e)


@bp.route("/", methods=["GET", "POST"])
# @jwt_required()
def handleResearchers1():
    try:
        # Create a session instance
        session = get_session(autocommit=False, autoflush=False)()

        search_query = request.args.get("q")

        # Base query
        query = (
            session.query(
                Author.author_id,
                Users.user_id,
                Author.author_name,
                Departments.dept_id,
                Departments.dept_name,
                Users.role,
                Users.email,
                Users.activated,
            )
            .join(Users, Author.user_id == Users.user_id)
            .join(Departments, Users.dept_id == Departments.dept_id)
        )

        if search_query:
            search_list = search_query.split(",")
            search_filters = []
            for search_item in search_list:
                filter_criteria = or_(
                    Author.author_name.ilike(f"%{search_item}%"),
                    Departments.dept_name.ilike(f"%{search_item}%"),
                    Users.email.ilike(f"%{search_item}%"),
                )
                search_filters.append(filter_criteria)
            query = query.filter(or_(*search_filters))

        researchers = [
            {
                "author_id": i.author_id,
                "user_id": i.user_id,
                "name": i.author_name,
                "dept_id": i.dept_id,
                "department": i.dept_name,
                "role": i.role,
                "email": i.email,
                "activated": i.activated,
            }
            for i in query.filter(Users.role == "Researcher")
            .order_by(Author.author_name)
            .all()
        ]

        program_chairs = [
            {
                "author_id": i.author_id,
                "user_id": i.user_id,
                "name": i.author_name,
                "dept_id": i.dept_id,
                "department": i.dept_name,
                "role": i.role,
                "email": i.email,
                "activated": i.activated,
            }
            for i in query.filter(Users.role == "Program Chair")
            .order_by(Author.author_name)
            .all()
        ]

        research_admins = [
            {
                "author_id": i.author_id,
                "user_id": i.user_id,
                "name": i.author_name,
                "dept_id": i.dept_id,
                "department": i.dept_name,
                "role": i.role,
                "email": i.email,
                "activated": i.activated,
            }
            for i in query.filter(Users.role == "Research Admin")
            .order_by(Author.author_name)
            .all()
        ]

        return jsonify(
            {
                "success": True,
                "message": "Fetched all users",
                "data": {
                    "researchers": researchers,
                    "program_chairs": program_chairs,
                    "research_admin": research_admins,
                },
            }
        ), 200
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"success": False, "message": str(e)}), 500


@bp.route("/<int:author_id>/<int:user_id>", methods=["GET", "PUT", "DELETE"])
# @jwt_required()
def handleResearcherItemRequests(author_id, user_id):
    session = get_session(autocommit=False, autoflush=False)()

    if request.method == "GET":
        try:
            result = (
                session.query(
                    Author.author_id,
                    Users.user_id,
                    Author.author_name,
                    Departments.dept_id,
                    Departments.dept_name,
                    Users.role,
                    Users.email,
                    Users.activated,
                )
                .join(Users, Author.user_id == Users.user_id)
                .join(Departments, Users.dept_id == Departments.dept_id)
                .filter(Author.author_id == author_id)
                .first()
            )

            researcher = {
                "author_id": result.author_id,
                "user_id": result.user_id,
                "name": result.author_name,
                "dept_id": result.dept_id,
                "department": result.dept_name,
                "role": result.role,
                "email": result.email,
                "activated": result.activated,
            }

            return jsonify(
                {"success": True, "message": f"Fetched user", "data": researcher}
            ), 200
        except Exception as e:
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500

    if request.method == "PUT":
        data = request.get_json()

        db_author = session.query(Author).get(author_id)
        db_user = session.query(Users).get(user_id)

        db_user.email = data.get("email")
        db_user.dept_id = data.get("dept_id")
        db_user.role = data.get("role")
        db_author.author_name = data.get("name")

        try:
            session.commit()
            return jsonify(
                {"success": True, "message": "User modified successfully."}
            ), 200
        except Exception as e:
            session.rollback()
            return jsonify({"success": False, "message": f"{e}"})

    if request.method == "DELETE":
        try:
            db_author = session.get(Author, author_id)
            db_user = session.get(Users, user_id)
            session.delete(db_author)
            session.delete(db_user)
            session.commit()
            return jsonify(
                {"success": True, "message": "User deleted successfully."}
            ), 200
        except Exception as e:
            print(e)
            session.rollback()
            return jsonify({"success": False, "message": f"{e}"}), 500


@bp.route("<int:author_id>/researches", methods=["GET"])
def handleAuthorResearches(author_id):
    cache = current_app.cache  # Access the cache instance
    cache_key = f"author_researches_{author_id}"

    # Try to get cached data
    cached_data = cache.get(cache_key)
    if cached_data:
        return jsonify(cached_data), 200

    # If not cached, proceed with the query
    session = get_session(autocommit=False, autoflush=False)()

    try:
        search_query = request.args.get("q")
        if search_query:
            search_query = f"%{search_query}%"
        query = (
            session.query(
                Research.research_id,
                Author.author_name,
                Author.author_id,
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
        )
        if search_query:
            query = query.filter(Research.title.ilike(search_query))

        result = query.all()

        if result:
            data = [
                {
                    "research_id": i.research_id,
                    "title": i.title,
                    "authors": ", ".join(
                        [
                            i["author_name"]
                            for i in getResearchAuthorsName(i.research_id)
                        ]
                    ),
                    "publication": i.published_where,
                    "citations": "N/A",
                    "year": i.publication_date,
                }
                for i in result
            ]
            response_data = {
                "success": True,
                "message": "author researches are fetched successfully",
                "data": data,
                "coauthors": getCoAuthors(author_id),
            }
            # Cache the response
            cache.set(
                cache_key, response_data, timeout=1
            )  # Cache timeout of 60 seconds
            return jsonify(response_data), 200
        else:
            response_data = {
                "success": False,
                "message": "Author has no research records",
                "data": [],
            }
            # Cache the response with an empty data array
            cache.set(cache_key, response_data, timeout=1)
            return jsonify(response_data), 404
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"success": False, "message": str(e)}), 500


@bp.route("/unique", methods=["GET"])
def uniqueValues():
    session = get_session(autocommit=False, autoflush=False)()
    try:
        # Get all the unique values of department, name, email
        departments = session.query(Departments.dept_name).distinct().all()
        names = session.query(Author.author_name).distinct().all()
        emails = session.query(Users.email).distinct().all()

        # Generate uniqueResearcherId for each department and name
        # Combine departments and names into a single array
        combined_unique = []

        for idx, dept in enumerate(departments):
            combined_unique.append(
                {
                    "uniqueResearcherId": idx + 1,
                    "uniqueResearcher": dept[0],
                }
            )

        for idx, name in enumerate(names):
            combined_unique.append(
                {
                    "uniqueResearcherId": len(departments) + idx + 1,
                    "uniqueResearcher": name[0],
                }
            )

        for idx, email in enumerate(emails):
            combined_unique.append(
                {
                    "uniqueResearcherId": len(emails) + idx + 1,
                    "uniqueResearcher": email[0],
                }
            )

        return jsonify(
            {
                "success": True,
                "message": "Fetched all unique departments and names",
                "data": combined_unique,
            }
        ), 200

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify(
            {
                "success": False,
                "message": str(e),
            }
        ), 500


if __name__ == "__main__":
    print(getResearchAuthorsName(5))
    print(getCoAuthors(1))
