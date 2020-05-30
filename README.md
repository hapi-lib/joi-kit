# joi-kit

[validate options](https://github.com/hapijs/joi/blob/master/API.md#anyvalidatevalue-options)

## install

```
npm install @hapi-lib/joi-kit
```

## register

```js
server.register('@hapi-lib/joi-kit', {
  // get the message resource
  async getMessages(server) {
    return {
      cn: require('@hapi-lib/joi-kit/i18n/cn.js'),
      zh: require('path/to/zh.js'),
    };
  },

  // will be used as the resource of kit().t(/* 'username' */)
  async getResources(server) {
    return {
      zh: {
        username: '用户名'
      },
      en: {
        username: 'user name'
      }
    }
  }

  // parse the language from the request
  parseLanguage: (request) => 'en',

  // assign to validate options to be used in the route
  // the options is the validate options
  setMixin({ server, request, options, Joi, kit, extend }) {
    options.Joi = Joi;
    options.kit = kit;
    // you can also assign other data to the options or request
  },
});
```

## use in router

```js
server.route({
  path: '/foo',
  method: 'POST',
  options: {
    validate: {
      payload: (value, { kit }) =>
        kit()
          // kit.options set joi validate options, it is not for the joi-kit plugin
          .options({
            // errors: {
            //   wrap: {
            //     label: '^',
            //   },
            // },
          })

          // use params for object
          // or use schema for a Joi schema, as:
          // .schema(Joi.objects().keys({
          //   username: Joi.string().min(3).max(18).required(),
          // }))
          .params({
            username: Joi.string()
              .min(3)
              .max(18)
              .required()
              .label(kit().t('username')),
          })
          .validate(value),
    },
  },
});
```

## default options for the plugin

```js
const defaultOptions = {
  getResources = () => ({}),
  parseLanguage = (request) => 'en',
  setMixin = ({ options, Kit, Joi }) => {
    options.Kit = Kit;
    options.Joi = Joi;
  }
}
```
