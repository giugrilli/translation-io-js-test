"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.timestamp = exports.write = exports.read = exports.parsePoData = exports.poGenerator = void 0;

var _fs = require("fs");

var _child_process = require("child_process");

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const poGenerator = obj => Object.keys(obj).map(key => `msgctxt "${key}"\nmsgid "${obj[key]}"\nmsgstr ""\n`).join('\n');

exports.poGenerator = poGenerator;

const parsePoData = data => {
  const split = data.split('\n\n');
  const parsed = split.map(chunk => {
    const item = {
      msgctxt: '',
      msgid: '',
      msgstr: ''
    };

    let lastkey = ''
    chunk.split('\n').forEach(line => {
      const res = line.match(/^(\w+) "(.*)"$/);
      if (res) {
        const [, key, value] = res;
        lastkey = key
        item[key] = value;
      } else {
        if (line != '') {
          item[lastkey] += line.replace(/"/g, "");
        }
      }
    });
    return item;
  });
  return parsed.map(item => ({
    [item.msgctxt]: item.msgstr || item.msgid
  })).reduce((acc, curr) => _objectSpread({}, acc, curr), {});
};

exports.parsePoData = parsePoData;

const read = file => (0, _fs.readFileSync)(file, 'utf8');

exports.read = read;

const write = (file, content) => (0, _fs.writeFileSync)(file, content, {
  encoding: 'utf8'
});

exports.write = write;

const timestamp = () => {
  const res = (0, _child_process.execSync)('git log --format=%ct -n 1', {
    encoding: 'utf8'
  }).trim();
  return parseInt(res, 10);
};

exports.timestamp = timestamp;
