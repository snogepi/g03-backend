import { ClearanceModel } from "../models/clearance.js";
import { RequestModel } from "../models/request.js";
import { createNotification } from "./notification.js";

export async function createClearance(req, res) {
    if (req.user.role !== "staff") {
        return res.status(403).json({
            success: false,
            message: "Only staff can create clearance records."
        })
    }

    try {
        const { request_id, student_id } = req.body

        if (!request_id || !student_id) {
            return res.status(400).json({
                success: false,
                message: "Request ID and student ID are required."
            })
        }

        const existing = await ClearanceModel.findOne({ request_id, student_id })
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Clearance record already exists for this request."
            })
        }

        const newClearance = new ClearanceModel({
            request_id,
            student_id
        })

        await newClearance.save()

        res.status(201).json({
            success: true,
            message: "Clearance record created.",
            clearance: newClearance
        })
    }

    catch(error) {
        console.error("Failed to create clearance:", error)

        res.status(500).json({
            success: false,
            message: "Server error while creating clearance."
        })
    }
}

export async function verifyClearance(req, res) {
    try {
        const { id } = req.params;
        const { status, remarks } = req.body;
        const staffId = req.user.id;

        if (!status || !["CLEARED", "NOT CLEARED"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be 'CLEARED' or 'NOT CLEARED'."
            });
        }

        const updatedClearance = await ClearanceModel.findByIdAndUpdate(
            id, 
            {
                status,
                remarks: remarks || "",
                verified_by: staffId,
                verified_date: new Date()
            },
            { new: true }
        ).populate("student_id")
        .populate("request_id");

        if (!updatedClearance) {
            return res.status(404).json({
                success: false,
                message: "Clearance record not found."
            });
        }

        const requestId = updatedClearance.request_id?._id;
        const studentId = updatedClearance.student_id?._id;

        if (!requestId) {
            return res.status(404).json({
                success: false,
                message: "Linked request not found."
            });
        }

        if (status === "CLEARED") {
            const updatedRequest = await RequestModel.findByIdAndUpdate(
                requestId,
                { status: "FOR PAYMENT" },
                { new: true }
            );

            if (!updatedRequest) {
                return res.status(404).json({
                    success: false,
                    message: "Request not found when updating after clearance."
                });
            }

            createNotification(
                "Student",
                studentId,
                "Your clearance has been verified. Please proceed with payment."
            );
        } else if (status === "NOT CLEARED") {
            createNotification(
                "Student",
                studentId,
                "Your clearance was NOT approved. Please settle your obligations."
            );
        }

        res.status(200).json({
            success: true,
            message: "Clearance verified successfully.",
            clearance: updatedClearance
        });
    } catch (error) {
        console.error("Failed to verify clearance:", error); 
        res.status(500).json({
            success: false,
            message: "Server error while verifying clearance."
        });
    }
}