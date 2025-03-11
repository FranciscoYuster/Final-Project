from flask_jwt_extended import jwt_required, get_jwt_identity
from flask import Blueprint, request, jsonify
from src.models import db, Movement, User

# Blueprint para Movimientos
movements_api = Blueprint("movements_api", __name__)

# Obtener movimientos del inventario del usuario autenticado
@movements_api.route('/movements', methods=['GET'])
@jwt_required()
def get_movements():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.inventory:
        return jsonify({"error": "User or inventory not found"}), 404

    # Filtrar movimientos por el inventario del usuario
    movements = Movement.query.filter_by(inventory_id=user.inventory.id).all()
    return jsonify([movement.serialize() for movement in movements]), 200

# Obtener un movimiento específico (solo si pertenece al inventario del usuario)
@movements_api.route('/movements/<int:id>', methods=['GET'])
@jwt_required()
def get_movement(id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.inventory:
        return jsonify({"error": "User or inventory not found"}), 404

    movement = Movement.query.filter_by(id=id, inventory_id=user.inventory.id).first()
    if not movement:
        return jsonify({"error": "Movement not found"}), 404
    return jsonify(movement.serialize()), 200

# Crear un nuevo movimiento, asignándole el inventory_id del usuario autenticado
@movements_api.route('/movements', methods=['POST'])
@jwt_required()
def create_movement():
    data = request.get_json()
    required_fields = ['product_id', 'type', 'quantity']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400

    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.inventory:
        return jsonify({"error": "User or inventory not found"}), 404

    movement = Movement(
        product_id=data['product_id'],
        type=data['type'],
        quantity=data['quantity'],
        inventory_id=user.inventory.id
    )
    movement.save()
    return jsonify(movement.serialize()), 201

# Actualizar un movimiento (solo si pertenece al inventario del usuario)
@movements_api.route('/movements/<int:id>', methods=['PUT'])
@jwt_required()
def update_movement(id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.inventory:
        return jsonify({"error": "User or inventory not found"}), 404

    movement = Movement.query.filter_by(id=id, inventory_id=user.inventory.id).first()
    if not movement:
        return jsonify({"error": "Movement not found"}), 404

    data = request.get_json()
    movement.product_id = data.get('product_id', movement.product_id)
    movement.type = data.get('type', movement.type)
    movement.quantity = data.get('quantity', movement.quantity)
    movement.update()
    return jsonify(movement.serialize()), 200

# Eliminar un movimiento (solo si pertenece al inventario del usuario)
@movements_api.route('/movements/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_movement(id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.inventory:
        return jsonify({"error": "User or inventory not found"}), 404

    movement = Movement.query.filter_by(id=id, inventory_id=user.inventory.id).first()
    if not movement:
        return jsonify({"error": "Movement not found"}), 404

    movement.delete()
    return jsonify({"message": "Movement deleted"}), 200
