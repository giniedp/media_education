(function(){
  
  App.Module.extend({ 
    name          : "vocabulary", 
    displayName   : I18n.t("app.modules.vocabulary.name"),
    hasHelpPage    : false,
    helpFunction   : "",
    whereAmIData   : {},
    navigationData : {},
    wisdomLevel    : 2,
    vocData       : [],
    vocHandle     : 0,
    statsTemplate  : _.template("<div title='Du hast bisher <%= statistics.wrongAnswers | 0 %> falsche und <%= statistics.correctAnswers | 0 %> richtige Antworten gegeben.'> <span style='color:red;'><%= statistics.wrongAnswers | 0 %></span> / <span style='color:green;'><%= statistics.correctAnswers | 0 %></span> </div>"),
    evaluateHash  : function(hash){
      App.Controller.pickModule(this.name);
      var current = hash.shift();
      
      if (current === "test"){
        this.Controller.showTestPage(hash.shift());
      } else if (current === "dict"){
        this.Controller.showDictionaryPage(hash.shift());
      } else {
        this.Controller.showIndexPage();
      }
      return;
    },
    pagePath : function(page, pageName){
      if (page === 'test'){
        return App.Controller.pathFor(["app", this.name, "test", pageName]);
      } else if (page === 'dict'){
        return App.Controller.pathFor(["app", this.name, "dict", pageName]);
      } else {
        return App.Controller.pathFor(["app", this.name]);
      }
    },
    setNavigation : function(url) {
      App.Modules.vocabulary.navigationData = [{
          name   : I18n.t("app.modules.vocabulary.test"),
          url    : this.pagePath('test', "index"),
          active : url === 'test'
        },{
          name   : I18n.t("app.modules.vocabulary.dict"),
          url    : this.pagePath('dict', "index"),
          active : url === 'dict'
        }];
      return App.Modules.vocabulary.navigationData;
    },
    Controller : {
      //get array of vocabulary
      //ordered: 
      //wisdomLevel determines, how often a vocable is max checked correctly, put this to disable
      getVocabulary : function(learn, callback, n){
        if(n === undefined || n < 0) n = 5; //how many?
        var ordered = 0;
        var wisdom = App.Modules.vocabulary.wisdomLevel;
        
        if(learn){ 
          ordered = 1;  //randomize?
          wisdom = -1;  //wisdomLevel?
        }
        
        callback = (callback || App.Modules.vocabulary.Controller.appendVocData);
        if (typeof(callback) === "function"){
            callback.call(this, { vocabulary : [{
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
          }]});
        }
        
        //TODO server logic + userid ...
        //temp data for now...
        return ;
      },
      appendVocData : function(data){
        App.Modules.vocabulary.vocData = App.Modules.vocabulary.vocData.concat(data.vocabulary);
      },
      initializeExercises : function(data){
        var voc = App.Modules.vocabulary;
        //load and show exercises... -> getVocabulary()
        if(data) {
          App.Modules.vocabulary.Controller.appendVocData(data);
        }
        
        //prefetch vocabulary
        if(App.Modules.vocabulary.vocData.length <= App.Modules.vocabulary.vocHandle) {
          voc.Controller.getVocabulary(false, App.Modules.vocabulary.Controller.initializeExercises);
          return;
        }
        
        var content = App.View.content.find("#exercise");
        //fade and disable old exercises...
        var exercises = content.find('.exercise');
        for(var i = 0; i < exercises.length; i++) {
          var obj = $(exercises[i]);
        
          var inp = obj.find("input.result")[0];
          inp.disabled = true;
          var opac = (obj.css("opacity") || 1) - 0.2;
          if(opac > 0)
            obj.fadeTo("slow", opac);
          if(opac <= 0) {
            obj.fadeTo("slow", 0, function() {
              $(this).remove();
            })
          }
        }

        var obj = App.Modules.vocabulary.vocData[App.Modules.vocabulary.vocHandle];
        obj.id = App.Modules.vocabulary.vocHandle;
        App.Modules.vocabulary.vocHandle += 1;
        var temp = _.template('<div class="exercise" id="<%= id %>"><%= origin %><input class="result" type="text" autocomplete="off" onchange="App.Modules.vocabulary.Controller.validateExercise($(this).parent());"></input><span class="validation"></span></div>',obj);
        $(temp).hide().prependTo(content).fadeIn(500, function() {
          $('#exercise input.result')[0].focus();
        });
      },
      validateExercise : function(container){
        var id = container.attr("id");
        var input = container.find("input.result");
        var userResult = input.val();

        var result = false;
        for(var i=0; i < App.Modules.vocabulary.vocData[id].translations.length; i++) {
          if(App.Modules.vocabulary.vocData[id].translations[i].toLowerCase() === userResult.toLowerCase()) {
            result = true;
            break;
          }
        }
        
        var stats = App.currentUser.moduleStatistics(App.currentModule);
        //TODO send result to server
        if (result){
          input.animate({ "background-color" : "green" });
          stats.correctAnswers = (stats.correctAnswers | 0) + 1;
        } else {
          input.animate({ "background-color" : "red" });
          stats.wrongAnswers = (stats.wrongAnswers | 0) + 1;
        }
        
        var waiContent = App.View.templates.whereami(App.Modules.vocabulary.whereAmIData);
        App.Controller.swapContent(App.View.info, waiContent, 0);
        
        App.Modules.vocabulary.Controller.initializeExercises();
      },
      initializeDictionary : function(){
        var voc = App.Modules.vocabulary;
        
        var content = App.View.content.find("#dictionary");
        content.fadeOut(500, function(){
          $(this).html("").show();

          var temp = $('<input type="text" autocomplete="off" id="dict"></input><div id="autotarget"></div>');
          $(temp).hide().appendTo(content).fadeIn(500, function() {
            $( "#dict" ).autocomplete({
              source: "modules/vocabulary/temp.txt",
              minLength: 2,
              select: function( event, ui ) {
                var temp = _.template('<h3><%= ui.item.origin %></h3><p><% _.each(ui.item.translations, function(item) { %> <%= item %><br /><% }); %></p>', { ui : ui });
                App.Controller.swapContent($('#autotarget'), temp);
              }
            });
          });
        });
      },
      showLearnPage : function(){
        var voc = App.Modules.vocabulary;
        voc.whereAmIData = {
          links : [{
            name   : voc.displayName,
            url    : voc.pagePath(),
            active : false
          },{
            name   : I18n.t("app.modules.vocabulary.learn"),
            url    : voc.pagePath(true, 'index'),
            active : false
          }],
          statistics : App.currentUser.moduleStatistics(voc)
        }

        var navContent = App.View.templates.linkList(voc.setNavigation('learn'));
        var waiContent = App.View.templates.whereami(voc.whereAmIData);
        
        $.get("modules/vocabulary/learn.html", function(data){
            App.Controller.swapContent(App.View.content, data, function(){
              //App.Modules.vocabulary.Controller.initializeExercises();
            });
            App.Controller.swapContent(App.View.sidebar, navContent, 0);
            App.Controller.swapContent(App.View.info, waiContent, 0);
        });
      },
      showDictionaryPage : function(){
        var voc = App.Modules.vocabulary;
        voc.whereAmIData = {
          links : [{
            name   : voc.displayName,
            url    : voc.pagePath(),
            active : false
          },{
            name   : I18n.t("app.modules.vocabulary.dict"),
            url    : voc.pagePath('dict', 'index'),
            active : false
          }],
          statistics : ""
        }

        var navContent = App.View.templates.linkList(voc.setNavigation('dict'));
        var waiContent = App.View.templates.whereami(voc.whereAmIData);
        
        $.get("modules/vocabulary/dict.html", function(data){
            App.Controller.swapContent(App.View.content, data, function(){
              App.Modules.vocabulary.Controller.initializeDictionary();
            });
            App.Controller.swapContent(App.View.sidebar, navContent, 0);
            App.Controller.swapContent(App.View.info, waiContent, 0);
        });
      },
      showTestPage : function(){
        var voc = App.Modules.vocabulary;
        voc.whereAmIData = {
          links : [{
            name   : voc.displayName,
            url    : voc.pagePath(),
            active : false
          },{
            name : I18n.t("app.modules.vocabulary.test"),
            url  : voc.pagePath('test', "index"),
            active : false
          }],
          statistics : App.currentUser.moduleStatistics(voc)
        }
        
        var navContent = App.View.templates.linkList(voc.setNavigation('test'));
        var waiContent = App.View.templates.whereami(voc.whereAmIData);

        $.get("modules/vocabulary/test.html", function(data){
            App.Controller.swapContent(App.View.content, data, function(){
              App.Modules.vocabulary.Controller.initializeExercises();
            });
            App.Controller.swapContent(App.View.sidebar, navContent, 0);
            App.Controller.swapContent(App.View.info, waiContent, 0);
        });
      },
      showIndexPage : function(){
        var voc = App.Modules.vocabulary;
        
        voc.whereAmIData = {
          links : [{
            name   : voc.displayName,
            url    : voc.pagePath(),
            active : false
          }],
          statistics : ""
        }
        
        var navContent = App.View.templates.linkList(voc.setNavigation('index'));
        var waiContent = App.View.templates.whereami(voc.whereAmIData);
        
        $.get("modules/vocabulary/index.html", function(data){
            App.Controller.swapContent(App.View.content, data);
            App.Controller.swapContent(App.View.sidebar, navContent, 0);
            App.Controller.swapContent(App.View.info, waiContent, 0);
        });
      }
    }
  });
  
})();
