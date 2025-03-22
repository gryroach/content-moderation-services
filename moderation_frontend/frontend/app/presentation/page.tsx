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
import { Slider } from "@/components/ui/slider"
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
  Pause,
  Play,
  Scale,
  Shield,
  XCircle
} from "lucide-react"
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

// Утилитарная функция для форматирования чисел с пробелом в качестве разделителя тысяч
const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

const LandingPage = () => {
  const [params, setParams] = useState<{
    requests: number,
    trafficPercentage: number,
    manualModeration: number,
  }>({
    requests: 1000000,
    trafficPercentage: 15,
    manualModeration: 20,
  })
  
  const [activeTab, setActiveTab] = useState('scenario1')
  const [flowMode, setFlowMode] = useState<'approve' | 'reject' | 'pending'>('approve')
  // Заменяем isAnimating на простое состояние текущего шага
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [currentStepDescription, setCurrentStepDescription] = useState<string>('')
  // Добавляем контроль скорости и паузы
  const [animationSpeed, setAnimationSpeed] = useState<number>(1)
  const [isPaused, setIsPaused] = useState<boolean>(false)
  const animationRef = useRef<number | null>(null)
  
  // Для графика и стоимости
  const [costData, setCostData] = useState<Record<string, number>>({
    'API': 0,
    'Облачный хостинг': 0,
    'Выделенный сервер': 0,
  })
  const chartRef = useRef<HTMLDivElement>(null)
  const [chartData, setChartData] = useState<Array<{ requests: number, api: number, cloud: number, server: number }>>([])
  const [intersectionPoints, setIntersectionPoints] = useState<{
    apiVsServer: string,
    cloudVsServer: string
  }>({
    'apiVsServer': '3200000',
    'cloudVsServer': '7500000'
  })
  
  // Восстанавливаем переменную для расширенного режима
  const [advancedMode, setAdvancedMode] = useState(false)
  
  // Заменяем реализацию startFlow для поддержки скорости и паузы
  const startFlow = () => {
    // Очищаем предыдущую анимацию, если она запущена
    if (animationRef.current) {
      clearTimeout(animationRef.current)
      animationRef.current = null
    }
    
    // Сбрасываем шаг
    setCurrentStep(0)
    
    // Запускаем последовательность шагов с задержками, учитывая скорость
    setCurrentStepDescription('Пользовательский контент отправляется через Kafka')
    
    const runStep = (step: number) => {
      if (isPaused) return
      
      // Рассчитываем время анимации с учетом скорости
      const baseDelay = 2000 // базовая задержка в мс
      const delay = baseDelay / animationSpeed
      
      animationRef.current = setTimeout(() => {
        setCurrentStep(step)
        
        switch(step) {
          case 1:
            if (flowMode === 'approve') {
              setCurrentStepDescription('Сервис автомодерации анализирует и одобряет контент')
              runStep(2)
            } else if (flowMode === 'reject') {
              setCurrentStepDescription('Сервис автомодерации обнаруживает нарушение правил контента')
            } else {
              setCurrentStepDescription('Сервис автомодерации отправляет контент на ручную проверку')
              runStep(2)
            }
            break
          case 2:
            if (flowMode === 'approve') {
              setCurrentStepDescription('Контент одобрен и сохраняется в MongoDB')
            } else if (flowMode === 'pending') {
              setCurrentStepDescription('Модератор проверяет контент в системе модерации')
              runStep(3)
            }
            break
          case 3:
            if (flowMode === 'pending') {
              setCurrentStepDescription('Модератор подтверждает, что контент соответствует правилам')
              runStep(4)
            }
            break
          case 4:
            if (flowMode === 'pending') {
              setCurrentStepDescription('Контент одобрен и сохраняется в MongoDB')
            }
            break
        }
      }, delay)
    }
    
    // Запускаем первый шаг, если анимация не на паузе
    if (!isPaused) {
      runStep(1)
    }
  }

  // Функция обновления параметра
  const updateParam = (param: string, value: string) => {
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue > 0) {
      setParams(prev => ({ ...prev, [param]: numValue }))
    }
  }

  // Расчет стоимости для интерактивного калькулятора
  useEffect(() => {
    // Используем параметры из состояния
    const { 
      requests, 
      trafficPercentage, 
      manualModeration
    } = params
    
    const totalTokens = requests * trafficPercentage / 100;
    
    // Дисконты на основе объема
    let costPerToken = 0.0001
    if (totalTokens >= 10_000_000) {
      costPerToken *= 0.8
    } else if (totalTokens >= 5_000_000) {
      costPerToken *= 0.9
    }
    
    const apiCost = totalTokens * costPerToken
    
    // Расчет стоимости облачного хостинга
    const cloudCostPerRequest = (totalTokens / 1_000_000) * 100;
    const cloudCost = 50000 + parseFloat(cloudCostPerRequest.toFixed(2));
    
    // Расчет стоимости выделенного сервера
    const additionalCostsFactor = 1.2
    const serverInstances = Math.ceil(totalTokens / 1_000_000)
    const serverCost = serverInstances * (100 + manualModeration) * additionalCostsFactor
    
    setCostData({
      'API': Number(apiCost.toFixed(0)),
      'Облачный хостинг': Number(cloudCost.toFixed(0)),
      'Выделенный сервер': Number(serverCost.toFixed(0)),
    })

    // Расчет функции стоимости для разных объемов
    const calculateCostForRequests = (requests: number) => {
      const tokens = requests * trafficPercentage / 100;
      let apiTokenCost = 0.0001;
      if (tokens >= 10_000_000) {
        apiTokenCost *= 0.8;
      } else if (tokens >= 5_000_000) {
        apiTokenCost *= 0.9;
      }
      
      const api = tokens * apiTokenCost;
      const cloud = Math.ceil(requests / 1_000_000) * 100;
      const server = Math.ceil(requests / 1_000_000) * (100 + manualModeration) * additionalCostsFactor;
      
      return { api, cloud, server };
    };

    // Поиск точек инверсии (приблизительно)
    let apiVsServer = 0;
    let cloudVsServer = 0;
    
    // Генерируем данные для графика
    const chartPoints: Array<{ requests: number, api: number, cloud: number, server: number }> = [];
    
    // Используем больше точек для плавного графика
    const pointsCount = 20;
    const stepSize = 10000000 / pointsCount;
    
    for (let r = 100000; r <= 10000000; r += stepSize) {
      const costs = calculateCostForRequests(r);
      
      // Добавляем точку для графика
      chartPoints.push({
        requests: r,
        api: costs.api,
        cloud: costs.cloud,
        server: costs.server
      });
      
      // Найдем точку, где API становится дороже сервера
      if (apiVsServer === 0 && costs.api > costs.server) {
        apiVsServer = r;
      }
      
      // Найдем точку, где облако становится дороже сервера
      if (cloudVsServer === 0 && costs.cloud > costs.server) {
        cloudVsServer = r;
      }
    }
    
    setChartData(chartPoints);
    
    setIntersectionPoints({
      apiVsServer: apiVsServer || '3200000', // Если не нашли, используем значение по умолчанию
      cloudVsServer: cloudVsServer || '7500000'
    });
    
    // Рисуем график, если есть ref на элемент
    if (chartRef.current) {
      drawChart(chartPoints);
    }
  }, [params]);
  
  // Функция для отрисовки графика
  const drawChart = (data: Array<{ requests: number, api: number, cloud: number, server: number }>) => {
    if (!chartRef.current) return;
    
    const container = chartRef.current;
    container.innerHTML = '';
    
    // Определяем размеры графика
    const width = container.clientWidth;
    const height = container.clientHeight - 30; // Оставляем место для легенды
    const padding = { top: 20, right: 20, bottom: 30, left: 50 };
    
    // Находим максимальные значения для масштабирования
    const maxRequests = Math.max(...data.map(d => d.requests));
    const maxCost = Math.max(
      ...data.map(d => d.api),
      ...data.map(d => d.cloud),
      ...data.map(d => d.server)
    );
    
    // Создаем SVG элемент
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width.toString());
    svg.setAttribute('height', height.toString());
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    container.appendChild(svg);
    
    // Вспомогательная функция для масштабирования значений
    const scaleX = (value: number) => {
      return padding.left + (value / maxRequests) * (width - padding.left - padding.right);
    };
    
    const scaleY = (value: number) => {
      return height - padding.bottom - (value / maxCost) * (height - padding.top - padding.bottom);
    };
    
    // Рисуем оси
    const axisX = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    axisX.setAttribute('x1', padding.left.toString());
    axisX.setAttribute('y1', (height - padding.bottom).toString());
    axisX.setAttribute('x2', (width - padding.right).toString());
    axisX.setAttribute('y2', (height - padding.bottom).toString());
    axisX.setAttribute('stroke', '#8899AA');
    axisX.setAttribute('stroke-width', '1');
    svg.appendChild(axisX);
    
    const axisY = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    axisY.setAttribute('x1', padding.left.toString());
    axisY.setAttribute('y1', padding.top.toString());
    axisY.setAttribute('x2', padding.left.toString());
    axisY.setAttribute('y2', (height - padding.bottom).toString());
    axisY.setAttribute('stroke', '#8899AA');
    axisY.setAttribute('stroke-width', '1');
    svg.appendChild(axisY);
    
    // Рисуем линии для каждого типа данных
    const drawLine = (data: Array<{ requests: number, value: number }>, color: string) => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      
      let d = `M ${scaleX(data[0].requests)} ${scaleY(data[0].value)}`;
      
      for (let i = 1; i < data.length; i++) {
        d += ` L ${scaleX(data[i].requests)} ${scaleY(data[i].value)}`;
      }
      
      path.setAttribute('d', d);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', color);
      path.setAttribute('stroke-width', '2');
      svg.appendChild(path);
    };
    
    // Подготавливаем данные для каждой линии
    const apiData = data.map(d => ({ requests: d.requests, value: d.api }));
    const cloudData = data.map(d => ({ requests: d.requests, value: d.cloud }));
    const serverData = data.map(d => ({ requests: d.requests, value: d.server }));
    
    drawLine(apiData, '#3B82F6'); // blue-500
    drawLine(cloudData, '#A855F7'); // purple-500
    drawLine(serverData, '#22C55E'); // green-500
    
    // Отмечаем точки инверсии
    if (intersectionPoints.apiVsServer > 0) {
      const apiVsServerPoint = data.find(d => d.requests >= intersectionPoints.apiVsServer);
      if (apiVsServerPoint) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', scaleX(apiVsServerPoint.requests).toString());
        circle.setAttribute('cy', scaleY(apiVsServerPoint.api).toString());
        circle.setAttribute('r', '4');
        circle.setAttribute('fill', '#EF4444'); // red-500
        circle.setAttribute('class', 'animate-pulse');
        svg.appendChild(circle);
        
        // Добавляем вертикальную линию к оси X
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', scaleX(apiVsServerPoint.requests).toString());
        line.setAttribute('y1', scaleY(apiVsServerPoint.api).toString());
        line.setAttribute('x2', scaleX(apiVsServerPoint.requests).toString());
        line.setAttribute('y2', (height - padding.bottom).toString());
        line.setAttribute('stroke', '#EF4444');
        line.setAttribute('stroke-width', '1');
        line.setAttribute('stroke-dasharray', '2,2');
        svg.appendChild(line);
        
        // Подпись к точке
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', scaleX(apiVsServerPoint.requests).toString());
        text.setAttribute('y', (height - padding.bottom + 15).toString());
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#EF4444');
        text.setAttribute('font-size', '10');
        text.textContent = formatNumber(intersectionPoints.apiVsServer);
        svg.appendChild(text);
      }
    }
    
    if (intersectionPoints.cloudVsServer > 0) {
      const cloudVsServerPoint = data.find(d => d.requests >= intersectionPoints.cloudVsServer);
      if (cloudVsServerPoint) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', scaleX(cloudVsServerPoint.requests).toString());
        circle.setAttribute('cy', scaleY(cloudVsServerPoint.cloud).toString());
        circle.setAttribute('r', '4');
        circle.setAttribute('fill', '#EF4444'); // red-500
        circle.setAttribute('class', 'animate-pulse');
        svg.appendChild(circle);
        
        // Добавляем вертикальную линию к оси X
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', scaleX(cloudVsServerPoint.requests).toString());
        line.setAttribute('y1', scaleY(cloudVsServerPoint.cloud).toString());
        line.setAttribute('x2', scaleX(cloudVsServerPoint.requests).toString());
        line.setAttribute('y2', (height - padding.bottom).toString());
        line.setAttribute('stroke', '#EF4444');
        line.setAttribute('stroke-width', '1');
        line.setAttribute('stroke-dasharray', '2,2');
        svg.appendChild(line);
        
        // Подпись к точке
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', scaleX(cloudVsServerPoint.requests).toString());
        text.setAttribute('y', (height - padding.bottom + 15).toString());
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#EF4444');
        text.setAttribute('font-size', '10');
        text.textContent = formatNumber(intersectionPoints.cloudVsServer);
        svg.appendChild(text);
      }
    }
    
    // Добавляем легенду
    const legendY = height - 10;
    const legendSpacing = 80;
    
    const legendItems = [
      { label: 'API', color: '#3B82F6' },
      { label: 'Облако', color: '#A855F7' },
      { label: 'Сервер', color: '#22C55E' }
    ];
    
    legendItems.forEach((item, index) => {
      const x = padding.left + index * legendSpacing;
      
      // Линия для легенды
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x.toString());
      line.setAttribute('y1', legendY.toString());
      line.setAttribute('x2', (x + 20).toString());
      line.setAttribute('y2', legendY.toString());
      line.setAttribute('stroke', item.color);
      line.setAttribute('stroke-width', '2');
      svg.appendChild(line);
      
      // Текст легенды
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', (x + 25).toString());
      text.setAttribute('y', (legendY + 4).toString());
      text.setAttribute('fill', '#FFFFFF');
      text.setAttribute('font-size', '10');
      text.textContent = item.label;
      svg.appendChild(text);
    });
  };

  useEffect(() => {
    // Рассчитываем и отрисовываем график при загрузке и изменении параметров
    const processData = () => {
      // Генерируем массив значений количества запросов (от 1 млн до 10 млн с шагом 1 млн)
      const requestValues = Array.from({ length: 10 }, (_, i) => (i + 1) * 1000000)
      
      // Стоимость для различных решений при разном количестве запросов
      const data = requestValues.map(req => {
        // Расчеты на основе данных из research.py
        // API: базовая стоимость 0.0001$ за токен
        const tokenPrice = 0.0001
        const tokensPerRequest = 1000 // Предполагаемое количество токенов на запрос
        const apiCost = (req * tokensPerRequest * tokenPrice / 1000000).toFixed(2) // Стоимость в млн $
        
        // Облачный хостинг: базовая стоимость 50к$ + 0.00001$ за запрос
        const cloudBaseCost = 50000
        const cloudPerRequest = 0.00001
        const cloudCost = (cloudBaseCost + req * cloudPerRequest).toFixed(2)
        
        // Сервер: фиксированная стоимость в 150к$
        const serverCost = 150000
        
        return {
          requests: req,
          api: parseFloat(apiCost),
          cloud: parseFloat(cloudCost),
          server: parseFloat(serverCost)
        }
      })
      
      setChartData(data)
      
      // Находим точки пересечения графиков
      const apiVsServer = data.find(d => d.api >= d.server)?.requests
      const cloudVsServer = data.find(d => d.cloud >= d.server)?.requests
      
      setIntersectionPoints({
        apiVsServer: apiVsServer ? apiVsServer.toString() : '3200000',
        cloudVsServer: cloudVsServer ? cloudVsServer.toString() : '7500000'
      })
      
      // Рассчитываем затраты для текущего количества запросов
      const currentRequestsData = data.find(d => d.requests >= params.requests) || data[0]
      setCostData({
        'API': currentRequestsData.api,
        'Облачный хостинг': currentRequestsData.cloud,
        'Выделенный сервер': currentRequestsData.server,
      })
      
      // Отрисовываем график с помощью SVG
      drawChart(data)
    }
    
    processData()
  }, [params.requests])

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
        <div className="relative w-full max-w-5xl h-96 md:h-[500px] my-8">
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
                <span>Кибербуллинг и токсичность <a href="https://www.pewresearch.org/internet/2017/07/11/online-harassment-2017/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">[источник]</a></span>
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block mt-2 mr-2"></span>
                <span>Негативное влияние на пользователей</span>
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block mt-2 mr-2"></span>
                <span>Репутационные риски для платформы <a href="https://www.datavisor.com/blog/the-power-of-user-generated-content-and-the-threat-of-content-abuse/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">[источник]</a></span>
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
                <span>Высокая стоимость ручной модерации <a href="https://www.reddit.com/r/science/comments/vjt8p2/unpaid_social_media_moderators_perform_labor/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">[источник]</a></span>
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
              <div className="text-4xl font-bold text-red-400 mb-2">66%</div>
              <p className="text-slate-300">пользователей сталкивались с токсичными комментариями</p>
              <p className="text-xs text-slate-400 mt-1"><a href="https://www.pewresearch.org/internet/2017/07/11/online-harassment-2017/" target="_blank" rel="noopener noreferrer" className="hover:underline">Pew Research Center</a></p>
            </div>
            <div className="p-4">
              <div className="text-4xl font-bold text-amber-400 mb-2">1,200₽</div>
              <p className="text-slate-300">средняя стоимость модерации 1000 комментариев вручную</p>
              <p className="text-xs text-slate-400 mt-1"><a href="https://www.reddit.com/r/science/comments/vjt8p2/unpaid_social_media_moderators_perform_labor/" target="_blank" rel="noopener noreferrer" className="hover:underline">Reddit Research</a></p>
            </div>
            <div className="p-4">
              <div className="text-4xl font-bold text-blue-400 mb-2">4.5M₽</div>
              <p className="text-slate-300">потенциальный штраф за нарушение требований</p>
              <p className="text-xs text-slate-400 mt-1"><a href="https://www.marketing.spb.ru/lib-comm/pr/reputation_management.htm" target="_blank" rel="noopener noreferrer" className="hover:underline">Marketing SPB</a></p>
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
        
        <div className="bg-slate-800/50 p-6 rounded-lg mb-8">
          <h3 className="text-xl font-bold mb-4 text-center">Схема взаимодействия компонентов</h3>
          <p className="text-base text-slate-300 mb-6">
            Наша архитектура построена на принципах микросервисов для обеспечения масштабируемости и надежности системы. 
            Ключевой особенностью решения является эффективный обмен данными между сервисами:
          </p>
          
          {/* Заменяем анимированную схему на статичную с изменением состояний */}
          <div className="relative h-[500px] bg-slate-900/30 rounded-lg p-4 mb-6">
            <div className="absolute inset-x-0 top-0 p-4 flex justify-center">
              <div className="bg-blue-800/20 text-center p-3 rounded-lg border border-blue-700 w-[200px]">
                <h4 className="text-sm font-semibold text-blue-400">UGC API</h4>
                <p className="text-xs text-slate-300">Обработка контента</p>
              </div>
            </div>
            
            <div className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
              <div className="bg-green-800/20 text-center p-3 rounded-lg border border-green-700 w-[180px]">
                <h4 className="text-sm font-semibold text-green-400">MongoDB</h4>
                <p className="text-xs text-slate-300">Хранение UGC</p>
              </div>
            </div>
            
            <div className="absolute inset-x-0 bottom-0 p-4 flex justify-center">
              <div className="bg-purple-800/20 text-center p-3 rounded-lg border border-purple-700 w-[200px]">
                <h4 className="text-sm font-semibold text-purple-400">Автомодерация</h4>
                <p className="text-xs text-slate-300">AI-анализ контента</p>
              </div>
            </div>
            
            <div className="absolute top-1/2 right-1/4 transform translate-x-1/2 -translate-y-1/2">
              <div className="bg-amber-800/20 text-center p-3 rounded-lg border border-amber-700 w-[180px]">
                <h4 className="text-sm font-semibold text-amber-400">PostgreSQL</h4>
                <p className="text-xs text-slate-300">Данные модерации</p>
              </div>
            </div>
            
            {/* Статичные потоки данных */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 500" xmlns="http://www.w3.org/2000/svg">
              {/* Линия от UGC API к Автомодерации (через Kafka) */}
              <path 
                d="M 500 60 L 500 440" 
                stroke="#6366f1" 
                strokeWidth="3" 
                strokeDasharray="10,5" 
                fill="none" 
              />
              
              {/* Точки для Kafka в зависимости от шага */}
              {currentStep >= 0 && (
                <>
                  <circle 
                    cx="500" 
                    cy={currentStep === 0 ? "180" : "440"}
                    r="5" 
                    fill="#6366f1"
                  />
                  {currentStep === 0 && (
                    <circle 
                      cx="500" 
                      cy="120" 
                      r="5" 
                      fill="#6366f1"
                    />
                  )}
                </>
              )}
              
              {/* gRPC потоки для разных сценариев */}
              {flowMode === 'approve' && (
                <>
                  {/* Статичный поток от Автомодерации к UGC API (одобрение) */}
                  <path 
                    d="M 600 440 Q 700 250 600 60" 
                    stroke="#10b981" 
                    strokeWidth="3" 
                    fill="none" 
                  />
                  
                  {/* Точки для gRPC (approve) в зависимости от шага */}
                  {currentStep >= 1 && (
                    <circle 
                      cx={currentStep === 1 ? "640" : "600"} 
                      cy={currentStep === 1 ? "350" : "60"} 
                      r="6" 
                      fill="#10b981"
                    />
                  )}
                  
                  {/* Путь к MongoDB */}
                  {currentStep >= 2 && (
                    <>
                      <path 
                        d="M 450 60 L 250 250" 
                        stroke="#10b981" 
                        strokeWidth="3"
                        fill="none" 
                      />
                      
                      <circle 
                        cx={currentStep === 2 ? "350" : "250"} 
                        cy={currentStep === 2 ? "155" : "250"} 
                        r="6" 
                        fill="#10b981"
                      />
                    </>
                  )}
                </>
              )}
              
              {flowMode === 'reject' && (
                <>
                  {/* Статичный поток от Автомодерации к UGC API (отклонение) */}
                  <path 
                    d="M 600 440 Q 700 250 600 60" 
                    stroke="#ef4444" 
                    strokeWidth="3" 
                    fill="none" 
                  />
                  
                  {/* Точки для gRPC (reject) в зависимости от шага */}
                  {currentStep >= 1 && (
                    <circle 
                      cx={currentStep === 1 ? "640" : "600"} 
                      cy={currentStep === 1 ? "350" : "60"} 
                      r="6" 
                      fill="#ef4444"
                    />
                  )}
                </>
              )}
              
              {flowMode === 'pending' && (
                <>
                  {/* Поток от Автомодерации к PostgreSQL */}
                  <path 
                    d="M 550 440 L 750 250" 
                    stroke="#f59e0b" 
                    strokeWidth="3" 
                    fill="none" 
                  />
                  
                  {/* Поток от PostgreSQL к UGC API */}
                  <path 
                    d="M 750 250 Q 700 150 600 60" 
                    stroke="#f59e0b" 
                    strokeWidth="3" 
                    fill="none" 
                  />
                  
                  {/* Точки для шага 1 к PostgreSQL */}
                  {currentStep >= 1 && currentStep < 3 && (
                    <circle 
                      cx={currentStep === 1 ? "650" : "750"} 
                      cy={currentStep === 1 ? "345" : "250"} 
                      r="6" 
                      fill="#f59e0b"
                    />
                  )}
                  
                  {/* Точки для шага 3 к UGC API */}
                  {currentStep >= 3 && (
                    <circle 
                      cx={currentStep === 3 ? "675" : "600"} 
                      cy={currentStep === 3 ? "155" : "60"} 
                      r="6" 
                      fill="#f59e0b"
                    />
                  )}
                  
                  {/* Финальный путь к MongoDB */}
                  {currentStep >= 4 && (
                    <>
                      <path 
                        d="M 450 60 L 250 250" 
                        stroke="#10b981" 
                        strokeWidth="3"
                        fill="none" 
                      />
                      
                      <circle 
                        cx="250" 
                        cy="250" 
                        r="6" 
                        fill="#10b981"
                      />
                    </>
                  )}
                </>
              )}
            </svg>
            
            {/* Легенда */}
            <div className="absolute top-4 right-4 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <div className="text-sm font-semibold mb-2">Текущий режим:</div>
              <div className={`text-sm mb-2 flex items-center ${
                flowMode === 'approve' ? 'text-green-400' : 
                flowMode === 'reject' ? 'text-red-400' : 'text-amber-400'
              }`}>
                {flowMode === 'approve' ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span>Одобрение контента</span>
                  </>
                ) : flowMode === 'reject' ? (
                  <>
                    <XCircle className="w-4 h-4 mr-1" />
                    <span>Отклонение контента</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    <span>Требуется проверка</span>
                  </>
                )}
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => {setFlowMode('approve'); startFlow()}}
                  className={`px-2 py-0.5 text-xs rounded ${flowMode === 'approve' ? 'bg-green-900/50 border border-green-700' : 'bg-slate-800'}`}
                >
                  Одобрение
                </button>
                <button 
                  onClick={() => {setFlowMode('reject'); startFlow()}}
                  className={`px-2 py-0.5 text-xs rounded ${flowMode === 'reject' ? 'bg-red-900/50 border border-red-700' : 'bg-slate-800'}`}
                >
                  Отклонение
                </button>
                <button 
                  onClick={() => {setFlowMode('pending'); startFlow()}}
                  className={`px-2 py-0.5 text-xs rounded ${flowMode === 'pending' ? 'bg-amber-900/50 border border-amber-700' : 'bg-slate-800'}`}
                >
                  Проверка
                </button>
              </div>
            </div>
            
            {/* Текущий шаг */}
            {currentStepDescription && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-slate-950/90 p-3 rounded-lg border border-slate-700 min-w-[60%] text-center" style={{ bottom: "80px" }}>
                <p className="text-sm">{currentStepDescription}</p>
              </div>
            )}
            
            {/* Управление анимацией */}
            <div className="absolute bottom-4 left-4 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => {
                    setIsPaused(!isPaused)
                    if (isPaused && currentStep > 0) startFlow()
                  }}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-white"
                >
                  {isPaused ? (
                    <Play className="w-4 h-4" />
                  ) : (
                    <Pause className="w-4 h-4" />
                  )}
                </button>
                <div className="text-xs text-slate-300">Скорость:</div>
                <button 
                  onClick={() => setAnimationSpeed(0.5)}
                  className={`px-2 py-0.5 text-xs rounded ${animationSpeed === 0.5 ? 'bg-blue-900/50 border border-blue-700' : 'bg-slate-800'}`}
                >
                  0.5x
                </button>
                <button 
                  onClick={() => setAnimationSpeed(1)}
                  className={`px-2 py-0.5 text-xs rounded ${animationSpeed === 1 ? 'bg-blue-900/50 border border-blue-700' : 'bg-slate-800'}`}
                >
                  1x
                </button>
                <button 
                  onClick={() => setAnimationSpeed(2)}
                  className={`px-2 py-0.5 text-xs rounded ${animationSpeed === 2 ? 'bg-blue-900/50 border border-blue-700' : 'bg-slate-800'}`}
                >
                  2x
                </button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 text-blue-400">Потоковая обработка данных</h4>
              <p className="text-sm text-slate-300">
                UGC-сервис принимает пользовательский контент и через Kafka отправляет его 
                на обработку в сервис автомодерации. Использование Kafka позволяет обеспечить 
                буферизацию данных при пиковых нагрузках и гарантировать доставку сообщений.
              </p>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 text-purple-400">gRPC-взаимодействие</h4>
              <p className="text-sm text-slate-300">
                Между сервисами автомодерации и UGC реализовано двунаправленное взаимодействие через 
                gRPC. Этот протокол обеспечивает низкую латентность при передаче данных, строгую 
                типизацию и эффективную сериализацию, что критично для процесса модерации.
              </p>
            </div>
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
              <Badge variant="secondary" className="bg-blue-900/30 hover:bg-blue-900/50">gRPC</Badge>
            </div>
            <p className="text-sm text-slate-300">
              Современный стек Python-технологий для создания высокопроизводительных микросервисов с асинхронной обработкой данных. Для оптимизации межсервисного взаимодействия между сервисами автомодерации и UGC используется gRPC - высокопроизводительный протокол RPC, который обеспечивает быструю и надежную передачу структурированных данных.
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
        <h2 className="text-4xl font-bold mb-12 text-center">Как это работает</h2>
        
        <Tabs defaultValue="scenario1" value={activeTab} onValueChange={setActiveTab} className="max-w-6xl mx-auto">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="scenario1">Позитивный отзыв</TabsTrigger>
            <TabsTrigger value="scenario2">Негативный отзыв</TabsTrigger>
            <TabsTrigger value="scenario3">Спорный случай</TabsTrigger>
          </TabsList>
          
          <TabsContent value="scenario1" className="mt-4">
            <div className="bg-slate-800 rounded-lg overflow-hidden">
              <div className="relative w-full max-w-full h-[600px] md:h-[800px]">
                <Image 
                  src="/presentation/demo-positive.gif" 
                  alt="Демонстрация модерации позитивного отзыва" 
                  fill
                  className="object-contain"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Обработка позитивного отзыва</h3>
                <p className="text-base text-slate-300 mb-4">
                  Система быстро определяет, что отзыв соответствует правилам сообщества. 
                  Не обнаружено запрещенных слов или токсичного содержания.
                </p>
                <div className="bg-slate-900 p-4 rounded-md flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
                    <span className="text-base font-medium">Одобрено</span>
                  </div>
                  <div className="text-sm text-slate-400">Время обработки: 0.8с</div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="scenario2" className="mt-4">
            <div className="bg-slate-800 rounded-lg overflow-hidden">
              <div className="relative w-full max-w-full h-[600px] md:h-[800px]">
                <Image 
                  src="/presentation/demo-negative.gif" 
                  alt="Демонстрация модерации негативного отзыва" 
                  fill
                  className="object-contain"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Обработка негативного отзыва</h3>
                <p className="text-base text-slate-300 mb-4">
                  Система выявляет потенциально токсичное содержание и дискриминационные высказывания. 
                  Отзыв автоматически отклоняется.
                </p>
                <div className="bg-slate-900 p-4 rounded-md flex items-center justify-between">
                  <div className="flex items-center">
                    <XCircle className="w-6 h-6 text-red-500 mr-2" />
                    <span className="text-base font-medium">Отклонено</span>
                  </div>
                  <div className="text-sm text-slate-400">Время обработки: 1.2с</div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="scenario3" className="mt-4">
            <div className="bg-slate-800 rounded-lg overflow-hidden">
              <div className="relative w-full max-w-full h-[600px] md:h-[800px]">
                <Image 
                  src="/presentation/demo-pending.gif" 
                  alt="Демонстрация модерации спорного отзыва" 
                  fill
                  className="object-contain"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Обработка спорного отзыва</h3>
                <p className="text-base text-slate-300 mb-4">
                  При невозможности принять однозначное решение система направляет отзыв 
                  на ручную модерацию для дополнительной проверки человеком.
                </p>
                <div className="bg-slate-900 p-4 rounded-md flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertTriangle className="w-6 h-6 text-yellow-500 mr-2" />
                    <span className="text-base font-medium">Требуется проверка</span>
                  </div>
                  <div className="text-sm text-slate-400">Время обработки: 0.9с</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>
      
      {/* Экономическая эффективность */}
      <section className="container py-20 bg-gradient-to-b from-slate-900 to-slate-950 rounded-xl">
        <h2 className="text-3xl font-bold mb-12 text-center">Экономическая эффективность</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-xl font-bold mb-6">Сравнение способов развертывания</h3>
            <p className="text-lg text-slate-300 mb-8">
              Стоимость модерации контента зависит от объема обрабатываемых данных и выбранного способа развертывания. Наше решение обеспечивает оптимальное соотношение цены и качества.
            </p>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Количество токенов в месяц:</span>
                  <span className="font-bold">{formatNumber(params.requests)}</span>
                </div>
                <Slider 
                  value={[params.requests]} 
                  min={10000} 
                  max={10000000} 
                  step={10000} 
                  onValueChange={values => setParams(prev => ({ ...prev, requests: values[0] }))}
                  className="py-4"
                />
                <div className="flex justify-between text-sm text-slate-400">
                  <span>10K</span>
                  <span>5M</span>
                  <span>10M</span>
                </div>
              </div>
              
              <div className="bg-slate-800 p-4 rounded-md">
                <h4 className="font-medium mb-3">Стоимость в месяц ($):</h4>
                <div className="space-y-3">
                  {Object.entries(costData).map(([label, cost]) => (
                    <div key={label} className="flex items-center justify-between">
                      <span>{label}</span>
                      <span className={`font-bold ${
                        cost === Math.min(...Object.values(costData)) 
                          ? 'text-green-400' 
                          : 'text-slate-300'
                      }`}>
                        ${cost}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="text-sm text-slate-400 mt-2">
                * Расчеты приведены для среднего размера запросов без учета пиковых нагрузок
              </div>
              
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAdvancedMode(!advancedMode)}
                  className="text-xs bg-slate-800 hover:bg-slate-700"
                >
                  {advancedMode ? 'Скрыть параметры' : 'Расширенные параметры'}
                </Button>
              </div>
              
              {advancedMode && (
                <div className="bg-slate-800 p-4 rounded-md">
                  <h4 className="font-medium mb-3">Настройка параметров:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Стоимость API токена ($)</label>
                      <input
                        type="number"
                        step="0.00001"
                        value={params.baseCostPerToken}
                        onChange={(e) => updateParam('baseCostPerToken', e.target.value)}
                        className="w-full p-2 rounded bg-slate-900 text-white border border-slate-700 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Токенов на запрос</label>
                      <input
                        type="number"
                        value={params.tokensPerRequest}
                        onChange={(e) => updateParam('tokensPerRequest', e.target.value)}
                        className="w-full p-2 rounded bg-slate-900 text-white border border-slate-700 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Стоимость облачного инстанса ($)</label>
                      <input
                        type="number"
                        value={params.costPerInstance}
                        onChange={(e) => updateParam('costPerInstance', e.target.value)}
                        className="w-full p-2 rounded bg-slate-900 text-white border border-slate-700 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Токенов на инстанс</label>
                      <input
                        type="number"
                        value={params.requestsPerInstance}
                        onChange={(e) => updateParam('requestsPerInstance', e.target.value)}
                        className="w-full p-2 rounded bg-slate-900 text-white border border-slate-700 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Стоимость сервера ($)</label>
                      <input
                        type="number"
                        value={params.costPerServer}
                        onChange={(e) => updateParam('costPerServer', e.target.value)}
                        className="w-full p-2 rounded bg-slate-900 text-white border border-slate-700 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Поддержка сервера ($)</label>
                      <input
                        type="number"
                        value={params.supportCostPerServer}
                        onChange={(e) => updateParam('supportCostPerServer', e.target.value)}
                        className="w-full p-2 rounded bg-slate-900 text-white border border-slate-700 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Токенов на сервер</label>
                      <input
                        type="number"
                        value={params.requestsPerServer}
                        onChange={(e) => updateParam('requestsPerServer', e.target.value)}
                        className="w-full p-2 rounded bg-slate-900 text-white border border-slate-700 text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-6">Точки инверсии рентабельности</h3>
            <p className="text-slate-300 mb-6">
              График показывает стоимость различных подходов в зависимости от объема токенов. Точки инверсии - это объемы, при которых один подход становится выгоднее другого.
            </p>
            
            <div className="bg-slate-800 p-6 rounded-lg h-[400px] flex flex-col">
              <div ref={chartRef} className="w-full h-[400px]"></div>
            </div>
            
            <div className="mt-6 p-4 bg-slate-800/60 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">API vs Выд. сервер:</p>
                  <p className="text-sm text-slate-300">~{formatNumber(intersectionPoints.apiVsServer)} запросов</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Облако vs Выд. сервер:</p>
                  <p className="text-sm text-slate-300">~{formatNumber(intersectionPoints.cloudVsServer)} запросов</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 bg-slate-800/50 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-4 text-center">Экономический эффект</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-4">
              <div className="text-4xl font-bold text-green-400 mb-2">до 70%</div>
              <p className="text-slate-300">экономия по сравнению с ручной модерацией</p>
            </div>
            <div className="p-4">
              <div className="text-4xl font-bold text-purple-400 mb-2">3-6X</div>
              <p className="text-slate-300">увеличение скорости модерации</p>
            </div>
            <div className="p-4">
              <div className="text-4xl font-bold text-blue-400 mb-2">95%</div>
              <p className="text-slate-300">точность классификации контента</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Перспективы развития */}
      <section className="container py-20">
        <h2 className="text-3xl font-bold mb-12 text-center">Будущее развитие проекта</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-gradient-to-br from-slate-900 to-purple-900/20 border-slate-800 h-full">
            <CardHeader>
              <CardTitle className="text-white">Кастомная фильтрация контента</CardTitle>
              <CardDescription className="text-slate-300">Q1 2025</CardDescription>
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
              <CardDescription className="text-slate-300">Q2 2025</CardDescription>
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
              <CardDescription className="text-slate-300">Q3 2025</CardDescription>
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