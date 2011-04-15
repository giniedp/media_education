(function(){
  
  App.Module.extend({ 
    name          : "mathematics", 
    displayName   : I18n.t("app.modules.math.name") 
  });
  
  App.Controller.pickModule(App.Modules.mathematics);
})();