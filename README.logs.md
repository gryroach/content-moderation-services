# 📊 Система мониторинга логов

> Инструкция по запуску и использованию системы мониторинга логов на базе Grafana, Loki и Promtail.

## 📑 Содержание

- [Обзор](#-обзор)
- [Компоненты](#-компоненты)
- [Быстрый старт](#-быстрый-старт)
- [Управление](#-управление)
- [Настройка](#-настройка)
- [Доступ к интерфейсу](#-доступ-к-интерфейсу)
- [Использование](#-использование)

## 🔍 Обзор

Система мониторинга логов позволяет централизованно собирать, хранить и анализировать логи со всех микросервисов проекта. Она построена на базе стека Grafana для визуализации, Loki для хранения и Promtail для сбора логов.

## 📦 Компоненты

В состав системы входят следующие сервисы:

| Сервис   | Назначение                                  | Порт |
| -------- | ------------------------------------------- | ---- |
| Promtail | Агент для сбора и отправки логов            | 9080 |
| Loki     | Система хранения и индексации логов         | 3100 |
| Grafana  | Платформа для визуализации и анализа данных | 3000 |

## 🚀 Быстрый старт

### Требования

- Docker 20.10+
- Docker Compose 3.9+

### Запуск

Для запуска системы мониторинга логов используйте команду:

```bash
docker-compose -f docker-compose.logs.yml up -d
```

## 🎮 Управление

```bash
# Запуск системы мониторинга логов
docker-compose -f docker-compose.logs.yml up -d

# Остановка системы
docker-compose -f docker-compose.logs.yml down

# Просмотр статуса сервисов
docker-compose -f docker-compose.logs.yml ps

# Просмотр логов
docker-compose -f docker-compose.logs.yml logs

# Просмотр логов конкретного сервиса
docker-compose -f docker-compose.logs.yml logs [promtail|loki|grafana]

# Перезапуск сервисов
docker-compose -f docker-compose.logs.yml restart
```

## ⚙️ Настройка

### Переменные окружения

Для работы с Grafana необходимо настроить следующие переменные окружения:

```env
GF_SECURITY_ADMIN_USER=admin           # Имя пользователя для входа в Grafana
GF_SECURITY_ADMIN_PASSWORD=admin       # Пароль для входа в Grafana
GF_USERS_ALLOW_SIGN_UP=false           # Отключение регистрации новых пользователей
GF_DATABASE_TYPE=sqlite3               # Тип базы данных для Grafana
GF_DATABASE_PATH=/var/lib/grafana/grafana.db
GF_SERVER_HTTP_PORT=3000               # Порт для доступа к Grafana
GF_SERVER_DOMAIN=localhost             # Домен для Grafana
GF_SERVER_ROOT_URL=http://localhost:3000
GF_DASHBOARDS_DEFAULT_HOME_DASHBOARD_PATH=/var/lib/grafana/dashboards/logs.json
GF_LOG_MODE=console                    # Режим логирования
GF_LOG_LEVEL=info                      # Уровень логирования
GF_AUTH_ANONYMOUS_ENABLED=true         # Разрешение анонимного доступа
GF_FEATURE_TOGGLES_ENABLE=publicDashboards # Включенные функции
```

### Конфигурационные файлы

Система использует следующие конфигурационные файлы:

- **Promtail**: `logs/promtail/promtail.yml`
- **Loki**: `logs/loki/loki.yaml`
- **Grafana**: `logs/grafana/custom.ini`

## 🖥️ Доступ к интерфейсу

После запуска системы, интерфейсы доступны по следующим адресам:

- **Grafana**: http://localhost:3000
  - Логин: `admin`
  - Пароль: `admin` (или значение из переменной окружения)

## 👨‍💻 Использование

### Просмотр логов в Grafana

1. Откройте Grafana в браузере (http://localhost:3000)
2. Войдите с учетными данными администратора
3. Перейдите в раздел "Explore" (Исследовать)
4. Выберите источник данных Loki
5. Используйте LogQL для поиска и фильтрации логов

### Пример LogQL запросов

```
# Все логи с контейнеров
{container_name=~".+"}

# Логи определенного контейнера
{container_name="ugc_api"}

# Логи с ошибками
{container_name=~".+"} |= "error"

# Логи с определенного хоста
{host="yourservername"}
```

### Дашборды

В системе предустановлены следующие дашборды:

- **Обзор логов** - общая статистика по всем логам
- **Логи приложений** - детализированные логи микросервисов
- **Системные логи** - логи системных компонентов

## 🔗 Интеграция с другими сервисами

Для отправки логов из контейнеров в Loki рекомендуется настроить их драйвер логирования в docker-compose:

```yaml
logging:
  driver: json-file
  options:
    max-size: "10m"
```

Это позволит Promtail собирать логи контейнеров и отправлять их в Loki для хранения и анализа.
