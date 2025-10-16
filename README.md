# mtblol

A tiny Flask-powered demo that simulates downloading input and output payloads with a Minecraft-inspired interface. Use the control panel to configure payload arguments, kick off the download queue, and watch realtime progress via Server-Sent Events.

## Getting started

1. Create a virtual environment and install dependencies:
This repository contains a minimal Flask application that serves a web UI for
triggering MTB downloads by proxying requests to the MTB actions service.

## Requirements

- Python 3.10+
- [pip](https://pip.pypa.io/)

## Installation

1. Create and activate a virtual environment (recommended)

   ```bash
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

2. Launch the development server:

   ```bash
   flask --app app run --debug
   ```

3. Open [http://localhost:5000](http://localhost:5000) to access the UI. Add filenames to the Input or Output panels and press the corresponding button to watch the simulated downloads land inside `downloads/input` or `downloads/output`.

## Requirements

A minimal `requirements.txt` is provided:

```
Flask>=2.3
```
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
