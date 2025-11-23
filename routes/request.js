import express from 'express'
import { auth } from '../middleware/auth.js' 

import { createRequest, viewRequest, viewMyRequests, viewRequests, updateMyRequest, updateRequest, deleteRequest, getRequestCounts } from '../controllers/request.js'

const router = express.Router();

// ---------------------------------
// STUDENT
// ---------------------------------

router.post('/createrequest', async(req, res) => { // working!
    const newRequest = await createRequest(req.body);
    res.json({
        isAdded: {
            request: newRequest
        }
    });
})

router.get('/viewrequest/:id', auth, viewRequest)

router.get('/:id', auth, viewMyRequests)

router.put('/updatemyrequest/:id', auth, updateMyRequest)

// ---------------------------------
// STAFF
// ---------------------------------

router.get('/viewrequests', auth, viewRequests) // working!

router.put('/updaterequest/:id', auth, updateRequest) // working!

router.get('/requestcounts', auth, getRequestCounts)

router.delete('/deleterequest/:id', auth, deleteRequest) // working!

// router.put('/exportrequests', exportRequests)

export { router as requestRoutes }