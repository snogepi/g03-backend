import { StudentModel, StaffModel } from '../models/user.js'
import { RequestModel } from '../models/request.js'
import { RFIDLogModel } from '../models/rfid-log.js'
import { createNotification } from './notification.js'

export async function scanRFID(req, res) {
    try {
        const { rfid_tag, request_id } = req.body

        if (!rfid_tag || !request_id) {
            return res.status(400).json({
                success: false,
                message: "RFID tag and request id are required."
            })
        }

        let user = await StudentModel.findOne({ rfid_tag })
        let userType = "Student"

        if (!user) {
            user = await StaffModel.findOne({ rfid_tag })
            userType = user ? "Staff" : null
        }

        if (!userType) {
            return res.status(404).json({
                success: false,
                message: "RFID Not Registered – Manual Verification Required."
            })
        }

        const request = await RequestModel.findById(request_id)
            .populate("student_id")

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Request not found."
            })
        }

        let action = "CLAIM"

        if (userType === "Student") {
            if (request.student_id._id.toString() !== user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "This request does not belong to this student."
                })
            }

            if (request.status !== "FOR PICKUP") {
                return res.status(403).json({
                    success: false,
                    message: "This request is not ready for claiming."
                })
            }
        }

        if (userType === "Staff") {
            action = "OVERRIDE"
        }

        request.status = "CLAIMED"
        request.release_date = new Date()
        await request.save()

        const log = new RFIDLogModel({
            rfid_tag,
            request_id,
            user_type: userType,
            action
        })

        await log.save()

        createNotification(
            "Student",
            request.student_id._id,
            "You have successfully claimed your document."
        )

        return res.status(200).json({
            success: true,
            message: "Request successfully claimed."
        })
    }

    catch(error) {
        console.error("RFID scan error:", error)
        return res.status(500).json({
            success: false,
            message: "Server error during RFID scan."
        })
    }
}