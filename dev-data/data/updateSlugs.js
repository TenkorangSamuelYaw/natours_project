import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import mongoose from 'mongoose';
import slugify from 'slugify';
import { Tour } from './../../models/tourModels.js';
import { User } from '../../models/userModel.js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname,'./../../config.env') });

const database = process.env.DATABASE.replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(database)
  .then(async () => {
    console.log('DB connected');

    const tours = await Tour.find();

    for (const tour of tours) {
      if (!tour.slug) {
        tour.slug = slugify(tour.name, { lower: true });
        await tour.save(); // this will now include slug because we're using .save()
        console.log(`Updated slug for: ${tour.name}`);
      }
    }

    console.log('All slugs updated');
    const check = await Tour.findOne({ name: 'The Sea Explorer' });
    console.log('✅ DB slug check result:', check.slug);
    process.exit();
  })
  .catch((err) => console.error('DB connection error:', err));
