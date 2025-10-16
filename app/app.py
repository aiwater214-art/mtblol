"""Flask application setup and route definitions."""
from __future__ import annotations

import os
from typing import Any

import requests
from flask import Flask, Response, jsonify, render_template, request

DEFAULT_API_URL = "http://216.234.102.170:10701/api/mtb/actions"
API_URL_ENV_VAR = "MTB_ACTIONS_API_URL"


def create_app() -> Flask:
    """Create and configure the Flask application."""
    app = Flask(
        __name__,
        static_folder="static",
        static_url_path="/static",
        template_folder="templates",
    )

    @app.route("/")
    def index() -> str:
        """Render the main UI page."""
        return render_template("index.html")

    @app.route("/download", methods=["POST"])
    def download() -> Response:
        """Proxy download requests to the MTB actions API."""
        api_url = os.getenv(API_URL_ENV_VAR, DEFAULT_API_URL)
        excluded_request_headers = {"host", "content-length"}
        headers = {
            key: value
            for key, value in request.headers
            if key.lower() not in excluded_request_headers
        }

        try:
            json_payload: Any | None = request.get_json(silent=True) if request.is_json else None
            raw_payload = None if json_payload is not None else request.get_data()

            proxied_response = requests.post(
                api_url,
                json=json_payload,
                data=raw_payload,
                headers=headers,
                timeout=60,
            )
        except requests.RequestException as exc:
            return jsonify({"error": "Failed to contact download service", "details": str(exc)}), 502

        excluded_response_headers = {"content-encoding", "content-length", "transfer-encoding", "connection"}
        filtered_headers = [
            (key, value)
            for key, value in proxied_response.headers.items()
            if key.lower() not in excluded_response_headers
        ]

        response = Response(
            proxied_response.content,
            status=proxied_response.status_code,
            headers=filtered_headers,
        )
        return response

    return app


# Allow ``flask run`` to discover the application when ``FLASK_APP=app.app``.
app = create_app()
