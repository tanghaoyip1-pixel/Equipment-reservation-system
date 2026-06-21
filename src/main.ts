/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App
 */

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

async function initApp() {
  const app = createApp(App)

  registerPlugins(app)

  app.mount('#app')
}

initApp()
