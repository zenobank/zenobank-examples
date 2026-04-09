# Flask Zenobank Examples

## Setup

```bash
uv sync
cp .env.example .env
```

## Run

```bash
uv run python run.py
```

The server starts at `http://127.0.0.1:5000`.

## Endpoints

| Method | Path      | Description  |
|--------|-----------|--------------|
| GET    | `/`       | API info     |
| GET    | `/health` | Health check |
