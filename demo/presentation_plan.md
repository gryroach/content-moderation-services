# План презентации дипломного проекта "Сервис модерации с использованием ИИ"

## Общая информация

- **Длительность**: 20 минут (включая время на вопросы)
- **Формат**: Демонстрация лендинга + интерактивная демонстрация
- **Аудитория**: Экзаменационная комиссия, преподаватели, студенты

## Подробный план с таймингом

### 1. Введение (2 минуты)

#### 1.1. Представление (30 секунд)

- Представление себя
- Название дипломного проекта
- Краткое представление области исследования (Задача - применить полученные знания, выбрать проблему, обосновать, подобрать решение правильно рассчитав силы и средства, проверить результат)

#### 1.2. Шутливое начало (30 секунд)

- Показ гифки из фильма "Джей и Молчаливый Боб наносят ответный удар"
- Легкий комментарий о проблеме неконтролируемых комментариев в интернете

#### 1.3. Обозначение проблемы (1 минута)

- Утверждения по токсичным/незаконным комментариям в сети (использование имплементированных моковых данных):

  - **70% пользователей сталкивались с токсичными комментариями.**
    _Источник:_

    - [Pew Research Center – Online Harassment 2017](https://www.pewresearch.org/internet/2017/07/11/online-harassment-2017/)
      _Пояснение:_ Исследование «Online Harassment 2017» демонстрирует, что значительная доля пользователей сталкивалась с агрессивными и оскорбительными комментариями в интернете.

  - **Токсичный пользовательский контент может существенно подорвать доверие пользователей и нанести ущерб репутации бренда.**
    _Источник:_

    - [Datavisor – The Power of User-Generated Content and the Threat of Content Abuse](https://www.datavisor.com/blog/the-power-of-user-generated-content-and-the-threat-of-content-abuse/)
      _Пояснение:_ Данные из исследования DataVisor показывают, что пользовательский контент (UGC) может значительно повлиять на репутацию брендов. Согласно отчету, токсичный или фальшивый контент может привести к утрате доверия пользователей, что в конечном итоге вредит репутации платформы и снижает её использование.

  - **Крупные платформы тратят миллионы долларов ежегодно на модерацию пользовательского контента, что составляет значительную часть их операционных расходов.**
    _Источник:_

    - [Reddit – Unpaid social media moderators perform labor](https://www.reddit.com/r/science/comments/vjt8p2/unpaid_social_media_moderators_perform_labor/)

  - **Объем пользовательского контента продолжает расти, играя ключевую роль в принятии решений потребителей.**
    _Источник:_

    - [Datavisor – The Power of User-Generated Content and the Threat of Content Abuse](https://www.datavisor.com/blog/the-power-of-user-generated-content-and-the-threat-of-content-abuse/)
    - [Marketing SPB – Управление репутацией](https://www.marketing.spb.ru/lib-comm/pr/reputation_management.htm)

### 2. Обоснование проекта (3 минуты)

#### 2.1. Нравственные аспекты (1 минута)

- Проблема кибербуллинга и токсичности
- Влияние токсичных комментариев на пользователей
- Репутационные риски для платформы

#### 2.2. Правовые аспекты (1 минута)

- Требования законодательства РФ (ФЗ "О защите детей от информации" и др.)
- Контроль со стороны Роспотребнадзора
- Юридические последствия отсутствия модерации

#### 2.3. Операционные сложности (1 минута)

- Масштаб проблемы в цифрах:
  - Статистика: среднее время модерации одного отзыва вручную - 2.5 минуты
  - На 10,000 отзывов требуется ~417 человеко-часов (не учитываем latency)
  - Стоимость человеко-часа модератора в среднем 300 руб.
- Неэффективность и высокая стоимость ручной модерации [Источник](https://www.reddit.com/r/science/comments/vjt8p2/unpaid_social_media_moderators_perform_labor/)

### 3. Архитектура решения (3 минуты)

#### 3.1. Микросервисная структура (1 минута)

- Обзор архитектуры системы
- Преимущества микросервисного подхода
- Основные компоненты и их взаимодействие

#### 3.2. Процесс обработки контента (1 минута)

- Пошаговое описание потока данных
- Демонстрация принципиальной анимированной схемы процесса модерации (реализованной с помощью SVG анимации и React)
- Роль ИИ в процессе модерации

#### 3.3. Технологический стек (1 минута)

- Обоснование выбора технологий
- Роль каждой технологии в проекте
- Интеграция с существующими системами

### 4. Демонстрация работы (4 минуты)

#### 4.1. Сценарий 1: Позитивный отзыв (1 минута)

- Показ GIF-записи с демо-страницы с процессом модерации позитивного отзыва
- Комментирование этапов и решений системы
- Результат: быстрое одобрение

#### 4.2. Сценарий 2: Токсичный контент (1 минута)

- Показ GIF-записи с демо-страницы с процессом модерации токсичного отзыва
- Выделение запрещенных слов/фраз
- Результат: отклонение контента

#### 4.3. Сценарий 3: Неоднозначный контент (1 минута)

- Показ GIF-записи с демо-страницы с процессом модерации неоднозначного отзыва
- Объяснение критериев неопределенности
- Результат: отправка на ручную модерацию

#### 4.4.Аналитика эффективности (1 минута)

- Скорость обработки различных типов контента (latency точно быстрее ручной модерации)
- Точность классификации (зависит от модели)
- Сравнение с ручной модерацией (скорость выше, можно увеличить эффективность введя можаритарный подход - мультиагентная проверка)

### 5. Экономические аспекты (3 минуты)

#### 5.1. Исследование рентабельности (1.5 минуты)

- Представление результатов исследования с актуальными данными:
  - Стоимость API запросов (GigaChat API, OpenAI и др.)
  - Затраты на инфраструктуру в различных вариантах
  - ROI при различных объемах трафика
- Демонстрация интерактивного калькулятора с возможностью ввода пользовательских данных
- Сравнение стоимости различных подходов

#### 5.2. Точки инверсии рентабельности (1.5 минуты)

- Объяснение понятия точки инверсии
- Показ графиков для различных сценариев с динамически меняющимися параметрами
- Практические рекомендации по выбору решения

### 6. Перспективы развития (2 минуты)

#### 6.1. Кастомная фильтрация контента (30 секунд)

- Концепция создания кастомных метаданных фильма на основе промтов аналитика
- Гибкая система фильтрации под нужды конкретных платформ
- Примеры реализации

#### 6.2. Персонализированные ленты (30 секунд)

- Учет интересов пользователя при формировании ленты
- Алгоритмы ранжирования контента
- Потенциальные преимущества

#### 6.3. Аналитика и прогнозирование (1 минута)

- Возможности анализа пользовательского контента
- Прогнозирование трендов
- Бизнес-ценность аналитических данных

### 7. Заключение и демонстрация (3 минуты)

#### 7.1. Резюме проекта (1 минута)

- Ключевые преимущества решения
- Решенные задачи
- Технические достижения

#### 7.2. Живая демонстрация (при желании комиссии) (2 минуты)

- Переход на демо-страницу
- Интерактивная демонстрация функций
- Приглашение протестировать систему

## Подготовка к вопросам (распределение оставшихся 10 минут)

### Возможные вопросы и подготовленные ответы

#### Технические вопросы

- Выбор технологий и их обоснование (Согласно требований тз)
- Детали архитектуры системы (Микросервисы)
- Методика тестирования и валидации (Автоматизированная + мануальная, включая end-to-end мануальное тестирование)

#### Вопросы по ИИ-модерации

- Выбор модели и API (Исходя из рентабельности)
- Обучение и точность (Доверяем API)
- Этические аспекты автоматизированной модерации (Сомнительные части отданы на проверку модератору)

#### Экономические вопросы

- Расчет стоимости решения (Проведен research)
- ROI и время окупаемости (Проведен research)
- Сравнение с готовыми решениями на рынке (Единого решения пока нет (навроде Cloudflare), сейчас каждый интегрирует самостоятельно)

#### Вопросы по реализации

- Сложности реализации (Просто)
- Масштабируемость системы (Масштабируемо)
- Дальнейшее развитие проекта (Есть несколько направлений, для выявления приоритетного необходима дополнительная аналитика)

## Дополнительные материалы для подготовки

- Записанные GIF-демонстрации работы сервиса с демо-страницы
- Графики и инфографика по исследованию рентабельности с реальными данными
- Готовая анимированная SVG-схема процесса обработки контента
- Резервные слайды для ответов на технические вопросы

## Критерии успешной презентации

- Уложиться в отведенное время
- Продемонстрировать работающее решение
- Четко обосновать экономические преимущества
- Ответить на все вопросы комиссии
- Получить положительную обратную связь
