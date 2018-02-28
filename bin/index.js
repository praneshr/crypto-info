#!/usr/bin/env node
'use strict';

var _cryptocurrencies = require('cryptocurrencies');

var _cryptocurrencies2 = _interopRequireDefault(_cryptocurrencies);

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _ora = require('ora');

var _ora2 = _interopRequireDefault(_ora);

var _cliTable = require('cli-table2');

var _cliTable2 = _interopRequireDefault(_cliTable);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultRequestUrl = 'https://api.coinmarketcap.com/v1/ticker/';
var defaultCurrencySymbol = 'USD';
var availableCurrencySymbols = ['AUD', 'BRL', 'CAD', 'CHF', 'CLP', 'CNY', 'CZK', 'DKK', 'EUR', 'GBP', 'HKD', 'HUF', 'IDR', 'ILS', 'INR', 'JPY', 'KRW', 'MXN', 'MYR', 'NOK', 'NZD', 'PHP', 'PKR', 'PLN', 'RUB', 'SEK', 'SGD', 'THB', 'TRY', 'TWD', 'ZAR', 'USD'];
var combinedAvailableCurrencies = availableCurrencySymbols.concat(_cryptocurrencies2.default.symbols());
var changeColor = function changeColor(changeString) {
  var changeFloat = parseFloat(changeString);
  var changeStringFull = changeFloat.toFixed(2) + ' %';
  if (changeFloat > 0) {
    return _chalk2.default.green(changeStringFull);
  }
  return _chalk2.default.red(changeStringFull);
};

var oraInstance = (0, _ora2.default)({
  text: 'Loading...'
});

// Coin Price Converter
_commander2.default.command('convert <unit> <symbol> [currency_symbol]').alias('c').description('Convert cryptocurrency to other cryptocurrency or local currency').action(function (unit, symbol) {
  var currency_symbol = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : defaultCurrencySymbol;

  var symbolCaps = symbol.toUpperCase();
  var currencySymbolCaps = currency_symbol.toUpperCase();
  var symbolId = _cryptocurrencies2.default[symbolCaps];
  var unitInt = parseFloat(unit);
  if (!combinedAvailableCurrencies.includes(currencySymbolCaps)) {
    return console.error(currencySymbolCaps + ' is currently not supported.');
  }
  if (symbolId) {
    oraInstance.start();
    _axios2.default.get('' + defaultRequestUrl + symbolId.toLowerCase() + '/?convert=' + currencySymbolCaps).then(function (_ref) {
      var data = _ref.data;

      oraInstance.stop();
      var priceKey = 'price_' + currencySymbolCaps.toLowerCase();
      var priceInLocalCurrency = data[0][priceKey];
      console.log(_chalk2.default.blue(unit + ' ' + symbol) + ' = ' + _chalk2.default.green(priceInLocalCurrency * unitInt + ' ' + currencySymbolCaps));
    });
  }
});

// Coin info
_commander2.default.command('price <symbol> [currency_symbol]').alias('p').description('Price of a cryptocurrency in other cryptocurrency or local currency').action(function (symbol) {
  var currency_symbol = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultCurrencySymbol;

  var symbolCaps = symbol.toUpperCase();
  var currencySymbolCaps = currency_symbol.toUpperCase();
  var symbolId = _cryptocurrencies2.default[symbolCaps];
  if (!combinedAvailableCurrencies.includes(currencySymbolCaps)) {
    return console.error(currencySymbolCaps + ' is currently not supported.');
  }
  if (symbolId) {
    oraInstance.start();
    _axios2.default.get('' + defaultRequestUrl + symbolId.toLowerCase() + '/?convert=' + currencySymbolCaps).then(function (_ref2) {
      var data = _ref2.data;

      oraInstance.stop();
      var priceKey = 'price_' + currencySymbolCaps.toLowerCase();
      var priceInLocalCurrency = data[0][priceKey];
      var percentageChange = data[0].percent_change_24h;
      console.log(_chalk2.default.blue('1 ' + symbol) + ' = ' + _chalk2.default.green(priceInLocalCurrency + ' ' + currencySymbolCaps) + ' (' + changeColor(percentageChange) + ')');
    });
  }
});

// Market info
_commander2.default.command('market [currency_symbol]').option('-l, --limit <n>', 'Limit the number of results', parseInt).option('-w, --watch', 'Auto refresh data every 1 minute').alias('m').description('Cryptocurrency market details').action(function () {
  var currency_symbol = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultCurrencySymbol;
  var cmd = arguments[1];

  var limit = cmd.limit || 10;
  var watch = cmd.watch || false;
  var currencySymbolCaps = currency_symbol.toUpperCase();
  var currencySymbolLowerCase = currency_symbol.toLowerCase();
  if (!combinedAvailableCurrencies.includes(currencySymbolCaps)) {
    return console.error(currencySymbolCaps + ' is currently not supported.');
  }
  oraInstance.start();
  var marketData = function marketData() {
    _axios2.default.get(defaultRequestUrl + '?convert=' + currencySymbolCaps + '&limit=' + limit).then(function (_ref3) {
      var data = _ref3.data;

      oraInstance.stop();
      var priceKey = 'price_' + currencySymbolLowerCase;
      var marketCapKey = 'market_cap_' + currencySymbolLowerCase;
      var table = new _cliTable2.default({
        style: {
          head: []
        }
      });
      table.push([_chalk2.default.blue('Rank'), _chalk2.default.blue('Symbol'), _chalk2.default.blue('Name'), _chalk2.default.blue('Price (' + currencySymbolCaps + ')'), _chalk2.default.blue('Change 1h'), _chalk2.default.blue('Change 24h'), _chalk2.default.blue('Change 1w')]);
      data.forEach(function (o) {
        table.push([o.rank, o.symbol, o.name, o[priceKey] + ' ' + currencySymbolCaps, changeColor(o.percent_change_1h), changeColor(o.percent_change_24h), changeColor(o.percent_change_7d)]);
      });
      if (watch) {
        process.stderr.write('\x1B[?1049h');
      }
      console.log('Last Updated at ' + new Date());
      console.log(table.toString());
    });
  };
  if (watch) {
    marketData();
    return setInterval(marketData, 60000);
  }
  return marketData();
});

// General
_commander2.default.version('0.0.2').description('Cryptocurrency converter and market info');

_commander2.default.on('--help', function () {
  console.log('');
  console.log('  Examples:');
  console.log('');
  console.log('    $ crypto-info convert 30 XRP ETH');
  console.log('    $ crypto-info c 640 XLM INR');
  console.log('    $ crypto-info price ETH');
  console.log('    $ crypto-info p ETH EUR');
  console.log('    $ crypto-info market INR');
  console.log('    $ crypto-info m INR --limit 25');
  console.log('');
});

_commander2.default.parse(process.argv);