# (rtl) css loader for webpack [![Build Status](https://img.shields.io/travis/romainberger/rtl-css-loader/master.svg?style=flat-square)](https://travis-ci.org/romainberger/rtl-css-loader)

Fork of the [css loader](https://github.com/webpack/css-loader), improved for rtl.

Drop-in replacement of the css-loader, it simply checks the `dir` attribute on the `html` tag on the page, then injects either the regular css or the rtl'ized css.

Uses [rtlcss](https://github.com/MohammadYounes/rtlcss) under the hood.

**Warning** This module should only be used for development. The processing of your css being done server-side, the bundle will include both the regular css and the rtl version, which can make your bundle a lot bigger. If you're using the `extract-text-webpack-plugin`, check out the [webpack-rtl-plugin](https://github.com/romainberger/webpack-rtl-plugin).

Check out the [webpack-rtl-example](https://github.com/romainberger/webpack-rtl-example) to see an example of an app using the rtl-css-loader and webpack-rtl-plugin.

## installation

`npm install rtl-css-loader --save-dev`

## Usage

Use it exactly like the [css-loader](https://github.com/webpack/css-loader):

``` javascript
module.exports = {
  module: {
    loaders: [
      {
        test: /\.css$/,
        loaders: ['style', 'rtl-css']
      },
    ]
  }
};
```

## License

[MIT](http://www.opensource.org/licenses/mit-license.php)
