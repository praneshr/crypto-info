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

var _cliTable = require('cli-table3');

var _cliTable2 = _interopRequireDefault(_cliTable);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _fromNow = require('from-now');

var _fromNow2 = _interopRequireDefault(_fromNow);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// work around to fix invalid symbol
_cryptocurrencies2.default.BCH = 'Bitcoin Cash';

var defaultRequestUrl = 'https://api.coinmarketcap.com/v1/ticker/';
var defaultCurrencySymbol = 'USD';
var availableCurrencySymbols = ['AUD', 'BRL', 'CAD', 'CHF', 'CLP', 'CNY', 'CZK', 'DKK', 'EUR', 'GBP', 'HKD', 'HUF', 'IDR', 'ILS', 'INR', 'JPY', 'KRW', 'MXN', 'MYR', 'NOK', 'NZD', 'PHP', 'PKR', 'PLN', 'RUB', 'SEK', 'SGD', 'THB', 'TRY', 'TWD', 'ZAR', 'USD'];
var combinedAvailableCurrencies = availableCurrencySymbols.concat(_cryptocurrencies2.default.symbols());
var changeColor = function changeColor(changeString) {
  var changeFloat = parseFloat(changeString);
  var changeStringFull = changeFloat.toFixed(2) + ' %';
  if (changeFloat >= 0) {
    return _chalk2.default.green(changeStringFull);
  }
  return _chalk2.default.red(changeStringFull);
};

var oraInstance = (0, _ora2.default)({
  text: 'Loading...'
});

var error = function error(err) {
  oraInstance.stop();
  console.log(_chalk2.default.red('ERROR: Something went wrong! Try again.'));
};

// Coin Price Converter
_commander2.default.command('convert <unit> <symbol> <symbol_2>').alias('c').description('Convert fiat to crypto or crypto to fiat or crypto to crypto').action(function (unit, symbol, symbol_2) {
  var symbolCaps = symbol.toUpperCase();
  var symbol2Caps = symbol_2.toUpperCase();
  var isBaseFiat = availableCurrencySymbols.includes(symbolCaps);
  var isConversionUnitFiat = availableCurrencySymbols.includes(symbol2Caps);
  if (isBaseFiat && isConversionUnitFiat) {
    return console.log(_chalk2.default.red('ERROR: Fiat to Fiat conversion is not supported'));
  }
  var symbolId = _cryptocurrencies2.default[isBaseFiat ? symbol2Caps : symbolCaps];
  var conversionUnit = isBaseFiat ? symbolCaps : symbol2Caps;
  if (!isBaseFiat && !combinedAvailableCurrencies.includes(conversionUnit)) {
    return console.log(_chalk2.default.red('ERROR: ' + conversionUnit + ' is currently not supported.'));
  }
  if (symbolId) {
    oraInstance.start();
    _axios2.default.get('' + defaultRequestUrl + symbolId.toLowerCase().replace(/ /g, '-') + '/?convert=' + conversionUnit).then(function (_ref) {
      var data = _ref.data;

      oraInstance.stop();
      var priceKey = 'price_' + conversionUnit.toLowerCase();
      var priceInLocalCurrency = data[0][priceKey];
      var percentageChange = data[0].percent_change_1h;
      var value = isBaseFiat ? unit / priceInLocalCurrency : unit * priceInLocalCurrency;
      console.log(_chalk2.default.blue(unit + ' ' + symbol) + ' = ' + _chalk2.default.green(value + ' ' + symbol2Caps) + ' (' + changeColor(percentageChange) + ' in 1h)');
    }).catch(error);
  }
});

// Coin info
_commander2.default.command('price <symbol> [fiat_symbol]').alias('p').description('Check price of a cryptocurrency in other cryptocurrency or fiat').action(function (symbol) {
  var fiat_symbol = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultCurrencySymbol;

  var symbolCaps = symbol.toUpperCase();
  var currencySymbolCaps = fiat_symbol.toUpperCase();
  var symbolId = _cryptocurrencies2.default[symbolCaps];
  if (!combinedAvailableCurrencies.includes(currencySymbolCaps)) {
    return console.log(_chalk2.default.red('ERROR: ' + currencySymbolCaps + ' is currently not supported.'));
  }
  if (symbolId) {
    oraInstance.start();
    _axios2.default.get('' + defaultRequestUrl + symbolId.toLowerCase().replace(/ /g, '-') + '/?convert=' + currencySymbolCaps).then(function (_ref2) {
      var data = _ref2.data;

      oraInstance.stop();
      var priceKey = 'price_' + currencySymbolCaps.toLowerCase();
      var priceInLocalCurrency = data[0][priceKey];
      var percentageChange = data[0].percent_change_1h;
      console.log(_chalk2.default.blue('1 ' + symbolCaps) + ' = ' + _chalk2.default.green(priceInLocalCurrency + ' ' + currencySymbolCaps) + ' (' + changeColor(percentageChange) + ' in 1h)');
    }).catch(error);
  } else {
    return console.log(_chalk2.default.red('ERROR: ' + symbolCaps + ' is currently not supported.'));
  }
});

// Market info
_commander2.default.command('market [fiat_symbol]').option('-l, --limit <n>', 'Limit the number of results', parseInt).option('-w, --watch', 'Auto refresh data every 1 minute').option('-o, --only <list>', 'Filter coins to be listed', function (val) {
  return val.split(',').map(function (s) {
    return s.toUpperCase();
  });
}).alias('m').description('Cryptocurrency market details').action(function () {
  var fiat_symbol = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultCurrencySymbol;
  var cmd = arguments[1];

  var limit = cmd.limit || 10;
  var watch = cmd.watch || false;
  var only = cmd.only && cmd.only.length !== 0 && cmd.only || undefined;
  var currencySymbolCaps = fiat_symbol.toUpperCase();
  var currencySymbolLowerCase = fiat_symbol.toLowerCase();
  if (!combinedAvailableCurrencies.includes(currencySymbolCaps)) {
    return console.log(_chalk2.default.red('ERROR: ' + currencySymbolCaps + ' is currently not supported.'));
  }
  oraInstance.start();
  var marketData = function marketData() {
    _axios2.default.get(defaultRequestUrl + '?convert=' + currencySymbolCaps + '&limit=' + (only ? 10000000 : limit)).then(function (_ref3) {
      var data = _ref3.data;

      oraInstance.stop();
      var priceKey = 'price_' + currencySymbolLowerCase;
      var table = new _cliTable2.default({
        style: {
          head: []
        }
      });
      table.push([_chalk2.default.blue('Rank'), _chalk2.default.blue('Symbol'), _chalk2.default.blue('Name'), _chalk2.default.blue('Price (' + currencySymbolCaps + ')'), _chalk2.default.blue('Change 1h'), _chalk2.default.blue('Change 24h'), _chalk2.default.blue('Change 1w'), _chalk2.default.blue('Last Updated')]);
      data.forEach(function (o) {
        if (only && !only.includes(o.symbol)) {
          return;
        }
        table.push([o.rank, o.symbol, o.name, o[priceKey] + ' ' + currencySymbolCaps, changeColor(o.percent_change_1h), changeColor(o.percent_change_24h), changeColor(o.percent_change_7d), (0, _fromNow2.default)(parseInt(o.last_updated * 1000)) + ' ago']);
      });
      if (watch) {
        process.stderr.write('\x1B[?1049h');
      }
      console.log('\nFetched at ' + _chalk2.default.bold.yellow(new Date()));
      console.log(table.toString());
      if (watch) {
        console.log('The table will update automatically every 1 minute.');
      }
    }).catch(error);
  };
  if (watch) {
    marketData();
    return setInterval(marketData, 60000);
  }
  return marketData();
});

// General
_commander2.default.version('0.0.3').description('Cryptocurrency converter and market info');

_commander2.default.on('--help', function () {
  console.log('');
  console.log('  Examples:');
  console.log('');
  console.log('    $ crypto-info convert 30 XRP ETH');
  console.log('    $ crypto-info c 640 XLM INR');
  console.log('    $ crypto-info c 100 USD BTC');
  console.log('    $ crypto-info price ETH');
  console.log('    $ crypto-info p ETH EUR');
  console.log('    $ crypto-info market INR');
  console.log('    $ crypto-info m INR --limit 25 --watch');
  console.log('');
});

_commander2.default.parse(process.argv);