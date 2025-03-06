FROM python:3.12-slim-bookworm

# Install uv.
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

RUN apt-get update && apt-get install -y gettext && apt-get install --no-install-recommends -y build-essential

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN  mkdir -p /var/www/static/ \
  && mkdir -p /var/www/media/ \
  && mkdir -p /app/static/ \
  && mkdir -p /app/media/

# Copy dependencies into the container.
COPY ./manual_moderation_service/pyproject.toml .
COPY uv.lock .
RUN uv sync --frozen --no-cache --package manual_moderation_service

COPY ./manual_moderation_service/src .
COPY ./manual_moderation_service/django-entrypoint.sh .

EXPOSE 8000

ENTRYPOINT ["bash", "django-entrypoint.sh"]
