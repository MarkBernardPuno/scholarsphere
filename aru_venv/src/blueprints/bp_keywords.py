from flask import Blueprint, request, jsonify

from db.engine import get_session
from models.Keywords import Keywords

bp = Blueprint("bp_keywords", __name__, url_prefix="/v1/keywords")


@bp.route("/main", methods=["GET", "POST"])
# @jwt_required()
def handleCategoryGetPost():
    session = get_session(autocommit=False, autoflush=False)()
    if request.method == "GET":
        try:
            result = session.query(Keywords).all()
            return jsonify(
                {
                    "success": True,
                    "message": f"Fetched all Keywords",
                    "data": [
                        {
                            "keywords_id": i.keywords_id,
                            "keywords_name": i.keywords_name,
                        }
                        for i in result
                    ],
                }
            ), 200
        except Exception as e:
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == "POST":
        keywords_name = request.get_json().get("keywords_name")
        new_data = Keywords(keywords_name)
        try:
            session.add(new_data)
            session.commit()
            return jsonify({
                "success": True,
                "message": "Keyword created successfully",
                "keywords_id": new_data.keywords_id,
                "keywords_name": new_data.keywords_name
            }), 201
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    else:
        return jsonify({"success": False, "message": "Invalid request"}), 400


@bp.route("/<int:id>", methods=["GET", "PUT", "DELETE"])
# @jwt_required()
def handleKeywordsItemRequests(id):
    session = get_session(autocommit=False, autoflush=False)()
    if request.method == "GET":
        try:
            result = session.query(Keywords).get(id)
            if result:
                return jsonify(
                    {
                        "success": True,
                        "message": f"Fetched record.",
                        "data": [
                            {
                                "keywords_id": result.keywords_id,
                                "keywords_name": result.keywords_name,
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
            result = session.query(Keywords).get(id)
            if result:
                result.keywords_name = request.get_json().get(
                    "keywords_name"
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
            result = session.query(Keywords).get(id)
            if not result:
                return jsonify({"success": False, "error": "Keywords not found"}), 404
            session.delete(result)
            session.commit()
            return jsonify({"message": "Keywords deleted successfully"})
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    else:
        return jsonify({"success": False, "message": "Invalid request"}), 400
