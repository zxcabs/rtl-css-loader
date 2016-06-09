# (rtl) css loader for webpack [![Build Status](https://img.shields.io/travis/romainberger/rtl-css-loader/master.svg?style=flat-square)](https://travis-ci.org/romainberger/rtl-css-loader)

Fork of the [css loader](https://github.com/webpack/css-loader), improved for rtl.

Drop-in replacement of the css-loader, it simply checks the `dir` attribute on the `html` tag on the page, then injects either the regular css or the rtl'ized css.

Uses [rtlcss](https://github.com/MohammadYounes/rtlcss) under the hood.

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
