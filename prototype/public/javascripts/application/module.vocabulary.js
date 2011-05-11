(function(){
  
  App.Module.extend({ 
    name          : "vocabulary", 
    displayName   : I18n.t("app.modules.vocabulary.name"),
    hasHelpPage    : false,
    helpFunction   : "",
    whereAmIData   : {},
    navigationData : {},
    statsTemplate  : _.template("<div title='Du hast bisher <%= statistics.wrongAnswers | 0 %> falsche und <%= statistics.correctAnswers | 0 %> richtige Antworten gegeben.'> <span style='color:red;'><%= statistics.wrongAnswers | 0 %></span> / <span style='color:green;'><%= statistics.correctAnswers | 0 %></span> </div>"),
    evaluateHash  : function(hash){
      App.Controller.pickModule(this.name);
      var current = hash.shift();
      
      if (current === "learn"){
        this.Controller.showLearnPage(hash.shift());
        return;
      } else if (current === "practise"){
        this.Controller.showPractisePage(hash.shift());
        return;
      }
      
      this.Controller.showIndexPage();
    },
    Controller : {
      makeWhereAmIData : function(link,stats){
        var mod = App.currentModule;
        mod.whereAmIData = {
          links : [{
            name   : mod.displayName,
            url    : mod.pagePath(),
            active : false
          },link],
          statistics : App.currentUser.moduleStatistics(mod)
        };
      },
      showLearnPage : function(name){
        name = name || "index";
        var voc = App.Modules.vocabulary;
  //      voc.navigationData = math.Controller.makeLinks(voc.Model.LearnPages, name, true);
        voc.navigationData = {},
        voc.whereAmIData = {
          links : [{
            name   : voc.displayName,
            url    : voc.pagePath(),
            active : false
          },{
  //          name   : "Lernen - " + voc.Model.LearnPages[name].name,
            name   : "Lernen ... bla",
            url    : voc.pagePath(true, name),
            active : false
          }],
          statistics : App.currentUser.moduleStatistics(voc)
        }

        var navContent = App.View.templates.linkList(voc.navigationData);
        var waiContent = App.View.templates.whereami(voc.whereAmIData);
        
        $.get("modules/mathematics/learn/" + name + ".html", function(data){
            App.Controller.swapContent(App.View.content, data);
            App.Controller.swapContent(App.View.sidebar, navContent, 0);
            App.Controller.swapContent(App.View.info, waiContent, 0);
        });
      },
      showPractisePage : function(name){
        name = name || "index";
        var voc = App.Modules.vocabulary;
   //    voc.navigationData = math.Controller.makeLinks(math.Model.PractisePages, name, false);
        voc.navigationData = {},
        voc.whereAmIData = {
          links : [{
            name   : voc.displayName,
            url    : voc.pagePath(),
            active : false
          },{
     //       name : "Üben - " + voc.Model.PractisePages[name].name,
            name : "Üben ... bla",
            url  : voc.pagePath(false, name),
            active : false
          }],
          statistics : App.currentUser.moduleStatistics(voc)
        }
        
        var navContent = App.View.templates.linkList(voc.navigationData);
        var waiContent = App.View.templates.whereami(voc.whereAmIData);

        $.get("modules/mathematics/practise/" + name + ".html", function(data){
            App.Controller.swapContent(App.View.content, data, function(){
              App.Modules.mathematics.Controller.initializeExercises(name);
            });
            App.Controller.swapContent(App.View.sidebar, navContent, 0); 
            App.Controller.swapContent(App.View.info, waiContent, 0);         
        });
      },
      showIndexPage : function(){
        var voc = App.Modules.vocabulary;
        voc.navigationData = [{
          name   : "Lernen",
          url    : voc.pagePath(true, "index"),
          active : false
        },{
          name   : "Üben",
          url    : voc.pagePath(false, "index"),
          active : false
        }];
        
        voc.whereAmIData = {
          links : [{
            name   : voc.displayName,
            url    : voc.pagePath(),
            active : false
          }],
          statistics : ""
        }
        
        var navContent = App.View.templates.linkList(voc.navigationData);
        var waiContent = App.View.templates.whereami(voc.whereAmIData);
        
        $.get("modules/mathematics/index.html", function(data){
            App.Controller.swapContent(App.View.content, data);
            App.Controller.swapContent(App.View.sidebar, navContent, 0);   
            App.Controller.swapContent(App.View.info, waiContent, 0);       
        });
      }
    },
  });
  
})();
