from flask import Blueprint, request, jsonify

from db.engine import get_session
from models.ResearchDepartment import ResearchDepartment

bp = Blueprint("bp_researchdepartment", __name__, url_prefix="/v1/researchdepartment")


@bp.route("/main", methods=["GET", "POST"])
# #@jwt_required()
def handleResearchDepartmentGetPost():
    session = get_session(autocommit=False, autoflush=False)()
    if request.method == "GET":
        try:
            result = session.query(ResearchDepartment).all()
            return jsonify(
                {
                    "success": True,
                    "message": f"Fetched all Research-Department relations",
                    "data": [
                        {"research_id": i.research_id, "dept_id": i.dept_id}
                        for i in result
                    ],
                }
            ), 200
        except Exception as e:
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == "POST":
        data = request.get_json()
        new_data = ResearchDepartment(
            research_id=data.get("research_id"), dept_id=data.get("dept_id")
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
    

@bp.route("/<int:research_id>/<int:dept_id>", methods=["GET", "PUT", "DELETE"])
# #@jwt_required()
def handleResearchDepartmentItemRequests(research_id, dept_id):
    session = get_session(autocommit=False, autoflush=False)()
    if request.method == "GET":
        try:
            result = (
                session.query(ResearchDepartment)
                .filter_by(research_id=research_id, dept_id=dept_id)
                .first()
            )
            if result:
                return jsonify(
                    {
                        "success": True,
                        "message": f"Fetched record.",
                        "data": {
                            "research_id": result.research_id,
                            "dept_id": result.dept_id,
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
                session.query(ResearchDepartment)
                .filter_by(research_id=research_id, dept_id=dept_id)
                .first()
            )
            if result:
                result.research_id = request.get_json().get("research_id")
                result.dept_id = request.get_json().get("dept_id")
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
                session.query(ResearchDepartment)
                .filter_by(research_id=research_id, dept_id=dept_id)
                .first()
            )
            if not result:
                return jsonify(
                    {"success": False, "error": "Research-Department relation not found"}
                ), 404
            session.delete(result)
            session.commit()
            return jsonify({"message": "Research-Department relation deleted successfully"})
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    else:
        return jsonify({"success": False, "message": "Invalid request"}), 400


@bp.route("/populate", methods=["GET", "POST"])
def handlePopulateResearchDepartment():
    session = get_session(autocommit=False, autoflush=False)()
    if request.method == "GET":
        data = session.query(ResearchDepartment).all()
        if data:
            data = [
                {"research_id": i.research_id, "dept_id": i.dept_id} for i in data
            ]

            return jsonify(
                {
                    "success": True,
                    "message": "ResearchDepartment is fetched succesfully",
                    "data": data,
                }
            ), 200
        else:
            return jsonify(
                {
                    "success": True,
                    "message": "ResearchDepartment has no records",
                    "data": data,
                }
            ), 401
    elif request.method == "POST":
        try:
            data = request.get_json()
            dept_id = data.get("dept_id")
            research_id = data.get("research_id")

            if dept_id is None or research_id is None:
                return jsonify(
                    {
                        "success": False,
                        "message": "Both dept_id and research_id are required",
                    }
                ), 400

            combination_exists = (
                session.query(ResearchDepartment)
                .filter_by(dept_id=dept_id, research_id=research_id)
                .first()
            )

            if combination_exists:
                return jsonify({"success": False, "message": "Combination exists"}), 400
            else:
                new_data = ResearchDepartment(dept_id=dept_id, research_id=research_id)
                session.add(new_data)
                session.commit()
                return jsonify(
                    {
                        "success": True,
                        "message": "Added research and department combination",
                    }
                ), 202

        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
