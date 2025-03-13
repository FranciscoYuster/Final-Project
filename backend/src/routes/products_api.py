from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models import db, Product, Movement, User

products_api = Blueprint("products_api", __name__)

@products_api.route('/products', methods=['GET'])
@jwt_required()  
def get_products():
    user_id = get_jwt_identity()
    products = Product.query.filter_by(user_id=user_id).all()
    return jsonify([product.serialize() for product in products]), 200

@products_api.route('/products/<int:id>', methods=['GET'])
@jwt_required()
def get_products_id(id):
    product = Product.query.get(id)
    if not product:
        return jsonify({"error": "Product not found"}), 404
    return jsonify(product.serialize()), 200

@products_api.route('/products', methods=['POST'])
@jwt_required()
def create_product():
    data = request.get_json()
    
    if not data.get("nombre"):
        return jsonify({"error": "Name is required"}), 400

    user_id = get_jwt_identity()  # El usuario autenticado
    user = User.query.get(user_id)
    if not user or not user.inventory:
        return jsonify({"error": "User or inventory not found"}), 404

    # Usar el inventory_id del usuario en lugar de depender de los datos entrantes
    product = Product(
        nombre=data.get("nombre"),
        precio=data.get("precio"),
        codigo=data.get("codigo"),
        stock=data.get("stock"),
        categoria=data.get("categoria"),
        inventory_id=user.inventory.id,  # Se usa el inventario del usuario
        user_id=user_id
    )
    try:
        product.save()
    except Exception as e:
        print(f"error al guardar el producto: {e}")
        return jsonify({"error": "error al guardar el producto", "detalles": str(e)}), 500
    return jsonify(product.serialize()), 201

@products_api.route('/products/<int:id>', methods=['PUT'])
@jwt_required()
def update_product(id):
    product = Product.query.get(id)
    if not product:
        return jsonify({"error": "Product not found"}), 404
    data = request.get_json()
    if data.get("nombre"):
        product.nombre = data["nombre"]
    if data.get("descripcion"):
        product.descripcion = data["descripcion"]
    if data.get("precio"):
        product.precio = data["precio"]
    if data.get("stock"):
        product.stock = data["stock"]

    try:
        product.save()
    except Exception as e:
        return jsonify({"error": "Error updating product", "details": str(e)}), 500
    return jsonify(product.serialize()), 200


@products_api.route('/products/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_product(id):
    product = Product.query.get(id)
    if not product:
        return jsonify({"error": "Product not found"}), 404
    try:
        product.delete()
    except Exception as e:
        return jsonify({"error": "Error deleting product", "details": str(e)}), 500
    return jsonify(product.serialize()), 200
