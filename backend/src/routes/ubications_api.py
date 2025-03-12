from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models import db, Ubicacion, User

ubications_api = Blueprint("ubications_api", __name__)

# Obtener todas las ubicaciones del inventario del usuario autenticado
@ubications_api.route('/ubicaciones', methods=['GET'])
@jwt_required()
def get_ubicaciones():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.inventory:
        return jsonify({"error": "Usuario o inventario no encontrado"}), 404
    ubicaciones = Ubicacion.query.filter_by(inventory_id=user.inventory.id).all()
    return jsonify([ubicacion.serialize() for ubicacion in ubicaciones]), 200

# Obtener una ubicación específica por su ID (solo si pertenece al inventario del usuario)
@ubications_api.route('/ubicaciones/<int:id>', methods=['GET'])
@jwt_required()
def get_ubicacion(id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.inventory:
        return jsonify({"error": "Usuario o inventario no encontrado"}), 404
    ubicacion = Ubicacion.query.filter_by(id=id, inventory_id=user.inventory.id).first()
    if not ubicacion:
        return jsonify({"error": "Ubicación no encontrada"}), 404
    return jsonify(ubicacion.serialize()), 200

# Crear una nueva ubicación en el inventario del usuario
@ubications_api.route('/ubicaciones', methods=['POST'])
@jwt_required()
def create_ubicacion():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.inventory:
        return jsonify({"error": "Usuario o inventario no encontrado"}), 404

    data = request.get_json()
    nombre = data.get("nombre")
    if not nombre:
        return jsonify({"error": "El nombre es requerido"}), 400
    descripcion = data.get("descripcion", "")
    
    new_ubicacion = Ubicacion(nombre=nombre, descripcion=descripcion, inventory_id=user.inventory.id)
    try:
        new_ubicacion.save()
    except Exception as e:
        return jsonify({"error": "Error al crear la ubicación", "details": str(e)}), 500

    return jsonify(new_ubicacion.serialize()), 201

# Actualizar una ubicación existente (nombre y descripción)
@ubications_api.route('/ubicaciones/<int:id>', methods=['PUT'])
@jwt_required()
def update_ubicacion(id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.inventory:
        return jsonify({"error": "Usuario o inventario no encontrado"}), 404

    ubicacion = Ubicacion.query.filter_by(id=id, inventory_id=user.inventory.id).first()
    if not ubicacion:
        return jsonify({"error": "Ubicación no encontrada"}), 404

    data = request.get_json()
    if "nombre" in data:
        ubicacion.nombre = data["nombre"]
    if "descripcion" in data:
        ubicacion.descripcion = data["descripcion"]

    try:
        ubicacion.update()
    except Exception as e:
        return jsonify({"error": "Error al actualizar la ubicación", "details": str(e)}), 500

    return jsonify(ubicacion.serialize()), 200

# Eliminar una ubicación (solo si pertenece al inventario del usuario)
@ubications_api.route('/ubicaciones/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_ubicacion(id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.inventory:
        return jsonify({"error": "Usuario o inventario no encontrado"}), 404

    ubicacion = Ubicacion.query.filter_by(id=id, inventory_id=user.inventory.id).first()
    if not ubicacion:
        return jsonify({"error": "Ubicación no encontrada"}), 404

    try:
        ubicacion.delete()
    except Exception as e:
        return jsonify({"error": "Error al eliminar la ubicación", "details": str(e)}), 500

    return jsonify({"message": "Ubicación eliminada correctamente"}), 200
