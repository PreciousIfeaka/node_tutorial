const express = require('express');

const app = express();

function timeDelay(duration) {
  const startTime = Date.now();
  while (Date.now() - startTime < duration) {
  }
} 

app.get('/', (req, res) => {
  res.send(`New process id: ${process.pid}`);
});

app.get('/timer', (req, res) => {
  timeDelay(3000);
  res.send(`New Process id: ${process.pid}`);
});

console.log("Worker process started.")
console.log("This is the worker");
app.listen(3000);