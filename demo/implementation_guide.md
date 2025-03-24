# Руководство по технической реализации

Данное руководство содержит технические рекомендации по реализации демонстрационной страницы и лендинга для проекта "Сервис модерации с использованием ИИ".

## 1. Структура компонентов

Анализ существующей структуры проекта выявил следующую организацию:

```
moderation_frontend/frontend/
├── app/                        # Next.js приложение с маршрутизацией
│   ├── globals.css             # Глобальные стили
│   ├── layout.tsx              # Основной макет приложения
│   ├── page.tsx                # Главная страница
│   ├── login/                  # Страницы авторизации
│   ├── moderation/             # Страницы модерации
│   │   ├── layout.tsx          # Макет для страниц модерации
│   │   ├── page.tsx            # Основная страница модерации
│   │   ├── login/              # Вложенные страницы авторизации для модераторов
│   │   └── reviews/            # Страницы с отзывами для модерации
│   └── movies/                 # Страницы с фильмами
├── components/                 # React компоненты
│   ├── ai-moderation.tsx       # Компонент ИИ-модерации
│   ├── toaster.tsx             # Компонент уведомлений
│   ├── moderation/             # Компоненты для модерации
│   │   ├── auto-moderation-display.tsx  # Отображение результатов автоматической модерации
│   │   ├── moderation-navbar.tsx        # Навигационная панель модератора
│   │   └── review-card.tsx              # Карточка отзыва для модерации
│   └── ui/                     # Библиотека UI компонентов
│       ├── button.tsx          # Компонент кнопки
│       ├── card.tsx            # Компонент карточки
│       ├── input.tsx           # Компонент ввода
│       └── [множество других UI компонентов]
├── lib/                        # Утилиты и API
│   ├── api.ts                  # Базовый API-клиент
│   ├── api-wrapper.ts          # Обертка для API с обработкой ошибок
│   ├── moderation-api.ts       # API модерации (функции для работы с модерацией)
│   ├── token-storage.ts        # Функции для работы с токенами авторизации
│   └── error-handling.ts       # Утилиты для обработки ошибок
└── types/                      # TypeScript типы
    └── moderation-api.ts       # Типы для API модерации
```

### 1.1. Предлагаемая структура для интеграции демонстрационных компонентов

Основываясь на существующей структуре, предлагается следующая организация новых файлов и компонентов:

```
moderation_frontend/frontend/
├── app/
│   ├── demo/                   # Новая директория для демо-страницы
│   │   ├── page.tsx            # Демонстрационная страница
│   │   └── layout.tsx          # Макет для демо-страницы
│   ├── presentation/           # Новая директория для презентации
│   │   └── page.tsx            # Страница лендинга для презентации
│   └── api/
│       └── demo/               # API эндпоинты для демо
│           └── moderate/       # Эндпоинт для проверки модерации
│               └── route.ts    # Обработчик POST запросов для модерации
├── components/
│   ├── demo/                   # Компоненты для демо-страницы
│   │   ├── review-form.tsx     # Форма отзыва
│   │   ├── moderation-panel.tsx # Панель результатов модерации
│   │   └── preset-examples.tsx # Предустановленные примеры отзывов
│   └── presentation/           # Компоненты для лендинга
│       ├── hero-section.tsx    # Шапка лендинга с GIF
│       ├── problem-section.tsx # Раздел о проблеме
│       ├── solution-section.tsx # Раздел о решении
│       └── calculator.tsx      # Калькулятор рентабельности
└── public/
    └── presentation/           # Статические файлы для презентации
        ├── jay_and_bob.gif     # GIF из фильма
        └── diagrams/           # Диаграммы и графики
```

Эта структура следует паттернам существующего проекта:

- Использует директории `app` для страниц с маршрутизацией Next.js
- Хранит переиспользуемые компоненты в директории `components`
- Группирует компоненты по функциональности в соответствующих поддиректориях
- Следует API-подходу в Next.js для серверных обработчиков
- Размещает статические файлы в директории `public`

## 2. Реализация демо-страницы

### 2.1. Основной компонент демо-страницы

Создайте файл `app/demo/page.tsx`:

```tsx
"use client";

import { Container } from "@/components/ui/container";
import ReviewForm from "@/components/demo/review-form";
import ModerationPanel from "@/components/demo/moderation-panel";
import PresetExamples from "@/components/demo/preset-examples";
import { useState } from "react";
import { AutoModerationResult } from "@/types/moderation-api";

export default function DemoPage() {
  const [reviewText, setReviewText] = useState<string>("");
  const [moderationResult, setModerationResult] =
    useState<AutoModerationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Функция для отправки отзыва на модерацию
  const handleSubmitReview = async (text: string) => {
    setIsLoading(true);
    try {
      // Используем существующий API модерации
      const response = await fetch("/api/demo/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      setModerationResult(data);
    } catch (error) {
      console.error("Ошибка при модерации:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="py-8">
      <h1 className="text-2xl font-bold mb-6">
        Демонстрация сервиса модерации контента
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <ReviewForm
            reviewText={reviewText}
            setReviewText={setReviewText}
            onSubmit={() => handleSubmitReview(reviewText)}
            isLoading={isLoading}
          />
          <PresetExamples
            onSelectExample={(example) => {
              setReviewText(example);
              setModerationResult(null);
            }}
          />
        </div>

        <ModerationPanel result={moderationResult} isLoading={isLoading} />
      </div>
    </Container>
  );
}
```

### 2.2. Компоненты демо-страницы

#### Форма отправки отзыва

Создайте файл `components/demo/review-form.tsx`:

```tsx
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LoaderCircle } from "lucide-react";

interface ReviewFormProps {
  reviewText: string;
  setReviewText: (text: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export default function ReviewForm({
  reviewText,
  setReviewText,
  onSubmit,
  isLoading,
}: ReviewFormProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Напишите отзыв для проверки</h2>
      <Textarea
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        placeholder="Введите текст отзыва для модерации..."
        className="min-h-[150px]"
      />
      <Button
        onClick={onSubmit}
        disabled={!reviewText.trim() || isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            Модерация...
          </>
        ) : (
          "Отправить на модерацию"
        )}
      </Button>
    </div>
  );
}
```

#### Панель с результатами модерации

Для панели результатов можно использовать существующий компонент `AutoModerationDisplay` с дополнительными улучшениями:

```tsx
import AutoModerationDisplay from "@/components/moderation/auto-moderation-display";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AutoModerationResult } from "@/types/moderation-api";

interface ModerationPanelProps {
  result: AutoModerationResult | null;
  isLoading: boolean;
}

export default function ModerationPanel({
  result,
  isLoading,
}: ModerationPanelProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Результаты модерации</h2>
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!result && !isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Результаты модерации</h2>
        <Card>
          <CardContent className="py-6">
            <p className="text-center text-muted-foreground">
              Напишите отзыв или выберите пример, чтобы увидеть результаты
              модерации
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Результаты модерации</h2>
      <AutoModerationDisplay result={result} />

      {/* Дополнительная информация о процессе модерации */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            О процессе модерации
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Сервис анализирует контент на соответствие правилам, выявляя
            проблемные места и определяя общую тональность. Результаты включают
            статус модерации, метки классификации, выявленные проблемы и уровень
            уверенности ИИ в принятом решении.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### Предустановленные примеры отзывов

Создайте файл `components/demo/preset-examples.tsx`:

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, HelpCircle } from "lucide-react";

interface PresetExamplesProps {
  onSelectExample: (example: string) => void;
}

export default function PresetExamples({
  onSelectExample,
}: PresetExamplesProps) {
  const examples = [
    {
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      label: "Положительный",
      text: "Отличный фильм! Сюжет захватывающий, актёры играют великолепно. Рекомендую всем любителям хорошего кино.",
      variant: "outline",
    },
    {
      icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
      label: "Токсичный",
      text: "Полный отстой! Такой ужасный фильм я еще не видел. Актеры бездарные, режиссер идиот, сценарий писали дегенераты. Не тратьте своё время на это дерьмо!",
      variant: "outline",
    },
    {
      icon: <HelpCircle className="h-4 w-4 text-yellow-500" />,
      label: "Спорный",
      text: "Фильм средний. Местами интересно, но много недочетов. Главный герой бесит, но сюжет неплохой. Советую смотреть в компании, одному будет скучно. 3/5.",
      variant: "outline",
    },
  ];

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-sm">Готовые примеры</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2">
          {examples.map((example, index) => (
            <Button
              key={index}
              variant="ghost"
              className="justify-start"
              onClick={() => onSelectExample(example.text)}
            >
              {example.icon}
              <span className="ml-2">{example.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

### 2.3. API обработчик демо-запросов

Создайте файл `app/api/demo/moderate/route.ts`:

```typescript
import { parseAutoModerationResult } from "@/lib/moderation-api";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    // URL API модерации
    const API_URL =
      process.env.NEXT_PUBLIC_MODERATION_API_BASE_URL || "/api-moderator/v1";

    // Отправляем запрос на модерацию (используем существующую систему)
    const response = await fetch(`${API_URL}/moderation/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`Ошибка API: ${response.statusText}`);
    }

    const data = await response.json();

    // Обрабатываем результат с помощью существующей функции
    const result = parseAutoModerationResult(data);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Ошибка модерации:", error);
    return NextResponse.json(
      { error: "Ошибка при обработке запроса" },
      { status: 500 }
    );
  }
}
```

## 3. Реализация лендинга для презентации

### 3.1. Основная страница лендинга

Создайте файл `app/presentation/page.tsx`:

```tsx
import HeroSection from "@/components/presentation/hero-section";
import ProblemSection from "@/components/presentation/problem-section";
import SolutionSection from "@/components/presentation/solution-section";
import ProfitabilityCalculator from "@/components/presentation/calculator";

export default function PresentationPage() {
  return (
    <div>
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <ProfitabilityCalculator />
    </div>
  );
}
```

### 3.2. Компоненты лендинга

#### Шапка с GIF

Создайте файл `components/presentation/hero-section.tsx`:

```tsx
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function HeroSection() {
  return (
    <div className="relative bg-gradient-to-b from-black to-slate-900 text-white min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="absolute inset-0 opacity-20 bg-grid-white-900/[0.04] z-0"></div>

      <div className="max-w-5xl z-10">
        <h1 className="text-5xl sm:text-6xl font-bold mb-4">
          Сервис модерации с использованием ИИ
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Автоматизированное решение для модерации пользовательского контента
        </p>

        <div className="relative w-full max-w-3xl mx-auto mb-12 rounded-lg overflow-hidden">
          <Image
            src="/presentation/jay_and_bob.gif"
            alt="Jay and Silent Bob Strike Back"
            width={640}
            height={360}
            className="w-full h-auto shadow-2xl"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <p className="text-sm italic">Интернет без модерации 🙂</p>
          </div>
        </div>

        <Button asChild size="lg" className="text-lg px-8 py-6">
          <Link href="/demo">Перейти к демонстрации</Link>
        </Button>
      </div>
    </div>
  );
}
```

#### Раздел проблематики

Создайте файл `components/presentation/problem-section.tsx`:

```tsx
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Scale, Clock } from "lucide-react";

export default function ProblemSection() {
  const problems = [
    {
      icon: <Shield className="h-10 w-10 text-blue-500" />,
      title: "Моральный аспект",
      description:
        "Защита пользователей от вредоносного контента, токсичности и дезинформации",
    },
    {
      icon: <Scale className="h-10 w-10 text-green-500" />,
      title: "Правовой аспект",
      description:
        "Соответствие законодательным требованиям и нормативным актам о контроле контента",
    },
    {
      icon: <Clock className="h-10 w-10 text-purple-500" />,
      title: "Операционный аспект",
      description:
        "Высокие трудозатраты и задержки при ручной модерации большого объема контента",
    },
  ];

  return (
    <div className="bg-slate-900 text-white py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold mb-12 text-center">Проблематика</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {problems.map((problem, index) => (
            <Card key={index} className="bg-gray-800 border-none">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4">{problem.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{problem.title}</h3>
                  <p className="text-gray-300">{problem.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold mb-4">Масштаб проблемы</h3>
          <p className="text-gray-300 mb-6">
            Ежедневно в интернете создаются миллиарды единиц пользовательского
            контента, требующего модерации. Ручной подход не справляется с
            объемами и скоростью.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: "90%", label: "UGC требует проверки" },
              { value: "24/7", label: "Необходимость постоянной модерации" },
              { value: "× 100", label: "Рост токсичного контента за 5 лет" },
              { value: "75%", label: "Задержки в ручной модерации" },
            ].map((stat, index) => (
              <div key={index} className="p-4 bg-gray-800 rounded-lg">
                <p className="text-3xl font-bold text-blue-400">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

#### Калькулятор рентабельности

Вот компонент динамического калькулятора, который позволяет вводить пользовательские данные:

```tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function ProfitabilityCalculator() {
  // Параметры по умолчанию
  const defaultParams = {
    apiPrice: 0.0012, // Цена за запрос API (в $)
    serverPrice: 1000, // Стоимость собственного сервера (в $ в месяц)
    reviewsPerDay: 1000, // Количество отзывов в день
    apiSetupCost: 0, // Стоимость настройки API (в $)
    serverSetupCost: 5000, // Стоимость настройки своего сервера (в $)
  };

  const [params, setParams] = useState(defaultParams);
  const [chartData, setChartData] = useState<any[]>([]);

  // Обновление графика при изменении параметров
  useEffect(() => {
    calculateData();
  }, [params]);

  const calculateData = () => {
    const months = 12; // Количество месяцев для расчета
    const data = [];

    for (let month = 1; month <= months; month++) {
      const daysInMonth = 30; // Упрощенно

      // Кумулятивные затраты для API
      const apiCost =
        params.apiPrice * params.reviewsPerDay * daysInMonth * month +
        params.apiSetupCost;

      // Кумулятивные затраты для сервера
      const serverCost = params.serverPrice * month + params.serverSetupCost;

      data.push({
        month: `Месяц ${month}`,
        "API сервис": Math.round(apiCost),
        "Собственный сервер": Math.round(serverCost),
      });
    }

    setChartData(data);
  };

  // Расчет точки безубыточности
  const calculateBreakEvenPoint = () => {
    if (params.apiPrice === 0 || params.serverPrice === 0)
      return "Невозможно рассчитать";

    const dailyApiCost = params.apiPrice * params.reviewsPerDay;
    const dailyServerCost = params.serverPrice / 30;

    if (dailyApiCost <= dailyServerCost) return "API всегда выгоднее";

    const setupCostDiff = params.serverSetupCost - params.apiSetupCost;
    const dailyCostDiff = dailyApiCost - dailyServerCost;

    const breakEvenDays = setupCostDiff / dailyCostDiff;

    if (breakEvenDays < 0) return "API всегда выгоднее";
    if (breakEvenDays > 365) return `${Math.round(breakEvenDays / 30)} месяцев`;

    return `${Math.round(breakEvenDays)} дней`;
  };

  // Обработчик изменения полей ввода
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParams((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  return (
    <div className="bg-white py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold mb-12 text-center">
          Расчет экономической эффективности
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Параметры расчета</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="apiPrice">Стоимость API запроса ($)</Label>
                  <Input
                    id="apiPrice"
                    name="apiPrice"
                    type="number"
                    step="0.0001"
                    value={params.apiPrice}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="serverPrice">
                    Стоимость сервера в месяц ($)
                  </Label>
                  <Input
                    id="serverPrice"
                    name="serverPrice"
                    type="number"
                    value={params.serverPrice}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="reviewsPerDay">Отзывов в день</Label>
                  <Input
                    id="reviewsPerDay"
                    name="reviewsPerDay"
                    type="number"
                    value={params.reviewsPerDay}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="apiSetupCost">
                    Начальные затраты на API ($)
                  </Label>
                  <Input
                    id="apiSetupCost"
                    name="apiSetupCost"
                    type="number"
                    value={params.apiSetupCost}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="serverSetupCost">
                    Начальные затраты на сервер ($)
                  </Label>
                  <Input
                    id="serverSetupCost"
                    name="serverSetupCost"
                    type="number"
                    value={params.serverSetupCost}
                    onChange={handleInputChange}
                  />
                </div>

                <Button onClick={calculateData} className="w-full">
                  Пересчитать
                </Button>

                <div className="mt-4 p-4 border rounded-md bg-blue-50">
                  <p className="font-bold">Точка безубыточности:</p>
                  <p className="text-lg text-blue-600">
                    {calculateBreakEvenPoint()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>График затрат</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, undefined]} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="API сервис"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Собственный сервер"
                      stroke="#82ca9d"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
```

#### Раздел решения

Создайте файл `components/presentation/solution-section.tsx`:

```tsx
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Server, Shield, Zap, Cpu } from "lucide-react";

export default function SolutionSection() {
  return (
    <div className="bg-gray-100 py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold mb-12 text-center">Наше решение</h2>

        <div className="mb-16">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold mb-4 text-center">
              Архитектура сервиса модерации
            </h3>

            <div className="relative h-[400px] mb-8">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full max-w-4xl h-full relative">
                  {/* Здесь можно использовать Image компонент с SVG диаграммой или создать диаграмму с помощью JSX */}
                  <svg
                    viewBox="0 0 800 400"
                    className="w-full h-full"
                    style={{ fontFamily: "system-ui, sans-serif" }}
                  >
                    {/* Стилизованная диаграмма архитектуры */}
                    <defs>
                      <marker
                        id="arrowhead"
                        markerWidth="10"
                        markerHeight="7"
                        refX="0"
                        refY="3.5"
                        orient="auto"
                      >
                        <polygon points="0 0, 10 3.5, 0 7" fill="#718096" />
                      </marker>
                    </defs>

                    {/* Клиент */}
                    <rect
                      x="50"
                      y="150"
                      width="120"
                      height="60"
                      rx="4"
                      fill="#EBF4FF"
                      stroke="#3182CE"
                      strokeWidth="2"
                    />
                    <text
                      x="110"
                      y="185"
                      textAnchor="middle"
                      fontSize="14"
                      fontWeight="bold"
                    >
                      Клиент
                    </text>

                    {/* API шлюз */}
                    <rect
                      x="250"
                      y="150"
                      width="120"
                      height="60"
                      rx="4"
                      fill="#E6FFFA"
                      stroke="#319795"
                      strokeWidth="2"
                    />
                    <text
                      x="310"
                      y="185"
                      textAnchor="middle"
                      fontSize="14"
                      fontWeight="bold"
                    >
                      API шлюз
                    </text>

                    {/* Сервис модерации */}
                    <rect
                      x="450"
                      y="150"
                      width="120"
                      height="60"
                      rx="4"
                      fill="#FEFCBF"
                      stroke="#D69E2E"
                      strokeWidth="2"
                    />
                    <text
                      x="510"
                      y="185"
                      textAnchor="middle"
                      fontSize="14"
                      fontWeight="bold"
                    >
                      Сервис модерации
                    </text>

                    {/* AI модели */}
                    <rect
                      x="650"
                      y="90"
                      width="120"
                      height="60"
                      rx="4"
                      fill="#FBD38D"
                      stroke="#DD6B20"
                      strokeWidth="2"
                    />
                    <text
                      x="710"
                      y="125"
                      textAnchor="middle"
                      fontSize="14"
                      fontWeight="bold"
                    >
                      Модель ИИ
                    </text>

                    {/* База данных */}
                    <rect
                      x="650"
                      y="210"
                      width="120"
                      height="60"
                      rx="4"
                      fill="#E9D8FD"
                      stroke="#805AD5"
                      strokeWidth="2"
                    />
                    <text
                      x="710"
                      y="245"
                      textAnchor="middle"
                      fontSize="14"
                      fontWeight="bold"
                    >
                      База данных
                    </text>

                    {/* Стрелки */}
                    <line
                      x1="170"
                      y1="180"
                      x2="240"
                      y2="180"
                      stroke="#718096"
                      strokeWidth="2"
                      markerEnd="url(#arrowhead)"
                    />
                    <line
                      x1="370"
                      y1="180"
                      x2="440"
                      y2="180"
                      stroke="#718096"
                      strokeWidth="2"
                      markerEnd="url(#arrowhead)"
                    />
                    <line
                      x1="570"
                      y1="160"
                      x2="640"
                      y2="120"
                      stroke="#718096"
                      strokeWidth="2"
                      markerEnd="url(#arrowhead)"
                    />
                    <line
                      x1="570"
                      y1="200"
                      x2="640"
                      y2="240"
                      stroke="#718096"
                      strokeWidth="2"
                      markerEnd="url(#arrowhead)"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <p className="text-gray-600 text-center max-w-3xl mx-auto">
              Микросервисная архитектура обеспечивает масштабируемость,
              отказоустойчивость и гибкость при обработке пользовательского
              контента. API шлюз распределяет запросы, а сервис модерации
              использует ИИ-модели для анализа текста.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {[
            {
              icon: <Shield className="h-10 w-10 text-blue-500" />,
              title: "Автоматизация",
              description:
                "Снижение нагрузки на модераторов за счет автоматической проверки 90% контента",
            },
            {
              icon: <Zap className="h-10 w-10 text-purple-500" />,
              title: "Скорость",
              description:
                "Мгновенное принятие решений по контенту - менее 300 мс на проверку",
            },
            {
              icon: <Server className="h-10 w-10 text-green-500" />,
              title: "Масштабируемость",
              description:
                "Возможность обработки миллионов запросов в день в пиковые нагрузки",
            },
            {
              icon: <Cpu className="h-10 w-10 text-red-500" />,
              title: "Обучаемость",
              description:
                "Система постоянно улучшается, обучаясь на новых примерах контента",
            },
          ].map((feature, index) => (
            <Card
              key={index}
              className="border-none shadow-md hover:shadow-xl transition-shadow"
            >
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 p-3 bg-gray-100 rounded-full">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-blue-900 text-white p-8 rounded-xl">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8">
              <h3 className="text-2xl font-bold mb-4">Критерии модерации</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-500 mr-2 mt-0.5">
                    ✓
                  </span>
                  <span>Выявление запрещенного контента и токсичности</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-500 mr-2 mt-0.5">
                    ✓
                  </span>
                  <span>Проверка на соответствие возрастным ограничениям</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-500 mr-2 mt-0.5">
                    ✓
                  </span>
                  <span>Анализ контекста и смысла сообщений</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-500 mr-2 mt-0.5">
                    ✓
                  </span>
                  <span>Выявление потенциальных правовых нарушений</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-500 mr-2 mt-0.5">
                    ✓
                  </span>
                  <span>Фильтрация спама и рекламного контента</span>
                </li>
              </ul>
            </div>
            <div className="md:w-1/2">
              <h3 className="text-2xl font-bold mb-4">Процесс модерации</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="bg-blue-500 rounded-full p-2 mr-3">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <p>Пользователь отправляет контент (отзыв, комментарий)</p>
                </div>
                <div className="flex items-center">
                  <div className="bg-blue-500 rounded-full p-2 mr-3">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <p>Сервис модерации получает запрос и начинает анализ</p>
                </div>
                <div className="flex items-center">
                  <div className="bg-blue-500 rounded-full p-2 mr-3">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <p>ИИ проводит многоуровневую проверку контента</p>
                </div>
                <div className="flex items-center">
                  <div className="bg-blue-500 rounded-full p-2 mr-3">
                    <span className="text-white font-bold">4</span>
                  </div>
                  <p>
                    Система выносит решение: одобрить, отклонить или направить
                    на ручную проверку
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="bg-blue-500 rounded-full p-2 mr-3">
                    <span className="text-white font-bold">5</span>
                  </div>
                  <p>
                    Результат возвращается клиенту и сохраняется в базе данных
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## 4. Запуск в Docker контейнере

Проект собирается с использованием Docker контейнера. Для этого нет необходимости менять структуру файлов - достаточно просто положить все созданные файлы в директорию `moderation_frontend/frontend` согласно описанной выше структуре:

```
moderation_frontend/frontend/
├── app/
│   ├── demo/                  # Демо-страница
│   └── presentation/          # Презентация-лендинг
├── components/
│   ├── demo/                  # Компоненты для демо
│   └── presentation/          # Компоненты для презентации
```

Для сборки и запуска используется файл Docker.dev, который автоматически соберет проект с указанными изменениями:

```bash
# Запуск сборки контейнера
docker-compose -f docker-compose.dev.yml up -d
```

### 4.1. Примечания по развертыванию

- Все необходимые зависимости уже включены в Docker-образ
- Дополнительные библиотеки для реализации графиков (recharts) нужно указать в package.json
- Убедитесь, что все переменные окружения корректно настроены для подключения к API модерации

## 5. Зависимости проекта

Для успешной реализации калькулятора рентабельности и других компонентов, возможно, потребуется установить дополнительные зависимости:

```bash
npm install recharts
```

## 6. Тестирование

Перед интеграцией в основное приложение рекомендуется локально протестировать компоненты:

1. Проверьте работу формы отзывов
2. Убедитесь, что API обработчик корректно обрабатывает запросы
3. Проверьте корректное отображение результатов модерации
4. Протестируйте калькулятор с разными входными данными
5. Проверьте корректность расчета точки безубыточности

## 7. Контрольный список

- [ ] Создана страница демонстрации
- [ ] Реализована форма отправки отзывов
- [ ] Добавлены предустановленные примеры
- [ ] Реализована панель результатов модерации
- [ ] Создан лендинг для презентации
- [ ] Добавлен калькулятор рентабельности
- [ ] Настроены API-интеграции
- [ ] Протестирована работа компонентов
- [ ] Проверена работа в Docker-контейнере
