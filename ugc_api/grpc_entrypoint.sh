#!/usr/bin/env bash

# Run the GRPC server
echo "Запуск GRPC сервера..."
eval uv run src/grpc_server.py 
