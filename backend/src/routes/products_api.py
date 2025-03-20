from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models import db, Product, Movement, Sale, Purchase, User

products_api = Blueprint("products_api", __name__)

# GET: Lista de productos para el usuario autenticado
@products_api.route('/products', methods=['GET'])
@jwt_required()
def get_products():
    user_id = get_jwt_identity()
    products = Product.query.filter_by(user_id=user_id).all()
    return jsonify([product.serialize() for product in products]), 200

# GET: Producto por ID
@products_api.route('/products/<int:id>', methods=['GET'])
@jwt_required()
def get_product(id):
    product = Product.query.get(id)
    if not product:
        return jsonify({"error": "Product not found"}), 404
    return jsonify(product.serialize()), 200

# POST: Crear un nuevo producto
@products_api.route('/products', methods=['POST'])
@jwt_required()
def create_product():
    data = request.get_json()
    if not data.get("nombre"):
        return jsonify({"error": "Name is required"}), 400

    user_id = get_jwt_identity()  # Usuario autenticado
    user = User.query.get(user_id)
    if not user or not user.inventory:
        return jsonify({"error": "User or inventory not found"}), 404

    product = Product(
        nombre=data.get("nombre"),
        precio=data.get("precio"),
        codigo=data.get("codigo"),
        stock=data.get("stock"),
        categoria=data.get("categoria"),
        inventory_id=user.inventory.id,
        ubicacion_id=data.get("ubicacion_id"),  # opcional
        user_id=user_id
    )
    try:
        product.save()
    except Exception as e:
        print(f"Error al guardar el producto: {e}")
        return jsonify({"error": "Error al guardar el producto", "detalles": str(e)}), 500
    return jsonify(product.serialize()), 201

# PUT: Actualizar un producto existente
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
    if data.get("categoria"):
        product.categoria = data["categoria"]
    if data.get("ubicacion_id"):
        product.ubicacion_id = data["ubicacion_id"]
    try:
        product.update()
    except Exception as e:
        return jsonify({"error": "Error updating product", "details": str(e)}), 500
    return jsonify(product.serialize()), 200

# DELETE: Eliminar un producto (si no tiene historial)
@products_api.route('/products/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_product(id):
    product = Product.query.get(id)
    if not product:
        return jsonify({"error": "Product not found"}), 404

    # Verificar si el producto tiene historial
    movement_exist = Movement.query.filter_by(product_id=product.id).first() is not None
    sale_exist = Sale.query.filter_by(product_id=product.id).first() is not None
    purchase_exist = Purchase.query.filter_by(product_id=product.id).first() is not None

    if movement_exist or sale_exist or purchase_exist:
        return jsonify({"error": "El producto tiene historial y no se puede eliminar"}), 409

    try:
        product.delete()
    except Exception as e:
        print(f"Error al eliminar el producto ID {id}: {e}")
        return jsonify({"error": "Error deleting product", "details": str(e)}), 500

    return jsonify(product.serialize()), 200
