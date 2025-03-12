// Ключи для хранения токенов
const USER_TOKEN_KEY = "jwt_token"
const MODERATOR_TOKEN_KEY = "moderator_jwt_token"

// Проверка доступности localStorage
const isLocalStorageAvailable = () => {
  try {
    const testKey = "__test__"
    localStorage.setItem(testKey, testKey)
    localStorage.removeItem(testKey)
    return true
  } catch (e) {
    return false
  }
}

// Проверка доступности sessionStorage
const isSessionStorageAvailable = () => {
  try {
    const testKey = "__test__"
    sessionStorage.setItem(testKey, testKey)
    sessionStorage.removeItem(testKey)
    return true
  } catch (e) {
    return false
  }
}

// Установка cookie
const setCookie = (name: string, value: string, days = 30) => {
  const date = new Date()
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
  const expires = `expires=${date.toUTCString()}`
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Strict`
}

// Получение cookie
const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null

  const nameEQ = `${name}=`
  const ca = document.cookie.split(";")
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === " ") c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}

// Удаление cookie
const removeCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Strict`
}

// Сохранение токена с использованием всех доступных методов
export const saveToken = (token: string, isModeratorToken = false) => {
  const key = isModeratorToken ? MODERATOR_TOKEN_KEY : USER_TOKEN_KEY

  // Сохраняем в localStorage, если доступно
  if (isLocalStorageAvailable()) {
    try {
      localStorage.setItem(key, token)
    } catch (e) {
      console.warn("Failed to save token to localStorage:", e)
    }
  }

  // Сохраняем в sessionStorage как резервный вариант
  if (isSessionStorageAvailable()) {
    try {
      sessionStorage.setItem(key, token)
    } catch (e) {
      console.warn("Failed to save token to sessionStorage:", e)
    }
  }

  // Сохраняем в cookie как дополнительный резервный вариант
  try {
    if (typeof document !== "undefined") {
      setCookie(key, token)
    }
  } catch (e) {
    console.warn("Failed to save token to cookie:", e)
  }

  return token
}

// Получение токена из любого доступного хранилища
export const getToken = (isModeratorToken = false): string | null => {
  if (typeof window === "undefined") return null

  const key = isModeratorToken ? MODERATOR_TOKEN_KEY : USER_TOKEN_KEY
  let token = null

  // Пробуем получить из localStorage
  if (isLocalStorageAvailable()) {
    token = localStorage.getItem(key)
  }

  // Если не нашли в localStorage, пробуем sessionStorage
  if (!token && isSessionStorageAvailable()) {
    token = sessionStorage.getItem(key)

    // Если нашли в sessionStorage, сохраняем в localStorage для будущего использования
    if (token && isLocalStorageAvailable()) {
      try {
        localStorage.setItem(key, token)
      } catch (e) {
        console.warn("Failed to save token from sessionStorage to localStorage:", e)
      }
    }
  }

  // Если не нашли в sessionStorage, пробуем cookie
  if (!token) {
    token = getCookie(key)

    // Если нашли в cookie, сохраняем в localStorage для будущего использования
    if (token && isLocalStorageAvailable()) {
      try {
        localStorage.setItem(key, token)
      } catch (e) {
        console.warn("Failed to save token from cookie to localStorage:", e)
      }
    }
  }

  return token
}

// Удаление токена из всех хранилищ
export const removeToken = (isModeratorToken = false) => {
  const key = isModeratorToken ? MODERATOR_TOKEN_KEY : USER_TOKEN_KEY

  // Удаляем из localStorage
  if (isLocalStorageAvailable()) {
    try {
      localStorage.removeItem(key)
    } catch (e) {
      console.warn("Failed to remove token from localStorage:", e)
    }
  }

  // Удаляем из sessionStorage
  if (isSessionStorageAvailable()) {
    try {
      sessionStorage.removeItem(key)
    } catch (e) {
      console.warn("Failed to remove token from sessionStorage:", e)
    }
  }

  // Удаляем из cookie
  try {
    if (typeof document !== "undefined") {
      removeCookie(key)
    }
  } catch (e) {
    console.warn("Failed to remove token from cookie:", e)
  }
}

