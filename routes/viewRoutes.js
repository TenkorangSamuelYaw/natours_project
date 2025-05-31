import express from 'express';
import { getOverview, getTour } from './../controllers/viewsController.js';

const router = express.Router();

router.route('/').get(getOverview);
router.route('/tour').get(getTour);


export default router;