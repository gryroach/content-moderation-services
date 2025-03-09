# stdlib
import logging

# thirdparty
from constants import ModerationStatus
from errors import GigaChatServiceError
from repository import GigaChatRepository
from service import ModerationService

# Настройка логирования
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("./logs.log"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)

TOKEN = ""
if not TOKEN:
    raise EnvironmentError(
        "Сгенерируйте Authorization key и подставьте в TOKEN https://developers.sber.ru/docs/ru/gigachat/quickstart/ind-create-project"
    )
# Конфигурация
API_CONFIG = {
    "auth_url": "https://ngw.devices.sberbank.ru:9443/api/v2/oauth",
    "chat_url": "https://gigachat.devices.sberbank.ru/api/v1/chat/completions",
    "credentials": {
        "auth_header": "Basic {}".format(TOKEN),
        "scope": "GIGACHAT_API_PERS",
    },
    "model_params": {
        "model": "GigaChat",
        "temperature": 0.0,
        "stream": False,
        "update_interval": 0,
        "max_tokens": 1024,
        "timeout": 10.0,
    },
    "security": {"ssl_verify": False},
}


if __name__ == "__main__":
    # stdlib
    import json

    try:
        repository = GigaChatRepository(API_CONFIG)
        service = ModerationService(repository)

        sample_text = "Фильм очень хорошо показывает в чем на самом деле различия между нациями. Я бы показывал его всему молодому поколению, что бы с детства прививать правильное мышление и отношение ко всем странам бывшего СНГ, кто они есть на самом деле и где их место."
        result = service.moderate_text(sample_text)

        logger.info("Результат модерации:")
        logger.info(json.dumps(result.model_dump(), ensure_ascii=False, separators=(",", ":")))

        if result.status == ModerationStatus.REJECTED:
            logger.warning("Текст отклонен по причинам:")
            for issue in result.issues:
                logger.warning(f"- {issue.category}: {issue.description}")

    except GigaChatServiceError as e:
        logger.error(f"Критическая ошибка: {str(e)}")
        exit(1)
