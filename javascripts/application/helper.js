// this is taken from 
// http://stackoverflow.com/questions/149055/how-can-i-format-numbers-as-money-in-javascript
// Usage:
//    (123456789.12345).format(2, '.', ','); => 123,456,789.12
Number.prototype.formatNumber = function(decimals, decimal_sep, thousands_sep)
{ 
   var n = this;
   // if decimal is zero we must take it, it means user does not want to show any decimal
   var c = isNaN(decimals) ? 2 : Math.abs(decimals) 
   // if no decimal separetor is passed we use the comma as default decimal separator (we MUST use a decimal separator)
   var d = decimal_sep || ','; 

   // if you don't want ot use a thousands separator you can pass empty string as thousands_sep value
   var t = (typeof(thousands_sep) === 'undefined') ? '.' : thousands_sep;
   var sign = (n < 0) ? '-' : '';

   // extracting the absolute value of the integer part of the number and converting to string
   var i = parseInt(n = Math.abs(n).toFixed(c)) + '';

   var j = ((j = i.length) > 3) ? j % 3 : 0; 
   return sign + (j ? i.substr(0, j) + t : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : ''); 
}

Number.prototype.round = function(decimals){
  var n = this;
  var d = isNaN(decimals) ? 2 : Math.abs(decimals);
  var s = Math.pow(10, d);
  return Math.round(n * s) / s;
}

String.prototype.round = function(decimals){
  return Number(this).round(decimals);
}

String.prototype.formatNumber = function(decimals, decimal_sep, thousands_sep){
  return Number(this).formatNumber(decimals, decimal_sep, thousands_sep);
}