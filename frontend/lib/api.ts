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

export const identityApi = createApi('https://identity-service-xtv7.onrender.com')
export const ledgerApi = createApi('https://ledger-service-jdcq.onrender.com')
export const fineApi = createApi('https://fine-service.onrender.com')
export const loanApi = createApi('https://loan-service-1bhi.onrender.com')
export const notificationApi = createApi('https://notification-service-521i.onrender.com')

export default identityApi