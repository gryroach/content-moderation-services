#!/bin/bash

# Функция для удаления сети
clean_network() {
  echo "Попытка удаления сети graduate_work_network..."
  
  # Проверяем, существует ли сеть
  if docker network ls | grep -q "graduate_work_network"; then
    # Проверяем, есть ли активные контейнеры в сети
    if [ -z "$(docker network inspect -f '{{range .Containers}}{{.Name}} {{end}}' graduate_work_network 2>/dev/null)" ]; then
      docker network rm graduate_work_network
      echo "Сеть graduate_work_network успешно удалена."
    else
      echo "Сеть graduate_work_network используется активными контейнерами и не может быть удалена."
      echo "Сначала остановите все контейнеры с помощью 'make down-all'."
    fi
  else
    echo "Сеть graduate_work_network не существует."
  fi
}

# Функция для создания сети с правильными метками
create_network() {
  # Проверяем, существует ли сеть
  if docker network ls | grep -q "graduate_work_network"; then
    # Проверяем метки сети
    LABEL=$(docker network inspect graduate_work_network -f '{{index .Labels "com.docker.compose.network"}}')
    
    if [ "$LABEL" != "graduate_work_network" ]; then
      echo "Сеть graduate_work_network существует, но имеет неправильную метку."
      echo "Текущая метка: $LABEL, ожидаемая: graduate_work_network"
      
      # Проверяем, можно ли удалить сеть
      if [ -z "$(docker network inspect -f '{{range .Containers}}{{.Name}} {{end}}' graduate_work_network 2>/dev/null)" ]; then
        echo "Удаляем существующую сеть и создаем новую с правильными метками..."
        docker network rm graduate_work_network
        docker network create --driver bridge \
          --label com.docker.compose.network=graduate_work_network \
          --label com.docker.compose.project=graduate_work \
          graduate_work_network
        echo "Сеть graduate_work_network успешно пересоздана с правильными метками."
      else
        echo "ВНИМАНИЕ: Сеть используется контейнерами и не может быть удалена."
        echo "Остановите все контейнеры с помощью 'make down-all' и повторите попытку."
      fi
    else
      echo "Сеть graduate_work_network уже существует с правильными метками."
    fi
  else
    echo "Создание сети graduate_work_network..."
    docker network create --driver bridge \
      --label com.docker.compose.network=graduate_work_network \
      --label com.docker.compose.project=graduate_work \
      graduate_work_network
    echo "Сеть graduate_work_network успешно создана."
  fi
}

# Проверяем, не передан ли параметр clean
if [ "$1" == "clean" ]; then
  clean_network
  exit 0
fi

echo "Проверка и создание основной Docker сети..."
create_network

echo "Проверка сетей завершена."
echo "Список доступных сетей:"
docker network ls | grep "graduate_work_network"
docker network inspect graduate_work_network | grep -A 3 Labels 
