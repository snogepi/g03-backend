import express from 'express'

import { sendNotification, viewNotification, getUnreadNotificationCount, markNotificationAsRead, softDeleteNotification } from '../controllers/notification.js'
import { auth } from '../middleware/auth.js'

const router = express.Router()

router.post('/send', auth, sendNotification)

router.get('/view', auth, viewNotification)

router.get('/unread-count', auth, getUnreadNotificationCount)

router.put('/read/:id', auth, markNotificationAsRead)

router.put('/delete/:id', auth, softDeleteNotification)

export { router as notificationRoutes }