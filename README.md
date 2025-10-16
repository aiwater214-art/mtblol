# mtblol

A tiny Flask-powered demo that simulates downloading input and output payloads with a Minecraft-inspired interface. Use the control panel to configure payload arguments, kick off the download queue, and watch realtime progress via Server-Sent Events.

## Getting started

1. Create a virtual environment and install dependencies:

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
