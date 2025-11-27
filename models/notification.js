import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    recipient_type: {
        type: String,
        enum: ['Student', 'Staff'],
        required: true
    },
    recipient_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    date_sent: {
        type: Date,
        default: Date.now
    },
    read: {
        type: Boolean,
        default: false
    }
})

export const NotificationModel = mongoose.model('Notification', notificationSchema)