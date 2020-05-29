const Joi = require('@hapi/joi');
const extend = require('extend');
const Boom = require('@hapi/boom');
exports.plugin = {
  pkg: require('../package.json'),
  register: async function (server, options = {}) {
    const {
      getResources = () => ({}),
      parseLanguage = () => 'en',
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
        _options: extend(true, {}, validOptions, {
          errors: {
            language,
          },
        }),
        options(options = {}) {
          extend(true, this._options, options);
          return this;
        },
        i18n(params = {}, defaultText) {
          try {
            const language = this.getLang();
            const text = params[language];
            if (!text && text !== '') {
              return defaultText;
            }
            return text;
          } catch (err) {
            return defaultText || '';
          }
        },
        setLang(language) {
          extend(true, this._options, { errors: { language } });
          return this;
        },
        getLang() {
          return this._options.errors.language;
        },
        format(params) {
          try {
            this._schema = Joi.object().keys(params);
          } catch (err) {
            throw Boom.badImplementation('the params of Kit.format is error!');
          }
          return this;
        },
        schema(params) {
          try {
            this._schema = params;
          } catch (err) {
            throw Boom.badImplementation('the params of Kit.format is error!');
          }
          return this;
        },
        validate(val) {
          const { _schema } = this;
          if (_schema) {
            const { error, value } = _schema.validate(val, this._options);
            if (error) {
              throw error;
            }
            return value;
          }
        },
      };

      setMixin({ server, request, options: validOptions, Kit, Joi, extend });

      return h.continue;
    });
  },
};
