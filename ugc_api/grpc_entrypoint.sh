#!/usr/bin/env bash

# Установка зависимостей
echo "Установка зависимостей..."
cd /app
uv sync --frozen --no-cache --package ugc_api
uv pip install grpcio==1.71.0 grpcio-tools==1.71.0 protobuf==5.29.3

# Run the GRPC server
echo "Запуск GRPC сервера..."
eval uv run src/grpc_server.py 
