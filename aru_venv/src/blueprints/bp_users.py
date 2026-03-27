from socket import timeout
from flask import Blueprint, request, jsonify, current_app, send_file
import os
from db.engine import get_session
from models.Author import Author
from models.Users import Users
from models.Departments import Departments
import re

bp = Blueprint("bp_users", __name__, url_prefix="/v1/users")


@bp.route("/main", methods=["GET", "POST"])
# @jwt_required()
def handleUsersGetPost():
    session = get_session(autocommit=False, autoflush=False)()
    if request.method == "GET":
        try:
            result = session.query(Users).all()
            return jsonify(
                {
                    "success": True,
                    "message": f"Fetched all users",
                    "data": [
                        {
                            "user_id": i.user_id,
                            "email": i.email,
                            "role": i.role,
                            "dept_id": i.dept_id,
                            "camp_id": i.camp_id,
                            "activated": i.activated,
                            "image": i.image,
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
        new_data = Users(email=data.get("email"), dept_id=data.get("dept_id"))
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
def handleUserItemRequests(id):
    session = get_session(autocommit=False, autoflush=False)()
    if request.method == "GET":
        try:
            result = session.query(Users).get(id)
            if result:
                return jsonify(
                    {
                        "success": True,
                        "message": f"Fetched record.",
                        "data": [
                            {
                                "user_id": result.user_id,
                                "email": result.email,
                                "role": result.role,
                                "dept_id": result.dept_id,
                                "activated": result.activated,
                                "image": result.image,
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
            result = session.query(Users).get(id)
            data = request.get_json()
            if result:
                result.email = (data.get("email"),)
                result.dept_id = (data.get("dept_id"),)
                result.role = (data.get("role"),)
                result.activated = eval(data.get("activated"))
                result.password = data.get("password")
                # Update the image if provided
                if "image" in data:
                    result.image = data.get("image")
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
            result = session.query(Users).get(id)
            if not result:
                return jsonify({"success": False, "error": "User not found"}), 404
            session.delete(result)
            session.commit()
            return jsonify({"message": "User deleted successfully"})
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    else:
        return jsonify({"success": False, "message": "Invalid request"}), 400


def modifyUser():
    session = get_session(autocommit=False, autoflush=False)()
    data = request.get_json()

    try:
        db_author = session.query(Author).get(data.get("author_id"))
        db_user = session.query(Users).get(data.get("user_id"))

        if not db_user or not db_author:
            return jsonify(
                {"success": False, "message": "User or Author not found"}
            ), 404

        db_user.email = data.get("email")
        db_user.dept_id = session.query(Departments).get(data.get("dept_id"))
        db_user.role = data.get("role")
        db_author.author_name = data.get("name")

        # Update the image if provided
        if "image" in data:
            db_user.image = data.get("image")

        session.commit()
        return jsonify({"success": True, "message": "User modified successfully."}), 200

    except Exception as e:
        session.rollback()
        print(f"An error occurred: {e}")
        return jsonify({"success": False, "message": str(e)}), 500


@bp.route("/users/researchers", methods=["GET"])
def handleResearchers():
    try:
        session = get_session(autocommit=False, autoflush=False)()
        all = (
            session.query(
                Author.author_id,
                Users.user_id,
                Author.author_name,
                Departments.dept_id,
                Departments.dept_name,
                Users.role,
                Users.email,
                Users.activated,
                Users.image,
            )
            .join(Users, Author.user_id == Users.user_id)
            .join(Departments, Users.dept_id == Departments.dept_id)
        )

        researchers = [
            {
                "author_id": i.author_id,
                "user_id": i.user_id,
                "name": i.author_name,
                "dept_id": i.dept_id,
                "department": i.dept_name,
                "role": i.role,
                "email": i.email,
                "activated": i.activated,
                "image": i.image,
            }
            for i in all.filter(Users.role == "Researcher")
            .order_by(Author.author_name)
            .all()
        ]

        program_chairs = [
            {
                "author_id": i.author_id,
                "user_id": i.user_id,
                "name": i.author_name,
                "dept_id": i.dept_id,
                "department": i.dept_name,
                "role": i.role,
                "email": i.email,
                "activated": i.activated,
            }
            for i in all.filter(Users.role == "Program Chair")
            .order_by(Author.author_name)
            .all()
        ]

        research_admins = [
            {
                "author_id": i.author_id,
                "user_id": i.user_id,
                "name": i.author_name,
                "dept_id": i.dept_id,
                "department": i.dept_name,
                "role": i.role,
                "email": i.email,
                "activated": i.activated,
                "image": i.image,
            }
            for i in all.filter(Users.role == "Research Admin")
            .order_by(Author.author_name)
            .all()
        ]

        return jsonify(
            {
                "success": True,
                "message": f"Fetched all users",
                "data": {
                    "researchers": researchers,
                    "program_chairs": program_chairs,
                    "research_admin": research_admins,
                },
            }
        ), 200
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"success": False, "message": str(e)}), 500


@bp.route("/upload_image/<int:user_id>", methods=["POST", "PUT"])
def upload_or_update_image(user_id):
    session = get_session(autocommit=False, autoflush=False)()

    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    user = session.query(Users).get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    if file:
        original_filename = file.filename
        file_extension = os.path.splitext(original_filename)[1]

        # Construct the new filename with a delimiter
        filename = f"profile_photo_{user_id}_{file_extension}"
        file_path = os.path.join(current_app.config["UPLOAD_FOLDER"], filename)

        count = 1
        while os.path.exists(file_path):
            filename = f"profile_photo_{user_id}_{count}{file_extension}"
            file_path = os.path.join(current_app.config["UPLOAD_FOLDER"], filename)
            count += 1

        try:
            file.save(file_path)

            # Update the user's image filename in the database
            user.image = filename
            session.commit()

            return jsonify(
                {
                    "message": "Image uploaded successfully",
                    "file_path": file_path,
                    "file_type": file.content_type,
                    "user_id": user_id,
                }
            ), 200
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"error": str(e)}), 500
    else:
        return jsonify({"error": "No file part"}), 400


@bp.route("/latest_image/<int:user_id>", methods=["GET"])
def get_latest_image(user_id):
    cache = current_app.cache

    cache_key = f"latest_image_{user_id}"

    cached_image = cache.get(cache_key)
    if cached_image:
        return send_file(cached_image, mimetype="image/jpeg")

    session = get_session(autocommit=False, autoflush=False)()

    user = session.query(Users).get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    upload_folder = current_app.config["UPLOAD_FOLDER"]

    pattern = f"profile_photo_{user_id}_"
    files = [
        f
        for f in os.listdir(upload_folder)
        if f.startswith(pattern) and os.path.isfile(os.path.join(upload_folder, f))
    ]

    if not files:
        return jsonify({"message": "No files found for this user"}), 404

    latest_file = max(
        files, key=lambda f: os.path.getmtime(os.path.join(upload_folder, f))
    )
    file_path = os.path.join(upload_folder, latest_file)

    try:
        cache.set(cache_key, file_path, timeout=1)
        return send_file(file_path, mimetype="image/jpeg")
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": "Failed to retrieve image"}), 500
