log = function(message){
  if (console){
    console.log(message);
    return true;
  }
  return false;
};


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
    content  : $("#content"),
    sidebar  : $("#sidebar"),
    quicknav : $("#quicknav"),
    info     : $("#info"),
    
    moduleList : $("<div class='module-list'></div>"), 
    templates : {
      localLink: _.template("<a href='<%= url %>' onclick='App.Controller.evaluateHash(\"<%= url %>\");'><%= name %></a>"),
      whereami : _.template("<div>Du bist hier:</div> <% _.each(links, function(link) { %><div><%= App.View.templates.localLink(link) %></div><% }); %>  <% if (statistics) { %> <div><%= statistics %></div> <% } %>"),
      linkList : _.template("<ul> <% _.each(arguments[0], function(link) { %> <li><%= App.View.templates.localLink(link) %></li> <% if (arguments[0].subnav) { %><%= App.View.templates.linkList(arguments[0].subnav) %><% } %><% }); %> </ul>"),
      article  : _.template("<h2><%= title %></h2><p><%= body %></p>")
    }
  };
  
  // App.Controller
  // -----------------
  App.Controller = {
    pickModule : function(module){
      if (typeof(module) === "string"){
        App.currentModule = App.Modules[module];
      } else {
        App.currentModule = module;
      }
      return App.currentModule;
    },
    evaluateHash : function(newHash){
      var hash = window.location.hash;
      
      if (typeof(newHash) === "string"){
        hash = newHash;
        // FIXME
        // window.location.hash = hash;
      }
      
      hash = hash.replace(/.*\#/, "").split("/");
      
      var current = hash.shift();
      if (current === "app"){
        current = hash.shift();
        App.Controller.pickModule(current).evaluateHash(hash);
      } else {
        // TODO:
        // check current
      }
    },
    swapContent : function(container, content, callback){
      if (typeof(content) === "function"){
        content = content.call();  
      }
      content = App.Controller.processContent(content);
      
      $(container).fadeOut(300, function(){
        container.html(content).fadeIn(300, callback);
      });
    },
    processContent : function(content){
      content = $(content);
      content.find("a").each(function(){
        var $this = $(this);
        if ($this.attr("href").indexOf("wikipedia.org") >= 0){
          $this.click(function(e){
            App.Controller.showIframe($(this).attr("href"));
            return false;
          });
        }
      });
      return content;
    },
    showIframe : function(url){
      var dialog = $("<div id='dialog'/>");
      $("body").append(dialog);
      dialog.html("<iframe src='" + url + "' width='100%' height='95%'></iframe>");
      
      dialog.dialog({
        modal : true,
        width : "90%",
        height : 600,
        buttons : {
          "Schliessen" : function(){
            $(this).dialog("close");
          }
        },
        close : function(){
          $("body #dialog").remove();
        }
      });
    },
    pathFor : function(arg){
      return "#" + arg.join("/");
    },
    modulePagePath : function(module, learnPage, pageName){
      if (typeof(module) === "string"){
        module = App.Modules[module];
      }
      return module.pagePath(learnPage, pageName);
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
      app : App,
      evaluateHash : function(args){
        log(args);
      },
      render : function(){
        return "FOO";
      },
      pagePath : function(learnPage, pageName){
        if (learnPage === true){
          return App.Controller.pathFor(["app", this.name, "learn", pageName]);
        } else if (learnPage === false){
          return App.Controller.pathFor(["app", this.name, "practise", pageName]);
        } else {
          return App.Controller.pathFor(["app", this.name]);
        }
      },
      // Add further module implementations that may be overridden with options here
    }, options);
    
    // add further module implementation that may not be overridden here
    // this.someFunction = function(){ ... }
  };
  App.Module.extend = function(options){
    App.Modules[options.name] = new App.Module(options);;
    
    var links = _.map(App.Modules, function(n){
      return { 
        url   : n.pagePath(), 
        name  : n.name 
      };
    });
    
    App.View.moduleList.html( App.View.templates.linkList(links) );
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

  App.currentUser = App.User.extend({ name : "Alex" });
  
  App.View.sidebar.append(App.View.moduleList);
})();
