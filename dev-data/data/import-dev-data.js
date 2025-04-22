import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { Tour } from './../../models/tourModels.js' // Tour model from the database
import mongoose from 'mongoose';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname,'./../../config.env') });

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

// READ JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/./tours.json`, 'utf-8'));

// IMPORT DATA INTO THE DATABASE
const importData = async () => {
    try {
        await Tour.create(tours); // Each object in the tours array is treated as a document
        console.log('Data successfully loaded');
    } catch (error) {
        console.log(error);
    }

    process.exit();
};

// DELETE ALL DATA FROM DATABASE
const deleteData = async () => {
    try {
        await Tour.deleteMany();
        console.log('Data successfully deleted');
    } catch (error) {
        console.log(error);
    }

    process.exit();
};

if (process.argv[2] === '--import') {
    importData();
} else if(process.argv[2] === '--delete') {
    deleteData();
}

console.log(process.argv);

