from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, create_access_token, get_jwt_identity
from functions import verify_google_token, verify_google_access_token
from datetime import timedelta
from models import (db, User, Profile, Inventory, Product, Sale, Purchase, Provider, Movement,create_inventory_for_user)
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests
import os


api = Blueprint("api", __name__)

@api.route('/verificar-token', methods=['POST'])
def verificar_token():
    data = request.get_json()
    token = data.get('token')
    
    if not token:
        return jsonify({"error": "token is invalid"}), 400
    
    try:
        client_id = os.getenv('VITE_GOOGLE_CLIENT_ID')
        idinfo = google_id_token.verify_oauth2_token(token, google_requests.Request(), client_id)
    except ValueError as e:
        return jsonify({"error": "token is invalid", "details": str(e)}), 400

    email = idinfo.get('email')
    if not email:
        return jsonify({"error": "email not found in token"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        "access_token": access_token,
        "user": user.serialize()
    }), 200

