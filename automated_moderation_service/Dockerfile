FROM python:3.12-slim-bookworm

# Install uv.
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Install the application dependencies.
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Copy dependencies into the container.
COPY ./grpc_services ./grpc_services
COPY ./pyproject.toml .
COPY uv.lock .
RUN uv sync --frozen --no-cache --package automated_moderation_service

# Copy the application into the container.
COPY ./automated_moderation_service/src .

# Run the application.
ENTRYPOINT ["uv", "run", "main.py"]
