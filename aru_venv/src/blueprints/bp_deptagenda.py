from flask import Blueprint, request, jsonify

from db.engine import get_session
from models.DeptAgenda import DeptAgenda

bp = Blueprint("bp_deptagenda", __name__, url_prefix="/v1/deptagenda")


@bp.route("/main", methods=["GET", "POST"])
# @jwt_required()
def handleDeptAgendaGetPost():
    session = get_session(autocommit=False, autoflush=False)()
    if request.method == "GET":
        try:
            result = session.query(DeptAgenda).all()
            return jsonify(
                {
                    "success": True,
                    "message": f"Fetched all DeptAgenda",
                    "data": [
                        {
                            "deptagenda_id": i.deptagenda_id, 
                            "deptagenda_name": i.deptagenda_name,
                            "dept_id": i.dept_id
                        } for i in result
                    ],
                }
            ), 200
        except Exception as e:
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
        
    elif request.method == "POST":
        data = request.get_json()
        new_data = DeptAgenda(
            deptagenda_name=data.get("deptagenda_name"),
            dept_id=data.get("dept_id")
        )
        try:
            session.add(new_data)
            session.commit()
            return jsonify({
                "success": True, 
                "message": str(new_data),
                "deptagenda_id": new_data.deptagenda_id,
                "deptagenda_name": new_data.deptagenda_name
                }), 201
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    else:
        return jsonify({"success": False, "message": "Invalid request"}), 400


@bp.route("/<int:id>", methods=["GET", "PUT", "DELETE"])
# @jwt_required()
def handleDeptAgendaItemRequests(id):
    session = get_session(autocommit=False, autoflush=False)()
    if request.method == "GET":
        try:
            result = session.query(DeptAgenda).get(id)
            if result:
                return jsonify(
                    {
                        "success": True,
                        "message": f"Fetched record.",
                        "data": {
                            "deptagenda_id": result.deptagenda_id,
                            "deptagenda_name": result.deptagenda_name,
                            "dept_id": result.dept_id
                        },
                    }
                ), 200
            else:
                return jsonify({"success": False, "message": f"No result"}), 404
        except Exception as e:
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
        
    elif request.method == "PUT":
        data = request.get_json()
        try:
            result = session.query(DeptAgenda).get(id)
            if result:
                result.deptagenda_name = data.get("deptagenda_name", result.deptagenda_name)
                result.dept_id = data.get("dept_id", result.dept_id)
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
            result = session.query(DeptAgenda).get(id)
            if not result:
                return jsonify({"success": False, "error": "DeptAgenda not found"}), 404
            session.delete(result)
            session.commit()
            return jsonify({"message": "DeptAgenda deleted successfully"})
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    else:
        return jsonify({"success": False, "message": "Invalid request"}), 400

