# joi-kit

## install

```
npm install @hapi-lib/joi-kit
```

## register

```js
server.register('@hapi-lib/joi-kit', {
  // set the message resource
  async getResources(server) {
    return {
      cn: require('@hapi-lib/joi-kit/i18n/cn.js'),
      foo: require('path/to/foo.js'),
      baz: {},
    }
  },

  // parse the language from the request
  parseLanguage(request) {
    return request.query.lang || 'en'
  },

  // assign to validate options to be used in the route
  setMixin({ server, request, options, Kit, Joi }) {
    Kit.joi = () => Joi
    options.Kit = Kit
  },
})
```

## use in router

```js
server.route({
  path: '/foo',
  method: 'POST',
  options: {
    validate: {
      payload(value, { Kit }) {
        return Kit.schema({
          username: Kit.joi().string().min(3).max(18).required(),
        })
      },
    },
  },
})
```
