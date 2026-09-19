import { createApp } from 'vue'
import { createPinia } from 'pinia'
import FloatingVue from 'floating-vue'
import App from './App.vue'
import 'floating-vue/dist/style.css'
import './style.css'

const app = createApp(App)

app.use(createPinia())
app.use(FloatingVue, {
  themes: {
    activity: {
      $extend: 'tooltip',
      placement: 'top',
      distance: 8,
      container: '#app-root',
    },
  },
})
app.mount('#app')
