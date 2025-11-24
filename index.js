import 'dotenv/config';
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import helmet from 'helmet'

import { userRoutes } from './routes/user.js'
import { requestRoutes } from './routes/request.js'
import { notificationRoutes } from './routes/notification.js'
import { clearanceRoutes } from './routes/clearance.js';
import { rfidLogRoutes } from './routes/rfid-log.js';

const app = express()

app.use(helmet())
app.use(express.json())
app.use(cors())
app.use('/user', userRoutes)
app.use('/requests', requestRoutes)
app.use('/notifications', notificationRoutes)
app.use('/clearance', clearanceRoutes)
app.use('/log', rfidLogRoutes)

mongoose.connect(process.env.MONGODB_URL)
mongoose.connection.once('open', () => console.log('Now connected to MongoDB Atlas.'))

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});