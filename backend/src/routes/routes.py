from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, create_access_token, get_jwt_identity
from src.functions import verify_google_token, verify_google_access_token
from datetime import timedelta
from src.models import (db, User, Profile, Inventory, Product, Sale, Purchase, Provider, Movement,create_inventory_for_user)
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests
import os
from flask_mail import Message, Mail


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


@api.route('/register', methods=['POST'])
def register():
    """
    Endpoint para registrar un nuevo usuario y crear su inventario.
    Se espera un JSON con: email, password, firstName, lastName.
    En self-registration se asigna created_by=0.
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

    # Para self-registration, se asigna created_by=0
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

# Ruta de login 
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
        return jsonify({"error": "User doesn't exist"}), 401
    
    if not user.verify_password(password):
        return jsonify({"error": "Credentials are incorrect!"}), 401

    access_token = create_access_token(identity=str(user.id))
    datos = {
        "access_token": access_token,
        "user": user.serialize()
    }
    return jsonify(datos), 200

# Ruta para Login con Google
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
        # Registro del usuario con Google
        profile = Profile()
        user = User(
            email=email,
            first_name=idinfo.get('given_name', ''),
            last_name=idinfo.get('family_name', '')
        )
        user.profile = profile
        user.save() 
        # Opcional: Puedes crear el inventario automáticamente aquí si lo deseas
        try:
            create_inventory_for_user(user)
        except ValueError:
            pass

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        "access_token": access_token,
        "user": user.serialize()  
    }), 200



@api.route('/profile', methods=['GET'])
@jwt_required()  # Ruta protegida
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
    # Actualiza solo los campos enviados; si no existen, se mantienen los actuales.
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
@jwt_required()  # Asegura que solo los usuarios autenticados puedan acceder a la lista de usuarios
def get_created_users():
    try:
        # Obtiene la identidad del administrador desde el JWT
        token = get_jwt_identity()

        try:
            admin_id = int(token)  # Convierte el token en ID de administrador
        except ValueError:
            return jsonify({"error": "Token inválido"}), 400  # Si el token no es válido, devuelve un error

        # Obtiene todos los usuarios creados por este administrador
        users = User.query.filter_by(created_by=admin_id).all()
        
        # Devuelve los usuarios en formato JSON
        return jsonify([user.serialize() for user in users]), 200
    except Exception as e:
        # Si ocurre algún error, se maneja y devuelve el mensaje de error
        print("Error en get_created_users:", e)
        return jsonify({"error": "Error al obtener los usuarios", "details": str(e)}), 500

# Tabla para crear usuarios desde Usuarios.jsx
@api.route('/admin/register', methods=['POST'])
@jwt_required()  # Asegura que solo usuarios autenticados puedan registrar a un nuevo usuario
def admin_register():
    try:
        # Obtiene la identidad del administrador desde el JWT
        admin_identity = get_jwt_identity()
        admin_id = int(admin_identity)
    except Exception as e:
        return jsonify({"error": "Token inválido", "details": str(e)}), 400

    # Obtiene los datos enviados en la solicitud
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    first_name = data.get('firstName')
    last_name = data.get('lastName')
    role = data.get('role', 'empleado')

    # Verifica que todos los campos requeridos estén presentes
    if not all([email, password, first_name, last_name, role]):
        return jsonify({"error": "Faltan datos requeridos."}), 400

    # Verifica si el email ya está registrado
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "El usuario ya existe."}), 400

    try:
        # Crea un nuevo usuario
        new_user = User(
            email=email,
            first_name=first_name,
            last_name=last_name,
            role=role,
            created_by=admin_id
        )
        new_user.set_password(password)  # Encripta la contraseña

        db.session.add(new_user)  # Agrega el nuevo usuario a la base de datos
        db.session.commit()  # Guarda el usuario en la base de datos

        try:
            # Intenta crear un inventario para el nuevo usuario
            create_inventory_for_user(new_user)
        except ValueError as e:
            # Si hay un error al crear el inventario, se maneja y se devuelve un mensaje
            print("Error al crear inventario:", e)
            return jsonify({"error": "El usuario fue creado, pero hubo un problema con el inventario", "details": str(e)}), 400

        # Si todo salió bien, responde con éxito y los datos del usuario
        return jsonify({"success": True, "user": new_user.serialize()}), 201
    except Exception as e:
        # Si ocurre un error al guardar el usuario, revierte los cambios y responde con el error
        db.session.rollback()
        return jsonify({"error": "Error al guardar el usuario", "details": str(e)}), 500

@api.route('/admin/users/<int:user_id>', methods=['PUT'])
@jwt_required()  # Asegura que el usuario esté autenticado
def update_user(user_id):
    try:
        # Busca el usuario a actualizar
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404

        # Obtiene los datos enviados en la solicitud
        data = request.get_json()

        # Verifica si el nuevo email ya está en uso
        if 'email' in data:
            existing_user = User.query.filter_by(email=data['email']).first()
            if existing_user and existing_user.id != user.id:
                return jsonify({"error": "El email ya está en uso."}), 400

        # Actualiza los campos del usuario
        user.email = data.get('email', user.email)
        user.first_name = data.get('firstName', user.first_name)
        user.last_name = data.get('lastName', user.last_name)
        user.role = data.get('role', user.role)

        db.session.commit()  # Aplica los cambios a la base de datos
        return jsonify({"success": True, "user": user.serialize()}), 200

    except Exception as e:
        db.session.rollback()  # Revierte cambios si ocurre un error
        return jsonify({"error": "Error al actualizar el usuario", "details": str(e)}), 500


@api.route('/admin/users/<int:user_id>', methods=['DELETE'])
@jwt_required()  # Asegura que el usuario esté autenticado
def delete_user(user_id):
    try:
        # Elimina las relaciones dependientes del usuario (ejemplo: registros de inventario)
        Inventory.query.filter_by(user_id=user_id).delete()

        # Busca el usuario en la base de datos
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404
        
        # Elimina el usuario
        db.session.delete(user)
        db.session.commit()

        return jsonify({"success": True, "message": "Usuario eliminado correctamente"}), 200

    except Exception as e:
        db.session.rollback()  # Revierte cambios en caso de error
        return jsonify({"error": "Error al eliminar usuario", "details": str(e)}), 500

# Ventas
sales_api = Blueprint("sales_api", __name__)

@sales_api.route('/sales', methods=['GET'])
def get_sales():
    sales = Sale.get_all()
    return jsonify([sale.serialize() for sale in sales]), 200

@sales_api.route('/sales/<int:id>', methods=['GET'])
def get_sale(id):
    sale = Sale.find_by_id(id)
    if not sale:
        return jsonify({"error": "Sale not found"}), 404
    return jsonify(sale.serialize()), 200

@sales_api.route('/sales', methods=['POST'])
def create_sale():
    data = request.get_json()
    required_fields = ['user_id', 'product_id', 'quantity', 'total']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400
    sale = Sale(
        user_id=data['user_id'],
        product_id=data['product_id'],
        quantity=data['quantity'],
        total=data['total']
    )
    sale.save()
    return jsonify(sale.serialize()), 201

@sales_api.route('/sales/<int:id>', methods=['PUT'])
def update_sale(id):
    sale = Sale.find_by_id(id)
    if not sale:
        return jsonify({"error": "Sale not found"}), 404
    data = request.get_json()
    sale.user_id = data.get('user_id', sale.user_id)
    sale.product_id = data.get('product_id', sale.product_id)
    sale.quantity = data.get('quantity', sale.quantity)
    sale.total = data.get('total', sale.total)
    sale.update()
    return jsonify(sale.serialize()), 200

@sales_api.route('/sales/<int:id>', methods=['DELETE'])
def delete_sale(id):
    sale = Sale.find_by_id(id)
    if not sale:
        return jsonify({"error": "Sale not found"}), 404
    sale.delete()
    return jsonify({"message": "Sale deleted"}), 200

# Compras
purchases_api = Blueprint("purchases_api", __name__)

@purchases_api.route('/purchases', methods=['GET'])
def get_purchases():
    purchases = Purchase.get_all()
    return jsonify([purchase.serialize() for purchase in purchases]), 200

@purchases_api.route('/purchases/<int:id>', methods=['GET'])
def get_purchase(id):
    purchase = Purchase.find_by_id(id)
    if not purchase:
        return jsonify({"error": "Purchase not found"}), 404
    return jsonify(purchase.serialize()), 200

@purchases_api.route('/purchases', methods=['POST'])
def create_purchase():
    data = request.get_json()
    required_fields = ['provider_id', 'product_id', 'quantity', 'total']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400
    purchase = Purchase(
        provider_id=data['provider_id'],
        product_id=data['product_id'],
        quantity=data['quantity'],
        total=data['total']
    )
    purchase.save()
    return jsonify(purchase.serialize()), 201

@purchases_api.route('/purchases/<int:id>', methods=['PUT'])
def update_purchase(id):
    purchase = Purchase.find_by_id(id)
    if not purchase:
        return jsonify({"error": "Purchase not found"}), 404
    data = request.get_json()
    purchase.provider_id = data.get('provider_id', purchase.provider_id)
    purchase.product_id = data.get('product_id', purchase.product_id)
    purchase.quantity = data.get('quantity', purchase.quantity)
    purchase.total = data.get('total', purchase.total)
    purchase.update()
    return jsonify(purchase.serialize()), 200

@purchases_api.route('/purchases/<int:id>', methods=['DELETE'])
def delete_purchase(id):
    purchase = Purchase.find_by_id(id)
    if not purchase:
        return jsonify({"error": "Purchase not found"}), 404
    purchase.delete()
    return jsonify({"message": "Purchase deleted"}), 200


inventory_api = Blueprint("inventory_api", __name__)

@inventory_api.route('/inventory', methods=['GET'])
@jwt_required()
def get_inventory():
    """
    Obtiene el inventario del usuario autenticado.
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.inventory:
        return jsonify({"error": "Inventario no encontrado."}), 404
    return jsonify(user.inventory.serialize()), 200

@inventory_api.route('/inventory', methods=['POST'])
@jwt_required()
def create_inventory():
    """
    Crea un inventario para el usuario autenticado, si es que aún no tiene uno.
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if user.inventory:
        return jsonify({"error": "El inventario ya existe."}), 400
    try:
        # Utilizamos la función que se encarga de crear y asociar el inventario
        create_inventory_for_user(user)
        return jsonify(user.inventory.serialize()), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

@inventory_api.route('/inventory', methods=['DELETE'])
@jwt_required()
def delete_inventory():
    """
    Elimina el inventario del usuario autenticado.
    """
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

    # Aquí buscarías al usuario en tu base de datos por el correo
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "No user found with this email"}), 404

    # Generar el enlace de restablecimiento de contraseña
    reset_token = user.generate_reset_token()  # Necesitarás implementar esta función
    reset_url = f"http://localhost:5173/reset-password/{reset_token}"

    # Crear el mensaje de correo
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
        # Enviar el correo
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

    # Verificar si el token es válido
    user = User.verify_reset_token(token)
    if not user:
        return jsonify({"error": "Invalid or expired token"}), 400

    # Actualizar la contraseña del usuario
    user.set_password(new_password)  # Necesitas implementar esta función
    db.session.commit()

    return jsonify({"message": "Password has been reset successfully"}), 200
