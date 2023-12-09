const app = require('./app');
const connectdb = require('./src/db');

//console.log(x);
//for the undefined kind error
process.on('uncaughtException', err => {
  console.log(err.name, err.message);
  console.log('UNHANDLED EXCEPTION! Shutting down....');
  process.exit(1);
});

const port = process.env.PORT || 3000;
let server;
connectdb().then(() => {
  server = app.listen(port, () => {
    console.log(`👻 👻  App is running at port ${port}`);
  });
});

//safety net for promise rejection
//adding a layer for unhandled rejection
process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION! Shutting down....');
  //.close method will do the all pending request and after close
  server.close(() => {
    process.exit(1);
  });
});
