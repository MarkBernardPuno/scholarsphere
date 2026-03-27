import datetime
from db.engine import get_session
from flask import Blueprint, jsonify, request
from models.Author import Author
from models.AuthorResearch import AuthorResearch
from models.Category import Category
from models.Departments import Departments
from models.IncentivesApplication import IncentivesApplication
from models.Research import Research
from models.Users import Users
from sqlalchemy import or_
from sqlalchemy.orm import joinedload

bp = Blueprint("bp_search", __name__, url_prefix="/v1/search")


def getResearchAuthorsName(research_id):
    try:
        session = get_session(autocommit=False, autoflush=False)()
        result = session.query(AuthorResearch).filter(
            AuthorResearch.research_id == research_id
        )
        return [session.get(Author, i.author_id).author_name for i in result]
    except Exception as e:
        print(e)


@bp.route("/main", methods=["GET"])
def getResult():
    session = get_session(autocommit=False, autoflush=False)()
    try:
        search_query = request.args.get("q")
        startDate = request.args.get("startDate")
        endDate = request.args.get("endDate")
        department = request.args.get("department")
        author_id = request.args.get("author_id", type=int)
        research_id = request.args.get("research_id", type=int)

        query = (
            session.query(IncentivesApplication)
            .options(
                joinedload(IncentivesApplication.research).joinedload(Research.files),
                joinedload(IncentivesApplication.research)
                .joinedload(Research.authorresearch)
                .joinedload(AuthorResearch.author),
                joinedload(IncentivesApplication.research).joinedload(
                    Research.department
                ),
                joinedload(IncentivesApplication.category),
            )
            .join(IncentivesApplication.research)
            .join(Research.authorresearch)
            .join(AuthorResearch.author)
            .join(Departments, Research.dept_id == Departments.dept_id)
            .join(IncentivesApplication.category)
        )

        # Filter by search_query if provided
        if search_query:
            search_query = f"%{search_query}%"
            query = query.filter(
                or_(
                    Author.author_name.ilike(search_query),
                    Research.title.ilike(search_query),
                    Research.inst_agenda.ilike(search_query),
                    Research.dept_agenda.ilike(search_query),
                    Research.presented_where.ilike(search_query),
                    Research.presentation_location.ilike(search_query),
                    Category.category_description.ilike(search_query),
                    Departments.dept_name.ilike(search_query),
                )
            )

        # Filter by startDate and endDate for presentation_date and publication_date
        if startDate or endDate:
            date_filters = []

            if startDate:
                startDate = datetime.datetime.strptime(startDate, "%Y-%m-%d")
                date_filters.append(Research.presentation_date >= startDate)
                date_filters.append(Research.publication_date >= startDate)

            if endDate:
                endDate = datetime.datetime.strptime(endDate, "%Y-%m-%d")
                date_filters.append(Research.presentation_date <= endDate)
                date_filters.append(Research.publication_date <= endDate)

            query = query.filter(or_(*date_filters))

        # Filter by department if provided
        if department:
            query = query.filter(Departments.dept_name == department)

        # Filter by author_id if provided
        if author_id:
            query = query.filter(Author.author_id == author_id)

        # Filter by research_id if provided
        if research_id:
            query = query.filter(Research.research_id == research_id)

        applications = query.all()

        data = []
        for application in applications:
            research = application.research
            data.append(
                {
                    "research_id": research.research_id,
                    "author_id": None,  # Adjust as needed
                    "author_name": ", ".join(
                        [ar.author.author_name for ar in research.authorresearch]
                    ),
                    "dept_name": research.department.dept_name,
                    "title": research.title,
                    "presented_where": research.presented_where,
                    "presentation_location": research.presentation_location,
                    "presentation_date": research.presentation_date,
                    "published_where": research.published_where,
                    "publication_date": research.publication_date,
                    "inst_agenda": research.inst_agenda,
                    "dept_agenda": research.dept_agenda,
                    "doi_or_full": research.doi_or_full,
                    "category_description": application.category.category_description,
                    "application_id": application.application_id,
                    "files": [
                        {
                            "file_id": file.file_id,
                            "file_type": file.file_type,
                            "file_path": file.file_path,
                        }
                        for file in research.files
                    ],
                    "authors": [
                        {
                            "author_id": ar.author_id,
                            "author_name": ar.author.author_name,
                        }
                        for ar in research.authorresearch
                    ],
                }
            )

        return jsonify({"success": True, "data": data}), 200

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"success": False, "message": str(e)}), 500
