import os
from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, create_refresh_token
from werkzeug.security import generate_password_hash, check_password_hash
from aru_venv.archive._models import engine, Base, Session, Departments, Users, Author, Category, Citingpaper, Research, Fileupload, Status, Incentivesapplication, Notification, Authorresearch, Researchciting
from flask_cors import CORS
from datetime import timedelta, datetime
from sqlalchemy import or_

app = Flask(__name__)
CORS(app)  
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:1234@localhost/aru_research_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False 

app.config['JWT_SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['JWT_EXPIRATION_DELTA'] = timedelta(days=1)  # Set expiration time to 1 day

UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

jwt = JWTManager(app)
session = Session()


# @app.route('/', methods=['GET'])
# #@jwt_required()
# def getResult():
#     try:
#         research_data = session.query(
#             Author.author_name,
#             Departments.dept_name,
#             Research.title,
#             Research.presented_where,
#             Research.presentation_location,
#             Research.presentation_date,
#             Research.published_where,
#             Research.publication_date,
#             Research.inst_agenda,
#             Research.dept_agenda,
#             Research.doi_or_full,
#             Category.category_description
#         ).outerjoin(
#             Authorresearch, Authorresearch.research_id == Research.research_id
#         ).outerjoin(
#             Author, Author.author_id == Authorresearch.author_id
#         ).outerjoin(
#             Users, Users.user_id == Research.user_id
#         ).outerjoin(
#             Departments, Departments.dept_id == Users.dept_id
#         ).outerjoin(
#             Incentivesapplication, Incentivesapplication.research_id == Research.research_id
#         ).outerjoin(
#             Category, Category.category_id == Incentivesapplication.category_id 
#         ).all()

#         # Convert the query results to a list of dictionaries
#         data = []
#         for row in research_data:
#             data.append({
#             "author_name": row[0],
#             "dept_name": row[1],
#             "title": row[2],
#             "presented_where": row[3],
#             "presentation_location": row[4],
#             "presentation_date": row[5],
#             "published_where": row[6],
#             "publication_date": row[7],
#             "inst_agenda": row[8],
#             "dept_agenda": row[9],
#             "doi_or_full": row[10],
#             "category_description": row[11],
#             })

#         return jsonify({"success": True, "data": data}), 200
#     except Exception as e:
#         print(f"An error occurred: {e}")
#         return jsonify({"success": False, "message": str(e)}), 500


@app.route('/', methods=['GET'])
#@jwt_required()
def getResult():
    try:
        search_query = request.args.get('q')
        startDate = request.args.get('startDate')
        endDate = request.args.get('endDate')
        category = request.args.get('category')  

        query = session.query(
            Research.research_id,
            Author.author_name,
            Departments.dept_name,
            Research.title,
            Research.presented_where,
            Research.presentation_location,
            Research.presentation_date,
            Research.published_where,
            Research.publication_date,
            Research.inst_agenda,
            Research.dept_agenda,
            Research.doi_or_full,
            Category.category_description
        ).outerjoin(
            Authorresearch, Authorresearch.research_id == Research.research_id
        ).outerjoin(
            Author, Author.author_id == Authorresearch.author_id
        ).outerjoin(
            Users, Users.user_id == Research.user_id
        ).outerjoin(
            Departments, Departments.dept_id == Users.dept_id
        ).outerjoin(
            Incentivesapplication, Incentivesapplication.research_id == Research.research_id
        ).outerjoin(
            Category, Category.category_id == Incentivesapplication.category_id 
        )

        if search_query:
            search_query = f"%{search_query}%"
            query = query.filter(
                or_(
                    Author.author_name.ilike(search_query),
                    Research.title.ilike(search_query),
                    Research.inst_agenda.ilike(search_query),
                    Research.dept_agenda.ilike(search_query),
                    # Research.presented_where.ilike(search_query),
                    Research.presentation_location.ilike(search_query),
                    # Research.published_where.ilike(search_query),
                    Research.doi_or_full.ilike(search_query)
                )
            )

        if startDate:
            startDate = datetime.strptime(startDate, '%Y-%m-%d')
            query = query.filter(Research.presentation_date >= startDate)

        if endDate:
            endDate = datetime.strptime(endDate, '%Y-%m-%d')
            query = query.filter(Research.presentation_date <= endDate)

        if category: 
            query = query.filter(Category.category_description.ilike(f'%{category}%'))

        research_data = query.all()

        data = []
        for row in research_data:
            data.append({
                "research_id": row[0],
                "author_name": row[1],
                "dept_name": row[2],
                "title": row[3],
                "presented_where": row[4],
                "presentation_location": row[5],
                "presentation_date": row[6],
                "published_where": row[7],
                "publication_date": row[8],
                "inst_agenda": row[9],
                "dept_agenda": row[10],
                "doi_or_full": row[11],
                "category_description": row[12],  
            })

        return jsonify({"success": True, "data": data}), 200
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"success": False, "message": str(e)}), 500



    
    
@app.route('/signup', methods=['POST'])
#@jwt_required()
def signup():
    data=request.get_json()
    
    name=data.get('name')
    email=data.get('email')
    
    # check whether the user exists
    db_user = session.query(Users).filter_by(email=email).first()
    if db_user is not None:
        return jsonify({"success":False,"message":f"User with email {email} already exists."})
    
    db_author = session.query(Author).filter_by(author_name=name).first()
    if db_author is not None:
        return jsonify({"success":False,"message":f"User with name {name} already exists."})
    
    
    new_user=Users(
        email=data.get('email'),
        password=generate_password_hash(data.get('password')),
        dept_id=data.get('dept_id'),
        role=data.get('role'),
        activated=True
    )
    
    try:
        session.add(new_user)
        session.commit()
        db_user = session.query(Users).filter_by(email=email).first()
    except Exception as e:
        session.rollback()
        return jsonify({"success":False,"message":f"{e}"})
    
    new_author=Author(
        author_name=name,
        user_id=db_user.user_id
    )
    
    try:
        session.add(new_author)
        session.commit()
    except Exception as e:
        session.rollback()
        return jsonify({"success":False,"message":f"{e}"})
    
    return jsonify({"success":True,"message":"User created successfully."}), 200
    
    
@app.route('/modify_user', methods=['PUT'])
def modifyUser():
    data=request.get_json()
    
    db_author = session.query(Author).get(data.get('author_id'))
    db_user = session.query(Users).get(data.get('user_id'))
    
    db_user.email = data.get('email')
    db_user.dept_id = data.get('dept_id')
    db_user.role = data.get('role')
    db_author.author_name = data.get('name')
    
    try:
        session.commit()
        return jsonify({"success":True,"message":"User modified successfully."}), 200
    except Exception as e:
        session.rollback()
        return jsonify({"success":False,"message":f"{e}"})

    


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
        
    email=data.get('email')
    password=data.get('password')
        
    try:
        db_user = session.query(Users).filter_by(email=email).first()
        
        if db_user and check_password_hash(db_user.password, password):

            access_token = create_access_token(identity=db_user.email)
            refresh_token = create_refresh_token(identity=db_user.email)
            
            db_author = session.query(Author).filter(Author.user_id==db_user.user_id).first()
            db_dept = session.query(Departments).filter(Departments.dept_id==db_user.dept_id).first()
                    
            return jsonify({
                "success": True,
                "message":"Token created successfuly.",
                "access_token": access_token, 
                "refresh_token": refresh_token,
                "user": {
                    "user_id":db_user.user_id,
                    "author_id":db_author.author_id,
                    "author_name":db_author.author_name,
                    "email":db_user.email,
                    "role":db_user.role,
                    "dept":db_dept.dept_name
                }
            })
        else:
            return jsonify({"success": False, "message": "No account exist"}), 500
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"success": False, "message": str(e)}), 500
    
@app.route('/users/researchers', methods=['GET'])
def handleResearchers():
    try:
        all = session.query(
            Author.author_id,
            Users.user_id,
            Author.author_name,
            Departments.dept_id,
            Departments.dept_name,
            Users.role,
            Users.email,
            Users.activated
        ).join(Users, Author.user_id == Users.user_id).join(Departments, Users.dept_id==Departments.dept_id)
        
        researchers = [{
            'author_id':i.author_id,
            'user_id':i.user_id,
            'name':i.author_name,
            'dept_id':i.dept_id,
            'department':i.dept_name,
            'role':i.role,
            'email':i.email,
            'activated':i.activated
        } for i in all.filter(Users.role=='Researcher').order_by(Author.author_name).all()]
        
        program_chairs = [{
            'author_id':i.author_id,
            'user_id':i.user_id,
            'name':i.author_name,
            'dept_id':i.dept_id,
            'department':i.dept_name,
            'role':i.role,
            'email':i.email,
            'activated':i.activated
        } for i in all.filter(Users.role=='Program Chair').order_by(Author.author_name).all()]
        
        research_admins = [{
            'author_id':i.author_id,
            'user_id':i.user_id,
            'name':i.author_name,
            'dept_id':i.dept_id,
            'department':i.dept_name,
            'role':i.role,
            'email':i.email,
            'activated':i.activated
        } for i in all.filter(Users.role=='Research Admin').order_by(Author.author_name).all()]
        
        return jsonify({
            "success": True, 
            "message": f"Fetched all users", 
            "data": {
                'researchers':researchers,
                'program_chairs':program_chairs,
                'research_admin':research_admins
            }
        }), 200
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"success": False, "message": str(e)}), 500


@app.route('/departments', methods=['GET','POST'])
#@jwt_required()
def handleDepartmentsGetPost():
    if request.method == 'GET':
        try:
            result = session.query(Departments).all()
            return jsonify({
                "success": True, 
                "message": f"Fetched all Departments", 
                "data": [{
                    'dept_id':i.dept_id,
                    'dept_name':i.dept_name
                } for i in result]
            }), 200
        except Exception as e:
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == 'POST':
        new_data = Departments(request.get_json().get('dept_name'))
        try:
            session.add(new_data)
            session.commit()
            return jsonify({"success": True, 'message': str(new_data)}), 201
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    else:
        return jsonify({"success": False, "message": 'Invalid request'}), 400
    
    
@app.route('/departments/<int:id>', methods=['GET','PUT','DELETE'])
#@jwt_required()
def handleDepartmentItemRequests(id):
    if request.method == 'GET':
        try:
            result = session.query(Departments).get(id)
            if result:
                return jsonify({
                    "success": True, 
                    "message": f"Fetched record.", 
                    "data": [{
                        'dept_id':result.dept_id,
                        'dept_name':result.dept_name
                    }]
                }), 200
            else:
                return jsonify({"success": False, "message": f"No result"}), 404
        except Exception as e:
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == 'PUT':
        try:
            result = session.query(Departments).get(id)
            if result:
                result.dept_name = request.get_json().get('dept_name').lower()
                session.commit()
                return jsonify({"success": True, "message": f"Updated record."}), 200
            else:
                return jsonify({"success": False, "message": f"No result"}), 404
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == 'DELETE':
        try:
            result = session.query(Departments).get(id)
            if not result:
                return jsonify({"success": False, 'error': 'Department not found'}), 404
            session.delete(result)
            session.commit()
            return jsonify({'message': 'Department deleted successfully'})
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    else:
        return jsonify({"success": False, "message": 'Invalid request'}), 400

@app.route('/users', methods=['GET','POST'])
#@jwt_required()
def handleUsersGetPost():
    if request.method == 'GET':
        try:
            result = session.query(Users).all()
            return jsonify({
                "success": True, 
                "message": f"Fetched all users", 
                "data": [{
                    'user_id':i.user_id,
                    'email':i.email,
                    'role':i.role,
                    'dept_id':i.dept_id,
                    'activated':i.activated
                } for i in result]
            }), 200
        except Exception as e:
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == 'POST':
        data = request.get_json()
        new_data = Users(
            email   = data.get('email').lower(), 
            dept_id = data.get('dept_id')
        )
        try:
            session.add(new_data)
            session.commit()
            return jsonify({"success": True, 'message': str(new_data)}), 201
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    else:
        return jsonify({"success": False, "message": 'Invalid request'}), 400
    
    
@app.route('/users/<int:id>', methods=['GET','PUT','DELETE'])
#@jwt_required()
def handleUserItemRequests(id):
    if request.method == 'GET':
        try:
            result = session.query(Users).get(id)
            if result:
                return jsonify({
                    "success": True, 
                    "message": f"Fetched record.", 
                    "data": [{
                        'user_id':result.user_id,
                        'email':result.email,
                        'role':result.role,
                        'dept_id':result.dept_id,
                        'activated':result.activated
                    }]
                }), 200
            else:
                return jsonify({"success": False, "message": f"No result"}), 404
        except Exception as e:
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == 'PUT':
        try:
            result = session.query(Users).get(id)
            data = request.get_json()
            if result:
                result.email     = data.get('email').lower(), 
                result.dept_id   = data.get('dept_id'), 
                result.role      = data.get('role').lower(),
                result.activated = eval(data.get('activated'))
                result.password  = data.get('password')
                session.commit()
                return jsonify({"success": True, "message": f"Updated record."}), 200
            else:
                return jsonify({"success": False, "message": f"No result"}), 404
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == 'DELETE':
        try:
            result = session.query(Users).get(id)
            if not result:
                return jsonify({"success": False, 'error': 'User not found'}), 404
            session.delete(result)
            session.commit()
            return jsonify({'message': 'User deleted successfully'})
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    else:
        return jsonify({"success": False, "message": 'Invalid request'}), 400
    
    
    
@app.route('/author', methods=['GET','POST'])
#@jwt_required()
def handleAuthorGetPost():
    if request.method == 'GET':
        try:
            result = session.query(Author).all()
            return jsonify({
                "success": True, 
                "message": f"Fetched all Authors", 
                "data": [{
                    'author_id':i.author_id,
                    'author_name':i.author_name,
                    'user_id':i.user_id
                } for i in result]
            }), 200
        except Exception as e:
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == 'POST':
        author_name = request.get_json().get('author_name').lower()
        new_data = Author(author_name)
        try:
            session.add(new_data)
            session.commit()
            return jsonify({"success": True, 'message': str(new_data), 'author_id': new_data.author_id}), 201
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    else:
        return jsonify({"success": False, "message": 'Invalid request'}), 400
    
    
@app.route('/author/<int:id>', methods=['GET','PUT','DELETE'])
#@jwt_required()
def handleAuthorItemRequests(id):
    if request.method == 'GET':
        try:
            result = session.query(Author).get(id)
            if result:
                return jsonify({
                    "success": True, 
                    "message": f"Fetched record.", 
                    "data": [{
                        'author_id':result.author_id,
                        'author_name':result.author_name
                    }]
                }), 200
            else:
                return jsonify({"success": False, "message": f"No result"}), 404
        except Exception as e:
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == 'PUT':
        try:
            result = session.query(Author).get(id)
            if result:
                result.author_name = request.get_json().get('author_name').lower()
                session.commit()
                return jsonify({"success": True, "message": f"Updated record."}), 200
            else:
                return jsonify({"success": False, "message": f"No result"}), 404
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == 'DELETE':
        try:
            result = session.query(Author).get(id)
            if not result:
                return jsonify({"success": False, 'error': 'Author not found'}), 404
            session.delete(result)
            session.commit()
            return jsonify({'message': 'Author deleted successfully'})
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    else:
        return jsonify({"success": False, "message": 'Invalid request'}), 400



@app.route('/category', methods=['GET','POST'])
#@jwt_required()
def handleCategoryGetPost():
    if request.method == 'GET':
        try:
            result = session.query(Category).all()
            return jsonify({
                "success": True, 
                "message": f"Fetched all Category", 
                "data": [{
                    'category_id':i.category_id,
                    'category_description':i.category_description
                } for i in result]
            }), 200
        except Exception as e:
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == 'POST':
        category_description = request.get_json().get('category_description').lower()
        new_data = Category(category_description)
        try:
            session.add(new_data)
            session.commit()
            return jsonify({"success": True, 'message': str(new_data)}), 201
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    else:
        return jsonify({"success": False, "message": 'Invalid request'}), 400
    
    
@app.route('/category/<int:id>', methods=['GET','PUT','DELETE'])
#@jwt_required()
def handleCategoryItemRequests(id):
    if request.method == 'GET':
        try:
            result = session.query(Category).get(id)
            if result:
                return jsonify({
                    "success": True, 
                    "message": f"Fetched record.", 
                    "data": [{
                        'category_id':result.category_id,
                        'category_description':result.category_description
                    }]
                }), 200
            else:
                return jsonify({"success": False, "message": f"No result"}), 404
        except Exception as e:
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == 'PUT':
        try:
            result = session.query(Category).get(id)
            if result:
                result.category_description = request.get_json().get('category_description').lower()
                session.commit()
                return jsonify({"success": True, "message": f"Updated record."}), 200
            else:
                return jsonify({"success": False, "message": f"No result"}), 404
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == 'DELETE':
        try:
            result = session.query(Category).get(id)
            if not result:
                return jsonify({"success": False, 'error': 'Category not found'}), 404
            session.delete(result)
            session.commit()
            return jsonify({'message': 'Category deleted successfully'})
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    else:
        return jsonify({"success": False, "message": 'Invalid request'}), 400


@app.route('/citingpaper', methods=['GET','POST'])
def handleCitingpaperGetPost():
    if request.method == 'GET':
        try:
            result = session.query(Citingpaper).all()
            return jsonify({
                "success": True, 
                "message": f"Fetched all Citing Papers", 
                "data": [{
                    'citing_id':i.citing_id,
                    'research_indexing':i.research_indexing,
                    'pub_location':i.pub_location,
                    'citing_pub_date':i.citing_pub_date,
                    'cite_doi_or_full':i.cite_doi_or_full
                } for i in result]
            }), 200
        except Exception as e:
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == 'POST':
        data = request.get_json()
        new_data = Citingpaper(
            research_indexing = data.get('research_indexing').lower(),
            pub_location = data.get('pub_location').lower(),
            citing_pub_date = data.get('citing_pub_date'),
            cite_doi_or_full = data.get('cite_doi_or_full')
        )
        try:
            session.add(new_data)
            session.commit()
            return jsonify({"success": True, 'message': str(new_data)}), 201
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    else:
        return jsonify({"success": False, "message": 'Invalid request'}), 400
    
@app.route('/citingpaper/<int:id>', methods=['GET','PUT','DELETE'])
#@jwt_required()
def handleCitingpaperItemRequests(id):
    if request.method == 'GET':
        try:
            result = session.query(Citingpaper).get(id)
            if result:
                return jsonify({
                    "success": True, 
                    "message": f"Fetched record.", 
                    "data": [{
                        'citing_id':result.citing_id,
                        'research_indexing':result.research_indexing,
                        'pub_location':result.pub_location,
                        'citing_pub_date':result.citing_pub_date,
                        'cite_doi_or_full':result.cite_doi_or_full
                    }]
                }), 200
            else:
                return jsonify({"success": False, "message": f"No result"}), 404
        except Exception as e:
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == 'PUT':
        try:
            result = session.query(Citingpaper).get(id)
            data = request.get_json()
            if result:
                result.research_indexing = data.get('research_indexing').lower(), 
                result.pub_location = data.get('pub_location'), 
                result.citing_pub_date = data.get('citing_pub_date').lower(),
                result.cite_doi_or_full = data.get('cite_doi_or_full')
                session.commit()
                return jsonify({"success": True, "message": f"Updated record."}), 200
            else:
                return jsonify({"success": False, "message": f"No result"}), 404
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == 'DELETE':
        try:
            result = session.query(Citingpaper).get(id)
            if not result:
                return jsonify({"success": False, 'error': 'Citing Paper not found'}), 404
            session.delete(result)
            session.commit()
            return jsonify({'message': 'Citing Paper deleted successfully'})
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    else:
        return jsonify({"success": False, "message": 'Invalid request'}), 400
    

@app.route('/researches', methods=['GET','POST'])
# #@jwt_required()
def handleResearchGetPost():
    if request.method == 'GET':
        try:
            search_query = request.args.get('q')
            startDate = request.args.get('startDate')
            endDate = request.args.get('endDate')

            query = session.query(Research)

            if search_query:
                query = query.filter(
                    (Research.title.ilike(f"%{search_query}%")) | 
                    (Research.inst_agenda.ilike(f"%{search_query}%")) |
                    (Research.dept_agenda.ilike(f"%{search_query}%")) |
                    (Research.presented_where.ilike(f"%{search_query}%")) |
                    (Research.presentation_location.ilike(f"%{search_query}%")) |
                    (Research.published_where.ilike(f"%{search_query}%")) |
                    (Research.doi_or_full.ilike(f"%{search_query}%"))
                )

            if startDate:
                startDate = datetime.strptime(startDate, '%Y-%m-%d')
                query = query.filter(Research.presentation_date >= startDate)

            if endDate:
                endDate = datetime.strptime(endDate, '%Y-%m-%d')
                query = query.filter(Research.presentation_date <= endDate)

            result = query.all()

            if result:
                res2 = session.query(Authorresearch).all()
                author_ids = [i.author_id for i in res2]
                authors = []
                for author_id in author_ids:
                    author = session.query(Author).get(author_id)
                    if author:
                        authors.append(author.author_name)
                    else:
                        print(f"Author with ID {author_id} not found")
            return jsonify({
                "success": True, 
                "message": f"Fetched all Research", 
                "data": [{
                    'research_id': i.research_id,
                    'title' : i.title,
                    'authors' : authors, 
                    # 'user_id' : i.user_id,
                    'inst_agenda' : i.inst_agenda,
                    'dept_agenda' : i.dept_agenda,
                    'presented_where' : i.presented_where, 
                    'presentation_location' : i.presentation_location, 
                    'presentation_date' : i.presentation_date, 
                    'published_where' : i.published_where,
                    'publication_date' : i.publication_date,
                    'doi_or_full' : i.doi_or_full,
                } for i in result]
            }), 200
        except Exception as e:
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500

    elif request.method == 'POST':
        data = request.get_json()
        new_data = Research(
            title = data.get('title').lower(), 
            user_id = data.get('user_id'),
            inst_agenda = data.get('inst_agenda').lower(),
            dept_agenda = data.get('dept_agenda').lower(),
            presented_where = data.get('presented_where').lower(), 
            presentation_location = data.get('presentation_location', None) and data['presentation_location'].lower(), 
            presentation_date = data.get('presentation_date', None) and data['presentation_date'].lower(), 
            published_where = data.get('published_where', None) and data['published_where'].lower(),
            publication_date = data.get('publication_date', None) and data['publication_date'].lower(),
            doi_or_full = data.get('doi_or_full', None) and data['doi_or_full'].lower(), 
            )
        try:
            session.add(new_data)
            session.commit()
            return jsonify({"success": True, 'message': str(new_data), 'research_id': new_data.research_id}), 201
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    else:
        return jsonify({"success": False, "message": 'Invalid request'}), 400  
    
    
@app.route('/researches/author', methods=['GET'])
#@jwt_required()
def handleAuthorResearches():
    try:
        data = request.get_json()
        print(data.get('author_id'))
        results = session.query(Authorresearch).filter(Authorresearch.author_id==data.get('author_id')).all()
    
        if results:
            for result in results:
                res2 = session.query(Authorresearch).all()
                authors = [i.author_id for i in res2]
                authors = [i.author_name for i in authors]
                return jsonify({
                    "success": True, 
                    "message": f"Fetched all Research", 
                    "data": [{
                        'research_id': i.research_id,
                        'title' : i.title,
                        'authors' : authors,
                        'inst_agenda' : i.inst_agenda,
                        'dept_agenda' : i.dept_agenda,
                        'presented_where' : i.presented_where, 
                        'presentation_location' : i.presentation_location, 
                        'presentation_date' : i.presentation_date, 
                        'published_where' : i.published_where,
                        'publication_date' : i.publication_date,
                        'doi_or_full' : i.doi_or_full,
                    } for i in result]
                }), 200
        else:
            return jsonify({"success": False, "message": "No matches"}), 500

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"success": False, "message": str(e)}), 500
        
    
@app.route('/researches/<int:id>', methods=['GET','PUT','DELETE'])
#@jwt_required()
def handleResearchItemRequests(id):
    if request.method == 'GET':
        try:
            result = session.query(Research).get(id)
            if result:
                res2 = session.query(Authorresearch).all()
                author_ids = [i.author_id for i in res2]
                authors = []
                for author_id in author_ids:
                    author = session.query(Author).get(author_id)
                    if author:
                        authors.append(author.author_name)
                    else:
                        print(f"Author with ID {author_id} not found")
                        
                return jsonify({
                    "success": True, 
                    "message": f"Fetched record.", 
                    "data": [{
                        'research_id': result.research_id,
                        'title' : result.title, 
                        'authors' : authors,
                        'inst_agenda' : result.inst_agenda,
                        'dept_agenda' : result.dept_agenda,
                        'presented_where' : result.presented_where, 
                        'presentation_location' : result.presentation_location, 
                        'presentation_date' : result.presentation_date, 
                        'published_where' : result.published_where,
                        'publication_date' : result.publication_date,
                        'doi_or_full' : result.doi_or_full,
                    }]
                }), 200
            else:
                return jsonify({"success": False, "message": f"No result"}), 404
        except Exception as e:
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == 'PUT':
        try:
            result = session.query(Research).get(id)
            data = request.get_json()
            if result:
                result.title = data.get('title').lower(), 
                result.user_id = data.get('user_id'),
                result.inst_agenda = data.get('inst_agenda').lower(),
                result.dept_agenda = data.get('dept_agenda').lower(),
                result.presented_where = data.get('presented_where').lower(), 
                result.presentation_location = data.get('presentation_location').lower(), 
                result.presentation_date = data.get('presentation_date'), 
                result.published_where = data.get('published_where').lower(),
                result.publication_date = data.get('publication_date'),
                result.doi_or_full = data.get('doi_or_full').lower()
                session.commit()
                return jsonify({"success": True, "message": f"Updated record."}), 200
            else:
                return jsonify({"success": False, "message": f"No result"}), 404
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == 'DELETE':
        try:
            result = session.query(Research).get(id)
            if not result:
                return jsonify({"success": False, 'error': 'Research not found'}), 404
            session.delete(result)
            session.commit()
            return jsonify({'message': 'Research deleted successfully'})
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    else:
        return jsonify({"success": False, "message": 'Invalid request'}), 400
    

@app.route('/fileupload', methods=['GET','POST'])
def handleFileUploadGetPost():
    if request.method == 'GET':
        try:
            result = session.query(Fileupload).all()
            return jsonify({
                "success": True, 
                "message": f"Fetched all files uploaded", 
                "data": [{
                    'file_id':i.file_id,
                    'research_id':i.research_id,
                    'category_id':i.category_id,
                    'file_type':i.file_type,
                    'file_path':i.file_path
                } for i in result]
            }), 200
        except Exception as e:
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == 'POST':
        data = request.get_json()
        new_data = Fileupload(
            research_id = data.get('research_id').lower(),
            category_id = data.get('category_id').lower(),
            file_type = data.get('file_type'),
            file_path = data.get('file_path')
        )
        try:
            session.add(new_data)
            session.commit()
            return jsonify({"success": True, 'message': str(new_data)}), 201
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    else:
        return jsonify({"success": False, "message": 'Invalid request'}), 400


@app.route('/fileupload/<int:id>', methods=['GET','PUT','DELETE'])
#@jwt_required()
def handleFileUploadItemRequests(id):
    if request.method == 'GET':
        try:
            result = session.query(Fileupload).get(id)
            if result:
                return jsonify({
                    "success": True, 
                    "message": f"Fetched record.", 
                    "data": [{
                        'file_id':result.file_id,
                        'research_id':result.research_id,
                        'category_id':result.category_id,
                        'file_type':result.file_type,
                        'file_path':result.file_path
                    }]
                }), 200
            else:
                return jsonify({"success": False, "message": f"No result"}), 404
        except Exception as e:
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == 'PUT':
        try:
            result = session.query(Fileupload).get(id)
            data = request.get_json()
            if result:
                result.research_id = data.get('research_id'), 
                result.category_id = data.get('category_id'), 
                result.file_type = data.get('file_type').lower(),
                result.file_path = data.get('file_path')
                session.commit()
                return jsonify({"success": True, "message": f"Updated record."}), 200
            else:
                return jsonify({"success": False, "message": f"No result"}), 404
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == 'DELETE':
        try:
            result = session.query(Fileupload).get(id)
            if not result:
                return jsonify({"success": False, 'error': 'File not found'}), 404
            session.delete(result)
            session.commit()
            return jsonify({'message': 'File deleted successfully'})
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    else:
        return jsonify({"success": False, "message": 'Invalid request'}), 400


@app.route('/status', methods=['GET','POST'])
def handleStatusGetPost():
    if request.method == 'GET':
        try:
            result = session.query(Status).all()
            return jsonify({
                "success": True, 
                "message": f"Fetched all Status", 
                "data": [{
                    'status_id':i.status_id,
                    'status_desc':i.status_desc
                } for i in result]
            }), 200
        except Exception as e:
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == 'POST':
        new_data = Status(request.get_json().get('status_desc').lower())
        try:
            session.add(new_data)
            session.commit()
            return jsonify({"success": True, 'message': str(new_data)}), 201
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    else:
        return jsonify({"success": False, "message": 'Invalid request'}), 400
    
    
@app.route('/status/<int:id>', methods=['GET','PUT','DELETE'])
#@jwt_required()
def handleStatusItemRequests(id):
    if request.method == 'GET':
        try:
            result = session.query(Status).get(id)
            if result:
                return jsonify({
                    "success": True, 
                    "message": f"Fetched record.", 
                    "data": [{
                        'status_id':result.status_id,
                        'status_desc':result.status_desc
                    }]
                }), 200
            else:
                return jsonify({"success": False, "message": f"No result"}), 404
        except Exception as e:
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == 'PUT':
        try:
            result = session.query(Status).get(id)
            if result:
                result.status_desc = request.get_json().get('status_desc').lower()
                session.commit()
                return jsonify({"success": True, "message": f"Updated record."}), 200
            else:
                return jsonify({"success": False, "message": f"No result"}), 404
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == 'DELETE':
        try:
            result = session.query(Status).get(id)
            if not result:
                return jsonify({"success": False, 'error': 'Status not found'}), 404
            session.delete(result)
            session.commit()
            return jsonify({'message': 'Status deleted successfully'})
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    else:
        return jsonify({"success": False, "message": 'Invalid request'}), 400


@app.route('/incentivesapplication', methods=['GET','POST'])
def handleIncentivesApplicationGetPost():
    if request.method == 'GET':
        try:
            result = session.query(Incentivesapplication).all()
            return jsonify({
                "success": True, 
                "message": f"Fetched all Status", 
                "data": [{
                    'application_id':i.application_id,
                    'research_id':i.research_id,
                    'user_id':i.user_id,
                    'status_id':i.status_id,
                    'date_submitted':i.date_submitted,
                    'category_id':i.category_id
                } for i in result]
            }), 200
        except Exception as e:
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == 'POST':
        data = request.get_json()
        new_data = Incentivesapplication(
            research_id = data.get('research_id'),
            user_id = data.get('user_id'),
            status_id = data.get('status_id'),
            date_submitted = data.get('date_submitted'),
            category_id = data.get('category_id')
        )
        try:
            session.add(new_data)
            session.commit()
            return jsonify({"success": True, 'message': str(new_data)}), 201
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    else:
        return jsonify({"success": False, "message": 'Invalid request'}), 400
    
    
@app.route('/incentivesapplication/<int:id>', methods=['GET','PUT','DELETE'])
#@jwt_required()
def handleIncentivesApplicationItemRequests(id):
    if request.method == 'GET':
        try:
            result = session.query(Incentivesapplication).get(id)
            if result:
                return jsonify({
                    "success": True, 
                    "message": f"Fetched record.", 
                    "data": [{
                        'application_id':result.application_id,
                        'research_id':result.research_id,
                        'user_id':result.user_id,
                        'status_id':result.status_id,
                        'date_submitted':result.date_submitted,
                        'category_id':result.category_id,
                    }]
                }), 200
            else:
                return jsonify({"success": False, "message": f"No result"}), 404
        except Exception as e:
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == 'PUT':
        try:
            result = session.query(Incentivesapplication).get(id)
            data = request.get_json()
            if result:
                result.research_id = data.get('research_id'), 
                result.user_id = data.get('user_id'), 
                result.status_id = data.get('status_id'),
                result.date_submitted = data.get('date_submitted'),
                result.category_id = data.get('category_id'),
                session.commit()
                return jsonify({"success": True, "message": f"Updated record."}), 200
            else:
                return jsonify({"success": False, "message": f"No result"}), 404
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == 'DELETE':
        try:
            result = session.query(Incentivesapplication).get(id)
            if not result:
                return jsonify({"success": False, 'error': 'Incentives Application not found'}), 404
            session.delete(result)
            session.commit()
            return jsonify({'message': 'Incentives Application deleted successfully'})
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    else:
        return jsonify({"success": False, "message": 'Invalid request'}), 400


@app.route('/notification', methods=['GET','POST'])
def handleNotificationGetPost():
    if request.method == 'GET':
        try:
            result = session.query(Notification).all()
            return jsonify({
                "success": True, 
                "message": f"Fetched all Status", 
                "data": [{
                    'notif_id':i.notif_id,
                    'notif_desc':i.notif_desc,
                    'application_id':i.application_id,
                    'user_id':i.user_id,
                } for i in result]
            }), 200
        except Exception as e:
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == 'POST':
        data = request.get_json()
        new_data = Notification(
            notif_desc = data.get('notif_desc'),
            application_id = data.get('application_id'),  
            user_id = data.get('user_id'),
        )
        try:
            session.add(new_data)
            session.commit()
            return jsonify({"success": True, 'message': str(new_data)}), 201
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    else:
        return jsonify({"success": False, "message": 'Invalid request'}), 400

@app.route('/notification/<int:id>', methods=['GET','PUT','DELETE'])
#@jwt_required()
def handleNotificationItemRequests(id):
    if request.method == 'GET':
        try:
            result = session.query(Notification).get(id)
            if result:
                return jsonify({
                    "success": True, 
                    "message": f"Fetched record.", 
                    "data": [{
                        'notif_id':result.notif_id,
                        'notif_desc':result.notif_desc,
                        'application_id':result.application_id,
                        'user_id':result.user_id,
                    }]
                }), 200
            else:
                return jsonify({"success": False, "message": f"No result"}), 404
        except Exception as e:
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == 'PUT':
        try:
            result = session.query(Notification).get(id)
            data = request.get_json()
            if result:
                result.notif_desc = data.get('notif_desc'), 
                result.application_id = data.get('application_id'), 
                result.user_id = data.get('user_id'),
                session.commit()
                return jsonify({"success": True, "message": f"Updated record."}), 200
            else:
                return jsonify({"success": False, "message": f"No result"}), 404
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == 'DELETE':
        try:
            result = session.query(Notification).get(id)
            if not result:
                return jsonify({"success": False, 'error': 'Notification not found'}), 404
            session.delete(result)
            session.commit()
            return jsonify({'message': 'Notification deleted successfully'})
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    else:
        return jsonify({"success": False, "message": 'Invalid request'}), 400
    

@app.route('/authorresearch', methods=['GET', 'POST'])
# #@jwt_required()
def handleAuthorResearchGetPost():
    if request.method == 'GET':
        try:
            result = session.query(Authorresearch).all()
            return jsonify({
                "success": True,
                "message": f"Fetched all Author-Research relations",
                "data": [{
                    'research_id': i.research_id,
                    'author_id': i.author_id
                } for i in result]
            }), 200
        except Exception as e:
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == 'POST':
        data = request.get_json()
        new_data = Authorresearch(
            research_id=data.get('research_id'),
            author_id=data.get('author_id')
        )
        try:
            session.add(new_data)
            session.commit()
            return jsonify({"success": True, 'message': str(new_data)}), 201
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    else:
        return jsonify({"success": False, "message": 'Invalid request'}), 400
    

@app.route('/authorresearch/<int:research_id>/<int:author_id>', methods=['GET', 'PUT', 'DELETE'])
# #@jwt_required()
def handleAuthorResearchItemRequests(research_id, author_id):
    if request.method == 'GET':
        try:
            result = session.query(Authorresearch).filter_by(research_id=research_id, author_id=author_id).first()
            if result:
                return jsonify({
                    "success": True,
                    "message": f"Fetched record.",
                    "data": {
                        'research_id': result.research_id,
                        'author_id': result.author_id
                    }
                }), 200
            else:
                return jsonify({"success": False, "message": f"No result"}), 404
        except Exception as e:
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == 'PUT':
        try:
            result = session.query(Authorresearch).filter_by(research_id=research_id, author_id=author_id).first()
            if result:
                result.research_id = request.get_json().get('research_id')
                result.author_id = request.get_json().get('author_id')
                session.commit()
                return jsonify({"success": True, "message": f"Updated record."}), 200
            else:
                return jsonify({"success": False, "message": f"No result"}), 404
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    elif request.method == 'DELETE':
        try:
            result = session.query(Authorresearch).filter_by(research_id=research_id, author_id=author_id).first()
            if not result:
                return jsonify({"success": False, 'error': 'Author-Research relation not found'}), 404
            session.delete(result)
            session.commit()
            return jsonify({'message': 'Author-Research relation deleted successfully'})
        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
    else:
        return jsonify({"success": False, "message": 'Invalid request'}), 400


@app.route('/upload', methods=['POST'])
def upload_file():
    # Check if the request contains file and form data
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']

    # If the user does not select a file, the browser submits an empty file without a filename
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Fetch additional data from form-data
    research_id = request.form.get('research_id')
    category_id = request.form.get('category_id')
    file_type = request.form.get('file_type')

    if file and research_id and category_id and file_type:
        # Save the uploaded file to the server
        original_filename, file_extension = os.path.splitext(file.filename)
        filename = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        
        # Check if the file already exists, if yes, append (1) to the file name
        count = 1
        while os.path.exists(filename):
            filename = os.path.join(app.config['UPLOAD_FOLDER'], f"{original_filename} ({count}){file_extension}")
            count += 1
        
        file.save(filename)
        
        new_data = Fileupload(
            research_id=research_id, 
            category_id=category_id, 
            file_type=file_type, 
            file_path=filename
        )
        try: 
            session.add(new_data)
            session.commit()
        except Exception as e:
            session.rollback()
            return jsonify({"success": False, "message": str(e)}), 500

        return jsonify({
            'message': 'File uploaded successfully',
            'file_path': filename,
            'research_id': research_id,
            'category_id': category_id,
            'file_type' : file_type,
        }), 200
    else:
        return jsonify({'error': 'Missing username or type description'}), 400
    

@app.route('/populate/authorResearch', methods=['GET','POST'])
def handlePopulateAuthorResearch():
    if request.method == 'GET':
        data = session.query(Authorresearch).all()
        if data:
            data = [{
                "research_id":i.research_id,
                "author_id":i.author_id
            } for i in data]
            
            return jsonify({
                'success':True,
                'message': 'AuthorResearch is fetched succesfully',
                'data': data
            }), 200
        else:
            return jsonify({
                    'success':True,
                    'message': 'AuthorResearch has no records',
                    'data': data
                }), 401
    elif request.method == 'POST':
        try:
            data = request.get_json()
            author_id = data.get('author_id')
            research_id = data.get('research_id')

            if author_id is None or research_id is None:
                return jsonify({"success": False, "message": "Both author_id and research_id are required"}), 400

            combination_exists = session.query(Authorresearch).filter_by(author_id=author_id, research_id=research_id).first()

            if combination_exists:
                return jsonify({"success": False, "message": "Combination exists"}), 400
            else:
                new_data = Authorresearch(
                    author_id = author_id,
                    research_id = research_id
                )
                session.add(new_data)
                session.commit()
                return jsonify({"success": True, "message": "Added author and research combination"}), 202

        except Exception as e:
            session.rollback()
            print(f"An error occurred: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
        

@app.route('/author/researches/<int:author_id>', methods=['GET'])
def handleAuthorResearch(author_id):
    try:
        query = session.query(
            Research.research_id,
            Author.author_name,
            Departments.dept_name,
            Research.title,
            Research.presented_where,
            Research.presentation_location,
            Research.presentation_date,
            Research.published_where,
            Research.publication_date,
            Research.inst_agenda,
            Research.dept_agenda,
            Research.doi_or_full,
            Category.category_description
        ).outerjoin(
            Authorresearch, Authorresearch.research_id == Research.research_id
        ).outerjoin(
            Author, Author.author_id == Authorresearch.author_id
        ).outerjoin(
            Users, Users.user_id == Research.user_id
        ).outerjoin(
            Departments, Departments.dept_id == Users.dept_id
        ).outerjoin(
            Incentivesapplication, Incentivesapplication.research_id == Research.research_id
        ).outerjoin(
            Category, Category.category_id == Incentivesapplication.category_id 
        ).filter(Authorresearch.author_id==author_id).all()
        
        if query:
            data = [{
                "research_id":i.research_id,
                "title":i.title,
                "authors":i.author_name,
                "publication":i.published_where,
                "citations":"N/A",
                "year":i.publication_date
            } for i in query]
            return jsonify({
                'success':True,
                'message': 'AuthorResearch is fetched succesfully',
                'data': data
            }), 200
        else:
            return jsonify({
                    'success':True,
                    'message': 'AuthorResearch has no records',
                    'data': []
                }), 401
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"success": False, "message": str(e)}), 500


# @app.route('/submit-application', methods=["POST"])
# def submit_research():
#     try:
#         data = request.get_json()
        
#         new_research = Research(
#             title=data.get('formData').get('title').lower(), 
#             user_id=data.get('formData').get('user_id'),
#             inst_agenda=data.get('formData').get('inst_agenda').lower(),
#             dept_agenda=data.get('formData').get('dept_agenda').lower(),
#             presented_where=data.get('formData').get('presented_where').lower(), 
#             presentation_location=data.get('formData').get('presentation_location', None) and data['formData']['presentation_location'].lower(), 
#             presentation_date=data.get('formData').get('presentation_date', None) and data['formData']['presentation_date'].lower(), 
#             published_where=data.get('formData').get('published_where', None) and data['formData']['published_where'].lower(),
#             publication_date=data.get('formData').get('publication_date', None) and data['formData']['publication_date'].lower(),
#             doi_or_full=data.get('formData').get('doi_or_full', None) and data['formData']['doi_or_full'].lower(), 
#         )
#         session.add(new_research)
#         session.commit()
        
#         generated_research_id = new_research.research_id
#         for file_data in data.get('selectedFiles', []):
#             upload_data = {
#                 'research_id': generated_research_id,
#                 'category_id': data.get('formData').get('category_id'),
#                 'file_type': file_data.get('type'),
#                 'file': file_data.get('file')
#             }
#             upload_file(upload_data)
            
#         # Submit Incentives Application
#         incentives_application_data = {
#             'research_id': generated_research_id,
#             'user_id': data.get('formData').get('user_id'),
#             'status_id': 1,  # Assuming default status is 1
#             'date_submitted': data.get('formData').get('formattedDate'),
#             'category_id': data.get('formData').get('category_id')
#         }
#         submit_incentives_application(incentives_application_data)
        
#          # Add Authors
#         authors = data.get('formData').get('authors', '').split(",")
#         author_ids = []
#         for author_name in authors:
#             author_id = add_author({'author_name': author_name.strip()})
#             if author_id:
#                 author_ids.append(author_id)

#         # Link Authors with Research
#         for author_id in author_ids:
#             link_author_research({
#                 'research_id': generated_research_id,
#                 'author_id': author_id
#             })

#         return jsonify({"success": True, "message": "Research submitted successfully!"}), 201

#     except Exception as e:
#         session.rollback()
#         print(f"An error occurred: {e}")
#         return jsonify({"success": False, "message": str(e)}), 500
    
# def upload_file(data):
#     try:
#         research_id = data['research_id']
#         category_id = data['category_id']
#         file_type = data['file_type']
#         file = data['file']['file']

#         # Prepare the file data to be sent to the /upload endpoint
#         files = {'file': (file.filename, file, file.content_type)}
#         upload_data = {
#             'research_id': research_id,
#             'category_id': category_id,
#             'file_type': file_type
#         }

#         # Send a POST request to the /upload endpoint
#         response = requests.post('http://localhost:5000/upload', files=files, data=upload_data)

#         if response.status_code == 200:
#             return response.json()
#         else:
#             return jsonify({'error': 'Failed to upload file'}), 500
#     except Exception as e:
#         print(f"An error occurred: {e}")
#         return jsonify({"error": str(e)}), 500

# def submit_incentives_application(data):
#     try:
#         new_data = Incentivesapplication(
#             research_id=data['research_id'],
#             user_id=data['user_id'],
#             status_id=data['status_id'],
#             date_submitted=data['date_submitted'],
#             category_id=data['category_id']
#         )
#         session.add(new_data)
#         session.commit()
#     except Exception as e:
#         session.rollback()
#         print(f"An error occurred: {e}")
#         return jsonify({"success": False, "message": str(e)}), 500

# def add_author(data):
#     try:
#         author_name = data['author_name'].lower()
#         new_data = Author(author_name)
#         session.add(new_data)
#         session.commit()
#         return new_data.author_id
#     except Exception as e:
#         session.rollback()
#         print(f"An error occurred: {e}")
#         return None

# def link_author_research(data):
#     try:
#         new_data = Authorresearch(
#             research_id=data['research_id'],
#             author_id=data['author_id']
#         )
#         session.add(new_data)
#         session.commit()
#     except Exception as e:
#         session.rollback()
#         print(f"An error occurred: {e}")
#         return jsonify({"success": False, "message": str(e)}), 500


if __name__ == '__main__':
 
    # with app.app_context():
    #     # Drop all tables (if desired)
    #     Base.metadata.drop_all(bind=engine)  # Specify the engine to bind to
    #     print('Tables dropped.')

    #     # Create all tables again
    #     Base.metadata.create_all(bind=engine)  # Specify the engine to bind to
    #     print('Tables created.')
        
    app.run(debug=True)
    