"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.error = exports.warn = exports.success = exports.info = exports.verbose = void 0;

var _chalk = _interopRequireDefault(require("chalk"));

var _args = _interopRequireDefault(require("./args"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const debugEnabled = () => {
  const env = process.env.TRANSLATION_IO_DEBUG;

  if (env == null) {
    return false;
  }

  return env !== 'false' && env !== '0';
};

const shouldPrint = () => !_args.default.quiet && (_args.default.verbose > 0 || debugEnabled());

const verbose = (...str) => shouldPrint && _args.default.verbose > 1 ? console.log(_chalk.default.magenta(...str)) // eslint-disable-line no-console
: undefined;

exports.verbose = verbose;

const info = (...str // eslint-disable-next-line no-console
) => shouldPrint() ? console.log(_chalk.default.cyan(...str)) : undefined;

exports.info = info;

const print = fn => (str // eslint-disable-next-line no-console
) => _args.default.quiet ? undefined : console.log(fn(str));

const success = print(_chalk.default.green);
exports.success = success;
const warn = print(_chalk.default.yellow);
exports.warn = warn;
const error = print(_chalk.default.red);
exports.error = error;