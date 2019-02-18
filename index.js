const app = require('./app');
const config = require('config');

app.listen(config.get('port'), () => {
  console.log('App is running on http://localhost:3000'); // eslint-disable-line no-console
});
