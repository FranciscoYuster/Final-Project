from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, create_access_token, get_jwt_identity
from datetime import timedelta
from models import User, Profile
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests
import os


api = Blueprint("api", __name__)

@api.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    email = data.get('email')
    password = data.get('password')
    first_name = data.get('firstName')  
    last_name = data.get('lastName')   

    if not email:
        return jsonify({"fail": "Email is required"}), 400  
     
    if not password:
        return jsonify({"error": "Password is required"}), 400

    if not first_name:
        return jsonify({"fail": "First name is required"}), 400
    if not last_name:
        return jsonify({"fail": "Last name is required"}), 400

    found = User.query.filter_by(email=email).first()
    if found:
        return jsonify({"fail": "User already exists"}), 409

    profile = Profile()
    user = User()
    user.email = email
    user.set_password(password)
    user.first_name = first_name  
    user.last_name = last_name    
    user.profile = profile

    user.save()
    if not user:
        return jsonify({"error": "Error"}), 500

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
        return jsonify({"error": "Credentials are incorrect!"}), 401

    access_token = create_access_token(identity=str(user.id))
    datos = {
        "access_token": access_token,
        "user": user.serialize()
    }
    return jsonify(datos), 200

@api.route('/profile', methods=['GET'])
@jwt_required()  # ruta protegida
def profile():
    id = get_jwt_identity() 
    user = User.query.get(id)
    if not user:
        return jsonify({"error": "User not found"}), 401

    return jsonify({
        "status": "success!",
        "user": user.serialize()
    }), 200

@api.route('/profile', methods=['PUT'])
@jwt_required()  # ruta protegida
def update_profile():
    id = get_jwt_identity()
    user = User.query.get(id)
    data = request.get_json()

    user.profile.bio = data.get('bio', user.profile.bio)
    user.profile.github = data.get('github', user.profile.github)
    user.profile.facebook = data.get('facebook', user.profile.facebook)
    user.profile.instagram = data.get('instagram', user.profile.instagram)
    user.profile.twitter = data.get('twitter', user.profile.twitter)

    user.save()
    return jsonify({
        "status": "success",
        "message": "Profile updated!",
        "user": user.serialize()
    }), 200

@api.route('/login/google', methods=['POST'])
def google_login():
    data = request.get_json()
    id_token_received = data.get('id_token')
    if not id_token_received:
        return jsonify({"error": "id_token is required"}), 400

    # Verifica el id_token usando la librería google-auth
    try:
        client_id = os.getenv('VITE_GOOGLE_CLIENT_ID')  
        idinfo = google_id_token.verify_oauth2_token(id_token_received, google_requests.Request(), client_id)
    except ValueError as e:
        return jsonify({"error": "Invalid token", "details": str(e)}), 400

    email = idinfo.get('email')
    if not email:
        return jsonify({"error": "Email not found in token"}), 400

    user = User.query.filter_by(email=email).first()

    if not user:
        
        # Registro del usuario con google-auth
        profile = Profile()
        user = User()
        user.email = email
        user.first_name = idinfo.get('given_name', '')
        user.last_name = idinfo.get('family_name', '')
        user.profile = profile
        # Se guarda el usuario
        user.save() 

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        "access_token": access_token,
        "user": user.serialize()  
    }), 200
