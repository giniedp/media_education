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
      whereami : _.template("<div>Du bist hier:</div> <% _.each(links, function(link) { %><div><%= App.View.templates.localLink(link) %></div><% }); %>  <% if (statistics) { %> <div><%= App.currentModule.statsTemplate({ statistics : statistics}) %></div> <% } %>"),
      linkList : _.template("<ul> <% _.each(arguments[0], function(link) { %> <li class='<% if(link.active) {%>active<% } %>'><%= App.View.templates.localLink(link) %></li> <% if (arguments[0].subnav) { %><%= App.View.templates.linkList(arguments[0].subnav) %><% } %><% }); %> </ul>"),
      article  : _.template("<h2><%= title %></h2><p><%= body %></p>"),
      quickicon: _.template("<li <% if(item.enabled) { %> onclick=\"<%= item.action %>\" <% } %> class='ui-state-<% if(item.enabled){ %>default<% } else { %>error<% } %> ui-corner-all' title='<%= item.tiptip %>'><span class='ui-icon ui-icon-<%= item.icon %>'></span></li>"),
      quicknav : _.template("<ul> <% _.each(arguments[0], function(item) { %> <%= App.View.templates.quickicon({ item : item }) %> <% }); %> </ul>")
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
    evaluateAppHash : function(current, hash){
      if (current === "sign_in") {

      } else if (current === "register") {

      } else if (current === "profile") {

      } else {
          var waiContent = App.View.templates.whereami({
            links : [{
              name : "Hauptseite",
              url  : "#index"
            }],
            statistics : ""
          });
          $.get("app/index.html", function(data){
            App.Controller.swapContent(App.View.content, data);
            App.Controller.swapContent(App.View.sidebar, App.View.moduleList); 
            App.Controller.swapContent(App.View.info, waiContent);   
        });
      }
    },
    evaluateHash : function(newHash){
      var hash = window.location.hash;
      
      if (typeof(newHash) === "string"){
        hash = newHash;
        window.location.hash = hash;
      }
      
      hash = hash.replace(/.*\#/, "").split("/");
      
      var current = hash.shift();
      if (current === "app"){
        current = hash.shift();
        App.Controller.pickModule(current).evaluateHash(hash);
      } else {
        App.Controller.evaluateAppHash(current, hash);
      }
      
      var iconContent = App.View.templates.quicknav([{
        enabled : true,
        tiptip  : "Zur Hauptseite des Moduls: " + App.currentModule.displayName,
        icon    : "folder-open",
        action  : "alert('foo');"
      },{
        enabled : true,
        tiptip  : "Zur Hauptseite des Programms",
        icon    : "home",
        action  : "App.Controller.evaluateHash('#index')"
      },{
        enabled : true,
        tiptip  : "Login / Profilseite",
        icon    : "person",
        action  : "alert('foo');"
      },{
        enabled : App.currentModule.hasHelpPage,
        tiptip  : (App.currentModule.helpTitle || (App.currentModule.hasHelpPage ? "Hilfe zur aktuellen Seite" : "Zu der aktuellen Seite ist keine Hilfe verfügbar")),
        icon    : "help",
        action  : App.currentModule.helpFunction
      }]);
      
      App.Controller.swapContent(App.View.quicknav, iconContent, 0);
    },
    swapContent : function(container, content, callback, duration){
      if (typeof(content) === "function"){
        content = content.call();  
      }
      content = App.Controller.processContent(content);
      
      if (typeof(callback) === "number"){
        duration = callback;
        callback = undefined;
      }
      
      if (typeof(duration) !== "number"){ 
        duration = 300; 
      }
      
      $(container).fadeOut(duration, function(){
        container.html(content).fadeIn(duration, callback);
        container.find("*[title]").tipTip({});
        // left collegeblock background container must be stretched
        // to the full height of the content page. Can not solve it with css onl
        $("#left").css({
          height : Math.max($("#middle").innerHeight(), $("#right").innerHeight()) 
        });
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
        title : url,
        modal : true,
        width : "90%",
        height : 600,
        //buttons : {
        //  "Schliessen" : function(){
        //    $(this).dialog("close");
        //  }
        //},
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
      app           : App,
      hasHelpPage   : false,
      helpFunction  : "",
      whereAmIData  : {},
      statsTemplate : _.template("Statistics: "),
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
      }
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
        name  : n.displayName 
      };
    });
    
    App.View.moduleList.html( App.View.templates.linkList(links) );
    return App.Modules[options.name];
  };


  
  // App.User
  // -----------------
  // This is our user data. Unless the user is signed in, we use the default guest user data.
  // This one may be stored in the session to keep module statistics
  // User instance may be created like this
  // App.User.extend({ some : options, and : content });
  App.User = function(options){
    _.extend(this, { 
      name : I18n.t("app.user.guest_name"),
      statistics : {}
      // Add further user implementations that may be overridden with options here
    }, options);
    
    // add further module implementation that may not be overridden here
    //this.someFunction = function(){ ... }
    
    this.moduleStatistics = function(module, options){
      if (!this.statistics[module.name]){
        this.statistics[module.name] = {};
      }
      return this.statistics[module.name]
    };
  };
  App.User.extend = function(options){
    return new App.User(options);
  };



  App.currentUser = App.User.extend({});
  App.View.sidebar.append(App.View.moduleList);
})();
