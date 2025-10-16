# mtblol

This repository contains a minimal Flask application that serves a web UI for
triggering MTB downloads by proxying requests to the MTB actions service.

## Requirements

- Python 3.10+
- [pip](https://pip.pypa.io/)

## Installation

1. Create and activate a virtual environment (recommended):

   ```bash
   python -m venv .venv
   source .venv/bin/activate
   ```

2. Install dependencies:

   ```bash
   pip install Flask requests
   ```

## Configuration

The application proxies download requests to the MTB actions service. The
endpoint can be customized using the following environment variable:

- `MTB_ACTIONS_API_URL` – overrides the default API endpoint
  (`http://216.234.102.170:10701/api/mtb/actions`).

## Running the application

1. Export the Flask app module:

   ```bash
   export FLASK_APP=app.app
   export FLASK_ENV=development  # optional, enables auto-reload
   ```

2. Start the development server:

   ```bash
   flask run --debug
   ```

3. Open the app in your browser at http://127.0.0.1:5000/.

Static assets are served from `app/static/`, and HTML templates live in
`app/templates/`.
