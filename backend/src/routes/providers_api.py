# src/routes/providers_api.py
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models import db, Provider, User

providers_api = Blueprint("providers_api", __name__)

@providers_api.route('/providers', methods=['GET'])
def get_providers():
    providers = Provider.get_all()
    return jsonify([provider.serialize() for provider in providers]), 200

@providers_api.route('/providers/<int:id>', methods=['GET'])
def get_provider(id):
    provider = Provider.find_by_id(id)
    if not provider:
        return jsonify({"error": "Provider not found"}), 404
    return jsonify(provider.serialize()), 200

# Crear proveedor (requiere autenticación)
@providers_api.route('/providers', methods=['POST'])
@jwt_required()
def create_provider():
    data = request.get_json()
    if not data.get('name'):
        return jsonify({"error": "Name is required"}), 400

    # Obtener el usuario autenticado y su inventario
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.inventory:
        return jsonify({"error": "User or inventory not found"}), 404

    provider = Provider(
        name=data['name'],
        addres=data.get('addres', ''),
        phone=data.get('phone', ''),
        email=data.get('email', ''),
        rut=data.get('rut', ''),  # NUEVO CAMPO
        inventory_id=user.inventory.id  # Asigna el inventory_id del usuario
    )
    try:
        provider.save()
    except Exception as e:
        return jsonify({"error": "Error saving provider", "details": str(e)}), 500
    return jsonify(provider.serialize()), 200

@providers_api.route('/providers/<int:id>', methods=['PUT'])
def update_provider(id):
    provider = Provider.find_by_id(id)
    if not provider:
        return jsonify({"error": "Provider not found"}), 404
    data = request.get_json()
    provider.name = data.get('name', provider.name)
    provider.addres = data.get('addres', provider.addres)
    provider.phone = data.get('phone', provider.phone)
    provider.email = data.get('email', provider.email)
    provider.rut = data.get('rut', provider.rut)  # Actualiza el rut
    provider.update()
    return jsonify(provider.serialize()), 200

@providers_api.route('/providers/<int:id>', methods=['DELETE'])
def delete_provider(id):
    provider = Provider.find_by_id(id)
    if not provider:
        return jsonify({"error": "Provider not found"}), 404
    provider.delete()
    return jsonify({"message": "Provider deleted"}), 200
