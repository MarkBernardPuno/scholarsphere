import os
import logging
from flask import Blueprint, request, jsonify, current_app
from db.engine import get_session
from models.File import File

# Initialize logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.ERROR)
handler = logging.FileHandler('error.log')
handler.setLevel(logging.ERROR)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)

bp = Blueprint("bp_file", __name__, url_prefix="/v1/file")

@bp.route("/main", methods=["GET", "POST"])
def handleFileUploadGetPost():
    session = get_session(autocommit=False, autoflush=False)()
    if request.method == "GET":
        try:
            result = session.query(File).all()
            return jsonify(
                {
                    "success": True,
                    "message": f"Fetched all files uploaded",
                    "data": [
                        {
                            "file_id": i.file_id,
                            "research_id": i.research_id,
                            "category_id": i.category_id,
                            "file_type": i.file_type,
                            "file_path": i.file_path,
                        }
                        for i in result
                    ],
                }
            ), 200
        except Exception as e:
            logger.error(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == "POST":
        data = request.get_json()
        new_data = File(
            research_id=data.get("research_id"),
            category_id=data.get("category_id"),
            file_type=data.get("file_type"),
            file_path=data.get("file_path"),
        )
        try:
            session.add(new_data)
            session.commit()
            return jsonify({"success": True, "message": str(new_data)}), 201
        except Exception as e:
            session.rollback()
            logger.error(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    else:
        return jsonify({"success": False, "message": "Invalid request"}), 400

@bp.route("/<int:id>", methods=["GET", "PUT", "DELETE"])
def handleFileUploadItemRequests(id):
    session = get_session(autocommit=False, autoflush=False)()
    if request.method == "GET":
        try:
            result = session.query(File).get(id)
            if result:
                return jsonify(
                    {
                        "success": True,
                        "message": f"Fetched record.",
                        "data": [
                            {
                                "file_id": result.file_id,
                                "research_id": result.research_id,
                                "category_id": result.category_id,
                                "file_type": result.file_type,
                                "file_path": result.file_path,
                            }
                        ],
                    }
                ), 200
            else:
                return jsonify({"success": False, "message": f"No result"}), 404
        except Exception as e:
            logger.error(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == "PUT":
        try:
            result = session.query(File).get(id)
            data = request.get_json()
            if result:
                result.research_id = data.get("research_id")
                result.category_id = data.get("category_id")
                result.file_type = data.get("file_type")
                result.file_path = data.get("file_path")
                session.commit()
                return jsonify({"success": True, "message": f"Updated record."}), 200
            else:
                return jsonify({"success": False, "message": f"No result"}), 404
        except Exception as e:
            session.rollback()
            logger.error(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == "DELETE":
        try:
            result = session.query(File).get(id)
            if not result:
                return jsonify({"success": False, "error": "File not found"}), 404
            session.delete(result)
            session.commit()
            return jsonify({"message": "File deleted successfully"})
        except Exception as e:
            session.rollback()
            logger.error(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    else:
        return jsonify({"success": False, "message": "Invalid request"}), 400

@bp.route("/upload", methods=["POST", "PUT"])
def upload_or_update_file():
    session = get_session(autocommit=False, autoflush=False)()
    
    research_id = request.form.get("research_id")
    category_id = request.form.get("category_id")
    file_type = request.form.get("file_type")

    if not research_id or not category_id or not file_type:
        return jsonify({"error": "Missing research_id, category_id or file_type"}), 400

    if request.method == "POST":
        if "file" not in request.files or request.files["file"].filename == "":
            return jsonify({"error": "No file part or no selected file"}), 400

        file = request.files["file"]
        original_filename, file_extension = os.path.splitext(file.filename)
        filename = os.path.join(current_app.config["UPLOAD_FOLDER"], file.filename)

        count = 1
        while os.path.exists(filename):
            filename = os.path.join(
                current_app.config["UPLOAD_FOLDER"],
                f"{original_filename} ({count}){file_extension}",
            )
            count += 1

        file.save(filename)

        try:
            existing_file = session.query(File).filter_by(
                research_id=research_id,
                category_id=category_id,
                file_type=file_type
            ).first()

            if existing_file:
                return jsonify({"error": "File already exists"}), 409

            new_data = File(
                research_id=research_id,
                category_id=category_id,
                file_type=file_type,
                file_path=filename,
            )
            session.add(new_data)
            session.commit()
            message = "File uploaded successfully"

        except Exception as e:
            session.rollback()
            logger.error(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500

        return jsonify(
            {
                "message": message,
                "file_path": filename,
                "research_id": research_id,
                "category_id": category_id,
                "file_type": file_type,
            }
        ), 200

    elif request.method == "PUT":
        existing_file = session.query(File).filter_by(
            research_id=research_id,
            category_id=category_id,
            file_type=file_type
        ).first()

        if not existing_file:
            return jsonify({"error": "File not found"}), 404

        # Fetch all files associated with the research ID, category ID, and file type
        existing_files = session.query(File).filter_by(
            research_id=research_id,
            category_id=category_id,
            file_type=file_type
        ).all()

        existing_filenames = [os.path.basename(file.file_path) for file in existing_files]

        # If a file is provided, update it if the filename is not in the existing ones
        if "file" in request.files and request.files["file"].filename != "":
            file = request.files["file"]
            original_filename = file.filename

            # Check if the filename exists in the existing files
            if original_filename in existing_filenames:
                return jsonify({"message": f"File '{original_filename}' already exists, skipping update."}), 200

            # If not, update the file
            file_extension = os.path.splitext(file.filename)[1]
            filename = os.path.join(current_app.config["UPLOAD_FOLDER"], file.filename)

            count = 1
            while os.path.exists(filename):
                filename = os.path.join(
                    current_app.config["UPLOAD_FOLDER"],
                    f"{original_filename} ({count}){file_extension}",
                )
                count += 1

            file.save(filename)
            existing_file.file_path = filename
            session.commit()
            return jsonify(
                {
                    "message": "File updated successfully",
                    "file_path": filename,
                    "research_id": research_id,
                    "category_id": category_id,
                    "file_type": file_type,
                }
            ), 200

        else:
            # If no file object is provided, do nothing and return 200
            return jsonify({"message": "No file provided; nothing to update"}), 200
