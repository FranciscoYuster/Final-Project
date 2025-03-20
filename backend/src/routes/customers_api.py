# src/routes/customers_api.py
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models import db, Customer

customers_api = Blueprint("customers_api", __name__)

# GET /api/customers
@customers_api.route('/customers', methods=['GET'])
@jwt_required()
def get_customers():
    user_id = get_jwt_identity()
    customers = Customer.query.filter_by(user_id=user_id).all()
    return jsonify([customer.serialize() for customer in customers]), 200

# POST /api/customers
@customers_api.route('/customers', methods=['POST'])
@jwt_required()
def create_customer():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data.get("name") or not data.get("email"):
        return jsonify({"error": "Name and email are required"}), 400

    customer = Customer(
        name=data.get("name"),
        email=data.get("email"),
        phone=data.get("phone", ""),
        rut=data.get("rut", ""),
        direccion=data.get("direccion", ""),
        user_id=user_id
    )
    try:
        customer.save()
    except Exception as e:
        return jsonify({"error": "Error saving customer", "details": str(e)}), 500
    return jsonify(customer.serialize()), 201

# PUT /api/customers/<id>
@customers_api.route('/customers/<int:id>', methods=['PUT'])
@jwt_required()
def update_customer(id):
    user_id = get_jwt_identity()
    customer = Customer.query.get(id)
    if not customer:
        return jsonify({"error": "Customer not found"}), 404
    if str(customer.user_id) != str(user_id):
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    customer.name = data.get("name", customer.name)
    customer.email = data.get("email", customer.email)
    customer.phone = data.get("phone", customer.phone)
    customer.rut = data.get("rut", customer.rut)              # Actualiza rut

    try:
        customer.update()
    except Exception as e:
        return jsonify({"error": "Error updating customer", "details": str(e)}), 500
    return jsonify(customer.serialize()), 200

# DELETE /api/customers/<id>
@customers_api.route('/customers/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_customer(id):
    user_id = get_jwt_identity()
    customer = Customer.query.get(id)
    if not customer:
        return jsonify({"error": "Customer not found"}), 404
    if str(customer.user_id) != str(user_id):
        return jsonify({"error": "Unauthorized"}), 403
    
    # Verificar si el cliente tiene facturas asociadas
    if hasattr(customer, 'invoices') and customer.invoices:
        return jsonify({"error": "El cliente tiene facturas asociadas y no puede ser eliminado."}), 409

    try:
        customer.delete()
    except Exception as e:
        return jsonify({"error": "Error deleting customer", "details": str(e)}), 500
    return jsonify({"message": "Customer deleted"}), 200
