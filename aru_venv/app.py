import os
from datetime import timedelta
import sys
import subprocess
from flask_mail import Mail

from blueprints import (
    bp_auth,
    bp_author,
    bp_authorresearch,
    bp_campus,
    bp_category,
    bp_citingpaper,
    bp_departments,
    bp_deptagenda,
    bp_file,
    bp_incentivesapplication,
    bp_incentivesevaluation,
    bp_instagenda,
    bp_keywords,
    bp_notification,
    bp_researchdepartment,
    bp_researchdeptagenda,
    bp_researchers,
    bp_researches,
    bp_researchinstagenda,
    bp_researchkeywords,
    bp_search,
    bp_status,
    bp_student,
    bp_studentresearch,
    bp_users,
    bp_researchers,
    bp_campus,
)
from db.engine import engine
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from models.Base import Base
from sqlalchemy.sql import text
from flask_caching import Cache


def create_app():
    app = Flask(__name__)
    cors = CORS(app, resources={r"/*": {"origins": "*"}})
    jwt = JWTManager(app)

    # Configure Flask-Caching
    app.config["CACHE_TYPE"] = "simple"  # Use in-memory cache
    cache = Cache(app)
    app.cache = cache
    # Server configurations
    # Uncomment or modify this line to use the local PostgreSQL database URI
    app.config["SQLALCHEMY_DATABASE_URI"] = (
        "postgresql://postgres:1234@localhost/aru_research_db"
    )
    # """
    # Note:
    #     Change the following line depending if the project is to be deployed in a docker container or for development.
    #     Remember to also change the database URI on src/db/engine.py
    # """
    # # If on the pc of Dr. Alonica Villanueva
    # app.config["SQLALCHEMY_DATABASE_URI"] = (
    #     "postgresql://postgres:alon@host.docker.internal/aru_research_db"
    # )

    # If on our local machine

    app.config["SQLALCHEMY_DATABASE_URI"] = (
        "postgresql://postgres:1234@host.docker.internal/aru_research_db"
    )

    app.config["JWT_SECRET_KEY"] = "7c136edba4a7fe176415eab1563a1d3f"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # SQLAlchemy settings
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        "pool_size": 50,
        "max_overflow": 100,
        "pool_timeout": 60,
    }
    # Upload file relative directory
    app.config["UPLOAD_FOLDER"] = "uploads"
    # Configuration for Flask-Mail
    app.config["MAIL_SERVER"] = "smtp.gmail.com"
    app.config["MAIL_PORT"] = 587
    app.config["MAIL_USE_TLS"] = True
    app.config["MAIL_USE_SSL"] = False
    app.config["MAIL_USERNAME"] = os.getenv("GMAIL_EMAIL")
    app.config["MAIL_PASSWORD"] = os.getenv("GMAIL_PASS")
    app.config["MAIL_DEFAULT_SENDER"] = (
        "TIP ARU Scholarsphere",
        os.getenv("GMAIL_EMAIL"),
    )
    mail = Mail(app)
    # Routes
    app.register_blueprint(bp_auth.bp)
    app.register_blueprint(bp_author.bp)
    app.register_blueprint(bp_authorresearch.bp)
    app.register_blueprint(bp_category.bp)
    app.register_blueprint(bp_campus.bp)
    app.register_blueprint(bp_citingpaper.bp)
    app.register_blueprint(bp_departments.bp)
    app.register_blueprint(bp_deptagenda.bp)
    app.register_blueprint(bp_file.bp)
    app.register_blueprint(bp_incentivesapplication.bp)
    app.register_blueprint(bp_incentivesevaluation.bp)
    app.register_blueprint(bp_instagenda.bp)
    app.register_blueprint(bp_keywords.bp)
    app.register_blueprint(bp_notification.bp)
    app.register_blueprint(bp_researchdepartment.bp)
    app.register_blueprint(bp_researchdeptagenda.bp)
    app.register_blueprint(bp_researchers.bp)
    app.register_blueprint(bp_researches.bp)
    app.register_blueprint(bp_researchinstagenda.bp)
    app.register_blueprint(bp_researchkeywords.bp)
    app.register_blueprint(bp_search.bp)
    app.register_blueprint(bp_status.bp)
    app.register_blueprint(bp_student.bp)
    app.register_blueprint(bp_studentresearch.bp)
    app.register_blueprint(bp_users.bp)

    return app


App = create_app()


def start_react_app():
    react_dir = os.path.join(os.getcwd(), "frontend")
    subprocess.Popen(["npm", "start"], cwd=react_dir)


def main():
    if len(sys.argv) == 2:
        try:
            arg = sys.argv[1]
            if arg == "start":
                try:
                    start_react_app()
                except:
                    pass
                finally:
                    App.run(host="0.0.0.0", port=5000, debug=True)

            elif arg == "create":
                print("\nCreating Tables...\n")
                with App.app_context():
                    Base.metadata.create_all(bind=engine)
                    print("Tables created.")
                sys.exit(1)

            elif arg == "delete":
                print("\nDeleting Tables...\n")
                with App.app_context():
                    with engine.connect() as connection:
                        with connection.begin():
                            for table in reversed(Base.metadata.sorted_tables):
                                connection.execute(
                                    text(f"DROP TABLE IF EXISTS {table.name} CASCADE")
                                )
                            print("Tables dropped.")
            else:
                print(
                    "\nUsage: \n\t Run Server: python app.py start \n\t Create database tables: python app.py create \n\t Delete database tables: python app.py delete"
                )
                sys.exit(1)
        except Exception as e:
            print(f"\n{e}\n")
            print(
                "\nUsage: \n\t Run Server: python app.py start \n\t Create database tables: python app.py create \n\t Delete database tables: python app.py delete"
            )
            sys.exit(1)
    else:
        print(
            "\nUsage: \n\t Run Server: python app.py start \n\t Create database tables: python app.py create \n\t Delete database tables: python app.py delete"
        )
        sys.exit(1)


if __name__ == "__main__":
    main()
