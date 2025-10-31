const app = require('./app');
const config = require('./config');

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`🚀 Server is listening on http://localhost:${PORT}`);
});
