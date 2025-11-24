// import mongoose
import mongoose, { mongo } from "mongoose"

// create schema?
// const schemaName = new monggose.Schema({ fieldName: { type: String example lang } })
const studentSchema = new mongoose.Schema({
    rfid_tag: {
        type: String,
        default: null,
        unique: true,
        sparse: true
    },
    student_number: {
        type: String,
        required: true,
        unique: true
    },
    first_name: {
        type: String,
        required: true
    },
    middle_name: {
        type: String,
        default: null
    },
    last_name: {
        type: String,
        required: true
    },
    extensions: {
        type: String,
        default: null
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    program: {
        type: String,
        default: null
    },
    year_level: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ["Enrolled", "Unenrolled", "Graduated", "On Leave", "Dropped"],
        default: "Enrolled"
    },
    reset_token: {
        type: String,
        default: null
    },
    reset_token_expiry: {
        type: Date,
        default: null
    }
})

const staffSchema = new mongoose.Schema({
    rfid_tag: {
        type: String,
        default: null,
        unique: true,
        sparse: true
    },
    employee_number: {
        type: String,
        required: true,
        unique: true
    },
    first_name: {
        type: String,
        required: true
    },
    middle_name: {
        type: String,
        default: null
    },
    last_name: {
        type: String,
        required: true
    },
    extensions: {
        type: String,
        default: null
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    reset_token: {
        type: String,
        default: null
    },
    reset_token_expiry: {
        type: Date,
        default: null
    }
})

// export const className = mongoose.model('collectionName', instance)
export const StudentModel = mongoose.model('Student', studentSchema)
export const StaffModel = mongoose.model('Staff', staffSchema)