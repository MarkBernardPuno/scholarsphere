from flask import Blueprint, request, jsonify

from db.engine import get_session
from models.StudentResearch import StudentResearch

bp = Blueprint("bp_studentresearch", __name__, url_prefix="/v1/studentresearch")


@bp.route("/main", methods=["GET", "POST"])
# #@jwt_required()
def handleStudentResearchGetPost():
    session = get_session(autocommit=False, autoflush=False)()
    if request.method == "GET":
        try:
            result = session.query(StudentResearch).all()
            return jsonify(
                {
                    "success": True,
                    "message": f"Fetched all StudentResearch relations",
                    "data": [
                        {"research_id": i.research_id, "student_id": i.student_id}
                        for i in result
                    ],
                }
            ), 200
        except Exception as e:
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == "POST":
        data = request.get_json()
        new_data = StudentResearch(
            research_id=data.get("research_id"), student_id=data.get("student_id")
        )
        try:
            session.add(new_data)
            session.commit()
            return jsonify({"success": True, "message": str(new_data)}), 201
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    else:
        return jsonify({"success": False, "message": "Invalid request"}), 400


@bp.route("/<int:research_id>/<int:student_id>", methods=["GET", "PUT", "DELETE"])
# #@jwt_required()
def handleStudentResearchItemRequests(research_id, student_id):
    session = get_session(autocommit=False, autoflush=False)()
    if request.method == "GET":
        try:
            result = (
                session.query(StudentResearch)
                .filter_by(research_id=research_id, student_id=student_id)
                .first()
            )
            if result:
                return jsonify(
                    {
                        "success": True,
                        "message": f"Fetched record.",
                        "data": {
                            "research_id": result.research_id,
                            "student_id": result.student_id,
                        },
                    }
                ), 200
            else:
                return jsonify({"success": False, "message": f"No result"}), 404
        except Exception as e:
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == "PUT":
        try:
            result = (
                session.query(StudentResearch)
                .filter_by(research_id=research_id, student_id=student_id)
                .first()
            )
            if result:
                result.research_id = request.get_json().get("research_id")
                result.student_id = request.get_json().get("student_id")
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
            result = (
                session.query(StudentResearch)
                .filter_by(research_id=research_id, student_id=student_id)
                .first()
            )
            if not result:
                return jsonify(
                    {"success": False, "error": "StudentResearch relation not found"}
                ), 404
            session.delete(result)
            session.commit()
            return jsonify({"message": "StudentResearch relation deleted successfully"})
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    else:
        return jsonify({"success": False, "message": "Invalid request"}), 400


@bp.route("/populate", methods=["GET", "POST"])
def handlePopulateStudentResearch():
    session = get_session(autocommit=False, autoflush=False)()
    if request.method == "GET":
        data = session.query(StudentResearch).all()
        if data:
            data = [
                {"research_id": i.research_id, "student_id": i.student_id} for i in data
            ]

            return jsonify(
                {
                    "success": True,
                    "message": "StudentResearch is fetched succesfully",
                    "data": data,
                }
            ), 200
        else:
            return jsonify(
                {
                    "success": True,
                    "message": "StudentResearch has no records",
                    "data": data,
                }
            ), 401
    elif request.method == "POST":
        try:
            data = request.get_json()
            student_id = data.get("student_id")
            research_id = data.get("research_id")

            if student_id is None or research_id is None:
                return jsonify(
                    {
                        "success": False,
                        "message": "Both student_id and research_id are required",
                    }
                ), 400

            combination_exists = (
                session.query(StudentResearch)
                .filter_by(student_id=student_id, research_id=research_id)
                .first()
            )

            if combination_exists:
                return jsonify({"success": False, "message": "Combination exists"}), 400
            else:
                new_data = StudentResearch(student_id=student_id, research_id=research_id)
                session.add(new_data)
                session.commit()
                return jsonify(
                    {
                        "success": True,
                        "message": "Added student and research combination",
                    }
                ), 202

        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
