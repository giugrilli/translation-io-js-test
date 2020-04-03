"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _path = require("path");

var _sarcastic = _interopRequireDefault(require("sarcastic"));

var _mkdirp = _interopRequireDefault(require("mkdirp"));

var _extract = require("./extract");

var _args = _interopRequireDefault(require("./args"));

var config = _interopRequireWildcard(require("./config"));

var log = _interopRequireWildcard(require("./log"));

var req = _interopRequireWildcard(require("./request"));

var util = _interopRequireWildcard(require("./util"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const SOURCE_EDITS = _sarcastic.default.arrayOf(_sarcastic.default.shape({
  key: _sarcastic.default.string,
  old_text: _sarcastic.default.string,
  new_text: _sarcastic.default.string
}));

var _default = async () => {
  log.info('Running `sync`.'); // ApplyYamlSourceEditsStep

  log.info('Retrieving source edits...');
  const sourceEdits = await req.post('/source_edits', {
    timestamp: util.timestamp()
  }).then(res => (0, _sarcastic.default)(res.data.source_edits, SOURCE_EDITS, 'source_edits'));

  if (sourceEdits.length > 0) {
    log.warn('Source has been edited on `translation.io`.');
    log.warn("This is not currently supported - you'll need to manually update the keys.");
    sourceEdits.forEach(edit => {
      log.warn(`  Changed \`${edit.key}\`: Replace '${edit.old_text}' with '${edit.new_text}'`);
    });
    log.warn('You can ignore any of these that have already been updated locally');
  }

  log.info('Source edits retreived.'); // CreateYamlPotFileStep

  log.info('Loading translations from disk...');
  const translations = (0, _extract.load)(config.messages());
  log.info('Translations loaded.');
  log.info('Ensuring that the output directory exists...');

  _mkdirp.default.sync(config.output());

  log.info('Output directory exists.');
  log.info('Writing translation file for source locale.');

  const translationsNewlineFixed = {}
  for (var key of Object.keys(translations)) {
    translationsNewlineFixed[key] = translations[key].replace(/<br>/g, "\n")
  }

  util.write((0, _path.join)(config.output(), `translation.${config.sourceLocale()}.json`), JSON.stringify(translationsNewlineFixed, null, 2));
  log.info('Generating PO data for translations...');
  const potData = util.poGenerator(translations);
  log.info('PO data generated.');
  log.info('Syncing data with `translation.io`...');
  const extra = {};

  if (_args.default.purge) {
    extra.purge = 'true';
  }

  if (_args.default.readonly) {
    extra.readonly = 'true';
  }

  const data = await req.post('/sync', _objectSpread({
    yaml_pot_data: potData,
    timestamp: util.timestamp()
  }, extra)).then(res => res.data);
  log.info('Retrieved data from `translation.io`.');

  if (data.unused_segments) {
    const unusedSegments = (0, _sarcastic.default)(data.unused_segments, _sarcastic.default.arrayOf(_sarcastic.default.shape({
      msgctxt: _sarcastic.default.string,
      msgid: _sarcastic.default.string
    })), 'unused_segments');

    if (unusedSegments.length > 0) {
      log.warn("You have unused segments. You should make sure these aren't used anywhere else before you remove them.");
      unusedSegments.forEach(seg => {
        log.warn(`  - \`${seg.msgctxt}\` ('${seg.msgid}') is unused.`);
      });
    }
  }

  log.info('Writing received translations to disk...');
  config.targetLocales().forEach(locale => {

    const poData = data[`yaml_po_data_${locale}`];

    if (typeof poData !== 'string') {
      log.warn(`Didn't get any translations from the server for ${locale}.`);
      return;
    }

    const translations = util.parsePoData(poData)

    const translationsNewlineFixed = {}
    for (var key of Object.keys(translations)) {
      translationsNewlineFixed[key] = translations[key].replace(/<br>/g, "\n")
    }

    util.write((0, _path.join)(config.output(), `translation.${locale}.json`), JSON.stringify(translationsNewlineFixed, null, 2));
  });
  log.info('Translations written do disk.');
  log.success('Successfully completed sync.');
};

exports.default = _default;
