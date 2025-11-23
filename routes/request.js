import express from 'express';
import { auth } from '../middleware/auth.js';

import {
  createRequest,
  viewRequest,
  viewMyRequests,
  viewRequests,
  updateMyRequest,
  updateRequest,
  deleteRequest,
  getRequestCounts
} from '../controllers/request.js';

const router = express.Router();

// ---------------------------------
// STAFF ROUTES
// ---------------------------------
router.get('/requestcounts', auth, getRequestCounts);       
router.get('/viewrequests', auth, viewRequests);            
router.put('/updaterequest/:id', auth, updateRequest);      
router.delete('/deleterequest/:id', auth, deleteRequest);   

// ---------------------------------
// STUDENT ROUTES
// ---------------------------------
router.post('/createrequest', async (req, res) => {         
  const newRequest = await createRequest(req.body);
  res.json({ isAdded: { request: newRequest } });
});

router.get('/viewrequest/:id', auth, viewRequest);          
router.put('/updatemyrequest/:id', auth, updateMyRequest);  
router.get('/:id', auth, viewMyRequests);                  

export { router as requestRoutes };
