#!/usr/bin/env bash

# Сбор статики
uv run manage.py collectstatic --noinput

# Компиляция переводов
uv run manage.py compilemessages

# Запуск миграций
uv run manage.py migrate

# Запуск web-сервера
uv run gunicorn -c gunicorn_config.py config.wsgi:application
