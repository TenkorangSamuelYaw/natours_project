import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });

// Unhandled exceptions here
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED EXCEPTION 🔥\nShutting down...');
  process.exit(1);
});

import app from './app.js';

const port = process.env.PORT || 3000;
// CONNECT TO THE DATABASE HERE
const database = process.env.DATABASE.replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD,
);
const connectDatabase = async () => {
  try {
    const connection = await mongoose.connect(database);
    // console.log(connection.connections);
    console.log('DB connection successful');
  } catch (error) {
    console.log('DB connection failed: ', error.message);
  }
};

connectDatabase();

const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

const unhandledErrors = (err) => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
};

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION 🔥\nShutting down...');
  unhandledErrors(err);
});
