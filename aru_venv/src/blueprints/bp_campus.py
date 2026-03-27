from flask import Blueprint, request, jsonify

from db.engine import get_session
from models.Campus import Campus

bp = Blueprint("bp_campus", __name__, url_prefix="/v1/campus")


@bp.route("/main", methods=["GET", "POST"])
# @jwt_required()
def handleCampusGetPost():
    session = get_session(autocommit=False, autoflush=False)()
    if request.method == "GET":
        try:
            result = session.query(Campus).all()
            return jsonify(
                {
                    "success": True,
                    "message": f"Fetched all Campuses",
                    "data": [
                        {"camp_id": i.camp_id, "camp_name": i.camp_name} for i in result
                    ],
                }
            ), 200
        except Exception as e:
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == "POST":
        new_data = Campus(request.get_json().get("camp_name"))
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


@bp.route("/<int:id>", methods=["GET", "PUT", "DELETE"])
# @jwt_required()
def handleCampusItemRequests(id):
    session = get_session(autocommit=False, autoflush=False)()
    if request.method == "GET":
        try:
            result = session.query(Campus).get(id)
            if result:
                return jsonify(
                    {
                        "success": True,
                        "message": f"Fetched record.",
                        "data": [
                            {"camp_id": result.camp_id, "camp_name": result.camp_name}
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
            result = session.query(Campus).get(id)
            if result:
                result.camp_name = request.get_json().get("camp_name")
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
            result = session.query(Campus).get(id)
            if not result:
                return jsonify({"success": False, "error": "Campus not found"}), 404
            session.delete(result)
            session.commit()
            return jsonify({"message": "Campus deleted successfully"})
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    else:
        return jsonify({"success": False, "message": "Invalid request"}), 400
