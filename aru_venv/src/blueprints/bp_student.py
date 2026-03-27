from db.engine import get_session
from flask import Blueprint, jsonify, request
from models.Student import Student
from models.StudentResearch import StudentResearch
from models.Departments import Departments


bp = Blueprint("bp_student", __name__, url_prefix="/v1/student")

@bp.route("/main", methods=["GET", "POST"])
# @jwt_required()
def handleStudentGetPost():
    session = get_session(autocommit=False, autoflush=False)()
    if request.method == "GET":
        try:
            result = session.query(Student).all()
            data = []
            
            for i in result:
                dept_name=""
                if i.dept_id:
                    dept = session.get(Departments, i.dept_id)
                    if dept:
                        dept_name = dept.dept_name
                    
                data.append({
                    "author_id": i.author_id,
                    "author_name": i.author_name,
                    "dept_name": dept_name
                })
            
            return jsonify(
                {
                    "success": True,
                    "message": f"Fetched all Students",
                    "data": data
                }
            ), 200
        except Exception as e:
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == "POST":
        student_name = request.get_json().get("student_name")
        dept_id = request.get_json().get("dept_id")
        
        if not student_name:
            return jsonify({"success": False, "message": "student_name is required"}), 400
        
        new_data = Student(student_name, dept_id)
        try:
            session.add(new_data)
            session.commit()
            return jsonify(
                {
                    "success": True,
                    "message": str(new_data),
                    "author_id": new_data.student_id,
                }
            ), 201
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    else:
        return jsonify({"success": False, "message": "Invalid request"}), 400


@bp.route("/<int:id>", methods=["GET", "PUT", "DELETE"])
# @jwt_required()
def handleStudentItemRequests(id):
    session = get_session(autocommit=False, autoflush=False)()
    if request.method == "GET":
        try:
            result = session.query(Author).get(id)
            if result:
                dept_name = ""
                if result.dept_id:
                    dept = session.get(Departments, result.dept_id)
                    if dept:
                        dept_name = dept.dept_name
                        
                return jsonify(
                    {
                        "success": True,
                        "message": f"Fetched record.",
                        "data": [
                            {
                                "student_id": result.student_id,
                                "student_name": result.student_name,
                                "dept_name": dept_name
                            }
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
            result = session.query(Student).get(id)
            if result:
                result.student_name = request.get_json().get("student_name", result.student_name)
                result.dept_id = request.get_json().get("dept_id", result.dept_id)
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
            result = session.query(Student).get(id)
            if not result:
                return jsonify({"success": False, "error": "Student not found"}), 404
            session.delete(result)
            session.commit()
            return jsonify({"message": "Student deleted successfully"})
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    else:
        return jsonify({"success": False, "message": "Invalid request"}), 400

