import express from 'express'

import { sendNotification, viewNotification, getUnreadNotificationCount, markNotificationAsRead } from '../controllers/notification.js'
import { auth } from '../middleware/auth.js'

const router = express.Router()

router.post('/send', auth, sendNotification)

router.get('/view', auth, viewNotification)

router.get('/unread-count', auth, getUnreadNotificationCount)

router.get('/read/:id', auth, markNotificationAsRead)

export { router as notificationRoutes }