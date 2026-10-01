const express = require('express');
const { upload } = require('../middleware/upload');
const {
  getHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
} = require('../controllers/hotelsController');

const router = express.Router();

router.get('/', getHotels);
router.get('/:id', getHotelById);
router.post('/', upload.single('image'), createHotel);
router.put('/:id', upload.single('image'), updateHotel);
router.delete('/:id', deleteHotel);

module.exports = router;
