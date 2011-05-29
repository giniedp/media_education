(function(){
  
  Module = function(){
    return App.Modules.login;
  };
  
  App.Module.extend({ 
    name          : "login", 
    displayName   : "Profilbereich",
    navigatable   : false,
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
    View : {
      profileTemplate : _.template("\
      <div id='profile'>\
        <div id='avatar'>\
          <img src='<%= profile.avatar %>' alt='<%= profile.name %>'></img>\
          <h3><%= profile.name %></h3>\
        </div>\
        <div id='info'>\
          <%= profile.welcome %>\
        </div>\
        <div style=\"clear: both\"></div>\
      </div>")
    },
    Controller : {
      getStatsPath : function(module){
        // TODO: return statistic path for module
        return Module().pagePath();
      },
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
          
          App.currentUser.facebookId = response.id;
          App.currentUser.avatar = "https://graph.facebook.com/" + response.id + "/picture?type=large";
          
          callback = (callback || App.Modules.login.Controller.showIndexPage);
          if (typeof(callback) === "function"){
            callback.call();
          }  

        });
      },
      unsetFacebookUserData : function(callback){
        App.currentUser.name = I18n.t("app.user.guest_name");
        App.currentUser.signedIn = false;
        App.currentUser.avatar = "stylesheets/images/guest.png"
        //TODO reset stats, cookies, ...
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
        var module = Module();
        
        var modules = _.select(App.Modules, function(item){
          // TODO: make a better filter
          return item.navigatable;
        });
        
        module.navigationData = _.map(modules, function(item){
          return {
            name : item.displayName,
            url  : module.Controller.getStatsPath(item),
            active : false
          }
        });
        
        
        if (App.currentUser.signedIn){

          module.whereAmIData = {
            links : [{
              name   : module.displayName,
              url    : module.pagePath(),
              active : false
            },{
              name   : App.currentUser.name,
              url    : module.pagePath(),
              active : false
            }],
            statistics : ""
          }
          
          $.get("modules/login/index-loggedin.html", function(data){
            App.Controller.swapContent(App.View.content, module.View.profileTemplate({
              profile : {
                avatar : App.currentUser.avatar,
                name : App.currentUser.name,
                welcome : data
              }
            }), function() {$("#profile #info div button").button().click(function() { App.Modules.login.Controller.unsetFacebookUserData();})});
            App.Controller.swapContent(App.View.sidebar, App.View.templates.linkList(module.navigationData));  
            App.Controller.swapContent(App.View.info, App.View.templates.whereami(module.whereAmIData));  
          });

        } else {
          
          module.whereAmIData = {
            links : [{
              name   : module.displayName,
              url    : module.pagePath(),
              active : false
            }],
            statistics : ""
          }
          
          $.get("modules/login/index-loggedout.html", function(data){
            App.Controller.swapContent(App.View.content, module.View.profileTemplate({
              profile : {
                avatar : App.currentUser.avatar,
                name : App.currentUser.name,
                welcome : data
              }
            }), function() {$("#profile #info div button").button().click(function() { App.Modules.login.Controller.facebookLogin();})});
            App.Controller.swapContent(App.View.sidebar, App.View.templates.linkList(module.navigationData));  
            App.Controller.swapContent(App.View.info, App.View.templates.whereami(module.whereAmIData));  
          });
        }
      }
    },
  });
  
})();
