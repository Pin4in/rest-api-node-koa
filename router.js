const Router = require('koa-router');
const router = new Router();
const mongoose = require('mongoose');
const pick = require('lodash/pick');
const User = require('./models/User');

module.exports = router
  .get('/users/:id', async ctx => {
    const { id } = ctx.params;
    const user = await User.findById(id)
      .catch(err => {
        if (err.message === 'User not found' || err.name === 'CastError') {
          return ctx.throw('User not found', 404);
        }
        console.log(err); // eslint-disable-line no-console
        return ctx.throw(500);
      });

    ctx.body = user;
  })
  .get('/users/', async ctx => {
    const users = await User.find()
      .catch(err => {
        console.log(err); // eslint-disable-line no-console
        return ctx.throw(500);
      });

    if (users.length === 0) ctx.throw('Users not found', 404);

    ctx.body = users;
  })
  .post('/users/', async ctx => {
    const userObj = Object.assign({}, ctx.request.body);
    // prevent user to provide an _id field
    delete userObj._id;

    ctx.body = await User.create(userObj)
      .then(({ _id }) => _id)
      .catch(err => {
        console.log(err);
        if (err.name === 'ValidationError') {
          ctx.status = 400;
          return err;
        } else {
          ctx.throw(500);
        }
      });
  })
  .patch('/users/:id', async ctx => {
    /* eslint no-console: ["error", { allow: ["log"] }] */
    const { id } = ctx.params;
    const modifiedProperties = pick(ctx.request.body, ['email', 'displayName']);

    // check if user exists
    const updateUser = async () => {
      const user = await User.findById(id)
        .catch(err => {
          if (err.message === 'User not found' || err.name === 'CastError') {
            return ctx.throw('User not found', 404);
          }
          console.log('---find error', err); // eslint-disable-line no-console
          return ctx.throw(500);
        });
      console.log('user', user);

      const updatedUser = await User.updateOne({ _id: id }, modifiedProperties)
        .then(data => {
          if (data.nModified && data.ok) {
            return Object.assign({}, user, modifiedProperties);
          }
          ctx.throw(500);
        })
        .catch(err => {
          console.log('---update error', err); // eslint-disable-line no-console
          return ctx.throw(500);
        });
    };

    ctx.body = await updateUser()
      .catch(err => {
        console.log('---got an err', err);
        if (err.name === 'CastError') {
          return ctx.throw('User not found', 404);
        }
        return ctx.throw(500);
      })
      .then(result => {
        console.log('--- user', result);
        if (!result.nModified) ctx.throw('User not found', 404);
        return 200;
      });

    // ctx.body = updatedUser;

    // ctx.body = await User.updateOne({ _id: id }, userObj)
    //   .then((err, data) => {
    //     if (err) {
    //       console.log('---data', err);
    //       return err;
    //     }
    //     console.log('---data', data);
    //     return data;
    //   });
    //   .then(({ _id }) => _id)
    //   .catch(err => {
    //     if (err.name === 'ValidationError') {
    //       ctx.status = 400;
    //       return err;
    //     } else {
    //       ctx.throw(500);
    //     }
    //   });
  })
  .del('/users/:id', async ctx => {
    ctx.body = 'hello';
  })
  .get('/create-users/', async ctx => {
    await User.remove({});
    await User.create({ email: 'john@gmail.com', displayName: 'John' });
    await User.create({ email: 'pete@gmail.com', displayName: 'Pete' });
    await User.create({ email: 'mary@gmail.com', displayName: 'Mary' });
    ctx.body = 'created';
  })
;


// {"message": "Cast to ObjectId failed for value \"5c58c6f4d03de2ba68ee517\" at path \"_id\" for model \"User\"",
// "name":"CastError",
// "stringValue":"\"5c58c6f4d03de2ba68ee517\"",
// "kind":"ObjectId",
// "value":"5c58c6f4d03de2ba68ee517",
// "path":"_id"}