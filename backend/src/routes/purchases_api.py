from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, create_access_token, get_jwt_identity
from src.functions import verify_google_token, verify_google_access_token
from datetime import timedelta
from src.models import (db, Invoice, Purchase,Movement)



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
    required_fields = ['numero_comprobante','orden_compra','metodo','inventory_id','provider_id', 'product_id', 'quantity', 'total']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"{field} is required"}),

    purchase = Purchase(
        orden_compra=data['orden_compra'],
        metodo=data['metodo'],
        provider_id=data['provider_id'],
        product_id=data['product_id'],
        inventory_id=data['inventory_id'],
        quantity=data['quantity'],
        total=data['total']
    )
    purchase.save()

    inventory = purchase.inventory
    user_id = inventory.user_id if inventory else None
    monto_base = purchase.total
    impuesto_aplicado = monto_base * 0.19
    total_final = monto_base - impuesto_aplicado


    # Logica para crear la factura al momento de registrar la compra
    invoice = Invoice(
        purchase_id = purchase.id,
        user_id=user_id,
        inventory_id=purchase.inventory_id,
        numero_comprobante=data['numero_cmoprobante'],
        monto_base=monto_base,
        impuesto_aplicado=impuesto_aplicado,
        total_final=total_final,
        status=data['status']        
    )
    invoice.save()

    # Registrar el movimiento de la compra en el inventario

    movement = Movement(
        prodcut_id=purchase.product_id,
        inventory_id=purchase.inventory_id,
        type=data['type'],
        quantity=purchase.quantity,
        purchase_id=purchase.id
    )
    movement.save()


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
