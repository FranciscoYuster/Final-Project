from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
import datetime
import jwt
from flask import current_app

db = SQLAlchemy()

# Tabla Inventory (Inventario)
class Inventory(db.Model):
    __tablename__ = 'inventories'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    
    # Relación: productos asociados a este inventario
    products = db.relationship("Product", backref="inventory", lazy=True)
    
    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
        }
    
    def save(self):
        db.session.add(self)
        db.session.commit()

# Tabla users
class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, nullable=False, unique=True)
    password = db.Column(db.String, nullable=False)
    first_name = db.Column(db.String, nullable=False)
    last_name = db.Column(db.String, nullable=False)
    role = db.Column(db.String, nullable=False) 
    is_active = db.Column(db.Boolean, default=True)
    
    # Campo para saber quién creó el usuario (self-referencial)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # Relación: los usuarios creados por este usuario (en caso de que sea admin)
    created_users = db.relationship(
        'User',
        backref=db.backref('creator', remote_side=[id]),
        lazy=True
    )

    profile = db.relationship("Profile", backref='user', uselist=False)
    
    # Relación uno a uno con inventario
    inventory = db.relationship("Inventory", backref='user', uselist=False)

    # Relación: clientes creados por el usuario
    customers = db.relationship("Customer", backref="creator", lazy=True)

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "role": self.role,
            "is_active": self.is_active,
            "created_by": self.created_by,
            "profile": self.profile.serialize() if self.profile else None,
            "inventory": self.inventory.serialize() if self.inventory else None,
            "customers": [customer.serialize() for customer in self.customers]
        }
    
    def save(self):
        db.session.add(self)
        db.session.commit()

    def update(self):
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def verify_password(self, password):
        return check_password_hash(self.password, password)
    
    def generate_reset_token(self, expires_in=600):
        payload = {
            "user_id": self.id,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(seconds=expires_in)
        }
        return jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')

    def verify_reset_token(token):
        try:
            payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            return User.query.get(payload['user_id'])
        except jwt.ExpiredSignatureError:
            return None  # Token expirado
        except jwt.InvalidTokenError:
            return None  # Token inválido

# Función para crear un inventario para un usuario, garantizando que no se cree más de uno.
def create_inventory_for_user(user):
    if user.inventory is not None:
        raise ValueError("El usuario ya tiene un inventario asignado.")
    
    new_inventory = Inventory(user_id=user.id)
    new_inventory.save()
    return new_inventory

# Tabla profiles
class Profile(db.Model):
    __tablename__ = 'profiles'

    id = db.Column(db.Integer, primary_key=True)
    bio = db.Column(db.String, default='')
    github = db.Column(db.String, default='')
    facebook = db.Column(db.String, default='')
    instagram = db.Column(db.String, default='')
    twitter = db.Column(db.String, default='')
    avatar = db.Column(db.String, default='')
    users_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    def serialize(self):
        return {
            "bio": self.bio,
            "github": self.github,
            "facebook": self.facebook,
            "twitter": self.twitter,
            "instagram": self.instagram,
            "avatar": self.avatar
        }
    
    def save(self):
        db.session.add(self)
        db.session.commit()

    def update(self):
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()

# Nuevo modelo: Tabla de Customers
class Customer(db.Model):
    __tablename__ = 'customers'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    email = db.Column(db.String, nullable=False)
    phone = db.Column(db.String, default='')
    # Relación: cada cliente es creado por un usuario
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "user_id": self.user_id
        }
        
    def save(self):
        db.session.add(self)
        db.session.commit()

    def update(self):
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()

# Tabla de productos
class Product(db.Model):
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True)  # ID único para cada producto
    codigo = db.Column(db.String(50), unique=True, nullable=False)  # Código del producto
    nombre = db.Column(db.String(100), nullable=False)  # Nombre del producto
    stock = db.Column(db.Integer, nullable=False)  # Cantidad disponible
    precio = db.Column(db.Float, nullable=False)  # Precio del producto
    categoria = db.Column(db.String(50), nullable=False)  # Categoría del producto
        # Vinculación al inventario
    inventory_id = db.Column(db.Integer, db.ForeignKey('inventories.id'), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    
    def serialize(self):
        return {
            "id": self.id,
            "codigo": self.codigo,
            "nombre": self.nombre,
            "stock": self.stock,
            "precio": self.precio,
            "categoria": self.categoria
        }
        
    def save(self):
        db.session.add(self)
        db.session.commit()

    def update(self):
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()
    

# Tabla de ventas (Sale)
class Sale(db.Model):
    __tablename__ = 'sales'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    inventory_id = db.Column(db.Integer, db.ForeignKey('inventories.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    total = db.Column(db.Float, nullable=False)
    sale_date = db.Column(db.DateTime, server_default=db.func.now())
    
    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "inventory_id": self.inventory_id,
            "product_id": self.product_id,
            "quantity": self.quantity,
            "total": self.total,
            "sale_date": self.sale_date.isoformat() if self.sale_date else None
        }
        
    def save(self):
        db.session.add(self)
        db.session.commit()
        
    def update(self):
        db.session.commit()
        
    def delete(self):
        db.session.delete(self)
        db.session.commit()
        
    def refresh(self):
        db.session.refresh(self)
    
    @classmethod
    def find_by_id(cls, sale_id):
        return cls.query.get(sale_id)
    
    @classmethod
    def get_all(cls):
        return cls.query.all()

# Modificada: Tabla de facturas (Invoice)
class Invoice(db.Model):
    __tablename__ = 'invoices'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    inventory_id = db.Column(db.Integer, db.ForeignKey('inventories.id'), nullable=False)
    # Se asigna la factura a un Customer
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    
    total = db.Column(db.Float, nullable=False)
    invoice_date = db.Column(db.DateTime, server_default=db.func.now())
    status = db.Column(db.String, nullable=False, default="Pending")
    
    # Relación para acceder al cliente asociado
    customer = db.relationship("Customer", backref="invoices")
    
    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "inventory_id": self.inventory_id,
            "customer": self.customer.serialize() if self.customer else None,
            "total": self.total,
            "invoice_date": self.invoice_date.isoformat() if self.invoice_date else None,
            "status": self.status
        }
        
    def save(self):
        db.session.add(self)
        db.session.commit()

# Tabla de compras
class Purchase(db.Model):
    __tablename__ = 'purchases'
    
    id = db.Column(db.Integer, primary_key=True)
    provider_id = db.Column(db.Integer, db.ForeignKey('providers.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    inventory_id = db.Column(db.Integer, db.ForeignKey('inventories.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    total = db.Column(db.Float, nullable=False)
    purchase_date = db.Column(db.DateTime, server_default=db.func.now())
    
    def serialize(self):
        return {
            "id": self.id,
            "provider_id": self.provider_id,
            "product_id": self.product_id,
            "inventory_id": self.inventory_id,
            "quantity": self.quantity,
            "total": self.total,
            "purchase_date": self.purchase_date.isoformat() if self.purchase_date else None
        }
    
    def save(self):
        db.session.add(self)
        db.session.commit()
    
    def update(self):
        db.session.commit()
    
    def delete(self):
        db.session.delete(self)
        db.session.commit()
    
    def refresh(self):
        db.session.refresh(self)
    
    @classmethod
    def find_by_id(cls, purchase_id):
        return cls.query.get(purchase_id)
    
    @classmethod
    def get_all(cls):
        return cls.query.all()

# Tabla de proveedores
class Provider(db.Model):
    __tablename__ = 'providers'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    contact = db.Column(db.String, default='')
    phone = db.Column(db.String, default='')
    email = db.Column(db.String, default='')
    
    # Vinculación al inventario
    inventory_id = db.Column(db.Integer, db.ForeignKey('inventories.id'), nullable=False)
    
    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "contact": self.contact,
            "phone": self.phone,
            "email": self.email,
            "inventory_id": self.inventory_id
        }
    
    def save(self):
        db.session.add(self)
        db.session.commit()
    
    def update(self):
        db.session.commit()
    
    def delete(self):
        db.session.delete(self)
        db.session.commit()
    
    def refresh(self):
        db.session.refresh(self)
    
    @classmethod
    def find_by_id(cls, provider_id):
        return cls.query.get(provider_id)
    
    @classmethod
    def get_all(cls):
        return cls.query.all()

# Tabla de movimientos
class Movement(db.Model):
    __tablename__ = 'movements'
    
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    inventory_id = db.Column(db.Integer, db.ForeignKey('inventories.id'), nullable=False)
    type = db.Column(db.String, nullable=False)  # Puede ser 'sale' o 'purchase'
    quantity = db.Column(db.Integer, nullable=False)
    date = db.Column(db.DateTime, server_default=db.func.now())
    
    def serialize(self):
        return {
            "id": self.id,
            "product_id": self.product_id,
            "inventory_id": self.inventory_id,
            "type": self.type,
            "quantity": self.quantity,
            "date": self.date.isoformat() if self.date else None
        }
    
    def save(self):
        db.session.add(self)
        db.session.commit()
    
    def update(self):
        db.session.commit()
    
    def delete(self):
        db.session.delete(self)
        db.session.commit()
    
    def refresh(self):
        db.session.refresh(self)
    
    @classmethod
    def find_by_id(cls, movement_id):
        return cls.query.get(movement_id)
    
    @classmethod
    def get_all(cls):
        return cls.query.all()
