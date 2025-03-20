from flask import Blueprint, jsonify, request
from src.models import db, Sale, Product, Customer, Inventory, User
from flask_jwt_extended import jwt_required, get_jwt_identity

sales_api = Blueprint("sales_api", __name__)

# Obtener todas las ventas del usuario actual
@sales_api.route('/sales', methods=['GET'])
@jwt_required()
def get_sales():
    user_id = get_jwt_identity()
    sales = Sale.query.filter_by(user_id=user_id).all()

    result = []
    for sale in sales:
        customer = Customer.query.filter_by(user_id=sale.user_id).first()
        product = Product.query.get(sale.product_id)

        if not customer or not product:
            continue  # Saltar si faltan datos para evitar errores

        result.append({
            "id": sale.id,
            "customer": customer.serialize(),
            "product": product.serialize(),
            "quantity": sale.quantity,
            "total": sale.total,
            "sale_date": sale.sale_date.isoformat()
        })

    return jsonify(result), 200

# Crear una nueva venta
@sales_api.route('/sales', methods=['POST'])
@jwt_required()
def create_sale():
    user_id = get_jwt_identity()
    data = request.get_json()

    # Validación estricta de campos requeridos
    required_fields = ['customer_id', 'product_id', 'quantity']
    missing_fields = [field for field in required_fields if field not in data]

    if missing_fields:
        return jsonify({"error": f"Campos faltantes: {', '.join(missing_fields)}"}), 400

    customer = Customer.query.get(data['customer_id'])
    if not customer:
        return jsonify({"error": "Cliente no encontrado"}), 404

    product = Product.query.get(data['product_id'])
    if not product:
        return jsonify({"error": "Producto no encontrado"}), 404

    inventory = Inventory.query.get(product.inventory_id)
    if not inventory:
        return jsonify({"error": "Inventario no encontrado para este producto"}), 404

    total = product.precio * int(data['quantity'])

    sale = Sale(
        user_id=user_id,
        inventory_id=inventory.id,
        product_id=product.id,
        quantity=int(data['quantity']),
        total=total
    )

    db.session.add(sale)
    db.session.commit()

    return jsonify({
        "id": sale.id,
        "customer": customer.serialize(),
        "product": product.serialize(),
        "quantity": sale.quantity,
        "total": sale.total,
        "sale_date": sale.sale_date.isoformat()
    }), 201

# Actualizar venta existente
@sales_api.route('/sales/<int:id>', methods=['PUT'])
@jwt_required()
def update_sale(id):
    user_id = get_jwt_identity()
    sale = Sale.query.filter_by(id=id, user_id=user_id).first()

    if not sale:
        return jsonify({"error": "Venta no encontrada"}), 404

    data = request.get_json()

    if 'quantity' in data:
        sale.quantity = int(data['quantity'])
        sale.total = sale.product.precio * sale.quantity

    db.session.commit()

    return jsonify({
        "id": sale.id,
        "customer": Customer.query.filter_by(user_id=sale.user_id).first().serialize(),
        "product": sale.product.serialize(),
        "quantity": sale.quantity,
        "total": sale.total,
        "sale_date": sale.sale_date.isoformat()
    }), 200

# Eliminar una venta existente
@sales_api.route('/sales/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_sale(id):
    user_id = get_jwt_identity()
    sale = Sale.query.filter_by(id=id, user_id=user_id).first()

    if not sale:
        return jsonify({"error": "Venta no encontrada"}), 404

    db.session.delete(sale)
    db.session.commit()

    return jsonify({"message": "Venta eliminada correctamente."}), 200
