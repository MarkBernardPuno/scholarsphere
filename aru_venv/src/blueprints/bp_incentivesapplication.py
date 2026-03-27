import os
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app
from sqlalchemy.orm import joinedload
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import func, cast, Date
from datetime import datetime, timedelta

from db.engine import get_session
from models.File import File
from models.Users import Users
from models.Author import Author
from models.Status import Status
from models.Research import Research
from models.Departments import Departments
from models.AuthorResearch import AuthorResearch
from models.StudentResearch import StudentResearch
from models.ResearchKeywords import ResearchKeywords
from models.ResearchDepartment import ResearchDepartment
from models.ResearchDeptAgenda import ResearchDeptAgenda
from models.ResearchInstAgenda import ResearchInstAgenda
from models.IncentivesApplication import IncentivesApplication


bp = Blueprint(
    "bp_incentivesapplication", __name__, url_prefix="/v1/incentivesapplication"
)


def getResearchAuthorsName(research_id):
    try:
        session = get_session(autocommit=False, autoflush=False)()
        result = session.query(AuthorResearch).filter(
            AuthorResearch.research_id == research_id
        )
        return [session.get(Author, i.author_id).author_name for i in result]
    except Exception as e:
        print(e)


def submit_incentives_application(session, data):
    try:
        new_data = IncentivesApplication(
            research_id=data["research_id"],
            user_id=data["user_id"],
            status_id=data["status_id"],
            date_submitted=data["date_submitted"],
            category_id=data["category_id"],
        )
        session.add(new_data)
        session.commit()
        return new_data, None
    except Exception as e:
        session.rollback()
        print(f"An error occurred: {e}")
        return None, str(e)


def link_author_research(session, research_id, author_id):
    try:
        new_data = AuthorResearch(research_id=research_id, author_id=author_id)
        session.add(new_data)
        session.commit()
        return new_data, None
    except Exception as e:
        session.rollback()
        print(f"An error occurred: {e}")
        return None, str(e)
    
def link_research_department(session, research_id, dept_id):
    try:
        new_data = ResearchDepartment(research_id=research_id, dept_id=dept_id)
        session.add(new_data)
        session.commit()
        return new_data, None
    except SQLAlchemyError as e:
        print(f"An error occurred: {e}")
        return None, str(e)

def get_research_departments_name(research_id):
    session = get_session(autocommit=False, autoflush=False)()
    try:
        result = session.query(ResearchDepartment).filter(
            ResearchDepartment.research_id == research_id
        )
        departments = [session.get(Departments, i.dept_id).dept_name for i in result]
        return departments
    except SQLAlchemyError as e:
        print(e)
    finally:
        session.close()
        
def link_research_keywords(session, research_id, keywords_id):
    try:
        new_data = ResearchKeywords(research_id=research_id, keywords_id=keywords_id)
        session.add(new_data)
        session.commit()
        return new_data, None
    except SQLAlchemyError as e:
        print(f"An error occurred: {e}")
        return None, str(e)

def link_student_research(session, research_id, student_id):
    try:
        new_data = StudentResearch(research_id=research_id, student_id=student_id)
        session.add(new_data)
        session.commit()
        return new_data, None
    except SQLAlchemyError as e:
        print(f"An error occurred: {e}")
        return None, str(e)
    
def link_research_deptagenda(session, research_id, deptagenda_id):
    try:
        new_data = ResearchDeptAgenda(research_id=research_id, deptagenda_id=deptagenda_id)
        session.add(new_data)
        session.commit()
        return new_data, None
    except SQLAlchemyError as e:
        print(f"An error occurred: {e}")
        return None, str(e)

def link_research_instagenda(session, research_id, instagenda_id):
    try:
        new_data = ResearchInstAgenda(research_id=research_id, instagenda_id=instagenda_id)
        session.add(new_data)
        session.commit()
        return new_data, None
    except SQLAlchemyError as e:
        print(f"An error occurred: {e}")
        return None, str(e)

def formatDate(x):
    dt = datetime.strptime(x, "%Y-%m-%dT%H:%M:%S.%fZ")
    return dt.strftime("%Y/%m/%d")

@bp.route("/main", methods=["POST", "GET"])
def handleApplicationGetPost():
    session = get_session(autocommit=False, autoflush=False)()
    if request.method == "POST":
        try:
            data = request.json
            formData = data.get("formData")
            selectedFiles = data.get("selectedFiles")
            print(formData)
            print(selectedFiles)

            # Insert research data
            new_research = Research(
                title=formData.get("title"),
                abstract=formData.get("abstract"),
                presented_where=formData.get("presented_where"),
                presentation_location=formData.get("presentation_location"),
                presentation_date=formData.get("presentation_date"),
                published_where=formData.get("published_where"),
                publication_date=formData.get("publication_date"),
                cited_where=formData.get("cited_where"),
                cited_date=formData.get("cited_date"),
                doi_or_full=formData.get("doi_or_full"),
                user_id=formData.get("user_id"),
                camp_id=formData.get("camp_id"),
            )
            session.add(new_research)
            session.commit()

            generated_research_id = new_research.research_id

            # Submit incentives application
            incentives_application_data = {
                "research_id": generated_research_id,
                "user_id": formData.get("user_id"),
                "status_id": 1,
                "date_submitted": formData.get("formattedDate"),
                "category_id": formData.get("category_id"),
            }
            success, message = submit_incentives_application(
                session, incentives_application_data
            )
            if not success:
                session.delete(new_research)
                session.commit()
                return jsonify({"success": False, "message": message}), 500.0

            # Add authors
            author_ids = [i["value"] for i in formData.get("authors")]
            print(author_ids)

            # Link authors with research
            for author_id in author_ids:
                success, message = link_author_research(
                    session, generated_research_id, author_id
                )
                if not success:
                    session.delete(new_research)
                    session.commit()
                    session.rollback()
                    return jsonify({"success": False, "message": message}), 500

             # Get departments
            dept_ids = [i["value"] for i in formData.get("departments")]
            print(dept_ids)

            # Link authors with research
            for dept_id in dept_ids:
                success, message = link_research_department(
                    session, generated_research_id, dept_id
                )
                if not success:
                    session.delete(new_research)
                    session.commit()
                    session.rollback()
                    return jsonify({"success": False, "message": message}), 500
                
            # Get keywords
            keywords_ids = [i["value"] for i in formData.get("keywords")]
            print(keywords_ids)

            # Link keywords with research
            for keywords_id in keywords_ids:
                success, message = link_research_keywords(
                    session, generated_research_id, keywords_id
                )
                if not success:
                    session.rollback()
                    return jsonify({"success": False, "message": message}), 500
                
            # Get students
            student_ids = [i["value"] for i in formData.get("students", [])]
            print(student_ids)

            # Link students with research
            for student_id in student_ids:
                success, message = link_student_research(
                    session, generated_research_id, student_id
                )
                if not success:
                    session.rollback()
                    return jsonify({"success": False, "message": message}), 500
            
            # Get deptagendas
            deptagenda_ids = [i["value"] for i in formData.get("deptagendas", [])]
            print(deptagenda_ids)

            # Link deptagendas with research
            for deptagenda_id in deptagenda_ids:
                success, message = link_research_deptagenda(
                    session, generated_research_id, deptagenda_id
                )
                if not success:
                    session.rollback()
                    return jsonify({"success": False, "message": message}), 500
                
            # Get instagendas
            instagenda_ids = [i["value"] for i in formData.get("instagendas", [])]
            print(instagenda_ids)

            # Link instagendas with research
            for instagenda_id in instagenda_ids:
                success, message = link_research_instagenda(
                    session, generated_research_id, instagenda_id
                )
                if not success:
                    session.rollback()
                    return jsonify({"success": False, "message": message}), 500
            
            return jsonify(
                {
                    "success": True,
                    "message": "Research submitted successfully!",
                    "research_id": generated_research_id,
                }
            ), 201

        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500

    elif request.method == "GET":
        try:
            result = (
                session.query(Research)
                .join(IncentivesApplication, Research.research_id == IncentivesApplication.research_id)
                .options(
                    joinedload(Research.incentivesapplication),
                    joinedload(Research.authorresearch).joinedload(AuthorResearch.author),
                    joinedload(Research.researchdepartment).joinedload(ResearchDepartment.department),
                    joinedload(Research.researchkeywords).joinedload(ResearchKeywords.keywords),
                    joinedload(Research.studentresearch).joinedload(StudentResearch.student),
                    joinedload(Research.researchdeptagenda).joinedload(ResearchDeptAgenda.deptagenda),
                    joinedload(Research.researchinstagenda).joinedload(ResearchInstAgenda.instagenda),
                    joinedload(Research.files)
                )
                .all()
            )

            if result:
                data = []
                for research in result:
                    applications = research.incentivesapplication
                    authors = [
                        {"author_id": ar.author_id, "author_name": ar.author.author_name}
                        for ar in research.authorresearch
                    ]
                    departments = [
                        {"dept_id": rd.dept_id, "dept_name": rd.department.dept_name}
                        for rd in research.researchdepartment
                    ]
                    keywords = [
                        {"keyword_id": rk.keywords_id, "keywords_name": rk.keywords.keywords_name}
                        for rk in research.researchkeywords
                    ]
                    students = [
                        {"student_id": sr.student_id, "student_name": sr.student.student_name}
                        for sr in research.studentresearch
                    ]
                    deptagendas = [
                        {"deptagenda_id": rda.deptagenda_id, "deptagenda_name": rda.deptagenda.deptagenda_name}
                        for rda in research.researchdeptagenda
                    ]
                    instagendas = [
                        {"instagenda_id": ria.instagenda_id, "instagenda_name": ria.instagenda.instagenda_name}
                        for ria in research.researchinstagenda
                    ]

                    research_data = {
                        "research_id": research.research_id,
                        "title": research.title,
                        "abstract": research.abstract,
                        "presented_where": research.presented_where,
                        "presentation_location": research.presentation_location,
                        "presentation_date": research.presentation_date,
                        "published_where": research.published_where,
                        "publication_date": research.publication_date,
                        "cited_where": research.cited_where,
                        "cited_date": research.cited_date,
                        "doi_or_full": research.doi_or_full,
                        "user_id": research.user_id,
                        "camp_id": research.camp_id,
                        "applications": [
                            {
                                "application_id": application.application_id,
                                "status_id": application.status_id,
                                "date_submitted": application.date_submitted,
                                "category_id": application.category_id,
                                "status_desc": session.get(Status, application.status_id).status_desc,
                            }
                            for application in applications
                        ],
                        "files": [
                            {
                                "file_id": file.file_id,
                                "file_type": file.file_type,
                                "file_path": file.file_path
                            }
                            for file in research.files
                        ],
                        "authors": authors,
                        "departments": departments,
                        "keywords": keywords,
                        "students": students,
                        "deptagendas": deptagendas,
                        "instagendas": instagendas,
                    }
                    data.append(research_data)

                return jsonify(
                    {
                        "success": True,
                        "message": "Fetched all research records with applications, files, and related entities",
                        "data": data,
                    }
                ), 200
            else:
                return jsonify({"success": False, "message": "No results"}), 404

        except Exception as e:
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
        finally:
            session.close()

@bp.route("/main/<int:application_id>", methods=["GET", "PUT", "DELETE"])
def handleApplicationById(application_id):
    session = get_session(autocommit=False, autoflush=False)()
    
    if request.method == "GET":
        try:
            # Fetch the application by its ID
            application = session.query(IncentivesApplication).filter_by(application_id=application_id).first()
            if application:
                research = application.research
                authors = [
                    {"author_id": ar.author_id, "author_name": ar.author.author_name}
                    for ar in research.authorresearch
                ]
                departments = [
                    {"dept_id": rd.dept_id, "dept_name": rd.department.dept_name}
                    for rd in research.researchdepartment
                ]
                keywords = [
                    {"keyword_id": rk.keywords_id, "keywords_name": rk.keywords.keywords_name}
                    for rk in research.researchkeywords
                ]
                students = [
                    {"student_id": sr.student_id, "student_name": sr.student.student_name}
                    for sr in research.studentresearch
                ]
                deptagendas = [
                    {"deptagenda_id": rda.deptagenda_id, "deptagenda_name": rda.deptagenda.deptagenda_name}
                    for rda in research.researchdeptagenda
                ]
                instagendas = [
                    {"instagenda_id": ria.instagenda_id, "instagenda_name": ria.instagenda.instagenda_name}
                    for ria in research.researchinstagenda
                ]
                files = [
                    {
                        "file_id": file.file_id,
                        "file_type": file.file_type,
                        "file_path": file.file_path
                    }
                    for file in research.files
                ]
                
                application_data = {
                    "research_id": research.research_id,
                    "title": research.title,
                    "abstract": research.abstract,
                    "presented_where": research.presented_where,
                    "presentation_location": research.presentation_location,
                    "presentation_date": research.presentation_date,
                    "published_where": research.published_where,
                    "publication_date": research.publication_date,
                    "cited_where": research.cited_where,
                    "cited_date": research.cited_date,
                    "doi_or_full": research.doi_or_full,
                    "user_id": research.user_id,
                    "camp_id": research.camp_id,
                    "application_id": application.application_id,
                    "status_id": application.status_id,
                    "date_submitted": application.date_submitted,
                    "category_id": application.category_id,
                    "status_desc": session.get(Status, application.status_id).status_desc,
                    "authors": authors,
                    "departments": departments,
                    "keywords": keywords,
                    "students": students,
                    "deptagendas": deptagendas,
                    "instagendas": instagendas,
                    "files": files
                }
                
                return jsonify({
                    "success": True,
                    "message": "Fetched application details successfully",
                    "data": application_data
                }), 200
            else:
                return jsonify({"success": False, "message": "Application not found"}), 404

        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500

    elif request.method == "PUT":
        try:
            data = request.json
            application = session.query(IncentivesApplication).filter_by(application_id=application_id).first()

            if application:
                # Update research information
                research = application.research
                research.title = data.get("title", research.title)
                research.abstract = data.get("abstract", research.abstract)
                research.presented_where = data.get("presented_where", research.presented_where) or None
                research.presentation_location = data.get("presentation_location", research.presentation_location) or None
                research.presentation_date = data.get("presentation_date", research.presentation_date) or None
                research.published_where = data.get("published_where", research.published_where) or None
                research.publication_date = data.get("publication_date", research.publication_date) or None
                research.cited_where = data.get("cited_where", research.cited_where) or None
                research.cited_date = data.get("cited_date", research.cited_date) or None
                research.doi_or_full = data.get("doi_or_full", research.doi_or_full) or None
                research.user_id = data.get("user_id", research.user_id)
                research.camp_id = data.get("camp_id", research.camp_id)
                
                # Update application information
                application.status_id = data.get("status_id", application.status_id)
                application.date_submitted = data.get("date_submitted", application.date_submitted)
                application.category_id = data.get("category_id", application.category_id)
                
                session.commit()
                
                return jsonify({"success": True, "message": "Application updated successfully"}), 200
            else:
                return jsonify({"success": False, "message": "Application not found"}), 404

        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500

    elif request.method == "DELETE":
        try:
            application = session.query(IncentivesApplication).filter_by(application_id=application_id).first()
            if application:
                research = application.research
                session.delete(application)
                session.delete(research)
                session.commit()
                return jsonify({"success": True, "message": "Application deleted successfully"}), 200
            else:
                return jsonify({"success": False, "message": "Application not found"}), 404

        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500

        finally:
            session.close()
       
            
@bp.route("/update_research", methods=["POST"])
def updateResearch():
    session = get_session(autocommit=False, autoflush=False)()
    if request.method == "POST":
        try:
            data = request.json
            formData = data.get("formData")
            research_id = formData.get("research_id")

            if not research_id:
                return jsonify({"success": False, "message": "Research ID is required"}), 400

            # Fetch the existing research entry
            research_entry = session.query(Research).filter_by(research_id=research_id).first()

            if not research_entry:
                return jsonify({"success": False, "message": "Research entry not found"}), 404

            # Update the existing research entry
            research_entry.presented_where = formData.get("presented_where")
            research_entry.presentation_location = formData.get("presentation_location")
            research_entry.presentation_date = formData.get("presentation_date") or None
            research_entry.published_where = formData.get("published_where")
            research_entry.publication_date = formData.get("publication_date") or None
            research_entry.cited_where = formData.get("cited_where")
            research_entry.cited_date = formData.get("citation_date") or None
            research_entry.doi_or_full = formData.get("doi_or_full")

            session.commit()

            # Submit incentives application
            incentives_application_data = {
                "research_id": research_id,
                "user_id": formData.get("user_id"),
                "status_id": 1,
                "date_submitted": formData.get("formattedDate"),
                "category_id": formData.get("category_id"),
            }
            success, message = submit_incentives_application(
                session, incentives_application_data
            )
            if not success:
                session.rollback()
                return jsonify({"success": False, "message": message}), 500

            return jsonify(
                {
                    "success": True,
                    "message": "Research updated and submitted successfully!",
                    "research_id": research_id,
                }
            ), 201

        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
        finally:
            session.close()
