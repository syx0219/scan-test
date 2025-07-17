import './assets/main.css'
import './assets/iconfont/iconfont.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import i18n from './language'
import { createPinia } from 'pinia'
import persist from 'pinia-plugin-persistedstate'

const app = createApp(App)

const pinia = createPinia()
pinia.use(persist)

app.use(pinia)
app.use(router)
app.use(i18n)

app.mount('#app')
