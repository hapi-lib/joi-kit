const Joi = require('@hapi/joi');
const extend = require('extend');
const Boom = require('@hapi/boom');
exports.plugin = {
  pkg: require('../package.json'),
  register: async function (server, options = {}) {
    const {
      getMessages = () => ({}),
      getResources = () => ({}),
      parseLanguage = (request) => request.query.lang || 'en',
      setMixin = ({ options, Joi, kit }) => {
        options.Joi = Joi;
        options.kit = kit;
      },
    } = options;

    Joi.assert(getMessages, Joi.function().label('getMessages arguments'));
    Joi.assert(getResources, Joi.function().label('getResources arguments'));
    Joi.assert(parseLanguage, Joi.function().label('parseLanguage arguments'));
    Joi.assert(setMixin, Joi.function().label('setMixin arguments'));

    const messages = await getMessages(server);
    const resources = await getResources(server);

    server.ext('onPostAuth', (request, h) => {
      const validOptions = request.route.settings.validate.options;
      validOptions.messages = messages;
      const language = parseLanguage(request);

      class Joikit {
        constructor() {
          this._options = extend(true, {}, validOptions, {
            errors: {
              language,
            },
          });
          this._language = language;
          this._schema = null;
          this._resources = resources;
        }
        options(options = {}) {
          extend(true, this._options, options);
          return this;
        }
        setLang(language) {
          extend(true, this._options, { errors: { language } });
          return this;
        }
        getLang() {
          return this._options.errors.language;
        }
        joi() {
          return Joi;
        }
        t(key) {
          const lang = this.getLang();
          const source = this._resources[lang];
          if (!source) {
            throw Boom.badImplementation(
              `the resources for joi-kit of ${lang} unexists`
            );
          } else {
            const result = source[key];
            if (!result && result !== '') {
              return key;
            }
            return result;
          }
        }
        params(params) {
          try {
            this._schema = Joi.object().keys(params);
          } catch (err) {
            throw Boom.badImplementation(
              'the params of KiJoik#params is error!'
            );
          }
          return this;
        }

        schema(params) {
          try {
            this._schema = params;
          } catch (err) {
            throw Boom.badImplementation('the params of Kit.#schema is error!');
          }
          return this;
        }
        validate(val) {
          const { _schema } = this;
          if (_schema) {
            const { error, value } = _schema.validate(val, this._options);
            if (error) {
              throw error;
            }
            return value;
          }
        }
        exec(callback = {}) {
          const { error } = Joi.function().validate(callback);
          if (error) {
            throw Boom.badImplementation('the params of Kit.#schema is error!');
          } else {
            callback({ server, request, options: this._options });
          }
          return this;
        }
      }

      const instances = {};
      const kit = (id = 'default') => {
        const instance = instances[id];
        if (instance) {
          return instance;
        }
        return (instances[id] = new Joikit());
      };
      setMixin({
        server,
        request,
        options: validOptions,
        kit,
        Joi,
        Joikit,
        extend,
      });

      return h.continue;
    });
  },
};
