import axios, { InternalAxiosRequestConfig, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import EmojiText from '../emojo'
import { router } from '@/router'

const axiosInstance = axios.create({
  timeout: 15000, // 请求超时时间(毫秒)
  baseURL: import.meta.env.VITE_API_URL, // API地址
  withCredentials: true, // 异步请求携带cookie
  transformRequest: [(data) => JSON.stringify(data)], // 请求数据转换为 JSON 字符串
  validateStatus: (status) => status >= 200 && status < 300, // 只接受 2xx 的状态码
  headers: {
    get: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
    post: { 'Content-Type': 'application/json;charset=utf-8' }
  },
  transformResponse: [
    (data) => {
      // 响应数据转换
      try {
        return typeof data === 'string' && data.startsWith('{') ? JSON.parse(data) : data
      } catch {
        return data // 解析失败时返回原数据
      }
    }
  ]
})

// 请求拦截器
axiosInstance.interceptors.request.use(
  (request: InternalAxiosRequestConfig) => {
    const access_token = useUserStore().info.access_token

    // 如果 token 存在，则设置请求头
    if (access_token) {
      request.headers.set({
        'Content-Type': 'application/json',
        authorization: access_token
      })
    }

    return request // 返回修改后的配置
  },
  (error) => {
    ElMessage.error(`服务器异常！ ${EmojiText[500]}`) // 显示错误消息
    return Promise.reject(error) // 返回拒绝的 Promise
  }
)

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // 检查响应数据中的 code
    const res = response.data
    if (res.code === 401) {
      // 清除用户信息
      const userStore = useUserStore()
      userStore.logOut()

      // 显示提示信息
      ElMessage.error('登录已过期，请重新登录')

      // 跳转到登录页
      router.push('/login')

      return Promise.reject(new Error('Unauthorized'))
    }

    return response
  },
  (error) => {
    if (axios.isCancel(error)) {
      console.log('repeated request: ' + error.message)
    } else {
      if (error.response?.status === 403) {
        // 显示提示信息
        ElMessage.warning('没有该权限访问！！')

        return Promise.reject(new Error('Unauthorized'))
      }
      // 检查是否是 401 错误
      if (error.response?.status === 401) {
        // 清除用户信息
        const userStore = useUserStore()
        userStore.logOut()
        // 显示提示信息
        ElMessage.error('登录已过期，请重新登录')

        // 跳转到登录页
        router.push('/login')
      } else {
        const errorMessage = error.response?.data.message
        ElMessage.error(
          errorMessage
            ? `${errorMessage} ${EmojiText[500]}`
            : `请求超时或服务器异常！${EmojiText[500]}`
        )
      }
    }
    return Promise.reject(error)
  }
)

// 请求
async function request<T = any>(config: AxiosRequestConfig): Promise<T> {
  // 将 POST | PUT 请求的参数放入 data 中，并清空 params
  if (config.method === 'POST' || config.method === 'PUT') {
    config.data = config.params
    config.params = {}
  }
  try {
    const res = await axiosInstance.request<T>({ ...config })
    return res.data
  } catch (e) {
    if (axios.isAxiosError(e)) {
      // 可以在这里处理 Axios 错误
    }
    return Promise.reject(e)
  }
}

// API 方法集合
const api = {
  get<T>(config: AxiosRequestConfig): Promise<T> {
    return request({ ...config, method: 'GET' }) // GET 请求
  },
  post<T>(config: AxiosRequestConfig): Promise<T> {
    return request({ ...config, method: 'POST' }) // POST 请求
  },
  put<T>(config: AxiosRequestConfig): Promise<T> {
    return request({ ...config, method: 'PUT' }) // PUT 请求
  },
  del<T>(config: AxiosRequestConfig): Promise<T> {
    return request({ ...config, method: 'DELETE' }) // DELETE 请求
  }
}

export default api
