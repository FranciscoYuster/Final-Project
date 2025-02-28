from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, create_access_token, get_jwt_identity
from datetime import timedelta
from models import User, Profile

api = Blueprint("api", __name__)

@api.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    email = data.get('email')
    password = data.get('password')
    
    if not email:
        return jsonify({"fail": "Email is required"}), 400  # Mejor usar 400 (Bad Request)
     
    if not password:
        return jsonify({"error": "Password is required"}), 400

    found = User.query.filter_by(email=email).first()
    if found:
        return jsonify({"fail": "User already exists"}), 409

   
    
    profile = Profile()
    user = User()
    user.email = email
    user.set_password(password)
    user.profile = profile

    user.save()
    if not user:
        return jsonify({"error": "Error"})

    
    return jsonify({"success": "Thanks for register, please login"}), 200

@api.route('/login', methods=['POST'])
def login():

    email = request.json.get('email')
    password = request.json.get('password')
    
    if not email:
        return jsonify({"error": "Email is required"}), 400  
     
    if not password:
        return jsonify({"error": "Password is required"}), 400
    
    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"error": "User don't exist"}), 401
    
    if not user.verify_password(password):
        return jsonify({"error": "Credentials are incorrects!"}), 401
    

    # expires = timedelta(min=15)
    # access_token = create_access_token(identity=str(user.id), expires_delta=expires )
    access_token = create_access_token(identity=str(user.id))


    datos = {
        "access_token": access_token,
        "user": user.serialize()
    }


    return jsonify(datos),200
    

@api.route('/profile', methods=['GET'])
@jwt_required()  # ruta protegida
def profile():

    id = get_jwt_identity() 
    user = User.query.get(id)

    if not user:
        return jsonify({"error": "User not found"}),401


    return jsonify({
        "status": "success!",
        "user": user.serialize()
        }),200

@api.route('/profile', methods=['PUT'])
@jwt_required()  # ruta protegida
def update_profile():
    id = get_jwt_identity()  # 1
    user = User.query.get(id)
    data = request.get_json()

    user.profile.bio = data['bio'] if 'bio' in data else user.profile.bio
    user.profile.github = data['github'] if 'github' in data else user.profile.github
    user.profile.facebook = data['facebook'] if 'facebook' in data else user.profile.facebook
    user.profile.instagram = data['instagram'] if 'instagram' in data else user.profile.instagram
    user.profile.twitter = data['twitter'] if 'twitter' in data else user.profile.twitter

    user.save()
    
    return jsonify({
        "status": "success",
        "message": "Profile updated!",
        "user": user.serialize()
    }), 200