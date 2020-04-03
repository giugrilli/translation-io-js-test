"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.stripNewlines = exports.normalizeIds = exports.format = exports.locales = exports.output = exports.targetLocales = exports.sourceLocale = exports.messages = exports.apiKey = void 0;

var _fs = require("fs");

var _path = require("path");

var _sarcastic = _interopRequireDefault(require("sarcastic"));

var _args = _interopRequireDefault(require("./args"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const CONFIG_SHAPE = _sarcastic.default.shape({
  apiKey: _sarcastic.default.string,
  messages: _sarcastic.default.string,
  sourceLocale: _sarcastic.default.string,
  targetLocales: _sarcastic.default.arrayOf(_sarcastic.default.string),
  output: _sarcastic.default.string,
  // one of 'json' | 'minimal' | 'lingui'
  format: _sarcastic.default.default(_sarcastic.default.string, 'json'),
  // allow message ids to be created automatically (for Lingui)
  normalizeIds: _sarcastic.default.default(_sarcastic.default.boolean, false),
  // strip newlines - they are problematic for t.io, so we can remove them
  stripNewlines: _sarcastic.default.default(_sarcastic.default.boolean, false)
});

let config = null;

const parse = json => (0, _sarcastic.default)(JSON.parse(json), CONFIG_SHAPE, 'Config');

const load = () => {
  const configPath = _args.default.config || (0, _path.join)(process.cwd(), '.translaterc.json');
  const file = (0, _fs.readFileSync)(configPath, 'utf8');
  return parse(file);
};

const get = () => {
  if (config) {
    return config;
  }

  config = load();
  return config;
};

const apiKey = () => get().apiKey;

exports.apiKey = apiKey;

const messages = () => get().messages;

exports.messages = messages;

const sourceLocale = () => get().sourceLocale;

exports.sourceLocale = sourceLocale;

const targetLocales = () => get().targetLocales;

exports.targetLocales = targetLocales;

const output = () => get().output;

exports.output = output;

const locales = () => get().targetLocales.concat(get().sourceLocale);

exports.locales = locales;

const format = () => get().format;

exports.format = format;

const normalizeIds = () => get().normalizeIds;

exports.normalizeIds = normalizeIds;

const stripNewlines = () => get().stripNewlines;

exports.stripNewlines = stripNewlines;