import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { useSesion } from './stores/sesion'

const app = createApp(App).use(createPinia())
// Con Entra, primero se inicia sesión (o se redirige al login) y se cargan las personas registradas.
await useSesion().iniciar()
app.mount('#app')
