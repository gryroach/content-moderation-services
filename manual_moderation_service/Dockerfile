FROM python:3.12-slim-bookworm

# Install uv.
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Install the application dependencies.
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV PYTHONPATH="./src"

# Copy dependencies into the container.
COPY ./manual_moderation_service/pyproject.toml .
COPY uv.lock .
RUN uv sync --frozen --no-cache --package manual_moderation_service

# Copy the application into the container.
COPY ./manual_moderation_service/alembic.ini .
COPY ./manual_moderation_service/src .
COPY ./manual_moderation_service/keys ./keys
COPY ./manual_moderation_service/entrypoint-api.sh .

ENTRYPOINT ["bash", "entrypoint-api.sh"]
