# Crypto Info

A simple CLI tool for crypto conversions, info and market details

![CLI](https://image.ibb.co/cC8YOH/ezgif_com_video_to_gif_1.gif)

## Install

``` bash
  yarn install crypto-info --global
  
  # or
  
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

    convert|c <unit> <symbol> <symbol_2>  Convert fiat to crypto or crypto to fiat or crypto to crypto
    price|p <symbol> [fiat_symbol]        Check price of a cryptocurrency in other cryptocurrency or fiat
    market|m [options] [fiat_symbol]      Cryptocurrency market details

  Examples:

    $ crypto-info convert 30 XRP ETH
    $ crypto-info c 640 XLM INR
    $ crypto-info c 100 USD BTC
    $ crypto-info price ETH
    $ crypto-info p ETH EUR
    $ crypto-info market INR
    $ crypto-info m INR --limit 25 --watch
```

## Info

All data are obtained from [coinmarketcap](https://coinmarketcap.com) . There is a rate limit of 10 requests per minute.

## License

MIT
