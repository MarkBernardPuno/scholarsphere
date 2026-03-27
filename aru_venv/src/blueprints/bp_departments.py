from flask import Blueprint, request, jsonify

from db.engine import get_session
from models.Departments import Departments

bp = Blueprint("bp_departments", __name__, url_prefix="/v1/departments")


@bp.route("/main", methods=["GET", "POST"])
# @jwt_required()
def handleDepartmentsGetPost():
    session = get_session(autocommit=False, autoflush=False)()
    if request.method == "GET":
        try:
            result = session.query(Departments).all()
            return jsonify(
                {
                    "success": True,
                    "message": f"Fetched all Departments",
                    "data": [
                        {
                            "dept_id": i.dept_id, 
                            "dept_name": i.dept_name,
                        } for i in result
                    ],
                }
            ), 200
        except Exception as e:
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
        
    elif request.method == "POST":
        data = request.get_json()
        new_data = Departments(dept_name=data.get("dept_name"))
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
def handleDepartmentItemRequests(id):
    session = get_session(autocommit=False, autoflush=False)()
    if request.method == "GET":
        try:
            result = session.query(Departments).get(id)
            if result:
                return jsonify(
                    {
                        "success": True,
                        "message": f"Fetched record.",
                        "data": {
                            "dept_id": result.dept_id,
                            "dept_name": result.dept_name,
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
            result = session.query(Departments).get(id)
            if result:
                result.dept_name = data.get("dept_name", result.dept_name)
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
            result = session.query(Departments).get(id)
            if not result:
                return jsonify({"success": False, "error": "Department not found"}), 404
            session.delete(result)
            session.commit()
            return jsonify({"message": "Department deleted successfully"})
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    else:
        return jsonify({"success": False, "message": "Invalid request"}), 400

