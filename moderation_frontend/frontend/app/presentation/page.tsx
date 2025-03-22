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
  // Параметры расчетов
  const [params, setParams] = useState({
    requestsPerMonth: 50000,        // Количество запросов в месяц
    tokensPerRequest: 5,           // Количество токенов на запрос (из research.py)
    apiCostPerToken: 0.0015,          // Стоимость API за токен (используется для OpenAI, из research.py)
    cloudCostPerMonth: 410,         // Стоимость облака в месяц (из research.py)
    requestsPerCloudInstance: 400_000,  // Запросов на один облачный инстанс (рассчитано из research.py)
    serverCostPerMonth: 288,        // Стоимость сервера в месяц (из research.py)
    serverMaintenanceCost: 150,      // Поддержка сервера (из research.py)
    requestsPerCpuServer: 1_000_000,    // Запросов на один CPU сервер (рассчитано из research.py)
    requestsPerCpuServerLease: 5_000_000,
    gpuCostPerMonth: 2000,           // Стоимость GPU в месяц (из research.py)
    serverLeaseCostPerMonth: 500,   // Стоимость лизинга сервера в месяц
    serverLeaseMaintenanceCost: 500, // Поддержка при лизинге
    serverAdditionalCostFactor: 1.2,  // Дополнительные расходы для сервера (фактор) (из research.py)
    leaseAdditionalCostFactor: 1.1,   // Дополнительные расходы для лизинга (фактор)
    gpuInstanceCostPerMonth: 1200,   // Стоимость GPU инстанса в облаке (из research.py)
    requestsPerGpuInstance: 1_400_000,  // Запросов на один GPU инстанс (рассчитано из research.py)
    requestsPerGpuServer: 2_000_000,   // Запросов на один GPU сервер (рассчитано из research.py)
    apiDiscount1: 250_000,           // Порог для первой скидки API (запросы)
    apiDiscount1Value: 0.9,           // Значение первой скидки (10%)
    apiDiscount2: 500_000,           // Порог для второй скидки API (запросы)
    apiDiscount2Value: 0.8,           // Значение второй скидки (20%)
    apiBaseCostPerToken: 0.0001        // Базовая стоимость API за токен (для отображения)
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
  const [chartData, setChartData] = useState<Array<{ requests: number, api: number, cloud: number, gpuCloud: number, server: number, lease: number, gpuServer: number }>>([])
  const [intersectionPoints, setIntersectionPoints] = useState<{
    apiVsServer: string;
    cloudVsServer: string;
    apiVsCloud: string;
    cpuVsGpuCloud: string;
    apiVsLease: string;
    cloudVsLease: string;
    leaseVsServer: string;
  }>({
    apiVsServer: "0",
    cloudVsServer: "0",
    apiVsCloud: "0",
    cpuVsGpuCloud: "0",
    apiVsLease: "0",
    cloudVsLease: "0",
    leaseVsServer: "0"
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
      requestsPerMonth, 
      tokensPerRequest, 
      apiCostPerToken, 
      cloudCostPerMonth,
      requestsPerCloudInstance,
      serverCostPerMonth,
      serverMaintenanceCost,
      requestsPerCpuServer,
      requestsPerCpuServerLease,
      gpuCostPerMonth,
      serverLeaseCostPerMonth,
      serverLeaseMaintenanceCost,
      serverAdditionalCostFactor,
      leaseAdditionalCostFactor,
      gpuInstanceCostPerMonth,
      requestsPerGpuInstance,
      requestsPerGpuServer,
      apiDiscount1, 
      apiDiscount1Value, 
      apiDiscount2, 
      apiDiscount2Value
    } = params
    
    // Упрощаем расчеты, используя запросы как основную единицу
    const totalRequests = requestsPerMonth;
    const totalTokens = totalRequests * tokensPerRequest;
    
    // Дисконты на основе объема запросов
    let costPerToken = apiCostPerToken
    if (totalRequests >= apiDiscount2) {
      costPerToken *= apiDiscount2Value
    } else if (totalRequests >= apiDiscount1) {
      costPerToken *= apiDiscount1Value
    }
    
    // Расчет стоимости API (зависит от токенов)
    const apiCost = totalTokens * costPerToken;
    
    // Расчет стоимости облачного хостинга (CPU)
    const cloudInstancesNeeded = Math.ceil(totalRequests / requestsPerCloudInstance);
    const cloudCost = cloudCostPerMonth * cloudInstancesNeeded;
    
    // Расчет стоимости облачного хостинга (GPU)
    const gpuCloudInstancesNeeded = Math.ceil(totalRequests / requestsPerGpuInstance);
    const gpuCloudCost = gpuInstanceCostPerMonth * gpuCloudInstancesNeeded;
    
    // Расчет стоимости выделенного сервера
    const serversNeeded = Math.ceil(totalRequests / requestsPerCpuServer);
    const serverCost = serversNeeded * (serverCostPerMonth + serverMaintenanceCost) * serverAdditionalCostFactor;
    
    // Расчет стоимости лизинга сервера
    const leaseServersNeeded = Math.ceil(totalRequests / requestsPerCpuServerLease);
    const leaseCost = leaseServersNeeded * (serverLeaseCostPerMonth + serverLeaseMaintenanceCost) * leaseAdditionalCostFactor;
    
    // Расчет стоимости выделенного GPU сервера
    const gpuServersNeeded = Math.ceil(totalRequests / requestsPerGpuServer);
    const gpuServerCost = gpuServersNeeded * (serverCostPerMonth + serverMaintenanceCost + gpuCostPerMonth) * serverAdditionalCostFactor * 1.3; // Повышенный фактор для GPU сервера
    
    setCostData({
      'API': parseFloat(apiCost.toFixed(2)),
      'CPU облако': parseFloat(cloudCost.toFixed(2)),
      'GPU облако': parseFloat(gpuCloudCost.toFixed(2)),
      'Выделенный сервер': parseFloat(serverCost.toFixed(2)),
      'Лизинг сервера': parseFloat(leaseCost.toFixed(2)),
      'GPU сервер': parseFloat(gpuServerCost.toFixed(2))
    })
    
    // Расчет функции стоимости для разных объемов
    const calculateCostForRequests = (requests: number) => {
      // Упрощаем расчет стоимости, используя запросы как основную единицу
      const tokens = requests * tokensPerRequest;
      
      // API стоимость с учетом дисконтов
      let apiTokenCost = apiCostPerToken;
      if (requests >= apiDiscount2) {
        apiTokenCost *= apiDiscount2Value;
      } else if (requests >= apiDiscount1) {
        apiTokenCost *= apiDiscount1Value;
      }
      const api = tokens * apiTokenCost;
      
      // Облачный хостинг (CPU)
      const cloudInstances = Math.ceil(requests / requestsPerCloudInstance);
      const cloud = cloudInstances * cloudCostPerMonth;
      
      // Облачный хостинг (GPU)
      const gpuCloudInstances = Math.ceil(requests / requestsPerGpuInstance);
      const gpuCloud = gpuCloudInstances * gpuInstanceCostPerMonth;
      
      // Выделенный сервер
      const servers = Math.ceil(requests / requestsPerCpuServer);
      const server = servers * (serverCostPerMonth + serverMaintenanceCost) * serverAdditionalCostFactor;
      
      // Лизинг сервера
      const leaseServers = Math.ceil(requests / requestsPerCpuServerLease);
      const lease = leaseServers * (serverLeaseCostPerMonth + serverLeaseMaintenanceCost) * leaseAdditionalCostFactor;
      
      // GPU Сервер
      const gpuServers = Math.ceil(requests / requestsPerGpuServer);
      const gpuServer = gpuServers * (serverCostPerMonth + serverMaintenanceCost + gpuCostPerMonth) * serverAdditionalCostFactor * 1.3;
      
      return { api, cloud, gpuCloud, server, lease, gpuServer };
    }
    
    // Генерация данных для графика
    const processData = () => {
      // Создаем массив точек с разными объемами запросов для построения графика
      const data = []
      
      // Определяем максимальное количество запросов для графика на основе текущего выбранного значения
      // Это обеспечит автоматическое масштабирование
      const requestsPerMonth = params.requestsPerMonth;
      const max = Math.min(Math.max(requestsPerMonth * 3, 1_000_000), 5_000_000); 
      
      // Уменьшаем шаг для более точных вычислений точек пересечения
      // Используем адаптивный шаг: меньше в начале, больше в конце
      let step = 1000;
      for (let requests = 0; requests <= max; requests += step) {
        const costs = calculateCostForRequests(requests)
        data.push({
          requests,
          ...costs
        })
        
        // Увеличиваем шаг по мере роста числа запросов для оптимизации
        if (requests >= 100000) step = 5000;
        if (requests >= 500000) step = 10000;
        if (requests >= 1000000) step = 20000;
      }
      
      setChartData(data)
      
      // Функция для нахождения точки пересечения двух линий
      const findIntersection = (line1: Array<{ requests: number, value: number }>, line2: Array<{ requests: number, value: number }>): number | null => {
        // Проходим по всем сегментам и ищем, где линии пересекаются
        for (let i = 0; i < Math.min(line1.length, line2.length) - 1; i++) {
          // Координаты текущего сегмента линии 1
          const x1 = line1[i].requests;
          const y1 = line1[i].value;
          const x2 = line1[i + 1].requests;
          const y2 = line1[i + 1].value;
          
          // Координаты текущего сегмента линии 2
          const x3 = line2[i].requests;
          const y3 = line2[i].value;
          const x4 = line2[i + 1].requests;
          const y4 = line2[i + 1].value;
          
          // Если линии практически параллельны, проверяем равенство значений
          if (Math.abs(y1 - y3) < 0.01 && Math.abs(y2 - y4) < 0.01) {
            return x1;
          }
          
          // Функция для проверки пересечения отрезков
          const ccw = (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) => {
            return (y3 - y1) * (x2 - x1) > (y2 - y1) * (x3 - x1);
          };
          
          const intersect = (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number) => {
            return ccw(x1, y1, x3, y3, x4, y4) !== ccw(x2, y2, x3, y3, x4, y4) && 
                   ccw(x1, y1, x2, y2, x3, y3) !== ccw(x1, y1, x2, y2, x4, y4);
          };
          
          if (intersect(x1, y1, x2, y2, x3, y3, x4, y4)) {
            // Вычисляем точку пересечения с помощью параметрического уравнения линии
            const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / 
                      ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
                      
            const intersectionX = x1 + t * (x2 - x1);
            
            // Проверяем, что точка пересечения находится внутри сегмента
            if (intersectionX >= x1 && intersectionX <= x2) {
              return intersectionX;
            }
          }
          
          // Проверяем, не пересекаются ли линии между точками (когда значения меняются относительно друг друга)
          if ((y1 < y3 && y2 > y4) || (y1 > y3 && y2 < y4)) {
            // Находим точку, где значения равны
            const slope1 = (y2 - y1) / (x2 - x1);
            const slope2 = (y4 - y3) / (x4 - x3);
            
            if (Math.abs(slope1 - slope2) < 0.0001) {
              // Практически параллельные линии
              return (x1 + x2) / 2;
            }
            
            // Вычисляем точку пересечения
            const b1 = y1 - slope1 * x1;
            const b2 = y3 - slope2 * x3;
            
            const intersectionX = (b2 - b1) / (slope1 - slope2);
            
            // Проверяем, что точка находится внутри обоих сегментов
            if (intersectionX >= x1 && intersectionX <= x2 && intersectionX >= x3 && intersectionX <= x4) {
              return intersectionX;
            }
          }
        }
        
        return null;
      };
      
      // Преобразуем данные для использования в findIntersection
      const apiLine = data.map(d => ({ requests: d.requests, value: d.api }));
      const cloudLine = data.map(d => ({ requests: d.requests, value: d.cloud }));
      const serverLine = data.map(d => ({ requests: d.requests, value: d.server }));
      const leaseLine = data.map(d => ({ requests: d.requests, value: d.lease }));
      const gpuCloudLine = data.map(d => ({ requests: d.requests, value: d.gpuCloud }));
      const gpuServerLine = data.map(d => ({ requests: d.requests, value: d.gpuServer }));
      
      // Находим пересечения между разными линиями
      const apiVsServer = findIntersection(apiLine, serverLine);
      const cloudVsServer = findIntersection(cloudLine, serverLine);
      const apiVsCloud = findIntersection(apiLine, cloudLine);
      const apiVsLease = findIntersection(apiLine, leaseLine);
      const cloudVsLease = findIntersection(cloudLine, leaseLine);
      const leaseVsServer = findIntersection(leaseLine, serverLine);
      const cpuVsGpuCloud = findIntersection(cloudLine, gpuCloudLine);
      
      setIntersectionPoints({
        apiVsServer: apiVsServer ? Math.round(apiVsServer).toString() : 'не найдено',
        cloudVsServer: cloudVsServer ? Math.round(cloudVsServer).toString() : 'не найдено',
        apiVsCloud: apiVsCloud ? Math.round(apiVsCloud).toString() : 'не найдено',
        apiVsLease: apiVsLease ? Math.round(apiVsLease).toString() : 'не найдено',
        cloudVsLease: cloudVsLease ? Math.round(cloudVsLease).toString() : 'не найдено',
        leaseVsServer: leaseVsServer ? Math.round(leaseVsServer).toString() : 'не найдено',
        cpuVsGpuCloud: cpuVsGpuCloud ? Math.round(cpuVsGpuCloud).toString() : 'не найдено'
      })
      
      // Рассчитываем затраты для текущего количества запросов
      const currentRequestsData = data.find(d => d.requests >= params.requestsPerMonth) || data[0]
      setCostData({
        'API': currentRequestsData.api,
        'CPU облако': currentRequestsData.cloud,
        'GPU облако': currentRequestsData.gpuCloud,
        'Лизинг': currentRequestsData.lease,
        'GPU сервер': currentRequestsData.gpuServer
      })
      
      // Отрисовываем график с помощью SVG
      drawChart(data)
    }
    
    processData()
  }, [params.requestsPerMonth])
  
  // Функция для отрисовки графика
  const drawChart = (data: Array<{ requests: number, api: number, cloud: number, gpuCloud: number, server: number, lease: number, gpuServer: number }>) => {
    if (!chartRef.current) return;
    
    const container = chartRef.current;
    container.innerHTML = '';
    
    // Определяем размеры графика
    const width = container.clientWidth;
    const height = container.clientHeight - 30; // Оставляем место для легенды
    const padding = { top: 20, right: 20, bottom: 50, left: 70 }; // Увеличиваем padding для осей
    
    // Находим максимальные значения для масштабирования
    const maxRequests = Math.max(...data.map(d => d.requests));
    const maxCost = Math.max(
      ...data.map(d => d.api),
      ...data.map(d => d.cloud),
      ...data.map(d => d.gpuCloud),
      ...data.map(d => d.server),
      ...data.map(d => d.lease),
      ...data.map(d => d.gpuServer)
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
    
    // Добавляем метки осей
    const xAxisLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    xAxisLabel.setAttribute('x', (width / 2).toString());
    xAxisLabel.setAttribute('y', (height - 25).toString());
    xAxisLabel.setAttribute('text-anchor', 'middle');
    xAxisLabel.setAttribute('fill', '#FFFFFF');
    xAxisLabel.setAttribute('font-size', '12');
    svg.appendChild(xAxisLabel);
    
    const yAxisLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    yAxisLabel.setAttribute('transform', `rotate(-90, 15, ${height / 2})`);
    yAxisLabel.setAttribute('x', '15');
    yAxisLabel.setAttribute('y', (height / 2).toString());
    yAxisLabel.setAttribute('text-anchor', 'middle');
    yAxisLabel.setAttribute('fill', '#FFFFFF');
    yAxisLabel.setAttribute('font-size', '12');
    yAxisLabel.textContent = 'Стоимость ($)';
    svg.appendChild(yAxisLabel);
    
    // Добавляем метки значений по осям
    const xTicks = 5;
    for (let i = 0; i <= xTicks; i++) {
      const value = (maxRequests / xTicks) * i;
      const x = scaleX(value);
      
      // Линия тика
      const tickLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      tickLine.setAttribute('x1', x.toString());
      tickLine.setAttribute('y1', (height - padding.bottom).toString());
      tickLine.setAttribute('x2', x.toString());
      tickLine.setAttribute('y2', (height - padding.bottom + 5).toString());
      tickLine.setAttribute('stroke', '#8899AA');
      tickLine.setAttribute('stroke-width', '1');
      svg.appendChild(tickLine);
      
      // Текст значения
      const tickText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tickText.setAttribute('x', x.toString());
      tickText.setAttribute('y', (height - padding.bottom + 20).toString());
      tickText.setAttribute('text-anchor', 'middle');
      tickText.setAttribute('fill', '#FFFFFF');
      tickText.setAttribute('font-size', '10');
      tickText.textContent = formatNumber(Math.round(value));
      svg.appendChild(tickText);
    }
    
    const yTicks = 5;
    for (let i = 0; i <= yTicks; i++) {
      const value = (maxCost / yTicks) * i;
      const y = scaleY(value);
      
      // Линия тика
      const tickLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      tickLine.setAttribute('x1', padding.left.toString());
      tickLine.setAttribute('y1', y.toString());
      tickLine.setAttribute('x2', (padding.left - 5).toString());
      tickLine.setAttribute('y2', y.toString());
      tickLine.setAttribute('stroke', '#8899AA');
      tickLine.setAttribute('stroke-width', '1');
      svg.appendChild(tickLine);
      
      // Текст значения
      const tickText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tickText.setAttribute('x', (padding.left - 10).toString());
      tickText.setAttribute('y', (y + 4).toString());
      tickText.setAttribute('text-anchor', 'end');
      tickText.setAttribute('fill', '#FFFFFF');
      tickText.setAttribute('font-size', '10');
      tickText.textContent = '$' + formatNumber(Math.round(value));
      svg.appendChild(tickText);
    }
    
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
    const gpuCloudData = data.map(d => ({ requests: d.requests, value: d.gpuCloud }));
    const serverData = data.map(d => ({ requests: d.requests, value: d.server }));
    const leaseData = data.map(d => ({ requests: d.requests, value: d.lease }));
    const gpuServerData = data.map(d => ({ requests: d.requests, value: d.gpuServer }));
    
    drawLine(apiData, '#3B82F6'); // blue-500
    drawLine(cloudData, '#A855F7'); // purple-500
    drawLine(gpuCloudData, '#6366F1'); // indigo-500
    drawLine(serverData, '#22C55E'); // green-500
    drawLine(leaseData, '#F59E0B'); // amber-500
    drawLine(gpuServerData, '#EF4444'); // red-500
    
    // Находим наиболее выгодное решение при текущем количестве запросов
    const currentRequestsIndex = data.findIndex(d => d.requests >= params.requestsPerMonth);
    const currentData = currentRequestsIndex >= 0 ? data[currentRequestsIndex] : data[0];

    // Определяем самую низкую стоимость
    const costs = [
      { label: 'API', value: currentData.api, color: '#3B82F6' },
      { label: 'Cloud', value: currentData.cloud, color: '#A855F7' },
      { label: 'GPU Cloud', value: currentData.gpuCloud, color: '#6366F1' },
      { label: 'Server', value: currentData.server, color: '#22C55E' },
      { label: 'Lease', value: currentData.lease, color: '#F59E0B' },
      { label: 'GPU Server', value: currentData.gpuServer, color: '#EF4444' },
    ];

    const cheapestOption = costs.reduce((prev, current) => 
      prev.value < current.value ? prev : current
    );

    // Выделяем зону текущего запроса на графике
    const currentReqArea = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    currentReqArea.setAttribute('x', scaleX(params.requestsPerMonth - maxRequests * 0.01).toString());
    currentReqArea.setAttribute('y', padding.top.toString());
    currentReqArea.setAttribute('width', (scaleX(params.requestsPerMonth + maxRequests * 0.01) - scaleX(params.requestsPerMonth - maxRequests * 0.01)).toString());
    currentReqArea.setAttribute('height', (height - padding.top - padding.bottom).toString());
    currentReqArea.setAttribute('fill', 'rgba(255, 255, 255, 0.05)');
    currentReqArea.setAttribute('stroke', 'rgba(255, 255, 255, 0.2)');
    currentReqArea.setAttribute('stroke-width', '1');
    svg.appendChild(currentReqArea);

    // Выделяем точку текущего запроса на графике
    const currentPointCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    currentPointCircle.setAttribute('cx', scaleX(params.requestsPerMonth).toString());
    currentPointCircle.setAttribute('cy', scaleY(cheapestOption.value).toString());
    currentPointCircle.setAttribute('r', '8');
    currentPointCircle.setAttribute('fill', cheapestOption.color);
    currentPointCircle.setAttribute('stroke', '#FFFFFF');
    currentPointCircle.setAttribute('stroke-width', '3');
    svg.appendChild(currentPointCircle);

    // Пульсирующий эффект для выделения точки текущего запроса
    const pulseAnimation = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    pulseAnimation.setAttribute('cx', scaleX(params.requestsPerMonth).toString());
    pulseAnimation.setAttribute('cy', scaleY(cheapestOption.value).toString());
    pulseAnimation.setAttribute('r', '12');
    pulseAnimation.setAttribute('fill', 'none');
    pulseAnimation.setAttribute('stroke', cheapestOption.color);
    pulseAnimation.setAttribute('stroke-width', '2');
    pulseAnimation.setAttribute('opacity', '0.7');
    const animateRadius = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    animateRadius.setAttribute('attributeName', 'r');
    animateRadius.setAttribute('values', '8;16;8');
    animateRadius.setAttribute('dur', '2s');
    animateRadius.setAttribute('repeatCount', 'indefinite');
    pulseAnimation.appendChild(animateRadius);
    const animateOpacity = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    animateOpacity.setAttribute('attributeName', 'opacity');
    animateOpacity.setAttribute('values', '0.7;0.1;0.7');
    animateOpacity.setAttribute('dur', '2s');
    animateOpacity.setAttribute('repeatCount', 'indefinite');
    pulseAnimation.appendChild(animateOpacity);
    svg.appendChild(pulseAnimation);

    // Отмечаем текущее значение с выделением
    const currentLabelBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    const labelText = `${cheapestOption.label}: $${formatNumber(Math.round(cheapestOption.value))}`;
    const textWidth = labelText.length * 7; // Приблизительная ширина
    currentLabelBg.setAttribute('x', (scaleX(params.requestsPerMonth) + 10).toString());
    currentLabelBg.setAttribute('y', (scaleY(cheapestOption.value) - 22).toString());
    currentLabelBg.setAttribute('width', textWidth.toString());
    currentLabelBg.setAttribute('height', '18');
    currentLabelBg.setAttribute('rx', '4');
    currentLabelBg.setAttribute('ry', '4');
    currentLabelBg.setAttribute('fill', cheapestOption.color);
    currentLabelBg.setAttribute('opacity', '0.2');
    svg.appendChild(currentLabelBg);

    const currentLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    currentLabel.setAttribute('x', (scaleX(params.requestsPerMonth) + 15).toString());
    currentLabel.setAttribute('y', (scaleY(cheapestOption.value) - 8).toString());
    currentLabel.setAttribute('fill', '#FFFFFF');
    currentLabel.setAttribute('font-size', '12');
    currentLabel.setAttribute('font-weight', 'bold');
    currentLabel.textContent = labelText;
    svg.appendChild(currentLabel);

    // Рисуем вертикальную линию от текущей точки к оси X
    const currentLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    currentLine.setAttribute('x1', scaleX(params.requestsPerMonth).toString());
    currentLine.setAttribute('y1', scaleY(cheapestOption.value).toString());
    currentLine.setAttribute('x2', scaleX(params.requestsPerMonth).toString());
    currentLine.setAttribute('y2', (height - padding.bottom).toString());
    currentLine.setAttribute('stroke', '#FFFFFF');
    currentLine.setAttribute('stroke-width', '2');
    currentLine.setAttribute('stroke-dasharray', '5,3');
    svg.appendChild(currentLine);

    // Показываем текущую точку на оси X
    const currentXLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    currentXLabel.setAttribute('x', scaleX(params.requestsPerMonth).toString());
    currentXLabel.setAttribute('y', (height - padding.bottom + 35).toString());
    currentXLabel.setAttribute('text-anchor', 'middle');
    currentXLabel.setAttribute('fill', '#FFFFFF');
    currentXLabel.setAttribute('font-size', '11');
    currentXLabel.setAttribute('font-weight', 'bold');
    currentXLabel.textContent = formatNumber(params.requestsPerMonth);
    svg.appendChild(currentXLabel);

    // Отображаем все точки инверсии на графике
    const intersectionPointsArray = [
      { name: 'API vs Server', value: intersectionPoints.apiVsServer === 'не найдено' ? NaN : parseInt(intersectionPoints.apiVsServer), color1: '#3B82F6', color2: '#22C55E' },
      { name: 'Cloud vs Server', value: intersectionPoints.cloudVsServer === 'не найдено' ? NaN : parseInt(intersectionPoints.cloudVsServer), color1: '#A855F7', color2: '#22C55E' },
      { name: 'API vs Cloud', value: intersectionPoints.apiVsCloud === 'не найдено' ? NaN : parseInt(intersectionPoints.apiVsCloud), color1: '#3B82F6', color2: '#A855F7' },
      { name: 'CPU vs GPU Cloud', value: intersectionPoints.cpuVsGpuCloud === 'не найдено' ? NaN : parseInt(intersectionPoints.cpuVsGpuCloud), color1: '#A855F7', color2: '#6366F1' },
      { name: 'API vs Lease', value: intersectionPoints.apiVsLease === 'не найдено' ? NaN : parseInt(intersectionPoints.apiVsLease), color1: '#3B82F6', color2: '#F59E0B' },
      { name: 'Cloud vs Lease', value: intersectionPoints.cloudVsLease === 'не найдено' ? NaN : parseInt(intersectionPoints.cloudVsLease), color1: '#A855F7', color2: '#F59E0B' },
      { name: 'Lease vs Server', value: intersectionPoints.leaseVsServer === 'не найдено' ? NaN : parseInt(intersectionPoints.leaseVsServer), color1: '#F59E0B', color2: '#22C55E' },
    ];

    // Сортируем точки инверсии по значению для лучшего управления позиционированием меток
    const sortedIntersectionPoints = [...intersectionPointsArray]
      .filter(point => !isNaN(point.value) && point.value > 0)
      .sort((a, b) => a.value - b.value);
    
    // Фильтруем только валидные точки пересечения и находим значения для них
    sortedIntersectionPoints.forEach((point, index) => {
      // Находим ближайшую точку данных для определения высоты
      const closestPoint = data.reduce((prev, curr) => 
        Math.abs(curr.requests - point.value) < Math.abs(prev.requests - point.value) ? curr : prev
      );
      
      // Определяем, какие линии пересекаются, чтобы получить правильное значение y
      let yValue;
      if (point.name === 'API vs Server') {
        yValue = (closestPoint.api + closestPoint.server) / 2;
      } else if (point.name === 'Cloud vs Server') {
        yValue = (closestPoint.cloud + closestPoint.server) / 2;
      } else if (point.name === 'API vs Cloud') {
        yValue = (closestPoint.api + closestPoint.cloud) / 2;
      } else if (point.name === 'CPU vs GPU Cloud') {
        yValue = (closestPoint.cloud + closestPoint.gpuCloud) / 2;
      } else if (point.name === 'API vs Lease') {
        yValue = (closestPoint.api + closestPoint.lease) / 2;
      } else if (point.name === 'Cloud vs Lease') {
        yValue = (closestPoint.cloud + closestPoint.lease) / 2;
      } else if (point.name === 'Lease vs Server') {
        yValue = (closestPoint.lease + closestPoint.server) / 2;
      }
      
      // Значок смены решения - градиентный круг
      const gradientId = `gradient-${index}`;
      const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
      gradient.setAttribute('id', gradientId);
      gradient.setAttribute('x1', '0%');
      gradient.setAttribute('y1', '0%');
      gradient.setAttribute('x2', '100%');
      gradient.setAttribute('y2', '100%');
      
      const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stop1.setAttribute('offset', '0%');
      stop1.setAttribute('stop-color', point.color1);
      gradient.appendChild(stop1);
      
      const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stop2.setAttribute('offset', '100%');
      stop2.setAttribute('stop-color', point.color2);
      gradient.appendChild(stop2);
      
      svg.appendChild(gradient);
      
      // Рисуем точку инверсии
      const intersectionCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      intersectionCircle.setAttribute('cx', scaleX(point.value || 0).toString());
      intersectionCircle.setAttribute('cy', scaleY(yValue || 0).toString());
      intersectionCircle.setAttribute('r', '5');
      intersectionCircle.setAttribute('fill', `url(#${gradientId})`);
      intersectionCircle.setAttribute('stroke', '#FFFFFF');
      intersectionCircle.setAttribute('stroke-width', '2');
      svg.appendChild(intersectionCircle);
      
      // Добавляем вертикальную пунктирную линию
      const intersectionLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      intersectionLine.setAttribute('x1', scaleX(point.value || 0).toString());
      intersectionLine.setAttribute('y1', scaleY(yValue || 0).toString());
      intersectionLine.setAttribute('x2', scaleX(point.value || 0).toString());
      intersectionLine.setAttribute('y2', (height - padding.bottom).toString());
      intersectionLine.setAttribute('stroke', `url(#${gradientId})`);
      intersectionLine.setAttribute('stroke-width', '1.5');
      intersectionLine.setAttribute('stroke-dasharray', '3,2');
      svg.appendChild(intersectionLine);
      
      // Проверяем, находится ли точка в пределах видимой области и достаточно ли места для метки
      if (point.value && !isNaN(point.value) && point.value <= maxRequests && 
          scaleX(point.value) >= padding.left && scaleX(point.value) <= width - padding.right) {
        
        // Рассчитываем вертикальное смещение для избежания перекрытия меток
        // Изменяем на основе индекса массива и общего числа точек
        const verticalOffset = 10 + (index % 3) * 15; 
        const labelYPos = scaleY(yValue || 0) - verticalOffset;
        
        // Фон для метки
        const labelBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        const labelWidth = formatNumber(point.value).length * 6 + 10; // Адаптивный размер
        labelBg.setAttribute('x', (scaleX(point.value) - labelWidth/2).toString());
        labelBg.setAttribute('y', (labelYPos - 12).toString());
        labelBg.setAttribute('width', labelWidth.toString());
        labelBg.setAttribute('height', '16');
        labelBg.setAttribute('rx', '4');
        labelBg.setAttribute('fill', 'rgba(0, 0, 0, 0.7)');
        svg.appendChild(labelBg);
        
        // Метка точки инверсии
        const annotationText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        annotationText.setAttribute('x', scaleX(point.value).toString());
        annotationText.setAttribute('y', labelYPos.toString());
        annotationText.setAttribute('text-anchor', 'middle');
        annotationText.setAttribute('fill', '#FFFFFF');
        annotationText.setAttribute('font-size', '10');
        annotationText.textContent = formatNumber(point.value);
        svg.appendChild(annotationText);
      }
    });

    // Добавляем легенду
    const legendY = height - 10;
    const legendSpacing = width / 7; // Более равномерное распределение для избежания наложения

    const legendItems = [
      { label: 'API', color: '#3B82F6' },
      { label: 'CPU облако', color: '#A855F7' },
      { label: 'GPU облако', color: '#6366F1' },
      { label: 'Сервер', color: '#22C55E' },
      { label: 'Лизинг', color: '#F59E0B' },
      { label: 'GPU сервер', color: '#EF4444' }
    ];

    legendItems.forEach((item, index) => {
      const x = padding.left + index * legendSpacing;
      
      // Линия для легенды
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x.toString());
      line.setAttribute('y1', legendY.toString());
      line.setAttribute('x2', (x + 15).toString());
      line.setAttribute('y2', legendY.toString());
      line.setAttribute('stroke', item.color);
      line.setAttribute('stroke-width', '2');
      svg.appendChild(line);
      
      // Текст легенды
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', (x + 20).toString());
      text.setAttribute('y', (legendY + 4).toString());
      text.setAttribute('fill', '#FFFFFF');
      text.setAttribute('font-size', '10');
      text.textContent = item.label;
      svg.appendChild(text);
    });
  };

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
                  
                  {/* Путь к MongoDB для режима отклонения */}
                  {currentStep >= 2 && (
                    <>
                      <path 
                        d="M 450 60 L 250 250" 
                        stroke="#ef4444" 
                        strokeWidth="3"
                        fill="none" 
                      />
                      
                      <circle 
                        cx={currentStep === 2 ? "350" : "250"} 
                        cy={currentStep === 2 ? "155" : "250"} 
                        r="6" 
                        fill="#ef4444"
                      />
                    </>
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
                  
                  {/* Добавляем путь к MongoDB при режиме проверки на более раннем шаге */}
                  {currentStep >= 2 && (
                    <>
                      <path 
                        d="M 450 60 L 250 250" 
                        stroke="#f59e0b" 
                        strokeWidth="3"
                        fill="none" 
                      />
                      
                      <circle 
                        cx={currentStep === 2 ? "350" : "250"} 
                        cy={currentStep === 2 ? "155" : "250"} 
                        r="6" 
                        fill="#f59e0b"
                      />
                    </>
                  )}
                  
                  {/* Финальный путь к MongoDB остаётся для совместимости */}
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
            <h3 className="text-xl font-bold mb-6">Сравнение вариантов инфраструктуры</h3>
            <p className="text-lg text-slate-300 mb-8">
              Стоимость модерации контента зависит от объема обрабатываемых данных и выбора инфраструктуры. 
              Наше решение позволяет динамически подбирать оптимальную инфраструктуру в зависимости от масштаба вашего проекта.
            </p>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Количество запросов в месяц:</span>
                  <span className="font-bold">{formatNumber(params.requestsPerMonth)}</span>
                </div>
                <Slider 
                  value={[params.requestsPerMonth]} 
                  min={1000} 
                  max={1000000} 
                  step={1000} 
                  onValueChange={values => setParams(prev => ({ ...prev, requestsPerMonth: values[0] }))}
                  className="py-4"
                />
                <div className="flex justify-between text-sm text-slate-400">
                  <span>1K</span>
                  <span>500K</span>
                  <span>1M</span>
                </div>
              </div>
              
              <div className="bg-slate-800 p-4 rounded-md">
                <h4 className="font-medium mb-3">Расчетная стоимость в месяц ($):</h4>
                <div className="space-y-3">
                  {Object.entries(costData)
                    .sort((a, b) => a[1] - b[1]) // Сортируем, чтобы самое дешевое решение было вверху
                    .map(([name, value], index) => {
                      const isOptimal = index === 0; // Первый элемент после сортировки - самый дешевый
                      return (
                        <div 
                          key={name} 
                          className={`flex justify-between items-center p-1.5 rounded-md ${isOptimal ? 'bg-green-800/30 border border-green-700' : ''}`}
                        >
                          <div className={`text-sm font-medium ${isOptimal ? 'text-green-400' : ''}`}>
                            {name}:{isOptimal && <span className="text-xs ml-2 bg-green-700 px-1.5 py-0.5 rounded">оптимально</span>}
                          </div>
                          <div className={`text-sm font-bold ${isOptimal ? 'text-green-400' : ''}`}>${formatNumber(value)}</div>
                        </div>
                      );
                    })
                  }
                </div>
              </div>
              
              <div className="text-sm text-slate-400 mt-2">
                * Расчеты основаны на исследовании из research.py
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
                  <h4 className="font-medium mb-3">API параметры:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Базовая стоимость токена OpenAI ($)</label>
                      <input
                        type="number"
                        step="0.00001"
                        value={params.apiBaseCostPerToken}
                        onChange={(e) => updateParam('apiBaseCostPerToken', e.target.value)}
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
                      <label className="block text-xs text-slate-400 mb-1">Порог первой скидки (токены)</label>
                      <input
                        type="number"
                        value={params.apiDiscount1}
                        onChange={(e) => updateParam('apiDiscount1', e.target.value)}
                        className="w-full p-2 rounded bg-slate-900 text-white border border-slate-700 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Коэффициент первой скидки</label>
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.01"
                        value={params.apiDiscount1Value}
                        onChange={(e) => updateParam('apiDiscount1Value', e.target.value)}
                        className="w-full p-2 rounded bg-slate-900 text-white border border-slate-700 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Порог второй скидки (токены)</label>
                      <input
                        type="number"
                        value={params.apiDiscount2}
                        onChange={(e) => updateParam('apiDiscount2', e.target.value)}
                        className="w-full p-2 rounded bg-slate-900 text-white border border-slate-700 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Коэффициент второй скидки</label>
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.01"
                        value={params.apiDiscount2Value}
                        onChange={(e) => updateParam('apiDiscount2Value', e.target.value)}
                        className="w-full p-2 rounded bg-slate-900 text-white border border-slate-700 text-sm"
                      />
                    </div>
                  </div>

                  <h4 className="font-medium mb-3 mt-6">Облачные параметры:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Стоимость CPU инстанса ($)</label>
                      <input
                        type="number"
                        value={params.cloudCostPerMonth}
                        onChange={(e) => updateParam('cloudCostPerMonth', e.target.value)}
                        className="w-full p-2 rounded bg-slate-900 text-white border border-slate-700 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Запросов на CPU инстанс</label>
                      <input
                        type="number"
                        value={params.requestsPerCloudInstance}
                        onChange={(e) => updateParam('requestsPerCloudInstance', e.target.value)}
                        className="w-full p-2 rounded bg-slate-900 text-white border border-slate-700 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Стоимость GPU инстанса ($)</label>
                      <input
                        type="number"
                        value={params.gpuInstanceCostPerMonth}
                        onChange={(e) => updateParam('gpuInstanceCostPerMonth', e.target.value)}
                        className="w-full p-2 rounded bg-slate-900 text-white border border-slate-700 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Запросов на GPU инстанс</label>
                      <input
                        type="number"
                        value={params.requestsPerGpuInstance}
                        onChange={(e) => updateParam('requestsPerGpuInstance', e.target.value)}
                        className="w-full p-2 rounded bg-slate-900 text-white border border-slate-700 text-sm"
                      />
                    </div>
                  </div>

                  <h4 className="font-medium mb-3 mt-6">Серверные параметры:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Стоимость сервера ($)</label>
                      <input
                        type="number"
                        value={params.serverCostPerMonth}
                        onChange={(e) => updateParam('serverCostPerMonth', e.target.value)}
                        className="w-full p-2 rounded bg-slate-900 text-white border border-slate-700 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Запросов на сервер</label>
                      <input
                        type="number"
                        value={params.requestsPerCpuServer}
                        onChange={(e) => updateParam('requestsPerCpuServer', e.target.value)}
                        className="w-full p-2 rounded bg-slate-900 text-white border border-slate-700 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Запросов на сервер (лизинг)</label>
                      <input
                        type="number"
                        value={params.requestsPerCpuServerLease}
                        onChange={(e) => updateParam('requestsPerCpuServerLease', e.target.value)}
                        className="w-full p-2 rounded bg-slate-900 text-white border border-slate-700 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Обслуживание сервера ($)</label>
                      <input
                        type="number"
                        value={params.serverMaintenanceCost}
                        onChange={(e) => updateParam('serverMaintenanceCost', e.target.value)}
                        className="w-full p-2 rounded bg-slate-900 text-white border border-slate-700 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Фактор доп. расходов</label>
                      <input
                        type="number"
                        min="1"
                        step="0.1"
                        value={params.serverAdditionalCostFactor}
                        onChange={(e) => updateParam('serverAdditionalCostFactor', e.target.value)}
                        className="w-full p-2 rounded bg-slate-900 text-white border border-slate-700 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Запросов на GPU сервер</label>
                      <input
                        type="number"
                        value={params.requestsPerGpuServer}
                        onChange={(e) => updateParam('requestsPerGpuServer', e.target.value)}
                        className="w-full p-2 rounded bg-slate-900 text-white border border-slate-700 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Стоимость GPU ($)</label>
                      <input
                        type="number"
                        value={params.gpuCostPerMonth}
                        onChange={(e) => updateParam('gpuCostPerMonth', e.target.value)}
                        className="w-full p-2 rounded bg-slate-900 text-white border border-slate-700 text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Конфигурация из research.py */}
              <div className="bg-slate-800/80 p-4 rounded-md mt-4">
                <h4 className="font-medium mb-3">Конфигурация из research.py:</h4>
                <div className="text-xs bg-slate-900 p-3 rounded-md font-mono text-slate-300 overflow-auto max-h-[150px]">
                  # Конфигурация API и инфраструктуры<br />
                  config = &#123;<br />
                  &nbsp;&nbsp;&nbsp;"apis": [<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#123;<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name": "OpenAI",<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"base_cost_per_token": {params.apiBaseCostPerToken},<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"discounts": [<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(1_000_000, 1.0),<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;({params.apiDiscount1}, {params.apiDiscount1Value}),<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;({params.apiDiscount2}, {params.apiDiscount2Value}),<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;],<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#125;,<br />
                  &nbsp;&nbsp;&nbsp;],<br />
                  &nbsp;&nbsp;&nbsp;"api_config": &#123;"tokens_per_request": {params.tokensPerRequest}&#125;,<br />
                  &nbsp;&nbsp;&nbsp;"cloud": &#123;<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"name": "AWS CPU instance",<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"cost_per_instance": {params.cloudCostPerMonth},<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"requests_per_instance": {params.requestsPerCloudInstance},<br />
                  &nbsp;&nbsp;&nbsp;&#125;,<br />
                  &#125;
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-6">Точки инверсии рентабельности</h3>
            <p className="text-slate-300 mb-6">
              График показывает стоимость различных подходов в зависимости от объема запросов в месяц. 
              Точки инверсии - это объемы, при которых один подход становится выгоднее другого.
            </p>
            
            <div className="bg-slate-800 p-6 rounded-lg h-[400px] flex flex-col">
              <div ref={chartRef} className="w-full h-[400px]"></div>
            </div>
            
            <div className="mt-6 p-4 bg-slate-800/60 rounded-lg">
              <div className="font-medium mb-2 text-lg text-center text-blue-400">Ключевые точки инверсии</div>
              <div className="text-xs text-center text-slate-400 mb-3">
                При каком объеме запросов меняется оптимальное решение
              </div>
              <div className="grid grid-cols-1 gap-4">
                {Object.entries({
                  'API vs Выделенный сервер': intersectionPoints.apiVsServer,
                  'Облако vs Выделенный сервер': intersectionPoints.cloudVsServer,
                  'API vs Облачный хостинг': intersectionPoints.apiVsCloud,
                  'CPU vs GPU в облаке': intersectionPoints.cpuVsGpuCloud,
                  'API vs Лизинг': intersectionPoints.apiVsLease,
                  'Облако vs Лизинг': intersectionPoints.cloudVsLease,
                  'Лизинг vs Сервер': intersectionPoints.leaseVsServer
                }).map(([label, value]) => {
                  const isFound = value !== 'не найдено';
                  const numValue = isFound ? parseInt(value) : 0;
                  const isActivePoint = isFound && params.requestsPerMonth >= numValue * 0.9 && params.requestsPerMonth <= numValue * 1.1;
                  
                  return (
                    <div 
                      key={label} 
                      className={`flex justify-between items-center p-2 rounded-lg border 
                        ${isActivePoint ? 'bg-amber-900/30 border-amber-700 animate-pulse' : 
                          isFound ? 'bg-slate-800/70 border-slate-700' : 'bg-slate-800/30 border-slate-800'}`}
                    >
                      <div className="space-y-1">
                        <p className={`text-sm font-medium ${isActivePoint ? 'text-amber-400' : isFound ? 'text-white' : 'text-slate-500'}`}>
                          {label}
                        </p>
                        {isFound && (
                          <p className="text-xs text-slate-400">
                            {numValue > params.requestsPerMonth 
                              ? `будет через ${formatNumber(numValue - params.requestsPerMonth)} запросов` 
                              : `был ${formatNumber(params.requestsPerMonth - numValue)} запросов назад`}
                          </p>
                        )}
                      </div>
                      <Badge className={`${isActivePoint ? 'bg-amber-600' : 
                        isFound ? 'bg-blue-600' : 'bg-slate-700 text-slate-400'}`}>
                        {isFound 
                          ? formatNumber(numValue) 
                          : 'не найдено'} 
                        {isFound && ' запросов'}
                      </Badge>
                    </div>
                  );
                })}
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