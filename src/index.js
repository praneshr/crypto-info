#!/usr/bin/env node

import cryptocurrencies from 'cryptocurrencies'
import program from 'commander'
import axios from 'axios'
import ora from 'ora'
import Table from 'cli-table3'
import chalk from 'chalk'
import fromNow from 'from-now'

// work around to fix invalid symbol
cryptocurrencies.BCH = 'Bitcoin Cash'

const defaultRequestUrl = 'https://api.coinmarketcap.com/v1/ticker/'
const defaultCurrencySymbol = 'USD'
const availableCurrencySymbols = [
  'AUD',
  'BRL',
  'CAD',
  'CHF',
  'CLP',
  'CNY',
  'CZK',
  'DKK',
  'EUR',
  'GBP',
  'HKD',
  'HUF',
  'IDR',
  'ILS',
  'INR',
  'JPY',
  'KRW',
  'MXN',
  'MYR',
  'NOK',
  'NZD',
  'PHP',
  'PKR',
  'PLN',
  'RUB',
  'SEK',
  'SGD',
  'THB',
  'TRY',
  'TWD',
  'ZAR',
  'USD',
]
const combinedAvailableCurrencies = availableCurrencySymbols.concat(cryptocurrencies.symbols())
const changeColor = (changeString) => {
  const changeFloat = parseFloat(changeString)
  const changeStringFull = `${changeFloat.toFixed(2)} %`
  if (changeFloat >= 0) {
    return chalk.green(changeStringFull)
  }
  return chalk.red(changeStringFull)
}

const oraInstance = ora({
  text: 'Loading...'
})

const error = (err) => {
  oraInstance.stop()
  console.log(chalk.red('ERROR: Something went wrong! Try again.'));
}

// Coin Price Converter
program
  .command('convert <unit> <symbol> <symbol_2>')
  .alias('c')
  .description('Convert fiat to crypto or crypto to fiat or crypto to crypto')
  .action((unit, symbol, symbol_2) => {
    const symbolCaps = symbol.toUpperCase()
    const symbol2Caps = symbol_2.toUpperCase()
    const isBaseFiat = availableCurrencySymbols.includes(symbolCaps)
    const isConversionUnitFiat = availableCurrencySymbols.includes(symbol2Caps)
    if (isBaseFiat && isConversionUnitFiat) {
      return console.log(chalk.red(`ERROR: Fiat to Fiat conversion is not supported`))
    }
    const symbolId = cryptocurrencies[
      isBaseFiat ? symbol2Caps : symbolCaps
    ]
    const conversionUnit = isBaseFiat ? symbolCaps : symbol2Caps
    if (!isBaseFiat && !combinedAvailableCurrencies.includes(conversionUnit)) {
      return console.log(chalk.red(`ERROR: ${conversionUnit} is currently not supported.`))
    }
    if (symbolId) {
      oraInstance.start()
      axios.get(`${defaultRequestUrl}${symbolId.toLowerCase().replace(/ /g, '-')}/?convert=${conversionUnit}`)
      .then(({ data }) => {
        oraInstance.stop()
        const priceKey = `price_${conversionUnit.toLowerCase()}`
        const priceInLocalCurrency = data[0][priceKey]
        const percentageChange = data[0].percent_change_1h
        const value = isBaseFiat
          ? unit / priceInLocalCurrency
          : unit * priceInLocalCurrency
        console.log(`${chalk.blue(`${unit} ${symbol}`)} = ${chalk.green(`${value} ${symbol2Caps}`)} (${changeColor(percentageChange)} in 1h)`);
      })
      .catch(error)
    }
  })

// Coin info
program
  .command('price <symbol> [fiat_symbol]')
  .alias('p')
  .description('Check price of a cryptocurrency in other cryptocurrency or fiat')
  .action((symbol, fiat_symbol = defaultCurrencySymbol) => {
    const symbolCaps = symbol.toUpperCase()
    const currencySymbolCaps = fiat_symbol.toUpperCase()
    const symbolId = cryptocurrencies[symbolCaps]
    if (!combinedAvailableCurrencies.includes(currencySymbolCaps)) {
      return console.log(chalk.red(`ERROR: ${currencySymbolCaps} is currently not supported.`))
    }
    if (symbolId) {
      oraInstance.start()
      axios.get(`${defaultRequestUrl}${symbolId.toLowerCase().replace(/ /g, '-')}/?convert=${currencySymbolCaps}`)
      .then(({ data }) => {
        oraInstance.stop()
        const priceKey = `price_${currencySymbolCaps.toLowerCase()}`
        const priceInLocalCurrency = data[0][priceKey]
        const percentageChange = data[0].percent_change_1h
        console.log(`${chalk.blue(`1 ${symbolCaps}`)} = ${chalk.green(`${priceInLocalCurrency} ${currencySymbolCaps}`)} (${changeColor(percentageChange)} in 1h)`)
      })
      .catch(error)
    } else {
      return console.log(chalk.red(`ERROR: ${symbolCaps} is currently not supported.`))
    }
  })

// Market info
program
  .command('market [fiat_symbol]')
  .option('-l, --limit <n>', 'Limit the number of results', parseInt)
  .option('-w, --watch', 'Auto refresh data every 1 minute')
  .option('-o, --only <list>', 'Filter coins to be listed', val => val.split(',').map(s => s.toUpperCase()))
  .alias('m')
  .description('Cryptocurrency market details')
  .action((fiat_symbol = defaultCurrencySymbol, cmd) => {
    const limit = cmd.limit || 10
    const watch = cmd.watch || false
    const only = (cmd.only && cmd.only.length !== 0 && cmd.only) || undefined
    const currencySymbolCaps = fiat_symbol.toUpperCase()
    const currencySymbolLowerCase = fiat_symbol.toLowerCase()
    if (!combinedAvailableCurrencies.includes(currencySymbolCaps)) {
      return console.log(chalk.red(`ERROR: ${currencySymbolCaps} is currently not supported.`))
    }
    oraInstance.start()
    const marketData = () => {
      axios.get(`${defaultRequestUrl}?convert=${currencySymbolCaps}&limit=${only ? 10000000 : limit}`)
      .then(({ data }) => {
        oraInstance.stop()
        const priceKey = `price_${currencySymbolLowerCase}`
        const table = new Table({
          style: {
            head: [],
          },
        })
        table.push([
          chalk.blue('Rank'),
          chalk.blue('Symbol'),
          chalk.blue('Name'),
          chalk.blue(`Price (${currencySymbolCaps})`),
          chalk.blue('Change 1h'),
          chalk.blue('Change 24h'),
          chalk.blue('Change 1w'),
          chalk.blue('Last Updated'),
        ])
        data.forEach((o) => {
          if (only && !only.includes(o.symbol)) {
            return
          }
          table.push([
            o.rank,
            o.symbol,
            o.name,
            `${o[priceKey]} ${currencySymbolCaps}`,
            changeColor(o.percent_change_1h),
            changeColor(o.percent_change_24h),
            changeColor(o.percent_change_7d),
            `${fromNow(parseInt(o.last_updated * 1000))} ago`,
          ])
        })
        if (watch) {
          process.stderr.write('\u001B[?1049h')
        }
        console.log(`\nFetched at ${chalk.bold.yellow(new Date())}`)
        console.log(table.toString());
        if (watch) {
          console.log('The table will update automatically every 1 minute.');
        }
      })
      .catch(error)
    }
    if (watch) {
      marketData()
      return setInterval(marketData, 60000)
    }
    return marketData()
  })

// General
program
  .version('0.0.3')
  .description('Cryptocurrency converter and market info')

  program.on('--help', () => {
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

program.parse(process.argv)
