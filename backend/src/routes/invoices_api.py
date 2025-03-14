from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models import db, Invoice, Configuration, User, Customer

invoices_api = Blueprint("invoices_api", __name__)

# Obtener todas las facturas del usuario autenticado
@invoices_api.route('/invoices', methods=['GET'])
@jwt_required()
def get_invoices():
    user_id = get_jwt_identity()
    invoices = Invoice.query.filter_by(user_id=user_id).all()
    return jsonify([invoice.serialize() for invoice in invoices]), 200

# Obtener una factura por ID
@invoices_api.route('/invoices/<int:id>', methods=['GET'])
@jwt_required()
def get_invoice(id):
    user_id = get_jwt_identity()
    invoice = Invoice.query.filter_by(id=id, user_id=user_id).first()
    if not invoice:
        return jsonify({"error": "Invoice not found"}), 404
    return jsonify(invoice.serialize()), 200

# Crear una factura
@invoices_api.route('/invoices', methods=['POST'])
@jwt_required()
def create_invoice():
    data = request.get_json()
    
    # Campos requeridos
    if "monto_base" not in data:
        return jsonify({"error": "monto_base is required"}), 400
    if "numero_comprobante" not in data:
        return jsonify({"error": "numero_comprobante is required"}), 400

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
                db.session.rollback()
                return jsonify({"error": "Error saving customer", "details": str(e)}), 500
        customer_id = customer.id

    try:
        monto_base = float(data["monto_base"])
    except ValueError:
        return jsonify({"error": "monto_base must be a valid number"}), 400

    # Obtener la configuración global para calcular el impuesto
    config_obj = Configuration.query.filter_by(user_id=user.id).first()
    tax = config_obj.impuesto if config_obj else 0.0

    impuesto_aplicado = monto_base * tax
    total_final = monto_base + impuesto_aplicado

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
        db.session.rollback()
        return jsonify({"error": "Error saving invoice", "details": str(e)}), 500

    return jsonify(invoice.serialize()), 200

# Actualizar una factura (actualiza monto_base y status, recalculando impuestos)
@invoices_api.route('/invoices/<int:id>', methods=['PUT'])
@jwt_required()
def update_invoice(id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    invoice = Invoice.query.filter_by(id=id, user_id=user.id).first()
    if not invoice:
        return jsonify({"error": "Invoice not found"}), 404

    data = request.get_json()

    # Actualizar monto_base si se recibe
    if "monto_base" in data:
        try:
            invoice.monto_base = float(data["monto_base"])
        except ValueError:
            return jsonify({"error": "monto_base must be a valid number"}), 400

    # Actualizar el estado si se envía
    if "status" in data:
        invoice.status = data["status"]

    # Obtener la configuración global para calcular el impuesto
    config_obj = Configuration.query.filter_by(user_id=user.id).first()
    tax = config_obj.impuesto if config_obj else 0.0

    # Recalcular impuesto_aplicado y total_final
    invoice.impuesto_aplicado = invoice.monto_base * tax
    invoice.total_final = invoice.monto_base + invoice.impuesto_aplicado

    try:
        invoice.update()
    except Exception as e:
        db.session.rollback()
        print("Error al actualizar factura:", e)
        return jsonify({"error": "Error updating invoice", "details": str(e)}), 500

    return jsonify(invoice.serialize()), 200

# Eliminar una factura
@invoices_api.route('/invoices/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_invoice(id):
    user_id = get_jwt_identity()
    invoice = Invoice.query.filter_by(id=id, user_id=user_id).first()
    if not invoice:
        return jsonify({"error": "Invoice not found"}), 404

    try:
        invoice.delete()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error deleting invoice", "details": str(e)}), 500

    return jsonify({"message": "Invoice deleted"}), 200
