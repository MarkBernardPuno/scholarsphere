from flask import Blueprint, request, jsonify

from db.engine import get_session
from models.ResearchKeywords import ResearchKeywords

bp = Blueprint("bp_researchkeywords", __name__, url_prefix="/v1/researchkeywords")


@bp.route("/main", methods=["GET", "POST"])
# #@jwt_required()
def handleResearchKeywordsGetPost():
    session = get_session(autocommit=False, autoflush=False)()
    if request.method == "GET":
        try:
            result = session.query(ResearchKeywords).all()
            return jsonify(
                {
                    "success": True,
                    "message": f"Fetched all Research-Keywords relations",
                    "data": [
                        {"research_id": i.research_id, "keywords_id": i.keywords_id}
                        for i in result
                    ],
                }
            ), 200
        except Exception as e:
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == "POST":
        data = request.get_json()
        new_data = ResearchKeywords(
            research_id=data.get("research_id"), keywords_id=data.get("keywords_id")
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
    

@bp.route("/<int:research_id>/<int:keywords_id>", methods=["GET", "PUT", "DELETE"])
# #@jwt_required()
def handleResearchKeywordsItemRequests(research_id, keywords_id):
    session = get_session(autocommit=False, autoflush=False)()
    if request.method == "GET":
        try:
            result = (
                session.query(ResearchKeywords)
                .filter_by(research_id=research_id, keywords_id=keywords_id)
                .first()
            )
            if result:
                return jsonify(
                    {
                        "success": True,
                        "message": f"Fetched record.",
                        "data": {
                            "research_id": result.research_id,
                            "keywords_id": result.keywords_id,
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
                session.query(ResearchKeywords)
                .filter_by(research_id=research_id, keywords_id=keywords_id)
                .first()
            )
            if result:
                result.research_id = request.get_json().get("research_id")
                result.keywords_id = request.get_json().get("keywords_id")
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
                session.query(ResearchKeywords)
                .filter_by(research_id=research_id, keywords_id=keywords_id)
                .first()
            )
            if not result:
                return jsonify(
                    {"success": False, "error": "ResearchKeywords relation not found"}
                ), 404
            session.delete(result)
            session.commit()
            return jsonify({"message": "ResearchKeywords relation deleted successfully"})
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    else:
        return jsonify({"success": False, "message": "Invalid request"}), 400


@bp.route("/populate", methods=["GET", "POST"])
def handlePopulateResearchKeywords():
    session = get_session(autocommit=False, autoflush=False)()
    if request.method == "GET":
        data = session.query(ResearchKeywords).all()
        if data:
            data = [
                {"research_id": i.research_id, "keywords_id": i.keywords_id} for i in data
            ]

            return jsonify(
                {
                    "success": True,
                    "message": "ResearchKeywords is fetched succesfully",
                    "data": data,
                }
            ), 200
        else:
            return jsonify(
                {
                    "success": True,
                    "message": "ResearchKeywords has no records",
                    "data": data,
                }
            ), 401
    elif request.method == "POST":
        try:
            data = request.get_json()
            keywords_id = data.get("keywords_id")
            research_id = data.get("research_id")

            if keywords_id is None or research_id is None:
                return jsonify(
                    {
                        "success": False,
                        "message": "Both keywords_id and research_id are required",
                    }
                ), 400

            combination_exists = (
                session.query(ResearchKeywords)
                .filter_by(keywords_id=keywords_id, research_id=research_id)
                .first()
            )

            if combination_exists:
                return jsonify({"success": False, "message": "Combination exists"}), 400
            else:
                new_data = ResearchKeywords(keywords_id=keywords_id, research_id=research_id)
                session.add(new_data)
                session.commit()
                return jsonify(
                    {
                        "success": True,
                        "message": "Added research and keywords combination",
                    }
                ), 202

        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
