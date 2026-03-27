from flask import Blueprint, request, jsonify

from db.engine import get_session
from models.CitingPaper import CitingPaper

bp = Blueprint("bp_citingpaper", __name__, url_prefix="/v1/citingpaper")


@bp.route("/main", methods=["GET", "POST"])
def handleCitingpaperGetPost():
    session = get_session(autocommit=False, autoflush=False)()
    if request.method == "GET":
        try:
            result = session.query(CitingPaper).all()
            return jsonify(
                {
                    "success": True,
                    "message": f"Fetched all Citing Papers",
                    "data": [
                        {
                            "citing_id": i.citing_id,
                            "research_indexing": i.research_indexing,
                            "pub_location": i.pub_location,
                            "citing_pub_date": i.citing_pub_date,
                            "cite_doi_or_full": i.cite_doi_or_full,
                        }
                        for i in result
                    ],
                }
            ), 200
        except Exception as e:
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == "POST":
        data = request.get_json()
        new_data = CitingPaper(
            research_indexing=data.get("research_indexing"),
            pub_location=data.get("pub_location"),
            citing_pub_date=data.get("citing_pub_date"),
            cite_doi_or_full=data.get("cite_doi_or_full"),
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


@bp.route("/<int:id>", methods=["GET", "PUT", "DELETE"])
# @jwt_required()
def handleCitingpaperItemRequests(id):
    session = get_session(autocommit=False, autoflush=False)()
    if request.method == "GET":
        try:
            result = session.query(CitingPaper).get(id)
            if result:
                return jsonify(
                    {
                        "success": True,
                        "message": f"Fetched record.",
                        "data": [
                            {
                                "citing_id": result.citing_id,
                                "research_indexing": result.research_indexing,
                                "pub_location": result.pub_location,
                                "citing_pub_date": result.citing_pub_date,
                                "cite_doi_or_full": result.cite_doi_or_full,
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
            result = session.query(CitingPaper).get(id)
            data = request.get_json()
            if result:
                result.research_indexing = (data.get("research_indexing"),)
                result.pub_location = (data.get("pub_location"),)
                result.citing_pub_date = (data.get("citing_pub_date"),)
                result.cite_doi_or_full = data.get("cite_doi_or_full")
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
            result = session.query(CitingPaper).get(id)
            if not result:
                return jsonify(
                    {"success": False, "error": "Citing Paper not found"}
                ), 404
            session.delete(result)
            session.commit()
            return jsonify({"message": "Citing Paper deleted successfully"})
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    else:
        return jsonify({"success": False, "message": "Invalid request"}), 400
