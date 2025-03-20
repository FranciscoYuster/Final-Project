from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from src.models import db, Category

categories_api = Blueprint("categories_api", __name__)

@categories_api.route('/categories', methods=['GET'])
@jwt_required()
def get_categories():
    categories = Category.query.all()
    return jsonify([cat.serialize() for cat in categories]), 200

@categories_api.route('/categories', methods=['POST'])
@jwt_required()
def create_category():
    data = request.get_json()
    if not data.get("nombre"):
        return jsonify({"error": "El nombre es requerido"}), 400
    if Category.query.filter_by(nombre=data.get("nombre")).first():
        return jsonify({"error": "La categoría ya existe"}), 409
    new_cat = Category(nombre=data.get("nombre"))
    try:
        new_cat.save()
    except Exception as e:
        return jsonify({"error": "Error al guardar categoría", "details": str(e)}), 500
    return jsonify(new_cat.serialize()), 201
