from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Invoice

# invoices_api.py
from flask import Blueprint, request, jsonify
from models import db, Invoice

invoices_api = Blueprint("invoices_api", __name__)

@invoices_api.route('/invoices', methods=['GET'])
@jwt_required()
def get_invoices():
    user_id = get_jwt_identity()
    invoices = Invoice.query.filter_by(user_id=user_id).all()
    return jsonify([invoice.serialize() for invoice in invoices]), 200

@invoices_api.route('/invoices/<int:id>', methods=['GET'])
@jwt_required()
def get_invoice(id):
    invoice = Invoice.query.get(id)
    if not invoice:
        return jsonify({"error": "Invoice not found"}), 404
    return jsonify(invoice.serialize()), 200

@invoices_api.route('/invoices', methods=['POST'])
@jwt_required()
def create_invoice():
    data = request.get_json()
    required_fields = ["customer_name", "customer_email", "total"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400

    # Obtener el usuario autenticado
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    if not user.inventory:
        return jsonify({"error": "No inventory found for the user"}), 400

    invoice = Invoice(
        customer_name=data["customer_name"],
        customer_email=data["customer_email"],
        total=data["total"],
        user_id=user.id,
        inventory_id=user.inventory.id,
        status=data.get("status", "Pending")
    )
    try:
        invoice.save()
    except Exception as e:
        return jsonify({"error": "Error saving invoice", "details": str(e)}), 500

    return jsonify(invoice.serialize()), 201

@invoices_api.route('/invoices/<int:id>', methods=['PUT'])
def update_invoice(id):
    invoice = Invoice.query.get(id)
    if not invoice:
        return jsonify({"error": "Invoice not found"}), 404

    data = request.get_json()
    invoice.customer_name = data.get("customer_name", invoice.customer_name)
    invoice.customer_email = data.get("customer_email", invoice.customer_email)
    invoice.total = data.get("total", invoice.total)
    invoice.status = data.get("status", invoice.status)
    db.session.commit()
    return jsonify(invoice.serialize()), 200

@invoices_api.route('/invoices/<int:id>', methods=['DELETE'])
def delete_invoice(id):
    invoice = Invoice.query.get(id)
    if not invoice:
        return jsonify({"error": "Invoice not found"}), 404

    db.session.delete(invoice)
    db.session.commit()
    return jsonify({"message": "Invoice deleted"}), 200
