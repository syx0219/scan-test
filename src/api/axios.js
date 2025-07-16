import axios from 'axios'
import { showFailToast } from 'vant'
const service = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://192.168.2.78/api/',
  timeout: 50000,
})
// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么
    // 例如：添加token到header中
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Autho-rization'] = `Bearer ${token}`
    }
    config.headers['lang'] = localStorage.getItem('lang') || 'en'
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8'
    config.headers['X-Requested-With'] = 'XMLHttpRequest'
    config.data = typeof config.data === 'undefined' ? {} : config.data
    return config
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error)
  },
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    if (response.status == 200) {
      alert(response.data.message)
      if (response.data.code == 300) {
        showFailToast(response.data.message)
        localStorage.removeItem('token')
        return Promise.reject(response.data.message)
      }
      if (response.data.code == 400) {
        showFailToast(response.data.message)
        return Promise.reject(response.data.message)
      }
      if (response.data.code == 200) {
        return response.data
      }
    }
  },
  (error) => {
    // 对响应错误做些什么
    if (error.response) {
      switch (error.response.status) {
        case 403:
          // 处理未授权的错误
          console.error('未授权，请重新登录')
          break
        case 404:
          // 处理资源不存在的错误
          console.error('请求的资源不存在')
          break
        default:
          console.error('请求失败，请稍后再试')
      }
    } else if (error.request) {
      console.error('请求失败，请检查网络连接')
    } else {
      console.error('请求配置错误')
    }
    return Promise.reject(error)
  },
)

export default service
