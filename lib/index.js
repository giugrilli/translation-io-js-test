#!/usr/bin/env node
"use strict";

var _args = _interopRequireDefault(require("./args"));

var _sync = _interopRequireDefault(require("./sync"));

var _init = _interopRequireDefault(require("./init"));

var _extract = _interopRequireDefault(require("./extract"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

switch (_args.default.command) {
  case 'sync':
    (0, _sync.default)();
    break;

  case 'init':
    (0, _init.default)();
    break;

  case 'extract':
    (0, _extract.default)();
    break;

  default:
    break;
}