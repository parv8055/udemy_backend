const dotenv = require('dotenv');
const app = require('./app');
const connectdb = require('./src/db');

dotenv.config({ path: './config.env' });

const port = process.env.PORT || 3000;
connectdb().then(() => {
  app.listen(port, () => {
    console.log(`😇 App is running at port ${port}`);
  });
});
