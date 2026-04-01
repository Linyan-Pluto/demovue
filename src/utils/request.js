import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 5000
})

// 请求拦截器：添加Token
request.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = 'Bearer ' + token
  }
  return config
}, error => {
  return Promise.reject(error)
})

// 响应拦截器：处理Token过期
request.interceptors.response.use(response => {
  return response
}, error => {
  if (error.response?.status === 401) {
    localStorage.clear()
    window.location.href = '/#/login'
    alert('登录已过期，请重新登录')
  }
  return Promise.reject(error)
})

export default request