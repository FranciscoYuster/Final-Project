# src/app.py
import os
from flask import Flask, jsonify
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
from datetime import timedelta
from flask_mail import Mail

# Importa tu objeto db y los modelos
from .models import db
# Importa la función que registra tus rutas
from .routes import register_blueprints

load_dotenv()

mail = Mail()

def create_app():
    app = Flask(__name__)

    # Configuraciones base
    app.config['DEBUG'] = True
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 465
    app.config['MAIL_USE_TLS'] = False
    app.config['MAIL_USE_SSL'] = True
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_USERNAME')
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

    # Inicializar extensiones
    db.init_app(app)
    Migrate(app, db)
    JWTManager(app)
    CORS(app)
    mail.init_app(app)

    @app.after_request
    def add_security_headers(response):
        response.headers['Cross-Origin-Opener-Policy'] = 'same-origin'
        return response

    @app.route('/')
    def main():
        return jsonify({"status": "Server running succesfully with JWT and Flask"}), 200

    # Registrar todos los Blueprints
    register_blueprints(app)

    return app

# Permite ejecutar la app con: python src/app.py
if __name__ == '__main__':
    app = create_app()
    app.run()
