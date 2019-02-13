const Router = require('koa-router');
const mongoose = require('./libs/mongoose');
const pick = require('lodash/pick');
const User = require('./models/User');

const router = new Router({
  prefix: '/users'
});


const loadById = async (ctx, next) => {
  const { id } = ctx.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    ctx.throw(404);
  }

  ctx.userById = await User.findById(id);

  if (!ctx.userById) {
    ctx.throw(404, 'user not found');
  }

  await next();
};

async function handleValidationError(ctx, next) {
  try {
    await next();
  } catch (err) {
    if (err.name == 'ValidationError') {
      ctx.status = 400;

      const errors = {};

      for (const field in err.errors) {
        if (err.errors.hasOwnProperty(field)) {
          errors[field] = err.errors[field].message;
        }
      }

      ctx.body = {
        errors: errors
      };
    } else {
      throw err;
    }
  }
}


module.exports = router
  .get('/', async ctx => {
    const users = await User.find()
      .catch(err => {
        console.log(err); // eslint-disable-line no-console
        return ctx.throw(500);
      });

    if (users.length === 0) ctx.throw('Users not found', 404);

    ctx.body = users.map(user => user.serialize());
  })
  .get('/:id', loadById, async ctx => {
    ctx.body = ctx.userById.serialize();
  })
  .post('/', handleValidationError, async ctx => {
    const user = await User.create(pick(ctx.request.body, User.publicFields));
    ctx.body = user.serialize();
  })
  .patch('/:id', loadById, handleValidationError, async ctx => {
    Object.assign(ctx.userById, pick(ctx.request.body, User.publicFields));
    await ctx.userById.save();

    ctx.body = ctx.userById.serialize();
  })
  .del('/:id', loadById, async ctx => {
    await ctx.userById.delete();
    ctx.body = 'Ok';
  })
;
