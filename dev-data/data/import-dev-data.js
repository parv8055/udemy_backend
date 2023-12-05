const fs = require('fs');
const connectdb = require('../../src/db');
const Tour = require('../../models/tourModel');

connectdb();

// node -r dotenv/config dev-data/data/import-dev-data.js --import
// node -r dotenv/config dev-data/data/import-dev-data.js --delete
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data successfully loaded');
    process.exit();
  } catch (err) {
    console.error(err);
  }
};
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data successfully deleted');
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

// console.log(process.argv[2]);

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
