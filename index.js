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

import { StudentModel, StaffModel } from './models/user.js'; 

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

mongoose.connection.once('open', async () => {
    console.log('Now connected to MongoDB Atlas.');

    try {
        console.log("Syncing RFID indexes...");
        await StudentModel.syncIndexes();
        await StaffModel.syncIndexes();
        console.log("RFID indexes synced successfully!");
    } catch (err) {
        console.error("Error syncing indexes:", err);
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});