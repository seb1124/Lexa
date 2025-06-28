const express = require('express');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.send('Lexa Backend API');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});