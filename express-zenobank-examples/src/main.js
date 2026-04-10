const { env } = require('./lib/env');
const { createApp } = require('./app');

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
});
