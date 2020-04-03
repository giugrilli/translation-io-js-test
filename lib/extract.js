"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.load = void 0;

var _path = require("path");

var _glob = require("glob");

var _mkdirp = _interopRequireDefault(require("mkdirp"));

var _sarcastic = _interopRequireDefault(require("sarcastic"));

var util = _interopRequireWildcard(require("./util"));

var config = _interopRequireWildcard(require("./config"));

var log = _interopRequireWildcard(require("./log"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const MINIMAL_FORMAT = _sarcastic.default.objectOf(_sarcastic.default.string);

const JSON_FORMAT = _sarcastic.default.arrayOf(_sarcastic.default.shape({
  id: _sarcastic.default.string,
  defaultMessage: _sarcastic.default.string
}));

const LINGUI_FORMAT = _sarcastic.default.objectOf(_sarcastic.default.shape({
  defaults: _sarcastic.default.maybe(_sarcastic.default.string)
}));

const normalizeId = config.normalizeIds() ? key => key.replace(/[^A-Za-z ]/g, '').replace(/ /g, '.').slice(0, 40).toLowerCase() : k => k;
const normalizeMessage = config.stripNewlines() ? message => message.replace(/\n */g, ' ') : m => m; // eslint-disable-next-line flowtype/no-weak-types

const normalize = (json, format) => {
  switch (format) {
    case 'minimal':
      return Object.keys((0, _sarcastic.default)(json, MINIMAL_FORMAT)).map(key => ({
        id: normalizeId(key),
        // when in `minimal` format, the name of the key in the source is
        // the default message
        defaultMessage: normalizeMessage(key)
      }));

    case 'lingui':
      // eslint-disable-next-line no-case-declarations
      const parsed = (0, _sarcastic.default)(json, LINGUI_FORMAT);
      return Object.keys((0, _sarcastic.default)(json, LINGUI_FORMAT)).map(key => ({
        id: normalizeId(key),
        defaultMessage: normalizeMessage(parsed[key].defaults || key)
      }));

    case 'json':
    default:
      return (0, _sarcastic.default)(json, JSON_FORMAT).map(({
        id,
        defaultMessage
      }) => ({
        id: normalizeId(id),
        defaultMessage: normalizeMessage(defaultMessage)
      }));
  }
};

const load = glob => {
  const files = (0, _glob.sync)(glob);
  const allTranslations = files.map(file => {
    try {
      const content = util.read(file);
      const json = JSON.parse(content);
      return normalize(json, config.format());
    } catch (e) {
      log.error(`Error extracting JSON from \`${file}\`: ${e.message}`);
      throw e;
    }
  }).reduce((acc, curr) => [...acc, ...curr], []);
  const obj = {};
  let error = false;
  allTranslations.forEach(t => {
    if (obj[t.id] !== undefined) {
      log.warn(`Duplicate translation keys: ${t.id}.`);
    }

    if (t.defaultMessage.includes('\n')) {
      log.error('Translations should not contain newlines. Please remove the newline.');
      log.error(`  \`${t.id}\` ("${t.defaultMessage}")`);
      error = true;
    }

    obj[t.id] = t.defaultMessage;
  });

  if (error) {
    log.error('Stopping due to errors');
    process.exit(1);
  }

  return obj;
};

exports.load = load;

var _default = () => {
  log.info('Running `extract`.');
  log.info('Extracting translations...');
  const translations = JSON.stringify(load(config.messages()), null, 2);
  log.info('Translations extracted.');
  log.info('Ensuring that the output directory exists...');

  _mkdirp.default.sync(config.output());

  log.info('Output directory exists.');
  log.info('Writing translation files...');
  config.locales().map(locale => (0, _path.join)(config.output(), `translation.${locale}.json`)).forEach(file => {
    log.verbose(`Writing \`${file}\`...`);
    util.write(file, translations);
    log.verbose(`Completed writing \`${file}\`.`);
  });
  log.info('Wrote all translation files.');
  log.info('Completed `extract`.');
  log.success('Successfully extracted translations.');
};

exports.default = _default;
