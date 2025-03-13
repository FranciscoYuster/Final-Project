import sys
import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)


from flask import Flask, jsonify
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from src.models import db
from src.routes.routes import api
from dotenv import load_dotenv
from datetime import timedelta
from flask_mail import Mail
from src.routes.invoices_api import invoices_api
from src.routes.customers_api import customers_api
from src.routes.products_api import products_api
from src.routes.providers_api import providers_api 
from src.routes.movements_api import movements_api  
from src.routes.ubications_api import ubications_api
from src.routes.configurations_api import configurations_api 
from src.routes.purchases_api import purchases_api







load_dotenv()

app = Flask(__name__)
app.config['DEBUG'] = True
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 465  # Usar SSL (465)
app.config['MAIL_USE_TLS'] = False  # No usar TLS, usamos SSL
app.config['MAIL_USE_SSL'] = True  # Usar SSL
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_USERNAME')
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')


mail = Mail(app)
db.init_app(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)
CORS(app)

@app.after_request
def add_security_headers(response):
    response.headers['Cross-Origin-Opener-Policy'] = 'same-origin'
    return response

@app.route('/')
def main():
    return jsonify({"status": "Server running succesfully with JWT and Flask"}), 200

app.register_blueprint(api, url_prefix="/api")
app.register_blueprint(invoices_api, url_prefix="/api")
app.register_blueprint(customers_api, url_prefix="/api")
app.register_blueprint(products_api, url_prefix="/api")
app.register_blueprint(providers_api, url_prefix="/api")
app.register_blueprint(movements_api, url_prefix="/api")
app.register_blueprint(ubications_api, url_prefix="/api")
app.register_blueprint(configurations_api, url_prefix="/api")
app.register_blueprint(purchases_api, url_prefix="/api")


if __name__ == '__main__':
    app.run()
