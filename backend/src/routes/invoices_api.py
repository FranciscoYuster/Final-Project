from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models import User, Invoice, Customer  # Asegúrate de importar Customer
from flask import Blueprint, request, jsonify
from src.models import db

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
    
    # Se requiere el campo monto_base y numero_comprobante
    if "monto_base" not in data:
        return jsonify({"error": "monto_base is required"}), 400
    if "numero_comprobante" not in data:
        return jsonify({"error": "numero_comprobante is required"}), 400

    # Obtener el usuario autenticado
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    if not user.inventory:
        return jsonify({"error": "No inventory found for the user"}), 400

    # Determinar el cliente a asociar
    if "customer_id" in data:
        customer_id = data["customer_id"]
    else:
        for field in ["customer_name", "customer_email"]:
            if field not in data:
                return jsonify({"error": f"{field} is required"}), 400
        customer = Customer.query.filter_by(email=data["customer_email"], user_id=user.id).first()
        if not customer:
            customer = Customer(
                name=data["customer_name"],
                email=data["customer_email"],
                phone=data.get("phone", ""),
                user_id=user.id
            )
            try:
                customer.save()
            except Exception as e:
                return jsonify({"error": "Error saving customer", "details": str(e)}), 500
        customer_id = customer.id

    # Convertir monto_base a float
    try:
        monto_base = float(data["monto_base"])
    except ValueError:
        return jsonify({"error": "monto_base must be a valid number"}), 400

    # Obtener la configuración global para este usuario
    from src.models import Configuration  # Asegúrate de que esté importado
    config = Configuration.query.filter_by(user_id=user.id).first()
    tax = config.impuesto if config else 0.0

    # Calcular el impuesto aplicado y el total final
    impuesto_aplicado = monto_base * tax
    total_final = monto_base - impuesto_aplicado

    # Crear la factura
    invoice = Invoice(
        user_id=user.id,
        inventory_id=user.inventory.id,
        customer_id=customer_id,
        monto_base=monto_base,
        impuesto_aplicado=impuesto_aplicado,
        total_final=total_final,
        status=data.get("status", "Pending"),
        numero_comprobante=data["numero_comprobante"]
    )

    try:
        invoice.save()
    except Exception as e:
        return jsonify({"error": "Error saving invoice", "details": str(e)}), 500

    return jsonify(invoice.serialize()), 200

@invoices_api.route('/invoices/<int:id>', methods=['PUT'])
def update_invoice(id):
    invoice = Invoice.query.get(id)
    if not invoice:
        return jsonify({"error": "Invoice not found"}), 404

    data = request.get_json()
    # Para actualizar, si deseas actualizar los datos del cliente, deberás manejarlo aparte.
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
