/**
 * plugins/vuetify.ts
 *
 * Tohoku University (東北大学) theme — 紫紺 (Shikon) palette
 */

import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'

// Tohoku University 紫紺 color palette
export const tohokuTheme = {
  dark: false,
  colors: {
    background: '#FAFAFA',
    surface: '#FFFFFF',
    'surface-bright': '#FFFFFF',
    'surface-light': '#F5F4F7',
    'surface-variant': '#EDEAF0',
    'on-surface-variant': '#4A4458',
    primary: '#582B82',
    'primary-darken-1': '#3D1A5F',
    'primary-lighten-1': '#7B52AB',
    secondary: '#8B7355',
    'secondary-darken-1': '#6B5840',
    error: '#C62828',
    info: '#5C6BC0',
    success: '#2E7D32',
    warning: '#E65100',
  },
  variables: {
    'border-color': '#1A1A1A',
    'border-opacity': 0.08,
    'high-emphasis-opacity': 0.87,
    'medium-emphasis-opacity': 0.60,
    'disabled-opacity': 0.38,
    'idle-opacity': 0.04,
    'hover-opacity': 0.06,
    'focus-opacity': 0.10,
    'selected-opacity': 0.08,
    'activated-opacity': 0.12,
    'pressed-opacity': 0.12,
    'dragged-opacity': 0.08,
    'theme-kbd': '#212529',
    'theme-on-kbd': '#FFFFFF',
    'theme-code': '#F5F5F5',
    'theme-on-code': '#000000',
  },
}

export default createVuetify({
  theme: {
    defaultTheme: 'tohokuTheme',
    themes: { tohokuTheme },
  },
  defaults: {
    VCard: {
      elevation: 1,
      rounded: 'lg',
    },
    VBtn: {
      rounded: 'lg',
    },
    VChip: {
      rounded: 'lg',
    },
    VAppBar: {
      elevation: 0,
    },
    VNavigationDrawer: {
      elevation: 0,
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
    },
    VTextarea: {
      variant: 'outlined',
      density: 'comfortable',
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
    },
  },
})
