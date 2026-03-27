from flask import Blueprint, request, jsonify

from db.engine import get_session
from models.Notification import Notification

bp = Blueprint("bp_notification", __name__, url_prefix="/v1/notification")


@bp.route("/main", methods=["GET", "POST"])
def handleNotificationGetPost():
    session = get_session(autocommit=False, autoflush=False)()
    if request.method == "GET":
        try:
            result = session.query(Notification).all()
            return jsonify(
                {
                    "success": True,
                    "message": f"Fetched all Status",
                    "data": [
                        {
                            "notif_id": i.notif_id,
                            "notif_desc": i.notif_desc,
                            "application_id": i.application_id,
                            "user_id": i.user_id,
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
        new_data = Notification(
            notif_desc=data.get("notif_desc"),
            application_id=data.get("application_id"),
            user_id=data.get("user_id"),
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
def handleNotificationItemRequests(id):
    session = get_session(autocommit=False, autoflush=False)()
    if request.method == "GET":
        try:
            result = session.query(Notification).get(id)
            if result:
                return jsonify(
                    {
                        "success": True,
                        "message": f"Fetched record.",
                        "data": [
                            {
                                "notif_id": result.notif_id,
                                "notif_desc": result.notif_desc,
                                "application_id": result.application_id,
                                "user_id": result.user_id,
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
            result = session.query(Notification).get(id)
            data = request.get_json()
            if result:
                result.notif_desc = (data.get("notif_desc"),)
                result.application_id = (data.get("application_id"),)
                result.user_id = (data.get("user_id"),)
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
            result = session.query(Notification).get(id)
            if not result:
                return jsonify(
                    {"success": False, "error": "Notification not found"}
                ), 404
            session.delete(result)
            session.commit()
            return jsonify({"message": "Notification deleted successfully"})
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    else:
        return jsonify({"success": False, "message": "Invalid request"}), 400


@bp.route('/<int:user_id>', methods=['GET'])
#@jwt_required()
def handleGetNotification(user_id):
    session = get_session(autocommit=False, autoflush=False)()
    result = session.query(Notification).filter(Notification.user_id==user_id)
        
    
