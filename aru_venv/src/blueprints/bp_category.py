from flask import Blueprint, request, jsonify

from db.engine import get_session
from models.Category import Category
from flask_cors import cross_origin

bp = Blueprint("bp_category", __name__, url_prefix="/v1/category")


@bp.route("/main", methods=["GET", "POST"])
# @jwt_required()
def handleCategoryGetPost():
    session = get_session(autocommit=False, autoflush=False)()
    if request.method == "GET":
        try:
            result = session.query(Category).all()
            return jsonify(
                {
                    "success": True,
                    "message": f"Fetched all Category",
                    "data": [
                        {
                            "category_id": i.category_id,
                            "category_description": i.category_description,
                        }
                        for i in result
                    ],
                }
            ), 200
        except Exception as e:
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == "POST":
        category_description = request.get_json().get("category_description")
        new_data = Category(category_description)
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
@cross_origin(supports_credentials=True)
# @jwt_required()
def handleCategoryItemRequests(id):
    session = get_session(autocommit=False, autoflush=False)()
    if request.method == "GET":
        try:
            result = session.query(Category).get(id)
            if result:
                return jsonify(
                    {
                        "success": True,
                        "message": f"Fetched record.",
                        "data": [
                            {
                                "category_id": result.category_id,
                                "category_description": result.category_description,
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
            result = session.query(Category).get(id)
            if result:
                result.category_description = request.get_json().get(
                    "category_description"
                )
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
            result = session.query(Category).get(id)
            if not result:
                return jsonify({"success": False, "error": "Category not found"}), 404
            session.delete(result)
            session.commit()
            return jsonify({"message": "Category deleted successfully"})
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    else:
        return jsonify({"success": False, "message": "Invalid request"}), 400
