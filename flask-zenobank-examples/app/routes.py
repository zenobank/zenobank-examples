from flask import Blueprint, jsonify

api = Blueprint("api", __name__)


@api.route("/")
def index():
    return jsonify({"message": "Flask Zenobank Examples API"})


@api.route("/health")
def health():
    return jsonify({"status": "ok"})
