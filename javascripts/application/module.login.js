(function(){
  
  App.Module.extend({ 
    name          : "login", 
    displayName   : "Profilbereich",
    hasHelpPage    : false,
    helpFunction   : "",
    whereAmIData   : {},
    navigationData : {},
    evaluateHash  : function(hash, last){
      App.Controller.pickModule(this.name);
      var current = hash.shift();
      
      if (App.currentUser.signedIn){
        App.Modules.login.Controller.showIndexPage();
      } else {
        this.Controller.signIn();
      }
    },
    Controller : {
      signIn : function(){
        FB.getLoginStatus(function(response) {
          if (response.session) {
            App.Modules.login.Controller.setFacebookUserData();
          } else {
            App.Modules.login.Controller.facebookLogin();
          }
        });
      },
      setFacebookUserData : function(callback){
        FB.api('/me', function(response) {
          App.currentUser.name = response.name;
          App.currentUser.signedIn = true;
          
          callback = (callback || App.Modules.login.Controller.showIndexPage);
          if (typeof(callback) === "function"){
            callback.call();
          }
        });
      },
      unsetFacebookUserData : function(callback){
        App.currentUser.name = I18n.t("app.user.guest_name");
        App.currentUser.signedIn = false;
        
        callback = (callback || App.Modules.login.Controller.showIndexPage);
        if (typeof(callback) === "function"){
          callback.call();
        }
      },
      facebookLogin : function(accessToken){

        FB.login(function(response) {
          if (response.session) {
            App.Modules.login.Controller.setFacebookUserData();
          } else {
            App.Modules.login.Controller.unsetFacebookUserData();
          }
        });

      },
      showIndexPage : function(){
        log(App.currentUser);
      }
    },
  });
  
})();
