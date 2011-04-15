(function(){
  
  App.Module.extend({ 
    name          : "mathematics", 
    displayName   : I18n.t("app.modules.math.name"),
    evaluateHash  : function(hash){
      App.View.content.html("Madde");
    }
  });
  
  App.Controller.pickModule(App.Modules.mathematics);
})();