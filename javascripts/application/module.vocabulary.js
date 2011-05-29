(function(){
  
  App.Module.extend({ 
    name          : "vocabulary", 
    displayName   : I18n.t("app.modules.vocabulary.name"),
    hasHelpPage    : false,
    helpFunction   : "",
    whereAmIData   : {},
    navigationData : {},
    wisdomLevel    : 2,
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
      //get array of vocabulary
      //ordered: 
      //wisdomLevel determines, how often a vocable is max checked correctly, put this to disable
      getVocabulary : function(n, learn){
        if(n === undefined || n < 0) n = 5; //how many?
        var ordered = 0;
        var wisdom = App.Modules.vocabulary.wisdomLevel;
        
        if(learn){ 
          ordered = 1;  //randomize?
          wisdom = -1;  //wisdomLevel?
        }
        
        //TODO server logic + userid ...
        //temp data for now...
        return { vocabulary : [{
          origin  : "Hello",
          lang    : "de",
          translations : ["Hallo"],
          correctGuesses : 2
        },{
          origin  : "die Banane",
          lang    : "en",
          translations : ["banana"],
          correctGuesses : 1
        },{
          origin  : "der Apfel",
          lang    : "en",
          translations : ["apple"],
          correctGuesses : 0
        },{
          origin  : "das Haus",
          lang    : "en",
          translations : ["house"],
          correctGuesses : 0
        },{
          origin  : "die Wohnung",
          lang    : "en",
          translations : ["apartment", "accommodation", "flat", "residence"],
          correctGuesses : 0
        }]};
      },
      initializeExercises : function(learn){
        //load and show exercises... -> getVocabulary()
        //add handler to reload vocs...
        //add handler to send vocs back to server, when used.
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
            name   : I18n.t("app.modules.vocabulary.learn"),
            url    : voc.pagePath(true, name),
            active : false
          }],
          statistics : App.currentUser.moduleStatistics(voc)
        }

        var navContent = App.View.templates.linkList(voc.navigationData);
        var waiContent = App.View.templates.whereami(voc.whereAmIData);
        
        $.get("modules/vocabulary/learn.html", function(data){
            App.Controller.swapContent(App.View.content, data, function(){
              App.Modules.vocabulary.Controller.initializeExercises(true);
            });
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
            name : I18n.t("app.modules.vocabulary.practice"),
            url  : voc.pagePath(false, name),
            active : false
          }],
          statistics : App.currentUser.moduleStatistics(voc)
        }
        
        var navContent = App.View.templates.linkList(voc.navigationData);
        var waiContent = App.View.templates.whereami(voc.whereAmIData);

        $.get("modules/vocabulary/practice.html", function(data){
            App.Controller.swapContent(App.View.content, data, function(){
              App.Modules.vocabulary.Controller.initializeExercises(false);
            });
            App.Controller.swapContent(App.View.sidebar, navContent, 0); 
            App.Controller.swapContent(App.View.info, waiContent, 0);         
        });
      },
      showIndexPage : function(){
        var voc = App.Modules.vocabulary;
        voc.navigationData = [{
          name   : I18n.t("app.modules.vocabulary.learn"),
          url    : voc.pagePath(true, "index"),
          active : false
        },{
          name   : I18n.t("app.modules.vocabulary.practice"),
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
        
        $.get("modules/vocabulary/index.html", function(data){
            App.Controller.swapContent(App.View.content, data);
            App.Controller.swapContent(App.View.sidebar, navContent, 0);   
            App.Controller.swapContent(App.View.info, waiContent, 0);       
        });
      }
    },
  });
  
})();
