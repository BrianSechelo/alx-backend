import express from 'express';
import redis from 'redis';
import { promisify } from 'util';
import kue from 'kue';

// Initialize Redis and Kue queue
const client = redis.createClient();
const queue = kue.createQueue();

// Promisify Redis get function
const getAsync = promisify(client.get).bind(client);

// Set initial seats and reservation status
let reservationEnabled = true;
const DEFAULT_SEATS = 50;

// Reserve seats in Redis
function reserveSeat(number) {
  client.set('available_seats', number);
}

// Get the current number of available seats
async function getCurrentAvailableSeats() {
  const seats = await getAsync('available_seats');
  return parseInt(seats, 10);
}

// Initialize available seats to 50 on server start
reserveSeat(DEFAULT_SEATS);

// Create Express app
const app = express();
const port = 1245;

// Route to get the number of available seats
app.get('/available_seats', async (req, res) => {
  const availableSeats = await getCurrentAvailableSeats();
  res.json({ numberOfAvailableSeats: availableSeats });
});

// Route to reserve a seat
app.get('/reserve_seat', (req, res) => {
  if (!reservationEnabled) {
    return res.json({ status: 'Reservation are blocked' });
  }

  const job = queue.create('reserve_seat').save((err) => {
    if (err) {
      return res.json({ status: 'Reservation failed' });
    }
    return res.json({ status: 'Reservation in process' });
  });

  // Log job completion or failure
  job.on('complete', () => {
    console.log(`Seat reservation job ${job.id} completed`);
  });
  
  job.on('failed', (err) => {
    console.log(`Seat reservation job ${job.id} failed: ${err}`);
  });
});

// Route to process the queue
app.get('/process', (req, res) => {
  res.json({ status: 'Queue processing' });

  // Process reservation jobs
  queue.process('reserve_seat', async (job, done) => {
    const availableSeats = await getCurrentAvailableSeats();

    if (availableSeats <= 0) {
      reservationEnabled = false;
      return done(new Error('Not enough seats available'));
    }

    // Decrease available seats by 1
    reserveSeat(availableSeats - 1);

    if (availableSeats - 1 === 0) {
      reservationEnabled = false;
    }

    return done();
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

