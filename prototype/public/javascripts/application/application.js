(function(){
  
  // Initial Setup
  // -------------

  // The top-level namespace. All public App classes and modules will be attached to this.
  var App = this.App = {};

  // Current version of the library.
  App.VERSION = '0.0.1';

  // App.Events
  // -----------------
  App.Events = {
    
  };
  
  // Collection of all known modules
  App.Modules = {};
  
  // App.View
  // -----------------
  App.View = {
    
  };
  
  // App.Controller
  // -----------------
  App.Controller = {
    pickModule : function(module){
      App.currentModule = module;
      
      // TODO
      // - set as current module
      // - refresh the view
    },
    showIndexPage : function(){
      
    },
    showModule : function(){
      
    },

    showTrainingPage : function(){
      // TODO
    },
    showLearningPage : function(){
      // TODO
    },
    showWikiContent : function(content, callback){
      // TODO
      // show the content in a modal window
    },
    
    pathFor : function(arg){
      return arg.join("/");
    },
    modulePagePath : function(learnPage, pageName){
      if (learnPage === true){
        return App.Controller.pathFor(["app", App.currentModule.name, "learn", pageName]);
      } else if (learnPage === false){
        return App.Controller.pathFor(["app", App.currentModule.name, "practise", pageName]);
      } else {
        return App.Controller.pathFor(["app", App.currentModule.name]);
      }
    }
  };
  
  
  
  
  
  
  
  
  // App.Module
  // -----------------
  // Modules may be created like this
  // App.Module.extend({ some : options, and : content });
  App.Module = function(options){
    if (!options.name){
      $.error("No name given");
    }
    _.extend(this, { 
      app : App
      // Add further module implementations that may be overridden with options here
    }, options);
    
    // add further module implementation that may not be overridden here
    // this.someFunction = function(){ ... }
  };
  App.Module.extend = function(options){
    App.Modules[options.name] = new App.Module(options);
    return App.Modules[options.name];
  };


  
  // App.User
  // -----------------
  // This is our user data. Unless the user is signed in, we use the default guest user data.
  // This one may be stored in the session to keep module statistic
  // User instance may be created like this
  // App.User.extend({ some : options, and : content });
  App.User = function(options){
    _.extend(this, { 
      name : function(){ return I18n.t("app.user.guest_name"); },
      statistics : {}
      // Add further user implementations that may be overridden with options here
    }, options);
    
    // add further module implementation that may not be overridden here
    // this.someFunction = function(){ ... }
  };
  App.User.extend = function(options){
    return new App.User(options);
  };

  App.currentUser = App.User.extend();
})();
