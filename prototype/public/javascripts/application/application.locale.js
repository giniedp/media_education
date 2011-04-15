// Extend the I18n.dictionary object by localization contents
// then use them like this for example : I18n.t("path.to.locale");
// Note: Do not pass the top level language keys like "de", "en" to the "t" method
//       use I18n.t("app.title"); but not I18n.t("de.app.title");
$.extend(true, I18n.dictionary, {
  de : {
    app : {
      title : "Schultrainer",
      page : {
        index : {
          title : "Willkommen beim Schultrainer",
          content : "Inhalt"
        }
      },
      user : {
        guest_name : "Gast"
      }
    }
  }
}); 