const path = require('path');

module.exports = {
  port: process.env.PORT || 3000,
  secret: 'mysecret',
  root: process.cwd(),
  templatesRoot: path.join(process.cwd(), 'templates'),
  mongodb: {
    uri: 'mongodb://localhost/users_app'
  }
};
