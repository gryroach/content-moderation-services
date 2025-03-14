FROM python:3.12-slim-bookworm

# Install uv.
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Install the application dependencies.
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV PYTHONPATH="./src"

# Copy dependencies into the container.
COPY ./ugc_api/pyproject.toml .
COPY uv.lock .
RUN uv sync --frozen --no-cache --package ugc_api

# Copy the application into the container.
COPY ./ugc_api/src ./src
COPY ./ugc_api/keys ./keys
COPY ./ugc_api/entrypoint.sh .
COPY ./grpc_services ./src/grpc_services

# Run the application.
ENTRYPOINT ["bash", "entrypoint.sh"]
