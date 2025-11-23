// import mongoose
import mongoose, { mongo } from "mongoose";
import { DocumentModel } from "./document.js";
import { type } from "os";

// create schema?
// const schemaName = new monggose.Schema({ fieldName: { type: String example lang } })
const requestSchema = new mongoose.Schema({
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    reference_id: {
        type: String,
        unique: true,
        required: true
    },
    documents: [
        {
            name: { type: String, required: true },
            copies: { type: Number, default: 1 },
            remarks: { type: String, default: "" },
            price: { type: Number, required: true }
        }
    ],
    purpose: {
        type: String,
        required: true
    },
    contact_number: {
        type: String,
        required: true
    },
    last_sem_attended: {
        type: String,
        required: true
    },
    semester: {
        type: String,
        required: true
    },
    date_graduated: {
        type: String,
        default: null
    }, 
    total_amount: {
        type: Number,
        required: true
    },
    request_date: {
        type: Date,
        default: Date.now,
    },
    proof_of_payment: {
        type: String,
        default: null
    },
    payment_verified_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        default: null
    },
    processing_time: {
        type: Number,
        default: null
    },
    status: {
        type: String,
        enum: ['FOR CLEARANCE', 'FOR PAYMENT', 'PROCESSING', 'FOR PICKUP', 'CLAIMED', 'CANCELLED', 'REJECTED'],
        default: 'FOR CLEARANCE'
    },
    remarks: {
        type: String,
        default: null
    },
    release_date: {
        type: Date,
        default: null
    },
    is_deleted: {
        type: Boolean,
        default: false
    }
})

// export const className = mongoose.model('collectionName', instance)
export const RequestModel = mongoose.model('Request', requestSchema)