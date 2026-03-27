from flask_restx import Api, Resource, Namespace, fields
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, create_access_token, create_refresh_token, jwt_required
from flask import Flask, request, jsonify, make_response
from models.Users import Users

auth_ns=Namespace('auth', description="A namespace for our authentication.")

signup_model=auth_ns.model(
    'SignUp',
    {
        "username":fields.String,
        "email":fields.String(),
        "password":fields.String()
    }
)

login_model=auth_ns.model(
    'Login',
    {
        "email":fields.String(),
        "password":fields.String()        
    }
)

user_model=auth_ns.model(
    'Users',
    {
        "username":fields.String,
        "email":fields.String(),
        "password":fields.String()
    }
)

@auth_ns.route('/signup')
class SignUp(Resource):
    @auth_ns.expect(signup_model)
    def post(self):
        data=request.get_json()
        
        username=data.get('username')
        # check whether the user exists
        db_user = User.query.filter_by(username=username).first()
        
        if db_user is not None:
            return jsonify({"message":f"User with username {username} already exists."})
        
        new_user=User(
            username=data.get('username'), 
            email=data.get('email'),
            password=generate_password_hash(data.get('password'))
        )
        new_user.save()
        
        return make_response(jsonify({"message":"User created successfuly."}),200)
    
@auth_ns.route('/login')
class Login(Resource):
    @auth_ns.expect(login_model)
    def post(self):
        data = request.get_json()
        
        email=data.get('email')
        password=data.get('password')
        
        db_user = User.query.filter_by(email=email).first()
        
        if db_user and check_password_hash(db_user.password, password):

                access_token = create_access_token(identity=db_user.username)
                refresh_token = create_refresh_token(identity=db_user.username)
                
                return jsonify(
                    {"access_token": access_token, "refresh_token": refresh_token}
                )
