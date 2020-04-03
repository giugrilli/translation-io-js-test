"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _path = require("path");

var _sarcastic = _interopRequireDefault(require("sarcastic"));

var log = _interopRequireWildcard(require("./log"));

var req = _interopRequireWildcard(require("./request"));

var util = _interopRequireWildcard(require("./util"));

var config = _interopRequireWildcard(require("./config"));

var _extract = require("./extract");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const RESPONSE_SHAPE = _sarcastic.default.shape({
  project_name: _sarcastic.default.string,
  project_url: _sarcastic.default.string
});

var _default = () => {
  log.info('Running `init`.');
  log.info('Loading translations from disk...');
  const translations = (0, _extract.load)(config.messages());
  log.info('Translations loaded.');
  log.info('Generating PO data for translations...');
  const potData = util.poGenerator(translations);
  const params = config.targetLocales().map(locale => ({
    [`yaml_po_data_${locale}`]: potData
  })).reduce((acc, curr) => _objectSpread({}, acc, curr), {});
  log.info('PO data generated.');
  log.info('Posting payload to `translation.io/init`');
  req.post('/init', params).then(res => {
    log.info('Request made. Processing...');
    const {
      data
    } = res;
    const knownData = (0, _sarcastic.default)(data, RESPONSE_SHAPE, 'init_response');
    log.info('Writing received translations to disk...'); // now we need to save the data that has come back

    const object = (0, _sarcastic.default)(data, _sarcastic.default.objectOf(_sarcastic.default.string), 'init_response');
    config.targetLocales().forEach(locale => {
      const poData = object[`yaml_po_data_${locale}`];

      if (poData) {
        util.write((0, _path.join)(config.output(), `translation.${locale}.json`), JSON.stringify(util.parsePoData(poData), null, 2));
      }
    });
    log.info('Written translations to disk.');
    log.success(`Successfully initialised project \`${knownData.project_name}\` at ${knownData.project_url}`);
  }).catch(() => {
    log.error('Failed to initialize project');
  });
};

exports.default = _default;