from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token
from werkzeug.security import generate_password_hash, check_password_hash

from db.engine import get_session
from models.Author import Author
from models.Users import Users
from models.Departments import Departments
from models.Campus import Campus
import logging
from flask import current_app
from flask_mail import Message

bp = Blueprint("bp_auth", __name__, url_prefix="/v1/auth")

logging.basicConfig(level=logging.DEBUG)


@bp.route('/send-email', methods=['POST'])
def send_email():
    data = request.get_json()
    recipient = data.get('email')
    
    if not recipient:
        return jsonify({'error': 'Email is required'}), 400

    msg = Message('Test Email', recipients=[recipient])
    msg.body = 'This is a test email.'
    
    mail = current_app.extensions['mail']
    mail.send(msg)
    
    return jsonify({'message': 'Email sent successfully'}), 200


@bp.route("/signup", methods=["POST"])
def signup():
    session = get_session(autocommit=False, autoflush=False)()
    data = request.get_json()
    logging.debug(f"Received data: {data}")

    name = data.get("name")
    email = data.get("email")

    # Check whether the user exists
    db_user = session.query(Users).filter_by(email=email).first()
    if db_user is not None:
        return jsonify(
            {"success": False, "message": f"User with email {email} already exists."}
        )

    db_author = session.query(Author).filter_by(author_name=name).first()
    if db_author is not None:
        return jsonify(
            {"success": False, "message": f"User with name {name} already exists."}
        )

    new_user = Users(
        email=data.get("email"),
        password=generate_password_hash(data.get("password")),
        dept_id=data.get("dept_id"),
        camp_id=data.get("camp_id"),
        role=data.get("role"),
        activated=data.get("activated") == "True",
    )

    try:
        session.add(new_user)
        session.commit()
        db_user = session.query(Users).filter_by(email=email).first()
        logging.debug(f"User created: {db_user}")
    except Exception as e:
        session.rollback()
        logging.error(f"Error creating user: {e}")
        return jsonify({"success": False, "message": str(e)})

    new_author = Author(author_name=name, user_id=db_user.user_id)

    try:
        session.add(new_author)
        session.commit()
        logging.debug(f"Author created: {new_author}")
    except Exception as e:
        session.rollback()
        logging.error(f"Error creating author: {e}")
        return jsonify({"success": False, "message": str(e)})

    return jsonify({"success": True, "message": "User created successfully."}), 200


@bp.route("/login", methods=["POST"])
def login():
    session = get_session(autocommit=False, autoflush=False)()
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    try:
        db_user = session.query(Users).filter_by(email=email).first()

        if db_user and check_password_hash(db_user.password, password):
            access_token = create_access_token(identity=db_user.email)
            refresh_token = create_refresh_token(identity=db_user.email)

            db_author = (
                session.query(Author).filter(Author.user_id == db_user.user_id).first()
            )
            db_dept = (
                session.query(Departments)
                .filter(Departments.dept_id == db_user.dept_id)
                .first()
            )
            db_campus = (
                session.query(Campus).filter(Campus.camp_id == db_user.camp_id).first()
            )

            return jsonify(
                {
                    "success": True,
                    "message": "Token created successfuly.",
                    "access_token": access_token,
                    "refresh_token": refresh_token,
                    "user": {
                        "user_id": db_user.user_id,
                        "author_id": db_author.author_id,
                        "author_name": db_author.author_name,
                        "email": db_user.email,
                        "role": db_user.role,
                        "dept": db_dept.dept_name,
                        "campus": db_campus.camp_name,
                    },
                }
            )
        else:
            return jsonify({"success": False, "message": "No account exist"}), 500
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"success": False, "message": str(e)}), 500
