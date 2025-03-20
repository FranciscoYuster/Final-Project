from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, create_access_token, create_refresh_token, get_jwt_identity
from src.functions import verify_google_token, verify_google_access_token
from datetime import timedelta
from src.models import (db, User, Profile, Invoice, Inventory, Sale, Purchase, create_inventory_for_user)
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests
import os
from flask_mail import Message, Mail

api = Blueprint("api", __name__)
mail = Mail()

@api.route('/renew-token', methods=['POST'])
@jwt_required()
def renew_token():
    try:
        identity = get_jwt_identity()
        new_access_token = create_access_token(
            identity=identity,
            expires_delta=timedelta(hours=1)  # renovar explícitamente por 1 hora
        )
        expires_in = 3600 * 1000  # 1 hora en milisegundos
        return jsonify({
            "access_token": new_access_token,
            "expires_in": expires_in
        }), 200
    except Exception as e:
        return jsonify({
            "error": "Error al renovar el token",
            "details": str(e)
        }), 422



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

    # Crear el token de acceso (1 hora) para la sesión.
    access_token = create_access_token(identity=str(user.id))
    expires_in = 3600 * 1000  # 1 hora en milisegundos.
    return jsonify({
        "access_token": access_token,
        "user": user.serialize(),
        "expires_in": expires_in
    }), 200

@api.route('/register', methods=['POST'])
def register():
    """
    Endpoint para registrar un nuevo usuario y crear su inventario.
    Se espera un JSON con: email, password, firstName, lastName.
    """
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    first_name = data.get('firstName')
    last_name = data.get('lastName')

    if not all([email, password, first_name, last_name]):
        return jsonify({"error": "Faltan datos requeridos."}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "El usuario ya existe."}), 400

    new_user = User(
        email=email,
        first_name=first_name,
        last_name=last_name,
        created_by=None,
        role='user'
    )
    new_user.set_password(password)
    new_user.save()

    try:
        create_inventory_for_user(new_user)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    return jsonify({"success": True, "user": new_user.serialize()}), 201

# Ruta de login tradicional.
@api.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email:
        return jsonify({"error": "Email is required"}), 400  
    if not password:
        return jsonify({"error": "Password is required"}), 400
    
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "User doesn't exist"}), 401
    
    if not user.verify_password(password):
        return jsonify({"error": "Credentials are incorrect!"}), 401

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    datos = {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": user.serialize()
    }
    return jsonify(datos), 200

# Ruta para Login con Google.
@api.route('/login/google', methods=['POST'])
def google_login():
    data = request.get_json()
    id_token_received = data.get('id_token')
    if not id_token_received:
        return jsonify({"error": "id_token is required"}), 400

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
        # Registro del usuario con Google.
        profile = Profile()
        user = User(
            email=email,
            first_name=idinfo.get('given_name', ''),
            last_name=idinfo.get('family_name', '')
        )
        user.profile = profile
        user.save() 
        try:
            create_inventory_for_user(user)
        except ValueError:
            pass

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    return jsonify({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": user.serialize()  
    }), 200

@api.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    user_id = get_jwt_identity() 
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 401
    return jsonify({
        "status": "success!",
        "user": user.serialize()
    }), 200

@api.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.profile:
        return jsonify({"error": "User or profile not found"}), 404
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

@api.route('/admin/users', methods=['GET'])
@jwt_required()
def get_created_users():
    try:
        token = get_jwt_identity()
        try:
            admin_id = int(token)
        except ValueError:
            return jsonify({"error": "Token inválido"}), 400
        users = User.query.filter_by(created_by=admin_id).all()
        return jsonify([user.serialize() for user in users]), 200
    except Exception as e:
        print("Error en get_created_users:", e)
        return jsonify({"error": "Error al obtener los usuarios", "details": str(e)}), 500

@api.route('/admin/register', methods=['POST'])
@jwt_required()
def admin_register():
    try:
        admin_identity = get_jwt_identity()
        admin_id = int(admin_identity)
    except Exception as e:
        return jsonify({"error": "Token inválido", "details": str(e)}), 400
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    first_name = data.get('firstName')
    last_name = data.get('lastName')
    role = data.get('role', 'empleado')
    if not all([email, password, first_name, last_name, role]):
        return jsonify({"error": "Faltan datos requeridos."}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "El usuario ya existe."}), 400
    try:
        new_user = User(
            email=email,
            first_name=first_name,
            last_name=last_name,
            role=role,
            created_by=admin_id
        )
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()
        try:
            create_inventory_for_user(new_user)
        except ValueError as e:
            print("Error al crear inventario:", e)
            return jsonify({"error": "El usuario fue creado, pero hubo un problema con el inventario", "details": str(e)}), 400
        return jsonify({"success": True, "user": new_user.serialize()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al guardar el usuario", "details": str(e)}), 500

@api.route('/admin/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404
        data = request.get_json()
        if 'email' in data:
            existing_user = User.query.filter_by(email=data['email']).first()
            if existing_user and existing_user.id != user.id:
                return jsonify({"error": "El email ya está en uso."}), 400
        user.email = data.get('email', user.email)
        user.first_name = data.get('firstName', user.first_name)
        user.last_name = data.get('lastName', user.last_name)
        user.role = data.get('role', user.role)
        db.session.commit()
        return jsonify({"success": True, "user": user.serialize()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al actualizar el usuario", "details": str(e)}), 500

@api.route('/admin/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    try:
        Inventory.query.filter_by(user_id=user_id).delete()
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404
        db.session.delete(user)
        db.session.commit()
        return jsonify({"success": True, "message": "Usuario eliminado correctamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al eliminar usuario", "details": str(e)}), 500


# Rutas para Inventario
inventory_api = Blueprint("inventory_api", __name__)

@inventory_api.route('/inventory', methods=['GET'])
@jwt_required()
def get_inventory():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.inventory:
        return jsonify({"error": "Inventario no encontrado."}), 404
    return jsonify(user.inventory.serialize()), 200

@inventory_api.route('/inventory', methods=['POST'])
@jwt_required()
def create_inventory():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if user.inventory:
        return jsonify({"error": "El inventario ya existe."}), 400
    try:
        create_inventory_for_user(user)
        return jsonify(user.inventory.serialize()), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

@inventory_api.route('/inventory', methods=['DELETE'])
@jwt_required()
def delete_inventory():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.inventory:
        return jsonify({"error": "Inventario no encontrado."}), 404
    try:
        user.inventory.delete()
        return jsonify({"message": "Inventario eliminado"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

mail = Mail()
@api.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({"error": "Email is required"}), 400
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "No user found with this email"}), 404
    reset_token = user.generate_reset_token()  # Implementa este método en tu modelo User.
    reset_url = f"http://localhost:5173/reset-password/{reset_token}"
    msg = Message(
        "Solicitud de Restablecimiento de Contraseña",
        sender="myprojectsexample1@gmail.com",
        recipients=[email]
    )
    msg.body = f"Para restablecer su contraseña, haga clic en el siguiente enlace: {reset_url}"
    msg.html = f'''
    <p>Estimado usuario,</p>
    <p>Ha solicitado restablecer su contraseña. Para continuar con el proceso, haga clic en el siguiente enlace:</p>
    <p><a href="{reset_url}">Restablecer Contraseña</a></p>
    <p>Si no solicitó este cambio, por favor ignore este correo.</p>
    <p>Atentamente,</p>
    <p>El equipo de soporte LogiGo</p>
    '''
    try:
        mail.send(msg)
        return jsonify({"message": "Password reset link has been sent to your email"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/reset-password/<token>', methods=['POST'])
def reset_password(token):
    data = request.get_json()
    new_password = data.get('new_password')
    if not new_password:
        return jsonify({"error": "New password is required"}), 400
    user = User.verify_reset_token(token)
    if not user:
        return jsonify({"error": "Invalid or expired token"}), 400
    user.set_password(new_password)
    db.session.commit()
    return jsonify({"message": "Password has been reset successfully"}), 200
