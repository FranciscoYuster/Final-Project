from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models import db, Configuration, User

configurations_api = Blueprint("configurations_api", __name__)

# Endpoint para obtener la configuración del usuario autenticado.
@configurations_api.route('/configuraciones', methods=['GET'])
@jwt_required()
def get_configuration():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404
    configuration = Configuration.query.filter_by(user_id=user.id).first()
    if not configuration:
        # Si no existe, se crea una configuración por defecto con impuesto 0.19 y moneda CLP
        configuration = Configuration(
            user_id=user.id,
            impuesto=0.19,
            moneda="CLP",
            formato_facturacion="Factura Electrónica"
        )
        try:
            configuration.save()
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": "Error al crear configuración", "details": str(e)}), 500
    return jsonify(configuration.serialize()), 200

# Endpoint para crear la configuración (se fuerza siempre impuesto=0.19 y moneda="CLP")
@configurations_api.route('/configuraciones', methods=['POST'])
@jwt_required()
def create_configuration():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    data = request.get_json()
    # Se ignoran los valores enviados para impuesto y moneda y se asignan siempre 0.19 y "CLP"
    impuesto = 0.19  
    moneda = "CLP"
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

# Endpoint para actualizar la configuración (se fuerza siempre impuesto=0.19 y moneda="CLP")
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
    # Se fuerza siempre el impuesto y la moneda a 0.19 y "CLP"
    configuration.impuesto = 0.19  
    configuration.moneda = "CLP"
    if "formato_facturacion" in data:
        configuration.formato_facturacion = data["formato_facturacion"]

    try:
        configuration.update()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al actualizar la configuración", "details": str(e)}), 500

    return jsonify(configuration.serialize()), 200

# Endpoint para eliminar la configuración
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
