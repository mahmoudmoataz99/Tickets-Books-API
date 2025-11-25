const express = require('express');
const router = express.Router();
const Booking = require('../Models/BookingModel');
const Event = require('../Models/EventModel');
const User = require('../Models/UserModel');

// Get all bookings
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('eventId', 'name date time location')
      .populate('userId', 'name email');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new booking
router.post('/create', async (req, res) => {
  const { eventId, userId, seats } = req.body;
  
  try {
    // Validate input
    if (!eventId || !userId || !seats) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check available seats
    if (event.availableSeats < seats) {
      return res.status(400).json({ 
        message: `Only ${event.availableSeats} seats available` 
      });
    }

    // Create booking
    const booking = new Booking({
      eventId,
      userId,
      date: event.date,
      time: event.time,
      location: event.location,
      price: event.price * seats,
      seats,
      categories: event.categories
    });

    // Update event's available seats
    event.availableSeats -= seats;
    await event.save();
    
    const savedBooking = await booking.save();
    
    res.status(201).json(savedBooking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/checkBook/:userId/:eventId', async (req, res) => {
 const { userId, eventId } = req.params;

 try {
   const existingBooking = await Booking.findOne({ userId, eventId });

   if (existingBooking) {
     return res.json({ exists: true }); // Indicates booking exists
   } else {
     return res.json({ exists: false }); // Indicates no booking
   }
 } catch (err) {
   return res.status(500).json({ message: err.message });
 }
});

// Get bookings by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.userId })
      .populate('eventId', 'name date time location image');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single booking by ID
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('eventId')
      .populate('userId');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Cancel a booking
router.put('/cancel/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Return seats to event
    const event = await Event.findById(booking.eventId);
    event.availableSeats += booking.seats;
    await event.save();
    
    // Update booking status
    booking.status = 'cancelled';
    await booking.save();
    
    res.json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;