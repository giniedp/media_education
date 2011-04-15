var I18n = {
  locale : "de",
  getLocale : function(){
    return I18n.locale;
  },
  dictionary : {},
  addValue : function(key, value){
    var path = key.split(".");
    var dict = I18n.dictionary;
    while(path.length > 1){
      key = path.shift();
      if (typeof(dict[key]) !== "object"){
        dict[key] = {};
      }
      dict = dict[key];
    }
    dict[path.shift()] = value;
  },
  getValue : function(key){
    var path = key.split(".");
    var dict = I18n.dictionary;
    while(path.length > 0){
      dict = dict[path.shift()];
      if(!dict){
        return null;
      }
    }
    return dict;
  },
  makeKey : function(locale, scope, key){
    var result = [];
    if (locale) { result.push(locale); } 
    if (scope) { result.push(scope); }
    if (key) { result.push(key); }
    return result.join(".");
  },
  pluralizationStrategies : {
    defaultStrategy : function(count){
      return (count === 1 ? "one" : "other");
    }
  },
  pluralize : function(locale, value, count){
    var strategy = I18n.pluralizationStrategies[locale];
    if (!strategy){
      strategy = I18n.pluralizationStrategies.defaultStrategy;
    }
    var category = strategy(count);
    if (value[category]){
      return value[category];
    } 
    return value;
  },
  interpolate : function(str, key, value){
    str = str.replace("%{" + key + "}", value);   // rails 3
    return str.replace("{{" + key + "}}", value); // rails 2
  },
  translate : function(key, options){
    if (typeof(options) !== "object"){
      options = {};
    }
    var locale = I18n.getLocale();
    
    // The translate method also takes a :scope option which can contain one or 
    // more additional keys that will be used to specify a “namespace” or scope 
    // for a translation key:
    var scope = options.scope;
    if (typeof(scope) === "object"){
      scope = scope.join(".");
    }

    // When a 'default' or 'defaultValue' option is given, its value will be 
    // returned if the translation is missing. 
    var defaultValue = (options.defaultValue || options["default"]);
    
    if (typeof(key) === "string"){
      return I18n.performTranslation(locale, scope, key, defaultValue, options);
    }
    
    // To look up multiple translations at once, an array of keys can be passed
    var result = [];
    var i = 0;
    for (i = 0; i < key.length; i++) {
      result.push(I18n.performTranslation(locale, scope, key[i], defaultValue, options));
    }
    return result;
  },
  t : function(key, options){
    return I18n.translate(key, options);
  },
  performTranslation : function(locale, scope, key, defaultValue, interpolation){
    key = I18n.makeKey(locale, scope, key);
    var value = I18n.getValue(key);

    if (!value){
      value = defaultValue;
    }
    if (!value){
      value = "Translation missing for: " + key;
    }
    if (interpolation.count){
      value = I18n.pluralize(locale, value, interpolation.count);
    }
    var item = 0;
    for (item in interpolation){
      if (interpolation.hasOwnProperty(item)){
        value = I18n.interpolate(value, item, interpolation[item]);
      }
    }
    return value;
  }
}; 

// Languages vary in how they handle plurals of nouns or unit expressions
// Some languages have two forms, like English; some languages have only a 
// single form; and some languages have multiple forms.
// You can define more pluralization stratiges by adding functions to the 
// I18n.pluralizationStrategies object. Here is an example for russian pluralization
// More information for pluralization rulse can be found at:
// http://unicode.org/repos/cldr-tmp/trunk/diff/supplemental/language_plural_rules.html
//
// I18n.pluralizationStrategies.ru = function(count){
//   if ((count % 10 === 1) && (count % 100 !== 11)){
//     return "one";
//   } else if ((count % 10) >= 2 && (count % 10) <= 4 && !((count % 100) >= 12 && (count % 100) <= 14)){
//     return "few";
//   } else if ((count % 10) === 0 || ((count % 10) >= 5 && (count % 10) <= 9) || ((count % 100) >= 11 && (count % 100) <= 14)){
//     return "many";
//   } else {
//     return "other";
//   }
// };