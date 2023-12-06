const app = require('./app');
const connectdb = require('./src/db');

const port = process.env.PORT || 3000;
connectdb().then(() => {
  app.listen(port, () => {
    console.log(`👻 👻  App is running at port ${port}`);
  });
});
