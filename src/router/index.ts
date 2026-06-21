/**
 * router/index.ts
 *
 * Routes for the Equipment Reservation System (no auth, name-based booking)
 */
import { createRouter, createWebHistory } from 'vue-router/auto'
import { setupLayouts } from 'virtual:generated-layouts'
import NotFound from '@/pages/NotFound.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: setupLayouts([
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFound,
    },
    {
      path: '/',
      redirect: '/calendar/day',
    },
    {
      path: '/calendar/:viewMode?',
      name: 'Calendar',
      component: () => import('@/pages/CalendarPage.vue'),
      meta: { layout: 'SimpleSideNavigationLayout' },
    },
    {
      path: '/devices',
      name: 'Devices',
      component: () => import('@/pages/DeviceListPage.vue'),
      meta: { layout: 'SideNavigationLayout' },
    },
    {
      path: '/devices/new',
      name: 'DeviceNew',
      component: () => import('@/pages/DeviceEditPage.vue'),
      meta: { layout: 'SideNavigationLayout' },
    },
    {
      path: '/devices/:id',
      name: 'DeviceEdit',
      component: () => import('@/pages/DeviceEditPage.vue'),
      meta: { layout: 'SideNavigationLayout' },
    },
    {
      path: '/reservations/batch',
      name: 'BatchReservation',
      component: () => import('@/pages/BatchReservationPage.vue'),
      meta: { layout: 'SideNavigationLayout' },
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('@/pages/SettingsPage.vue'),
      meta: { layout: 'SideNavigationLayout' },
    },
  ]),
})

router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (!localStorage.getItem('vuetify:dynamic-reload')) {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    } else {
      console.error('Dynamic import error, reloading page did not fix it', err)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
