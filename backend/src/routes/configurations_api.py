from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models import db, Configuration, User

configurations_api = Blueprint("configurations_api", __name__)

def normalize_impuesto(impuesto_value):
    """
    Convierte el valor ingresado a formato decimal.
    Si es mayor que 1, se asume que se ingresó en porcentaje.
    Ejemplo: 19 se convierte a 0.19.
    """
    try:
        imp = float(impuesto_value)
        if imp > 1:
            imp = imp / 100
        return imp
    except (ValueError, TypeError):
        return 0.0

# Obtener la configuración del usuario autenticado
@configurations_api.route('/configuraciones', methods=['GET'])
@jwt_required()
def get_configuration():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404
    configuration = Configuration.query.filter_by(user_id=user.id).first()
    if not configuration:
        return jsonify({"error": "Configuración no encontrada"}), 404
    return jsonify(configuration.serialize()), 200

# Crear una configuración para el usuario (si aún no existe)
@configurations_api.route('/configuraciones', methods=['POST'])
@jwt_required()
def create_configuration():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    data = request.get_json()
    impuesto = normalize_impuesto(data.get("impuesto", 0.20))
    moneda = data.get("moneda", "USD")
    formato_facturacion = data.get("formato_facturacion", "Factura Electrónica")

    if Configuration.query.filter_by(user_id=user.id).first():
        return jsonify({"error": "La configuración ya existe"}), 400

    configuration = Configuration(
        user_id=user.id,
        impuesto=impuesto,
        moneda=moneda,
        formato_facturacion=formato_facturacion
    )
    try:
        configuration.save()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al crear configuración", "details": str(e)}), 500

    return jsonify(configuration.serialize()), 201

# Actualizar la configuración del usuario
@configurations_api.route('/configuraciones/<int:id>', methods=['PUT'])
@jwt_required()
def update_configuration(id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    configuration = Configuration.query.filter_by(id=id, user_id=user.id).first()
    if not configuration:
        return jsonify({"error": "Configuración no encontrada"}), 404

    data = request.get_json()
    if "impuesto" in data:
        configuration.impuesto = normalize_impuesto(data["impuesto"])
    if "moneda" in data:
        configuration.moneda = data["moneda"]
    if "formato_facturacion" in data:
        configuration.formato_facturacion = data["formato_facturacion"]

    try:
        configuration.update()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al actualizar la configuración", "details": str(e)}), 500

    return jsonify(configuration.serialize()), 200

# Eliminar la configuración del usuario
@configurations_api.route('/configuraciones/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_configuration(id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    configuration = Configuration.query.filter_by(id=id, user_id=user.id).first()
    if not configuration:
        return jsonify({"error": "Configuración no encontrada"}), 404

    try:
        configuration.delete()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al eliminar la configuración", "details": str(e)}), 500

    return jsonify({"message": "Configuración eliminada correctamente"}), 200
