'use client'

import { Badge } from "@/components/ui/badge"
import {
    Button
} from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs"
import {
    AlertTriangle,
    ArrowRight,
    CheckCircle,
    Clock,
    LineChart,
    Scale,
    Shield,
    XCircle
} from "lucide-react"
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

const LandingPage = () => {
  const [activeTab, setActiveTab] = useState('scenario1')

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-950 to-black text-white">
      {/* Шапка (Hero section) */}
      <section className="container py-20 flex flex-col items-center text-center">
        <div className="w-20 h-20 mb-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
          <Shield className="w-10 h-10" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Сервис модерации с использованием ИИ</h1>
        <p className="text-xl text-slate-300 max-w-3xl mb-8">
          Интеллектуальное решение для модерации пользовательского контента
        </p>
        <div className="relative w-full max-w-3xl h-64 md:h-80 my-8">
          <Image 
            src="/presentation/moderation-hero.gif" 
            alt="Модерация контента" 
            fill
            className="rounded-lg object-cover"
          />
        </div>
        <Link href="/demo">
          <Button size="lg" className="group">
            Попробовать сейчас
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </section>

      {/* Проблематика */}
      <section className="container py-20">
        <h2 className="text-3xl font-bold mb-12 text-center">Проблема контроля пользовательского контента</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800 transform transition-transform hover:scale-105">
            <div className="w-12 h-12 rounded-full bg-red-900/30 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Нравственные аспекты</h3>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block mt-2 mr-2"></span>
                <span>Кибербуллинг и токсичность</span>
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block mt-2 mr-2"></span>
                <span>Негативное влияние на пользователей</span>
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block mt-2 mr-2"></span>
                <span>Репутационные риски для платформы</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800 transform transition-transform hover:scale-105">
            <div className="w-12 h-12 rounded-full bg-blue-900/30 flex items-center justify-center mb-4">
              <Scale className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Правовые аспекты</h3>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block mt-2 mr-2"></span>
                <span>Требования законодательства РФ (ФЗ "О защите детей от информации")</span>
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block mt-2 mr-2"></span>
                <span>Контроль со стороны Роспотребнадзора</span>
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block mt-2 mr-2"></span>
                <span>Риски штрафов и блокировок</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800 transform transition-transform hover:scale-105">
            <div className="w-12 h-12 rounded-full bg-amber-900/30 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Операционные аспекты</h3>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block mt-2 mr-2"></span>
                <span>Высокая стоимость ручной модерации</span>
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block mt-2 mr-2"></span>
                <span>Задержки в обработке контента</span>
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block mt-2 mr-2"></span>
                <span>Субъективность человеческих оценок</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-slate-900/50 rounded-lg p-8 border border-slate-800">
          <h3 className="text-xl font-bold mb-4 text-center">Статистика проблемы</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-4">
              <div className="text-4xl font-bold text-red-400 mb-2">36%</div>
              <p className="text-slate-300">пользователей сталкивались с токсичными комментариями</p>
            </div>
            <div className="p-4">
              <div className="text-4xl font-bold text-amber-400 mb-2">1,200₽</div>
              <p className="text-slate-300">средняя стоимость модерации 1000 комментариев вручную</p>
            </div>
            <div className="p-4">
              <div className="text-4xl font-bold text-blue-400 mb-2">4.5M₽</div>
              <p className="text-slate-300">потенциальный штраф за нарушение требований</p>
            </div>
          </div>
        </div>
      </section>

      {/* Решение */}
      <section className="container py-20 bg-gradient-to-b from-slate-900 to-slate-950 rounded-xl">
        <h2 className="text-3xl font-bold mb-12 text-center">Наше решение: автоматизированная модерация</h2>
        
        <div className="relative w-full h-96 mb-12">
          <div className="absolute inset-0 flex items-center justify-center">
            <Image 
              src="/presentation/architecture.svg" 
              alt="Архитектура решения" 
              fill 
              className="object-contain"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mt-8">
          <Card className="bg-slate-800 border-slate-700 transform transition-transform hover:scale-105">
            <CardHeader className="pb-2">
              <CardTitle className="text-white">UGC API</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300">
              Сбор и первичная обработка пользовательского контента
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700 transform transition-transform hover:scale-105">
            <CardHeader className="pb-2">
              <CardTitle className="text-white">Kafka</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300">
              Асинхронная передача данных между сервисами
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700 transform transition-transform hover:scale-105">
            <CardHeader className="pb-2">
              <CardTitle className="text-white">Автомодерация</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300">
              ИИ для анализа контента с использованием GigaChat
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700 transform transition-transform hover:scale-105">
            <CardHeader className="pb-2">
              <CardTitle className="text-white">Ручная модерация</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300">
              Интерфейс для модераторов и сложных случаев
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700 transform transition-transform hover:scale-105">
            <CardHeader className="pb-2">
              <CardTitle className="text-white">Хранилища данных</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300">
              MongoDB для UGC, PostgreSQL для данных модерации
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-12 p-6 bg-slate-800/50 rounded-lg border border-slate-700">
          <h3 className="text-xl font-bold mb-6 text-center">Процесс обработки отзыва</h3>
          <div className="flex flex-col md:flex-row items-center justify-between max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center mb-6 md:mb-0">
              <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center mb-3">
                <span className="text-lg font-bold">1</span>
              </div>
              <p className="text-sm max-w-[150px]">Получение отзыва от пользователя</p>
            </div>
            
            <div className="hidden md:block w-12 h-0.5 bg-slate-700"></div>
            
            <div className="flex flex-col items-center text-center mb-6 md:mb-0">
              <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center mb-3">
                <span className="text-lg font-bold">2</span>
              </div>
              <p className="text-sm max-w-[150px]">Быстрые проверки (слова, ссылки)</p>
            </div>
            
            <div className="hidden md:block w-12 h-0.5 bg-slate-700"></div>
            
            <div className="flex flex-col items-center text-center mb-6 md:mb-0">
              <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center mb-3">
                <span className="text-lg font-bold">3</span>
              </div>
              <p className="text-sm max-w-[150px]">AI-анализ содержания</p>
            </div>
            
            <div className="hidden md:block w-12 h-0.5 bg-slate-700"></div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center mb-3">
                <span className="text-lg font-bold">4</span>
              </div>
              <p className="text-sm max-w-[150px]">Принятие решения</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Технологический стек */}
      <section className="container py-20">
        <h2 className="text-3xl font-bold mb-12 text-center">Технологии, которые мы используем</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <h3 className="text-xl font-bold mb-4">Backend</h3>
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge variant="secondary" className="bg-blue-900/30 hover:bg-blue-900/50">Python 3.12</Badge>
              <Badge variant="secondary" className="bg-blue-900/30 hover:bg-blue-900/50">FastAPI</Badge>
              <Badge variant="secondary" className="bg-blue-900/30 hover:bg-blue-900/50">SQLAlchemy 2.0</Badge>
              <Badge variant="secondary" className="bg-blue-900/30 hover:bg-blue-900/50">Pydantic</Badge>
              <Badge variant="secondary" className="bg-blue-900/30 hover:bg-blue-900/50">Kafka-python</Badge>
            </div>
            <p className="text-sm text-slate-300">
              Современный стек Python-технологий для создания высокопроизводительных микросервисов с асинхронной обработкой данных.
            </p>
          </div>
          
          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <h3 className="text-xl font-bold mb-4">Frontend</h3>
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge variant="secondary" className="bg-purple-900/30 hover:bg-purple-900/50">Next.js</Badge>
              <Badge variant="secondary" className="bg-purple-900/30 hover:bg-purple-900/50">React</Badge>
              <Badge variant="secondary" className="bg-purple-900/30 hover:bg-purple-900/50">Tailwind CSS</Badge>
              <Badge variant="secondary" className="bg-purple-900/30 hover:bg-purple-900/50">shadcn/ui</Badge>
              <Badge variant="secondary" className="bg-purple-900/30 hover:bg-purple-900/50">TypeScript</Badge>
            </div>
            <p className="text-sm text-slate-300">
              Современный фронтенд с компонентным подходом, типизацией и атомарным CSS для создания адаптивных интерфейсов.
            </p>
          </div>
          
          <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
            <h3 className="text-xl font-bold mb-4">Инфраструктура</h3>
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge variant="secondary" className="bg-green-900/30 hover:bg-green-900/50">Docker</Badge>
              <Badge variant="secondary" className="bg-green-900/30 hover:bg-green-900/50">Nginx</Badge>
              <Badge variant="secondary" className="bg-green-900/30 hover:bg-green-900/50">MongoDB</Badge>
              <Badge variant="secondary" className="bg-green-900/30 hover:bg-green-900/50">PostgreSQL</Badge>
              <Badge variant="secondary" className="bg-green-900/30 hover:bg-green-900/50">GigaChat API</Badge>
            </div>
            <p className="text-sm text-slate-300">
              Надежная и масштабируемая инфраструктура с контейнеризацией, оптимизированными базами данных и внешними API.
            </p>
          </div>
        </div>
      </section>
      
      {/* Демонстрация работы */}
      <section className="container py-20 bg-gradient-to-b from-slate-900 to-slate-950 rounded-xl">
        <h2 className="text-3xl font-bold mb-12 text-center">Как это работает</h2>
        
        <Tabs defaultValue="scenario1" value={activeTab} onValueChange={setActiveTab} className="max-w-4xl mx-auto">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="scenario1">Позитивный отзыв</TabsTrigger>
            <TabsTrigger value="scenario2">Негативный отзыв</TabsTrigger>
            <TabsTrigger value="scenario3">Спорный случай</TabsTrigger>
          </TabsList>
          
          <TabsContent value="scenario1" className="mt-4">
            <div className="bg-slate-800 rounded-lg overflow-hidden">
              <div className="relative w-full h-72 md:h-96">
                <Image 
                  src="/presentation/demo-positive.gif" 
                  alt="Демонстрация модерации позитивного отзыва" 
                  fill
                  className="object-contain"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-medium mb-2">Обработка позитивного отзыва</h3>
                <p className="text-sm text-slate-300 mb-4">
                  Система быстро определяет, что отзыв соответствует правилам сообщества. 
                  Не обнаружено запрещенных слов или токсичного содержания.
                </p>
                <div className="bg-slate-900 p-3 rounded-md flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-sm font-medium">Одобрено</span>
                  </div>
                  <div className="text-xs text-slate-400">Время обработки: 0.8с</div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="scenario2" className="mt-4">
            <div className="bg-slate-800 rounded-lg overflow-hidden">
              <div className="relative w-full h-72 md:h-96">
                <Image 
                  src="/presentation/demo-negative.gif" 
                  alt="Демонстрация модерации негативного отзыва" 
                  fill
                  className="object-contain"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-medium mb-2">Обработка негативного отзыва</h3>
                <p className="text-sm text-slate-300 mb-4">
                  Система выявляет потенциально токсичное содержание и дискриминационные высказывания. 
                  Отзыв автоматически отклоняется.
                </p>
                <div className="bg-slate-900 p-3 rounded-md flex items-center justify-between">
                  <div className="flex items-center">
                    <XCircle className="w-5 h-5 text-red-500 mr-2" />
                    <span className="text-sm font-medium">Отклонено</span>
                  </div>
                  <div className="text-xs text-slate-400">Время обработки: 1.2с</div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="scenario3" className="mt-4">
            <div className="bg-slate-800 rounded-lg overflow-hidden">
              <div className="relative w-full h-72 md:h-96">
                <Image 
                  src="/presentation/demo-pending.gif" 
                  alt="Демонстрация модерации спорного отзыва" 
                  fill
                  className="object-contain"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-medium mb-2">Обработка спорного отзыва</h3>
                <p className="text-sm text-slate-300 mb-4">
                  При невозможности принять однозначное решение система направляет отзыв 
                  на ручную модерацию для дополнительной проверки человеком.
                </p>
                <div className="bg-slate-900 p-3 rounded-md flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
                    <span className="text-sm font-medium">Требуется проверка</span>
                  </div>
                  <div className="text-xs text-slate-400">Время обработки: 0.9с</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>
      
      {/* Перспективы развития */}
      <section className="container py-20">
        <h2 className="text-3xl font-bold mb-12 text-center">Будущее развитие проекта</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-gradient-to-br from-slate-900 to-purple-900/20 border-slate-800 h-full">
            <CardHeader>
              <CardTitle className="text-white">Кастомная фильтрация контента</CardTitle>
              <CardDescription className="text-slate-300">Q3 2024</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-slate-300">
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block mt-2 mr-2"></span>
                  <span>Создание кастомных метаданных фильма на основе промта аналитика</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block mt-2 mr-2"></span>
                  <span>Гибкая система фильтрации под нужды конкретных платформ</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block mt-2 mr-2"></span>
                  <span>Персонализированное ранжирование контента</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-slate-900 to-blue-900/20 border-slate-800 h-full">
            <CardHeader>
              <CardTitle className="text-white">Индивидуальная лента комментариев</CardTitle>
              <CardDescription className="text-slate-300">Q4 2024</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-slate-300">
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block mt-2 mr-2"></span>
                  <span>Учет интересов пользователя при показе комментариев</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block mt-2 mr-2"></span>
                  <span>Приоритизация релевантного контента</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block mt-2 mr-2"></span>
                  <span>Снижение видимости токсичных, но допустимых комментариев</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-slate-900 to-green-900/20 border-slate-800 h-full">
            <CardHeader>
              <CardTitle className="text-white">Расширенная аналитика</CardTitle>
              <CardDescription className="text-slate-300">Q1 2025</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-slate-300">
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block mt-2 mr-2"></span>
                  <span>Анализ тенденций в пользовательском контенте</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block mt-2 mr-2"></span>
                  <span>Прогнозирование популярности контента</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block mt-2 mr-2"></span>
                  <span>Выявление новых типов нежелательного контента</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* Заключение */}
      <section className="container py-20 bg-gradient-to-b from-blue-900/20 via-purple-900/20 to-slate-950 rounded-xl">
        <h2 className="text-3xl font-bold mb-8 text-center">Начните использовать современные решения для модерации</h2>
        
        <div className="max-w-3xl mx-auto text-center mb-10">
          <p className="text-lg text-slate-300 mb-8">
            Наше решение обеспечивает автоматизацию процессов модерации, экономическую эффективность,
            соответствие требованиям законодательства и возможность масштабирования с ростом вашей платформы.
          </p>
          
          <div className="flex justify-center space-x-4">
            <Link href="/demo">
              <Button size="lg" className="group">
                Попробовать демо
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="bg-slate-900/50 p-4 rounded-lg text-center">
            <div className="w-12 h-12 rounded-full bg-blue-900/30 mx-auto flex items-center justify-center mb-3">
              <LineChart className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="font-medium mb-2">Автоматизация</h3>
            <p className="text-xs text-slate-400">Сокращение времени обработки на 85%</p>
          </div>
          
          <div className="bg-slate-900/50 p-4 rounded-lg text-center">
            <div className="w-12 h-12 rounded-full bg-purple-900/30 mx-auto flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-medium mb-2">Экономия</h3>
            <p className="text-xs text-slate-400">Снижение затрат до 70%</p>
          </div>
          
          <div className="bg-slate-900/50 p-4 rounded-lg text-center">
            <div className="w-12 h-12 rounded-full bg-green-900/30 mx-auto flex items-center justify-center mb-3">
              <Shield className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="font-medium mb-2">Соответствие</h3>
            <p className="text-xs text-slate-400">Полное соответствие требованиям РФ</p>
          </div>
          
          <div className="bg-slate-900/50 p-4 rounded-lg text-center">
            <div className="w-12 h-12 rounded-full bg-amber-900/30 mx-auto flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <h3 className="font-medium mb-2">Масштабируемость</h3>
            <p className="text-xs text-slate-400">Легкое увеличение мощности</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage 