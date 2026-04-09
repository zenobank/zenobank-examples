import os

from flask import Flask

from config import config


def create_app():
    env = os.environ.get("FLASK_ENV", "default")
    app = Flask(__name__)
    app.config.from_object(config[env])

    from app.routes import api

    app.register_blueprint(api)

    return app
