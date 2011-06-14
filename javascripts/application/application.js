log = function(message){
  if (console){
    console.log(message);
    return true;
  }
  return false;
};
today = new Date();
today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
today = today.getTime();

(function(){
  
  // Initial Setup
  // -------------
$.ajaxSetup({
  cache: false
});

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
      linkList : _.template("<ul> <% _.each(arguments[0], function(link) { %> <li class='<% if(link.active) {%>active<% } %>'><%= App.View.templates.localLink(link) %><% if (link.sublink) { %><%= App.View.templates.localLink(link.sublink) %><% } %>  </li> <% if (arguments[0].subnav) { %><%= App.View.templates.linkList(arguments[0].subnav) %><% } %><% }); %> </ul>"),
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
      
      var accessMatch = current.match(/^access_token/);
      if (accessMatch !== null || 
          (current === "sign_in") ||
          (current === "register") ||
          (current === "profile")){
        App.Controller.pickModule("login").evaluateHash(hash, current);
      } else {
          var waiContent = App.View.templates.whereami({
            links : [{
              name : "Hauptseite",
              url  : App.Controller.pathFor(["index"])
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
      
      var enableModuleLink = true;
      var current = hash.shift();
      if (current === "app"){
        current = hash.shift();
        App.Controller.pickModule(current).evaluateHash(hash);
      } else {
        App.Controller.evaluateAppHash(current, hash);
        enableModuleLink = false;
      }
      
      var iconContent = [{
        enabled : true,
        tiptip  : "Zur Hauptseite des Programms",
        icon    : "home",
        action  : "App.Controller.evaluateHash('#index')"
      },{
        enabled : true,
        tiptip  : "Login / Profilseite",
        icon    : "person",
        action  : "App.Controller.evaluateHash('#sign_in');"
      }];
      
      if (enableModuleLink){
        iconContent.push({
          enabled : App.currentModule.hasHelpPage,
          tiptip  : (App.currentModule.helpTitle || (App.currentModule.hasHelpPage ? "Hilfe zur aktuellen Seite" : "Zu der aktuellen Seite ist keine Hilfe verfügbar")),
          icon    : "help",
          action  : (App.currentModule.hasHelpPage ? App.currentModule.helpFunction : "") 
        });
      } else {
        iconContent.push({
          enabled : false,
          tiptip  : "Zu der aktuellen Seite ist keine Hilfe verfügbar",
          icon    : "help",
          action  : ""
        });
      }
      iconContent = App.View.templates.quicknav(iconContent);
      
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
    showDialog : function(content, options){
      options = (options || {});
      var dialog = $("<div id='dialog'/>");
      $("body").append(dialog);
      
      dialog.dialog({
        title : options.title,
        modal : true,
        width : options.width,
        height : options.height,
        close : function(){
          $("body #dialog").remove();
        }
      }).html(content);
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
      navigatable   : true,
      statsTemplate : _.template("Statistics: "),
      evaluateHash : function(args){
        log(args);
      },
//      render : function(){
//        return "FOO";
//      },
      pagePath : function(learnPage, pageName){
        if (learnPage === true){
          return App.Controller.pathFor(["app", this.name, "learn", pageName]);
        } else if (learnPage === false){
          return App.Controller.pathFor(["app", this.name, "practise", pageName]);
        } else {
          return App.Controller.pathFor(["app", this.name]);
        }
      },
      percentageFormatter : function(v, axis) {
        return v.toFixed(axis.tickDecimals) +"%";
      },
      plotStatistics : function(content){
        var stats = App.currentUser.moduleStatistics(this, {allDates: true});
        var correct = new Array(); var wrong = new Array(); var percentage = new Array();
        var min; var max;
        _.each(stats,
            function(item, key){
                correct.push(new Array(parseInt(key), item.correctAnswers || 0));
                wrong.push(new Array(parseInt(key), item.wrongAnswers || 0));
                var total = (item.wrongAnswers || 0) + (item.correctAnswers || 0);
                percentage.push(new Array(parseInt(key), ((item.correctAnswers || 0) * 100) / total));
            });
        //TODO remove or bundle old...
        content.fadeIn('fast', function(){
          $.plot(content, 
            [{ label: "correct", data: correct}, 
              { label: "wrong", data: wrong}, 
              { label: "percentage", data: percentage, yaxis: 2} ], 
            { xaxis: {
                mode: "time",
                minTickSize: [1, "day"]},
              yaxes: [ { min: 0 }, {
                  // align if we are to the right
                  alignTicksWithAxis: 1,
                  position: 'right',
  //                tickFormatter: App.Module.this.percentageFormatter,
                  min: 0,
                  max: 100
                } ],

              series: {
                lines: { show: true, fill: true, steps: false },
                points: { show: true }
              }
            });});
      }
      // Add further module implementations that may be overridden with options here
    }, options);
    
    // add further module implementation that may not be overridden here
    // this.someFunction = function(){ ... }
    this.fadeExercises = function(content, count) {
      var opacDiff = 1 / ( count || 5);
      
      content.children().each(function(index, item){
        var obj = $(item);
        var inp = obj.find("input.result")[0];
        inp.disabled = true;
        var opac = obj.css("opacity") - opacDiff;
        if(opac > 0.01) { //should fix boxes sometimes not fading out...
          obj.fadeTo("slow", opac)
        } else {
          obj.detach();
        }
      });
    }
  };
  App.Module.extend = function(options){
    App.Modules[options.name] = new App.Module(options);;
    
    var modules = _.select(App.Modules, function(item){
      return item.navigatable;
    });
    
    var links = _.map(modules, function(n){
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
      avatar : "stylesheets/images/guest.png",
      facebookId : -1,
      statistics : {},
      signedIn : false
      // Add further user implementations that may be overridden with options here
    }, options);
    
    // add further module implementation that may not be overridden here
    //this.someFunction = function(){ ... }
    
    this.moduleStatistics = function(module, options){
      options = options || {};
      if (!this.statistics[module.name]){
        this.statistics[module.name] = {};
      }

      if(options.allDates || false){
        return this.statistics[module.name];
      } else {
        if (!this.statistics[module.name][today]){
          this.statistics[module.name][today] = {};
        }

        return this.statistics[module.name][today];
      }
    };
  };
  App.User.extend = function(options){
    return new App.User(options);
  };



  App.currentUser = App.User.extend({});
  App.View.sidebar.append(App.View.moduleList);
})();
