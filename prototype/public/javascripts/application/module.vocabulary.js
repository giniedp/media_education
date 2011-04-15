(function(){
  
  App.Module.extend({ 
    name          : "vocabulary", 
    displayName   : I18n.t("app.modules.vocabulary.name"),
    evaluateHash  : function(hash){
      App.View.content.html("Vocs");
    }
  });
  
})();