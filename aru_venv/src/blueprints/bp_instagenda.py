from flask import Blueprint, request, jsonify

from db.engine import get_session
from models.InstAgenda import InstAgenda

bp = Blueprint("bp_instagenda", __name__, url_prefix="/v1/instagenda")


@bp.route("/main", methods=["GET", "POST"])
# @jwt_required()
def handleInstAgendaGetPost():
    session = get_session(autocommit=False, autoflush=False)()
    if request.method == "GET":
        try:
            result = session.query(InstAgenda).all()
            return jsonify(
                {
                    "success": True,
                    "message": f"Fetched all InstAgenda",
                    "data": [
                        {"instagenda_id": i.instagenda_id, "instagenda_name": i.instagenda_name} for i in result
                    ],
                }
            ), 200
        except Exception as e:
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == "POST":
        new_data = InstAgenda(request.get_json().get("instagenda_name"))
        try:
            session.add(new_data)
            session.commit()
            return jsonify({
                "success": True, 
                "message": str(new_data),
                "instagenda_id": new_data.instagenda_id,
                "instagenda_name": new_data.instagenda_name
                }), 201
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    else:
        return jsonify({"success": False, "message": "Invalid request"}), 400


@bp.route("/<int:id>", methods=["GET", "PUT", "DELETE"])
# @jwt_required()
def handleInstAgendaItemRequests(id):
    session = get_session(autocommit=False, autoflush=False)()
    if request.method == "GET":
        try:
            result = session.query(InstAgenda).get(id)
            if result:
                return jsonify(
                    {
                        "success": True,
                        "message": f"Fetched record.",
                        "data": [
                            {"instagenda_id": result.instagenda_id, "instagenda_name": result.instagenda_name}
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
            result = session.query(InstAgenda).get(id)
            if result:
                result.instagenda_name = request.get_json().get("instagenda_name")
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
            result = session.query(InstAgenda).get(id)
            if not result:
                return jsonify({"success": False, "error": "InstAgenda not found"}), 404
            session.delete(result)
            session.commit()
            return jsonify({"message": "InstAgenda deleted successfully"})
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    else:
        return jsonify({"success": False, "message": "Invalid request"}), 400
