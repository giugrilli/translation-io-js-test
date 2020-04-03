"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.get = exports.post = void 0;

var _querystring = _interopRequireDefault(require("querystring"));

var _axios = _interopRequireDefault(require("axios"));

var log = _interopRequireWildcard(require("./log"));

var config = _interopRequireWildcard(require("./config"));

var _const = require("./const");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const attachParams = data => _objectSpread({
  client: 'rails',
  version: '1.14',
  source_language: config.sourceLocale(),
  'target_languages[]': config.targetLocales(),
  pot_data: _const.potData
}, data);

const instance = _axios.default.create({
  baseURL: 'https://translation.io/api'
});

instance.interceptors.request.use(req => {
  const params = attachParams(req.data);
  log.verbose(`Sending request to ${req.url} with ${JSON.stringify(params, null, 2)}`);
  Object.assign(req, {
    url: `/projects/${config.apiKey()}/${req.url}`,
    data: _querystring.default.stringify(params)
  });
  return req;
});
instance.interceptors.response.use(res => {
  log.verbose(`Received response from ${res.config.url}`);
  log.verbose(`Response: ${JSON.stringify(res.data, null, 2)}`);
  return res;
}, err => {
  log.error(`Error with request to \`${err.config.url}\``);

  if (err.response) {
    const res = err.response;
    log.error(`${res.status}: ${res.statusText}`);
    log.error(JSON.stringify(res.data, null, 2));
  }

  throw err;
});

const post = (url, data) => instance.post(url, data);

exports.post = post;

const get = url => instance.get(url);

exports.get = get;