import { RequestModel } from "../models/request.js";
import { ClearanceModel } from "../models/clearance.js";
import { createNotification } from "./notification.js";

async function generateReferenceId() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); 
    const day = String(now.getDate()).padStart(2, '0'); 
    const dateStr = `${year}-${month}${day}`; 
    
    const lastRequest = await RequestModel.findOne({
        reference_id: { $regex: `^${dateStr}-` }
    }).sort({ reference_id: -1 }); 
    let counter = 1; 
    if (lastRequest) {
        
        const lastCounter = parseInt(lastRequest.reference_id.split('-')[2], 10);
        counter = lastCounter + 1;
    }
   
    const counterStr = String(counter).padStart(5, '0');
    return `${dateStr}-${counterStr}`; 
}

// ---------------------------------
// STUDENT
// ---------------------------------

// new req
export async function createRequest(body) {
  try {
    if (
      !body.student_id ||
      !body.documents ||
      !Array.isArray(body.documents) ||
      body.documents.length === 0 ||
      !body.purpose ||
      !body.contact_number ||
      !body.last_sem_attended ||
      !body.semester ||
      body.total_amount == null ||
      typeof body.total_amount !== 'number'
    ) {
      throw new Error("Missing or invalid required fields. Ensure documents is an array, and total_amount is a number.");
    }

    for (const doc of body.documents) {
      if (!doc.name || typeof doc.price !== 'number') {
        throw new Error("Each document must have a name and a numeric price.");
      }
    }

    body.reference_id = await generateReferenceId();

    const request = new RequestModel(body);
    const saved = await request.save();
    return saved;
  } catch (err) {
    console.error("Error creating request:", err);
    throw err;
  }
}

export async function viewRequest(req, res) { // working!
  try {
    const { id } = req.params;

    const request = await RequestModel.findById(id)
      .populate("student_id");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found."
      });
    }

    return res.status(200).json({
      success: true,
      request
    });
  } catch (error) {
    console.error("Failed to fetch request: ", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching request."
    });
  }
}

export async function viewMyRequests(req, res) {
  try {
    const studentId = req.params.id;

    if (req.user.role === "Student" && studentId !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own requests."
      });
    }

    const requests = await RequestModel.find({ student_id: studentId, is_deleted: false })
      .sort({ request_date: -1 });
    res.status(200).json({
      success: true,
      requests: requests || []
    });
  } catch (error) {
    console.error("Failed to fetch student's requests:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching requests."
    });
  }
}

export async function updateMyRequest(req, res) {
  try {
    const { id } = req.params;

    const request = await RequestModel.findById(id);
    if (!request || request.is_deleted) {
      return res.status(404).json({
        success: false,
        message: "Request not found or has been deleted."
      });
    }

    if (request.student_id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own requests."
      });
    }

    if (request.status !== "FOR CLEARANCE" && request.status !== "FOR PAYMENT") {
      return res.status(400).json({
        success: false,
        message: "Cannot update request after payment. Please submit a new request."
      });
    }

    const { documents, purpose, contact_number, last_sem_attended, semester, total_amount, status } = req.body;

    const updateData = {};

    if (documents !== undefined) {
      if (!Array.isArray(documents) || documents.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Documents must be a non-empty array."
        });
      }
      updateData.documents = documents;
    }
    if (purpose !== undefined) updateData.purpose = purpose;
    if (contact_number !== undefined) updateData.contact_number = contact_number;
    if (last_sem_attended !== undefined) updateData.last_sem_attended = last_sem_attended;
    if (semester !== undefined) updateData.semester = semester;
    if (total_amount !== undefined && typeof total_amount === 'number') updateData.total_amount = total_amount;
    if (status !== undefined) {
        if (status === 'CANCELLED' && (request.status === 'FOR CLEARANCE' || request.status === 'FOR PAYMENT')) {
            updateData.status = status;
        } else {
            return res.status(400).json({
                success: false,
                message: "You can only cancel requests in 'FOR CLEARANCE' or 'FOR PAYMENT' status."
            })
        }
    }

    const updatedRequest = await RequestModel.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json({
      success: true,
      message: "Request updated successfully.",
      request: updatedRequest
    });
  } catch (error) {
    console.error("Failed to update request:", error);
    res.status(500).json({
      success: false,
      message: "Server error during update."
    });
  }
}

// ---------------------------------
// STAFF
// ---------------------------------

// get all reqs
export async function viewRequests(req, res) { // working!
  try {
    const requests = await RequestModel.find()
      .populate('student_id');

    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch all requests.',
      error: error.message
    });
  }
}

// update reqs (staff ONLY)
export async function updateRequest(req, res) { // working!
  try {
    const { id } = req.params;

    const existingRequest = await RequestModel.findById(id)
    if (!existingRequest || existingRequest.is_deleted) {
        return res.status(404).json({
            success: false,
            message: "Request not found or has been deleted."
        })
    }
    const {
      status,
      remarks,
      processing_time,
      release_date,
      proof_of_payment,
      payment_verified_by,
    } = req.body;

    const updateData = {};

    if (status) updateData.status = status;
    if (remarks !== undefined) updateData.remarks = remarks;
    if (processing_time !== undefined) updateData.processing_time = processing_time;
    if (release_date !== undefined) updateData.release_date = release_date;
    if (proof_of_payment !== undefined) updateData.proof_of_payment = proof_of_payment;
    if (payment_verified_by !== undefined) updateData.payment_verified_by = payment_verified_by;

    const updatedRequest = await RequestModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .populate("student_id")
      .populate("payment_verified_by");

    if (!updatedRequest) {
      return res.status(404).json({
        success: false,
        message: "Request not found."
      });
    }

    if (status === "FOR CLEARANCE") {
      createNotification(
        "Student",
        updatedRequest.student_id._id,
        "Your request is now pending. Please wait for clearance verification."
      );
    } else if (status === "FOR PAYMENT") {
      createNotification(
        "Student",
        updatedRequest.student_id._id,
        "Your request is now pending. Please wait for payment verification."
      );
    } else if (status === "PROCESSING") {
      createNotification(
        "Student",
        updatedRequest.student_id._id,
        "Your request is now being processed. Please wait for a message when it is ready for pickup."
      );
    } else if (status === "FOR PICKUP") {
      createNotification(
        "Student",
        updatedRequest.student_id._id,
        "Your document/s is/are ready for pickup!"
      );
    } else if (status === "CLAIMED") {
      createNotification(
        "Student",
        updatedRequest.student_id._id,
        "You have successfully claimed your document/s."
      );
    } else if (status === "REJECTED") {
      createNotification(
        "Student",
        updatedRequest.student_id._id,
        "Your request has been rejected. Please check the remarks for more details."
      );
    }

    res.status(200).json({
      success: true,
      message: "Request updated successfully.",
      request: updatedRequest
    });

  } catch (error) {
    console.error("Failed to update request:", error);
    res.status(500).json({
      success: false,
      message: "Server error during update."
    });
  }
}

// ---------------------------------
// BOTH
// ---------------------------------

export async function deleteRequest(req, res) {
  try {
    const { id } = req.params;

    const request = await RequestModel.findById(id);
    if (!request || request.is_deleted) {
      return res.status(404).json({
        success: false,
        message: "Request not found or already deleted."
      });
    }

    if (request.student_id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own requests."
      });
    }

    await RequestModel.findByIdAndUpdate(id, { is_deleted: true });

    res.status(200).json({
      success: true,
      message: "Request deleted successfully."
    });

  } catch (error) {
    console.error("Failed to delete request:", error);
    res.status(500).json({
      success: false,
      message: "Server error during deletion."
    });
  }
}