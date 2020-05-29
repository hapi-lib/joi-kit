const Joi = require('@hapi/joi');
const extend = require('extend');

exports.plugin = {
  pkg: require('./package.json'),
  register: async function (server, options = {}) {
    const {
      getResources = () => ({}),
      parseLanguage = (request) => request.query.lang,
      setMixin = ({ options, Kit, Joi }) => {
        Kit.joi = () => Joi;
        options.Kit = Kit;
        options.Joi = Joi;
      },
    } = options;

    Joi.assert(getResources, Joi.function().label('setMixin arguments'));
    Joi.assert(parseLanguage, Joi.function().label('setMixin arguments'));
    Joi.assert(setMixin, Joi.function().label('setMixin arguments'));

    const Resources = await getResources(server);

    server.ext('onPostAuth', (request, h) => {
      const validOptions = request.route.settings.validate.options;
      validOptions.messages = Resources;
      const language = parseLanguage(validOptions);

      const Kit = {
        _language: null,
        _schema: null,
        schema(params) {
          this._schema = Joi.object().keys(params);
          return this;
        },
        validate(val, options) {
          const { _schema } = this;
          if (_schema) {
            const { error } = _schema.validate(
              val,
              extend(
                true,
                {},
                validOptions,
                {
                  errors: {
                    language,
                  },
                },
                options
              )
            );
            if (error) {
              throw error;
            }
          }
        },
      };

      setMixin({ server, request, options: validOptions, Kit, Joi, extend });

      return h.continue;
    });
  },
};
