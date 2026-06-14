import axios from 'axios'

const createApi = (baseURL: string) => {
  const api = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('njangi_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  })

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('njangi_token')
          window.location.href = '/login'
        }
      }
      return Promise.reject(error)
    }
  )

  return api
}

export const identityApi = createApi('http://localhost:3001')
export const ledgerApi = createApi('http://localhost:3002')
export const fineApi = createApi('http://localhost:3003')
export const loanApi = createApi('http://localhost:3004')
export const notificationApi = createApi('http://localhost:3005')

export default identityApi