import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as labsComponents from 'vuetify/labs/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'

export default createVuetify({
  components: {
    ...components,
    ...labsComponents
  },
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi }
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#3949AB',
          secondary: '#00ACC1',
          accent: '#FF6D00',
          error: '#D32F2F',
          info: '#0288D1',
          success: '#388E3C',
          warning: '#F57C00',
          background: '#F3F4F6',
          surface: '#FFFFFF'
        }
      },
      dark: {
        colors: {
          primary: '#7986CB',
          secondary: '#4DD0E1',
          accent: '#FF6D00',
          background: '#111827',
          surface: '#1F2937'
        }
      }
    }
  },
  defaults: {
    VBtn: { rounded: 'lg', style: 'text-transform: none; font-weight: 500;' },
    VCard: { rounded: 'lg', elevation: 1 },
    VTextField: { variant: 'outlined', density: 'comfortable', hideDetails: 'auto' },
    VSelect: { variant: 'outlined', density: 'comfortable', hideDetails: 'auto' },
    VTextarea: { variant: 'outlined', density: 'comfortable', hideDetails: 'auto' }
  }
})
