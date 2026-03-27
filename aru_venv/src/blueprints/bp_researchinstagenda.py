from flask import Blueprint, request, jsonify

from db.engine import get_session
from models.ResearchInstAgenda import ResearchInstAgenda

bp = Blueprint("bp_researchinstagenda", __name__, url_prefix="/v1/researchinstagenda")


@bp.route("/main", methods=["GET", "POST"])
# #@jwt_required()
def handleResearchInstAgendaGetPost():
    session = get_session(autocommit=False, autoflush=False)()
    if request.method == "GET":
        try:
            result = session.query(ResearchInstAgenda).all()
            return jsonify(
                {
                    "success": True,
                    "message": f"Fetched all Research-InstAgenda relations",
                    "data": [
                        {"research_id": i.research_id, "instagenda_id": i.instagenda_id}
                        for i in result
                    ],
                }
            ), 200
        except Exception as e:
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == "POST":
        data = request.get_json()
        new_data = ResearchInstAgenda(
            research_id=data.get("research_id"), instagenda_id=data.get("instagenda_id")
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
    

@bp.route("/<int:research_id>/<int:instagenda_id>", methods=["GET", "PUT", "DELETE"])
# #@jwt_required()
def handleResearchInstAgendaItemRequests(research_id, instagenda_id):
    session = get_session(autocommit=False, autoflush=False)()
    if request.method == "GET":
        try:
            result = (
                session.query(ResearchInstAgenda)
                .filter_by(research_id=research_id, instagenda_id=instagenda_id)
                .first()
            )
            if result:
                return jsonify(
                    {
                        "success": True,
                        "message": f"Fetched record.",
                        "data": {
                            "research_id": result.research_id,
                            "instagenda_id": result.instagenda_id,
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
                session.query(ResearchInstAgenda)
                .filter_by(research_id=research_id, instagenda_id=instagenda_id)
                .first()
            )
            if result:
                result.research_id = request.get_json().get("research_id")
                result.instagenda_id = request.get_json().get("instagenda_id")
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
                session.query(ResearchInstAgenda)
                .filter_by(research_id=research_id, instagenda_id=instagenda_id)
                .first()
            )
            if not result:
                return jsonify(
                    {"success": False, "error": "Research-InstAgenda relation not found"}
                ), 404
            session.delete(result)
            session.commit()
            return jsonify({"message": "Research-InstAgenda relation deleted successfully"})
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    else:
        return jsonify({"success": False, "message": "Invalid request"}), 400


@bp.route("/populate", methods=["GET", "POST"])
def handlePopulateResearchInstAgenda():
    session = get_session(autocommit=False, autoflush=False)()
    if request.method == "GET":
        data = session.query(ResearchInstAgenda).all()
        if data:
            data = [
                {"research_id": i.research_id, "instagenda_id": i.instagenda_id} for i in data
            ]

            return jsonify(
                {
                    "success": True,
                    "message": "ResearchInstAgenda is fetched succesfully",
                    "data": data,
                }
            ), 200
        else:
            return jsonify(
                {
                    "success": True,
                    "message": "ResearchInstAgenda has no records",
                    "data": data,
                }
            ), 401
    elif request.method == "POST":
        try:
            data = request.get_json()
            instagenda_id = data.get("instagenda_id")
            research_id = data.get("research_id")

            if instagenda_id is None or research_id is None:
                return jsonify(
                    {
                        "success": False,
                        "message": "Both instagenda_id and research_id are required",
                    }
                ), 400

            combination_exists = (
                session.query(ResearchInstAgenda)
                .filter_by(instagenda_id=instagenda_id, research_id=research_id)
                .first()
            )

            if combination_exists:
                return jsonify({"success": False, "message": "Combination exists"}), 400
            else:
                new_data = ResearchInstAgenda(instagenda_id=instagenda_id, research_id=research_id)
                session.add(new_data)
                session.commit()
                return jsonify(
                    {
                        "success": True,
                        "message": "Added research and instagenda combination",
                    }
                ), 202

        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
