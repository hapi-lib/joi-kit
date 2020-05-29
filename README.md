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
  async getResources(server) {
    return {
      cn: require('@hapi-lib/joi-kit/i18n/cn.js'),
      foo: require('path/to/foo.js'),
      baz: {},
    };
  },

  // parse the language from the request
  parseLanguage: (request) => 'en',

  // assign to validate options to be used in the route
  // the options is the validate options
  setMixin({ server, request, options, Kit, Joi, extend }) {
    options.Joi = Joi;
    options.Kit = Kit;
    // you can also assign other data to the options
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
      payload(value, { Kit }) {
        return (
          Kit

            // kit.options set joi validate options, it is not for the joi-kit plugin
            .options({
              // errors: {
              //   wrap: {
              //     label: '^',
              //   },
              // },
            })

            // use format for object
            // or use schema for a Joi schema, as:
            // .schema(Joi.objects().keys({
            //   username: Joi.string().min(3).max(18).required(),
            // }))
            .format({
              username: Joi.string()
                .min(3)
                .max(18)
                .required()
                .label(
                  // auto use the correct i18n source provided through Kit.i18n()
                  // and the second params is the default text when can not match the corresponding language
                  Kit.i18n({ cn: '用户名' }, 'username')
                ),
            })
        );
      },
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
