import { NotificationModel } from "../models/notification.js";

export async function sendNotification(req, res) {
    try {
        if (req.user.role !== "staff") {
            return res.status(403).json({
                success: false,
                message: "Only staff can send notifications."
            })
        }

        const { recipient_type, recipient_id, message } = req.body

        if (!recipient_type  || !recipient_id || !message) {
            return res.status(400).json({
                success: false,
                message: "Recipient type, recipient id, and message are required."
            })
        }

        const newNotification = new NotificationModel({
            recipient_type,
            recipient_id,
            message
        })

        await newNotification.save()

        res.status(201).json({
            success: true,
            message: "Notification sent successfully.",
            notification: newNotification
        })
    }

    catch(error) {
        console.error("Failed to send notification:", error)
        res.status(500).json({
            success: false,
            message: "Server error while sending notification."
        })
    }
}

export async function viewNotification(req, res) {
    try {
        const { id, role } = req.user

        const recipientType = role.toLowerCase() === "student" ? "Student" : "Staff";

        const notifications = await NotificationModel.find({
            recipient_type: recipientType,
            recipient_id: id
        }).sort({ date_sent: -1 })

        res.status(200).json({
            success: true,
            notifications
        })
    }

    catch(error) {
        console.error("Failed to fetch notifications:", error)
        res.status(500).json({
            success: false,
            message: "Server error while fetching notifications."
        })
    }
}

export async function createNotification(recipient_type, recipient_id, message) {
  try {
    console.log(`Creating notification: type=${recipient_type}, id=${recipient_id}, message=${message}`);
    const newNotification = new NotificationModel({
      recipient_type: recipient_type,
      recipient_id: recipient_id,
      message: message,
      date_sent: new Date()
    });
    await newNotification.save();
    console.log('Notification saved successfully!');
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}