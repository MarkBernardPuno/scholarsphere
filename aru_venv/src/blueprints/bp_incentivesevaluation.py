import requests
import json
from datetime import datetime
from flask import Blueprint, request, jsonify
from sqlalchemy.orm import joinedload
from sqlalchemy.exc import SQLAlchemyError
from flask_cors import cross_origin
from db.engine import get_session
from models.Author import Author
from models.Status import Status
from models.Student import Student
from models.Research import Research
from models.Keywords import Keywords
from models.Departments import Departments
from models.AuthorResearch import AuthorResearch
from models.StudentResearch import StudentResearch
from models.ResearchKeywords import ResearchKeywords
from models.ResearchDepartment import ResearchDepartment
from models.ResearchDeptAgenda import ResearchDeptAgenda
from models.ResearchInstAgenda import ResearchInstAgenda
from models.IncentivesEvaluation import IncentivesEvaluation

bp = Blueprint(
    "bp_incentivesevaluation", __name__, url_prefix="/v1/incentivesevaluation"
)


def link_author_research(session, research_id, author_id):
    try:
        new_data = AuthorResearch(research_id=research_id, author_id=author_id)
        session.add(new_data)
        return new_data, None
    except SQLAlchemyError as e:
        print(f"An error occurred: {e}")
        return None, str(e)


def get_research_authors_name(research_id):
    session = get_session(autocommit=False, autoflush=False)()
    try:
        result = session.query(AuthorResearch).filter(
            AuthorResearch.research_id == research_id
        )
        authors = [session.get(Author, i.author_id).author_name for i in result]
        return authors
    except SQLAlchemyError as e:
        print(e)
    finally:
        session.close()


def link_research_department(session, research_id, dept_id):
    try:
        new_data = ResearchDepartment(research_id=research_id, dept_id=dept_id)
        session.add(new_data)
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
        return new_data, None
    except SQLAlchemyError as e:
        print(f"An error occurred: {e}")
        return None, str(e)


def link_student_research(session, research_id, student_id):
    try:
        new_data = StudentResearch(research_id=research_id, student_id=student_id)
        session.add(new_data)
        return new_data, None
    except SQLAlchemyError as e:
        print(f"An error occurred: {e}")
        return None, str(e)


def link_research_deptagenda(session, research_id, deptagenda_id):
    try:
        new_data = ResearchDeptAgenda(
            research_id=research_id, deptagenda_id=deptagenda_id
        )
        session.add(new_data)
        return new_data, None
    except SQLAlchemyError as e:
        print(f"An error occurred: {e}")
        return None, str(e)


def link_research_instagenda(session, research_id, instagenda_id):
    try:
        new_data = ResearchInstAgenda(
            research_id=research_id, instagenda_id=instagenda_id
        )
        session.add(new_data)
        return new_data, None
    except SQLAlchemyError as e:
        print(f"An error occurred: {e}")
        return None, str(e)


@bp.route("/main", methods=["POST", "GET"])
@cross_origin(supports_credentials=True)
def handle_request():
    session = get_session(autocommit=False, autoflush=False)()
    if request.method == "POST":
        try:
            data = request.get_json()

            # Insert research data
            new_research = Research(
                title=data.get("title"),
                abstract=data.get("abstract"),
                user_id=data.get("user_id"),
                camp_id=data.get("camp_id"),
            )
            session.add(new_research)
            session.commit()

            generated_research_id = new_research.research_id

            # Insert evaluation data
            new_evaluation = IncentivesEvaluation(
                research_id=generated_research_id,
                evaluated_by=data.get("evaluated_by"),
                is_agenda_aligned=data.get("is_agenda_aligned"),
                is_agenda_aligned_remarks=data.get("is_agenda_aligned_remarks"),
                is_title=data.get("is_title"),
                is_title_remarks=data.get("is_title_remarks"),
                is_problem1=data.get("is_problem1"),
                is_problem1_remarks=data.get("is_problem1_remarks"),
                is_problem2=data.get("is_problem2"),
                is_problem2_remarks=data.get("is_problem2_remarks"),
                is_significance1=data.get("is_significance1"),
                is_significance1_remarks=data.get("is_significance1_remarks"),
                is_significance2=data.get("is_significance2"),
                is_significance2_remarks=data.get("is_significance2_remarks"),
                is_significance3=data.get("is_significance3"),
                is_significance3_remarks=data.get("is_significance3_remarks"),
                is_significance4=data.get("is_significance4"),
                is_significance4_remarks=data.get("is_significance4_remarks"),
                is_ethics_criteria1=data.get("is_ethics_criteria1"),
                is_ethics_criteria1_remarks=data.get("is_ethics_criteria1_remarks"),
                is_ethics_criteria2a=data.get("is_ethics_criteria2a"),
                is_ethics_criteria2a_remarks=data.get("is_ethics_criteria2a_remarks"),
                is_ethics_criteria2b=data.get("is_ethics_criteria2b"),
                is_ethics_criteria2b_remarks=data.get("is_ethics_criteria2b_remarks"),
                is_ethics_criteria3a=data.get("is_ethics_criteria3a"),
                is_ethics_criteria3a_remarks=data.get("is_ethics_criteria3a_remarks"),
                is_ethics_criteria3b=data.get("is_ethics_criteria3b"),
                is_ethics_criteria3b_remarks=data.get("is_ethics_criteria3b_remarks"),
                is_ethics_criteria4=data.get("is_ethics_criteria4"),
                is_ethics_criteria4_remarks=data.get("is_ethics_criteria4_remarks"),
                is_ethics_criteria5=data.get("is_ethics_criteria5"),
                is_ethics_criteria5_remarks=data.get("is_ethics_criteria5_remarks"),
                status_id=data.get("status_id"),
                status_remarks=data.get("status_remarks"),
            )

            session.add(new_evaluation)

            # Get authors
            author_ids = [i["value"] for i in data.get("authors")]
            print(author_ids)

            # Link authors with research
            for author_id in author_ids:
                success, message = link_author_research(
                    session, generated_research_id, author_id
                )
                if not success:
                    session.rollback()
                    return jsonify({"success": False, "message": message}), 500

            # Get departments
            dept_ids = [i["value"] for i in data.get("departments")]
            print(dept_ids)

            # Link authors with research
            for dept_id in dept_ids:
                success, message = link_research_department(
                    session, generated_research_id, dept_id
                )
                if not success:
                    session.rollback()
                    return jsonify({"success": False, "message": message}), 500

            # Get keywords
            keywords_ids = [i["value"] for i in data.get("keywords")]
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
            student_ids = [i["value"] for i in data.get("students", [])]
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
            deptagenda_ids = [i["value"] for i in data.get("deptagendas", [])]
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
            instagenda_ids = [i["value"] for i in data.get("instagendas", [])]
            print(instagenda_ids)

            # Link instagendas with research
            for instagenda_id in instagenda_ids:
                success, message = link_research_instagenda(
                    session, generated_research_id, instagenda_id
                )
                if not success:
                    session.rollback()
                    return jsonify({"success": False, "message": message}), 500

            session.commit()
            return jsonify(
                {"success": True, "message": "Successfully added record"}
            ), 201

        except SQLAlchemyError as e:
            session.rollback()
            print("Error:", e)
            return jsonify(
                {"success": False, "message": "Failed to add new record"}
            ), 401
        finally:
            session.close()

    elif request.method == "GET":
        try:
            result = (
                session.query(Research)
                .join(
                    IncentivesEvaluation,
                    Research.research_id == IncentivesEvaluation.research_id,
                )
                .options(
                    joinedload(Research.incentivesevaluation),
                    joinedload(Research.authorresearch).joinedload(
                        AuthorResearch.author
                    ),
                    joinedload(Research.researchdepartment)
                    .joinedload(ResearchDepartment.department)
                    .joinedload(Departments.deptagenda),
                    joinedload(Research.researchkeywords).joinedload(
                        ResearchKeywords.keywords
                    ),
                    joinedload(Research.studentresearch).joinedload(
                        StudentResearch.student
                    ),
                    joinedload(Research.researchdeptagenda).joinedload(
                        ResearchDeptAgenda.deptagenda
                    ),
                    joinedload(Research.researchinstagenda).joinedload(
                        ResearchInstAgenda.instagenda
                    ),
                )
                .all()
            )

            if result:
                data = []
                for research in result:
                    evaluations = research.incentivesevaluation
                    authors = [
                        {
                            "author_id": ar.author_id,
                            "author_name": ar.author.author_name,
                        }
                        for ar in research.authorresearch
                    ]
                    departments = [
                        {"dept_id": rd.dept_id, "dept_name": rd.department.dept_name}
                        for rd in research.researchdepartment
                    ]
                    keywords = [
                        {
                            "keyword_id": rk.keywords_id,
                            "keywords_name": rk.keywords.keywords_name,
                        }
                        for rk in research.researchkeywords
                    ]
                    students = [
                        {
                            "student_id": sr.student_id,
                            "student_name": sr.student.student_name,
                        }
                        for sr in research.studentresearch
                    ]
                    deptagendas = [
                        {
                            "deptagenda_id": rda.deptagenda_id,
                            "deptagenda_name": rda.deptagenda.deptagenda_name,
                        }
                        for rda in research.researchdeptagenda
                    ]
                    instagendas = [
                        {
                            "instagenda_id": ria.instagenda_id,
                            "instagenda_name": ria.instagenda.instagenda_name,
                        }
                        for ria in research.researchinstagenda
                    ]

                    research_data = {
                        "research_id": research.research_id,
                        "title": research.title,
                        "abstract": research.abstract,
                        "user_id": research.user_id,
                        "camp_id": research.camp_id,
                        "evaluations": [
                            {
                                "evaluation_id": evaluation.evaluation_id,
                                "evaluated_by": evaluation.evaluated_by,
                                "is_agenda_aligned": evaluation.is_agenda_aligned,
                                "is_agenda_aligned_remarks": evaluation.is_agenda_aligned_remarks,
                                "is_title": evaluation.is_title,
                                "is_title_remarks": evaluation.is_title_remarks,
                                "is_problem1": evaluation.is_problem1,
                                "is_problem1_remarks": evaluation.is_problem1_remarks,
                                "is_problem2": evaluation.is_problem2,
                                "is_problem2_remarks": evaluation.is_problem2_remarks,
                                "is_significance1": evaluation.is_significance1,
                                "is_significance1_remarks": evaluation.is_significance1_remarks,
                                "is_significance2": evaluation.is_significance2,
                                "is_significance2_remarks": evaluation.is_significance2_remarks,
                                "is_significance3": evaluation.is_significance3,
                                "is_significance3_remarks": evaluation.is_significance3_remarks,
                                "is_significance4": evaluation.is_significance4,
                                "is_significance4_remarks": evaluation.is_significance4_remarks,
                                "is_ethics_criteria1": evaluation.is_ethics_criteria1,
                                "is_ethics_criteria1_remarks": evaluation.is_ethics_criteria1_remarks,
                                "is_ethics_criteria2a": evaluation.is_ethics_criteria2a,
                                "is_ethics_criteria2a_remarks": evaluation.is_ethics_criteria2a_remarks,
                                "is_ethics_criteria2b": evaluation.is_ethics_criteria2b,
                                "is_ethics_criteria2b_remarks": evaluation.is_ethics_criteria2b_remarks,
                                "is_ethics_criteria3a": evaluation.is_ethics_criteria3a,
                                "is_ethics_criteria3a_remarks": evaluation.is_ethics_criteria3a_remarks,
                                "is_ethics_criteria3b": evaluation.is_ethics_criteria3b,
                                "is_ethics_criteria3b_remarks": evaluation.is_ethics_criteria3b_remarks,
                                "is_ethics_criteria4": evaluation.is_ethics_criteria4,
                                "is_ethics_criteria4_remarks": evaluation.is_ethics_criteria4_remarks,
                                "is_ethics_criteria5": evaluation.is_ethics_criteria5,
                                "is_ethics_criteria5_remarks": evaluation.is_ethics_criteria5_remarks,
                                "status_id": evaluation.status_id,
                                "status_desc": session.get(
                                    Status, evaluation.status_id
                                ).status_desc,
                                "status_remarks": evaluation.status_remarks,
                            }
                            for evaluation in evaluations
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
                        "message": "Fetched all research records with evaluations and authors",
                        "data": data,
                    }
                ), 200
            else:
                return jsonify({"success": False, "message": "No results"}), 404

        except SQLAlchemyError as e:
            print(e)
            return jsonify(
                {"success": False, "message": "Failed to fetch records"}
            ), 500
        finally:
            session.close()


@bp.route("/main/<int:evaluation_id>", methods=["GET", "PUT", "DELETE"])
def handle_specific_evaluation(evaluation_id):
    session = get_session(autocommit=False, autoflush=False)()
    if request.method == "GET":
        try:
            evaluation = (
                session.query(IncentivesEvaluation)
                .filter(IncentivesEvaluation.evaluation_id == evaluation_id)
                .options(
                    joinedload(IncentivesEvaluation.research)
                    .joinedload(Research.authorresearch)
                    .joinedload(AuthorResearch.author),
                    joinedload(IncentivesEvaluation.research)
                    .joinedload(Research.researchdepartment)
                    .joinedload(ResearchDepartment.department),
                    joinedload(IncentivesEvaluation.research)
                    .joinedload(Research.researchkeywords)
                    .joinedload(ResearchKeywords.keywords),
                    joinedload(IncentivesEvaluation.research)
                    .joinedload(Research.studentresearch)
                    .joinedload(StudentResearch.student),
                    joinedload(IncentivesEvaluation.research)
                    .joinedload(Research.researchdeptagenda)
                    .joinedload(ResearchDeptAgenda.deptagenda),
                    joinedload(IncentivesEvaluation.research)
                    .joinedload(Research.researchinstagenda)
                    .joinedload(ResearchInstAgenda.instagenda),
                )
                .first()
            )

            if evaluation:
                research = evaluation.research
                result = {
                    "evaluation_id": evaluation.evaluation_id,
                    "research_id": research.research_id,
                    "title": research.title,
                    "abstract": research.abstract,
                    "user_id": research.user_id,
                    "camp_id": research.camp_id,
                    "evaluated_by": evaluation.evaluated_by,
                    "is_agenda_aligned": evaluation.is_agenda_aligned,
                    "is_agenda_aligned_remarks": evaluation.is_agenda_aligned_remarks,
                    "is_title": evaluation.is_title,
                    "is_title_remarks": evaluation.is_title_remarks,
                    "is_problem1": evaluation.is_problem1,
                    "is_problem1_remarks": evaluation.is_problem1_remarks,
                    "is_problem2": evaluation.is_problem2,
                    "is_problem2_remarks": evaluation.is_problem2_remarks,
                    "is_significance1": evaluation.is_significance1,
                    "is_significance1_remarks": evaluation.is_significance1_remarks,
                    "is_ethics_criteria1": evaluation.is_ethics_criteria1,
                    "is_ethics_criteria1_remarks": evaluation.is_ethics_criteria1_remarks,
                    "is_ethics_criteria2a": evaluation.is_ethics_criteria2a,
                    "is_ethics_criteria2a_remarks": evaluation.is_ethics_criteria2a_remarks,
                    "is_ethics_criteria2b": evaluation.is_ethics_criteria2b,
                    "is_ethics_criteria2b_remarks": evaluation.is_ethics_criteria2b_remarks,
                    "is_ethics_criteria3a": evaluation.is_ethics_criteria3a,
                    "is_ethics_criteria3a_remarks": evaluation.is_ethics_criteria3a_remarks,
                    "is_ethics_criteria3b": evaluation.is_ethics_criteria3b,
                    "is_ethics_criteria3b_remarks": evaluation.is_ethics_criteria3b_remarks,
                    "is_ethics_criteria4": evaluation.is_ethics_criteria4,
                    "is_ethics_criteria4_remarks": evaluation.is_ethics_criteria4_remarks,
                    "is_ethics_criteria5": evaluation.is_ethics_criteria5,
                    "is_ethics_criteria5_remarks": evaluation.is_ethics_criteria5_remarks,
                    "status_id": evaluation.status_id,
                    "status_remarks": evaluation.status_remarks,
                    "authors": [
                        {
                            "author_id": ar.author_id,
                            "author_name": ar.author.author_name,
                        }
                        for ar in research.authorresearch
                    ],
                    "departments": [
                        {"dept_id": rd.dept_id, "dept_name": rd.department.dept_name}
                        for rd in research.researchdepartment
                    ],
                    "keywords": [
                        {
                            "keyword_id": rk.keywords_id,
                            "keywords_name": rk.keywords.keywords_name,
                        }
                        for rk in research.researchkeywords
                    ],
                    "students": [
                        {
                            "student_id": sr.student_id,
                            "student_name": sr.student.student_name,
                        }
                        for sr in research.studentresearch
                    ],
                    "deptagendas": [
                        {
                            "deptagenda_id": rda.deptagenda_id,
                            "deptagenda_name": rda.deptagenda.deptagenda_name,
                        }
                        for rda in research.researchdeptagenda
                    ],
                    "instagendas": [
                        {
                            "instagenda_id": ria.instagenda_id,
                            "instagenda_name": ria.instagenda.instagenda_name,
                        }
                        for ria in research.researchinstagenda
                    ],
                }
                return jsonify(
                    {"success": True, "message": "Fetched record.", "data": result}
                ), 200
            else:
                return jsonify({"success": False, "message": "No result"}), 404
        except SQLAlchemyError as e:
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": "Failed to fetch record"}), 500
        finally:
            session.close()

    elif request.method == "PUT":
        try:
            data = request.get_json()
            evaluation = session.query(IncentivesEvaluation).get(evaluation_id)

            if not evaluation:
                return jsonify(
                    {"success": False, "message": "Evaluation not found"}
                ), 404

            # Update evaluation fields only if they have changed
            if (
                data.get("evaluated_by")
                and data["evaluated_by"] != evaluation.evaluated_by
            ):
                evaluation.evaluated_by = data["evaluated_by"]
            if (
                data.get("is_agenda_aligned") is not None
                and data["is_agenda_aligned"] != evaluation.is_agenda_aligned
            ):
                evaluation.is_agenda_aligned = data["is_agenda_aligned"]
            if (
                data.get("is_agenda_aligned_remarks")
                and data["is_agenda_aligned_remarks"]
                != evaluation.is_agenda_aligned_remarks
            ):
                evaluation.is_agenda_aligned_remarks = data["is_agenda_aligned_remarks"]
            if (
                data.get("is_title") is not None
                and data["is_title"] != evaluation.is_title
            ):
                evaluation.is_title = data["is_title"]
            if (
                data.get("is_title_remarks")
                and data["is_title_remarks"] != evaluation.is_title_remarks
            ):
                evaluation.is_title_remarks = data["is_title_remarks"]
            if (
                data.get("is_problem1") is not None
                and data["is_problem1"] != evaluation.is_problem1
            ):
                evaluation.is_problem1 = data["is_problem1"]
            if (
                data.get("is_problem1_remarks")
                and data["is_problem1_remarks"] != evaluation.is_problem1_remarks
            ):
                evaluation.is_problem1_remarks = data["is_problem1_remarks"]
            if (
                data.get("is_problem2") is not None
                and data["is_problem2"] != evaluation.is_problem2
            ):
                evaluation.is_problem2 = data["is_problem2"]
            if (
                data.get("is_problem2_remarks")
                and data["is_problem2_remarks"] != evaluation.is_problem2_remarks
            ):
                evaluation.is_problem2_remarks = data["is_problem2_remarks"]
            if (
                data.get("is_significance1") is not None
                and data["is_significance1"] != evaluation.is_significance1
            ):
                evaluation.is_significance1 = data["is_significance1"]
            if (
                data.get("is_significance1_remarks")
                and data["is_significance1_remarks"]
                != evaluation.is_significance1_remarks
            ):
                evaluation.is_significance1_remarks = data["is_significance1_remarks"]
            if (
                data.get("is_significance2") is not None
                and data["is_significance2"] != evaluation.is_significance2
            ):
                evaluation.is_significance2 = data["is_significance2"]
            if (
                data.get("is_significance2_remarks")
                and data["is_significance2_remarks"]
                != evaluation.is_significance2_remarks
            ):
                evaluation.is_significance2_remarks = data["is_significance2_remarks"]
            if (
                data.get("is_significance3") is not None
                and data["is_significance3"] != evaluation.is_significance3
            ):
                evaluation.is_significance3 = data["is_significance3"]
            if (
                data.get("is_significance3_remarks")
                and data["is_significance3_remarks"]
                != evaluation.is_significance3_remarks
            ):
                evaluation.is_significance3_remarks = data["is_significance3_remarks"]
            if (
                data.get("is_significance4") is not None
                and data["is_significance4"] != evaluation.is_significance4
            ):
                evaluation.is_significance4 = data["is_significance4"]
            if (
                data.get("is_significance4_remarks")
                and data["is_significance4_remarks"]
                != evaluation.is_significance4_remarks
            ):
                evaluation.is_significance4_remarks = data["is_significance4_remarks"]
            if (
                data.get("is_ethics_criteria1") is not None
                and data["is_ethics_criteria1"] != evaluation.is_ethics_criteria1
            ):
                evaluation.is_ethics_criteria1 = data["is_ethics_criteria1"]
            if (
                data.get("is_ethics_criteria1_remarks")
                and data["is_ethics_criteria1_remarks"]
                != evaluation.is_ethics_criteria1_remarks
            ):
                evaluation.is_ethics_criteria1_remarks = data[
                    "is_ethics_criteria1_remarks"
                ]
            if (
                data.get("is_ethics_criteria2a")
                and data["is_ethics_criteria2a"] != evaluation.is_ethics_criteria2a
            ):
                evaluation.is_ethics_criteria2a = data["is_ethics_criteria2a"]
            if (
                data.get("is_ethics_criteria2a_remarks")
                and data["is_ethics_criteria2a_remarks"]
                != evaluation.is_ethics_criteria2a_remarks
            ):
                evaluation.is_ethics_criteria2a_remarks = data[
                    "is_ethics_criteria2a_remarks"
                ]
            if (
                data.get("is_ethics_criteria2b")
                and data["is_ethics_criteria2b"] != evaluation.is_ethics_criteria2b
            ):
                evaluation.is_ethics_criteria2b = data["is_ethics_criteria2b"]
            if (
                data.get("is_ethics_criteria2b_remarks")
                and data["is_ethics_criteria2b_remarks"]
                != evaluation.is_ethics_criteria2b_remarks
            ):
                evaluation.is_ethics_criteria2b_remarks = data[
                    "is_ethics_criteria2b_remarks"
                ]
            if (
                data.get("is_ethics_criteria3a")
                and data["is_ethics_criteria3a"] != evaluation.is_ethics_criteria3a
            ):
                evaluation.is_ethics_criteria3a = data["is_ethics_criteria3a"]
            if (
                data.get("is_ethics_criteria3a_remarks")
                and data["is_ethics_criteria3a_remarks"]
                != evaluation.is_ethics_criteria3a_remarks
            ):
                evaluation.is_ethics_criteria3a_remarks = data[
                    "is_ethics_criteria3a_remarks"
                ]
            if (
                data.get("is_ethics_criteria3b")
                and data["is_ethics_criteria3b"] != evaluation.is_ethics_criteria3b
            ):
                evaluation.is_ethics_criteria3b = data["is_ethics_criteria3b"]
            if (
                data.get("is_ethics_criteria3b_remarks")
                and data["is_ethics_criteria3b_remarks"]
                != evaluation.is_ethics_criteria3b_remarks
            ):
                evaluation.is_ethics_criteria3b_remarks = data[
                    "is_ethics_criteria3b_remarks"
                ]
            if (
                data.get("is_ethics_criteria4")
                and data["is_ethics_criteria4"] != evaluation.is_ethics_criteria4
            ):
                evaluation.is_ethics_criteria4 = data["is_ethics_criteria4"]
            if (
                data.get("is_ethics_criteria4_remarks")
                and data["is_ethics_criteria4_remarks"]
                != evaluation.is_ethics_criteria4_remarks
            ):
                evaluation.is_ethics_criteria4_remarks = data[
                    "is_ethics_criteria4_remarks"
                ]
            if (
                data.get("is_ethics_criteria5")
                and data["is_ethics_criteria5"] != evaluation.is_ethics_criteria5
            ):
                evaluation.is_ethics_criteria5 = data["is_ethics_criteria5"]
            if (
                data.get("is_ethics_criteria5_remarks")
                and data["is_ethics_criteria5_remarks"]
                != evaluation.is_ethics_criteria5_remarks
            ):
                evaluation.is_ethics_criteria5_remarks = data[
                    "is_ethics_criteria5_remarks"
                ]
            if data.get("status_id") and data["status_id"] != evaluation.status_id:
                evaluation.status_id = data["status_id"]
            if (
                data.get("status_remarks")
                and data["status_remarks"] != evaluation.status_remarks
            ):
                evaluation.status_remarks = data["status_remarks"]

            # Update research fields only if they have changed
            research = evaluation.research
            if data.get("title") and data["title"] != research.title:
                research.title = data["title"]
            if data.get("user_id") and data["user_id"] != research.user_id:
                research.user_id = data["user_id"]
            if data.get("camp_id") and data["camp_id"] != research.camp_id:
                research.camp_id = data["camp_id"]

            # Update associated authors only if they have changed
            if "authors" in data:
                author_ids = [i["value"] for i in data["authors"]]
                current_author_ids = [ar.author_id for ar in research.authorresearch]
                if set(author_ids) != set(current_author_ids):
                    for ar in research.authorresearch:
                        session.delete(ar)
                    for author_id in author_ids:
                        link_author_research(session, research.research_id, author_id)

            # Update associated departments only if they have changed
            if "departments" in data:
                dept_ids = [i["value"] for i in data["departments"]]
                current_dept_ids = [rd.dept_id for rd in research.researchdepartment]
                if set(dept_ids) != set(current_dept_ids):
                    for rd in research.researchdepartment:
                        session.delete(rd)
                    for dept_id in dept_ids:
                        link_research_department(session, research.research_id, dept_id)

            # Update associated keywords only if they have changed
            if "keywords" in data:
                keyword_ids = [i["value"] for i in data["keywords"]]
                current_keyword_ids = [
                    rk.keywords_id for rk in research.researchkeywords
                ]
                if set(keyword_ids) != set(current_keyword_ids):
                    for rk in research.researchkeywords:
                        session.delete(rk)
                    for keyword_id in keyword_ids:
                        link_research_keywords(
                            session, research.research_id, keyword_id
                        )

            # Update associated students only if they have changed
            if "students" in data:
                student_ids = [i["value"] for i in data["students"]]
                current_student_ids = [sr.student_id for sr in research.studentresearch]
                if set(student_ids) != set(current_student_ids):
                    for sr in research.studentresearch:
                        session.delete(sr)
                    for student_id in student_ids:
                        link_student_research(session, research.research_id, student_id)

            # Update associated department agendas only if they have changed
            if "deptagendas" in data:
                deptagenda_ids = [i["value"] for i in data["deptagendas"]]
                current_deptagenda_ids = [
                    rda.deptagenda_id for rda in research.researchdeptagenda
                ]
                if set(deptagenda_ids) != set(current_deptagenda_ids):
                    for rda in research.researchdeptagenda:
                        session.delete(rda)
                    for deptagenda_id in deptagenda_ids:
                        link_research_deptagenda(
                            session, research.research_id, deptagenda_id
                        )

            # Update associated institution agendas only if they have changed
            if "instagendas" in data:
                instagenda_ids = [i["value"] for i in data["instagendas"]]
                current_instagenda_ids = [
                    ria.instagenda_id for ria in research.researchinstagenda
                ]
                if set(instagenda_ids) != set(current_instagenda_ids):
                    for ria in research.researchinstagenda:
                        session.delete(ria)
                    for instagenda_id in instagenda_ids:
                        link_research_instagenda(
                            session, research.research_id, instagenda_id
                        )

            session.commit()
            return jsonify({"success": True, "message": "Updated record."}), 200

        except SQLAlchemyError as e:
            print(f"An error occurred: {e}")
            session.rollback()
            return jsonify(
                {"success": False, "message": "Failed to update record"}
            ), 500
        finally:
            session.close()

    elif request.method == "DELETE":
        try:
            # Retrieve the evaluation entry by ID
            evaluation = session.query(IncentivesEvaluation).get(evaluation_id)

            if not evaluation:
                return jsonify(
                    {"success": False, "message": "Evaluation not found"}
                ), 404

            # Get associated research
            research = evaluation.research

            # Delete the linking tables
            author_researches = research.authorresearch
            for ar in author_researches:
                session.delete(ar)

            research_departments = research.researchdepartment
            for rd in research_departments:
                session.delete(rd)

            research_keywords = research.researchkeywords
            for rk in research_keywords:
                session.delete(rk)

            student_researches = research.studentresearch
            for sr in student_researches:
                session.delete(sr)

            research_deptagendas = research.researchdeptagenda
            for rd in research_deptagendas:
                session.delete(rd)

            research_instagendas = research.researchinstagenda
            for ri in research_instagendas:
                session.delete(ri)

            # Delete the evaluation and the research
            session.delete(evaluation)
            session.delete(research)

            # Commit the changes to the database
            session.commit()

            return jsonify(
                {
                    "success": True,
                    "message": "Evaluation and associated research deleted successfully.",
                }
            ), 200

        except SQLAlchemyError as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify(
                {
                    "success": False,
                    "message": "Failed to delete evaluation and associated research",
                }
            ), 500
        finally:
            session.close()
