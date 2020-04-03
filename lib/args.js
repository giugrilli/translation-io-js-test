"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _commander = _interopRequireDefault(require("@deecewan/commander"));

var _package = _interopRequireDefault(require("../package.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const increaseVerbosity = (v, total) => total + 1;

const res = _commander.default.version(_package.default.version, '-v, --version').option('-V, --verbose', 'Enable verbose mode', increaseVerbosity, 0).option('-q, --quiet', 'Disable all output').option('-c, --config', 'The config file to use').command('sync', 'Sync translations').option('-p, --purge', 'Purge when syncing keys').option('-r, --readonly', 'Only pull translations (do not push local translations)').command('init', 'Init the translation.io project').command('extract', 'Extract translations from your local files').parse(process.argv);

const args = {
  command: res.command,
  config: res.config || null,
  purge: res.purge || false,
  quiet: res.quiet || false,
  readonly: res.readonly || false,
  verbose: res.verbose || 0
};
var _default = args;
exports.default = _default;