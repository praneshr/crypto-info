# Crypto Info

A simple CLI tool for crypto conversions, info and market details

## Install

``` bash
  yarn install crypto-info --global
  or
  npm i crypto-info -g
```

## Usage

``` bash
$ crypto-info -h

  Usage: crypto-info [options] [command]

  Cryptocurrency converter and market info


  Options:

    -V, --version  output the version number
    -h, --help     output usage information


  Commands:

    convert|c <unit> <symbol> [currency_symbol]  Convert cryptocurrency to other cryptocurrency or local currency

    price|p <symbol> [currency_symbol]           Price of a cryptocurrency in other cryptocurrency or local currency

    market|m [options] [currency_symbol]         Cryptocurrency market details

  Examples:

    $ crypto-info convert 30 XRP ETH
    $ crypto-info c 640 XLM INR
    $ crypto-info price ETH
    $ crypto-info p ETH EUR
    $ crypto-info market INR
    $ crypto-info m INR --limit 25
```

## License

MIT
