import axios from 'axios'
import { AgtableSettings } from 'main'


export default function service(settings: AgtableSettings) {
  const instance = axios.create({
    baseURL: settings.baseURL,
    timeout: 6000
  })

  instance.interceptors.request.use(
    (config) => {
      if (settings.token) {
        config.headers["xc-token"] = settings.token
      }
      return config
    },
    (err) => {
      console.log("request interceptors", err)
      return Promise.reject(err)
    }
  )
  
  return instance
}