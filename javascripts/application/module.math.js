(function(){
  
  App.Module.extend({ 
    name           : "mathematics", 
    displayName    : I18n.t("app.modules.math.name"),
    hasHelpPage    : false,
    helpFunction   : "",
    whereAmIData   : {},
    navigationData : {},
    statsTemplate  : _.template("<div title='Du hast bisher <%= statistics.wrongAnswers | 0 %> falsche und <%= statistics.correctAnswers | 0 %> richtige Antworten gegeben.'> <span style='color:red;'><%= statistics.wrongAnswers | 0 %></span> / <span style='color:green;'><%= statistics.correctAnswers | 0 %></span> </div>"),
    evaluateHash  : function(hash){
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
      makeLinks : function(pages, name, learn){
        var page = pages[name];
        var parent;
        if (page.parent){
          parent = pages[page.parent];
        }
        var linkData = [];
        
        _.each(_.keys(pages), function(key){
          var item = pages[key];
          if (item.parent === name){
            linkData.push({
              name   : item.name,
              url    : App.Modules.mathematics.pagePath(learn, key),
              active : false
            });
          }
        });
        
        if (linkData.length === 0){
          // page has no children
          // list all siblings and the page itself
          _.each(_.keys(pages), function(key){
            var item = pages[key];
            if (item.parent === page.parent){
              linkData.push({
                name   : item.name,
                url    : App.Modules.mathematics.pagePath(learn, key),
                active : name === key
              });
            }
          });
          // add the parent page of current page as navigation item
          if (parent){
            linkData = [{
              name   : parent.name,
              url    : App.Modules.mathematics.pagePath(learn, page.parent),
              active : false
            }].concat(linkData);
          }
        } else {
          // the page has child items that are listed as navigation items
          // in this case the page is the selected page
          linkData = [{
            name   : page.name,
            url    : App.Modules.mathematics.pagePath(learn, name),
            active : true
          }].concat(linkData);
        }
        
        if (page.backpage || page.parent){
          var key = page.backpage || page.parent.backpage;
          linkData = [{
            name   : "Zurück",
            url    : App.Modules.mathematics.pagePath(learn, key),
            active : false
          }].concat(linkData);
        }
        
        return linkData;
      },
      figureFor : function(range, fallback){
        fallback = fallback || 0;
        
        if (typeof(range)==="string"){
          return fallback;
        }
        
        var allNumbers = false;
        _.each(range, function(item){
          allNumbers = allNumbers || _.isNumber(item);
        });
        
        if (allNumbers){
          var index = Math.round((Math.random() * (range.length - 1)));
          return range[index];
        }
        
        // get a random array from all arrays
        // [[0, 10], [20, 30]]
        var index = Math.round((Math.random() * (range.length - 1)));
        range = range[index];
        
        // get a random number inside range
        //[0, 10]
        return Math.round((Math.random() * (range[1] - range[0])));
      },
      validateExercise : function(container){
        var $this = container;

        var figure1 = $this.find(".figure-1").text();
        var figure2 = $this.find(".figure-2").text();
        var operator = $this.find(".operator").text();
        var userResult = $this.find("input.result").val();
        var result = eval([figure1, operator, figure2].join(" "));
        
        var stats = App.currentUser.moduleStatistics(App.currentModule);
        
        if (result == userResult){
          $this.find(".result").animate({ "background-color" : "green" });
          stats.correctAnswers = (stats.correctAnswers | 0) + 1;
        } else {
          $this.find(".result").animate({ "background-color" : "red" });
          stats.wrongAnswers = (stats.wrongAnswers | 0) + 1;
        }
        
        var waiContent = App.View.templates.whereami(App.Modules.mathematics.whereAmIData);
        App.Controller.swapContent(App.View.info, waiContent, 0);
      },
      initializeExercises : function(name){
        var math = App.Modules.mathematics;
        var data = math.Model.PractisePages[name];
        var content = App.View.content.find("#exercise");
        content.fadeOut(500, function(){
          $(this).html("").show();

          if (!data.exercise){ return; }
        
          for (var i = 0; i < 5; i++){
            var obj = {};
            
            obj.figure1 = math.Controller.figureFor(data.exercise.figure1);
            obj.figure2 = math.Controller.figureFor(data.exercise.figure2, obj.figure1);
            obj.operator= data.exercise.operator[0];
            
            var temp = _.template('<div class="exercise"><span class="figure-1"><%= figure1 %></span><span class="operator"><%= operator %></span><span class="figure-2"><%= figure2 %></span><span class="equal-sign">=</span><input class="result" type="text" autocomplete="off" onchange="App.Modules.mathematics.Controller.validateExercise($(this).parent());"></input><span class="validation"></span></div>',obj);
            $(temp).hide().appendTo(content).fadeIn(500);
          }

          var temp = $("<a href='#' onclick=\"App.Modules.mathematics.Controller.initializeExercises('" + name + "'); return false;\">Neue Aufgaben</a>");
          $(temp).hide().appendTo(content).fadeIn(500);          
        });
        

      },
      showLearnPage : function(name){
        name = name || "index";
        var math = App.Modules.mathematics;
        math.navigationData = math.Controller.makeLinks(math.Model.LearnPages, name, true);
        math.whereAmIData = {
          links : [{
            name   : math.displayName,
            url    : math.pagePath(),
            active : false
          },{
            name   : I18n.t("app.modules.math.learn") + " - " + math.Model.LearnPages[name].name,
            url    : math.pagePath(true, name),
            active : false
          }],
          statistics : App.currentUser.moduleStatistics(math)
        }

        var navContent = App.View.templates.linkList(math.navigationData);
        var waiContent = App.View.templates.whereami(math.whereAmIData);
        
        $.get("modules/mathematics/learn/" + name + ".html", function(data){
            App.Controller.swapContent(App.View.content, data);
            App.Controller.swapContent(App.View.sidebar, navContent, 0);
            App.Controller.swapContent(App.View.info, waiContent, 0);
        });
      },
      showPractisePage : function(name){
        name = name || "index";
        var math = App.Modules.mathematics;
        math.navigationData = math.Controller.makeLinks(math.Model.PractisePages, name, false);
        math.whereAmIData = {
          links : [{
            name   : math.displayName,
            url    : math.pagePath(),
            active : false
          },{
            name : I18n.t("app.modules.math.practice") + " - " + math.Model.PractisePages[name].name,
            url  : math.pagePath(false, name),
            active : false
          }],
          statistics : App.currentUser.moduleStatistics(math)
        }
        
        var navContent = App.View.templates.linkList(math.navigationData);
        var waiContent = App.View.templates.whereami(math.whereAmIData);

        $.get("modules/mathematics/practise/" + name + ".html", function(data){
            App.Controller.swapContent(App.View.content, data, function(){
              App.Modules.mathematics.Controller.initializeExercises(name);
            });
            App.Controller.swapContent(App.View.sidebar, navContent, 0); 
            App.Controller.swapContent(App.View.info, waiContent, 0);         
        });
      },
      showIndexPage : function(){
        var math = App.Modules.mathematics;
        math.navigationData = [{
          name   : I18n.t("app.modules.math.learn"),
          url    : math.pagePath(true, "index"),
          active : false
        },{
          name   : I18n.t("app.modules.math.practice"),
          url    : math.pagePath(false, "index"),
          active : false
        }];
        
        math.whereAmIData = {
          links : [{
            name   : math.displayName,
            url    : math.pagePath(),
            active : false
          }],
          statistics : ""
        }
        
        var navContent = App.View.templates.linkList(math.navigationData);
        var waiContent = App.View.templates.whereami(math.whereAmIData);
        
        $.get("modules/mathematics/index.html", function(data){
            App.Controller.swapContent(App.View.content, data);
            App.Controller.swapContent(App.View.sidebar, navContent, 0);   
            App.Controller.swapContent(App.View.info, waiContent, 0);       
        });
      }
    },
    Model : {
      LearnPages : {
        "index" : {
          name : "Start"
        },
        "page1" : {
          name : "Alle von 9, letzten von 10"
        },
        "page2" : {
          name     : "Vertikal und kreuzweise",
          backpage : "index"
        },
        "page2a" : {
          name  : "Zahlen unter und nahe 10",
          parent: "page2"
        },
        "page2b" : {
          name  : "Zahlen über und nahe 10",
          parent: "page2"
        },
        "page2c" : {
          name : "Zahlen unter und nahe 100",
          parent: "page2"
        },
        "page2d" : {
          name : "Zahlen über und nahe 100",
          parent: "page2"
        },
        "page3" : {
          name : "Einer mehr als der zuvor"
        },
        "page4" : {
          name : "Multiplikation mit 11"
        },
        "page5" : {
          name : "Division durch 9"
        }
      },
      PractisePages : {
        "index" : {
          name : "Start"
        },
        "page1" : {
          name     : "Alle von 9, letzten von 10",
          exercise : {
            figure1    : [10, 100, 1000],
            figure2    : [[0, 9], [0, 99], [0, 999]],
            conditions : "figure1 >= figure2",
            operator   : ["-"]
          }
        },
        "page2" : {
          name     : "Vertikal und Kreuzweise",
          backpage : "index"
        },
        "page2a" : {
          name     : "Zahlen unter und nahe 10",
          parent   : "page2",
          exercise : {
            figure1 : [[6, 10]],
            figure2 : [[6, 10]],
            operator: ["*"]
          }
        },
        "page2b" : {
          name     : "Zahlen über und nahe 10",
          parent   : "page2",
          exercise : {
            figure1 : [[10, 15]],
            figure2 : [[10, 15]],
            operator: ["*"]
          }
        },
        "page2c" : {
          name     : "Zahlen unter und nahe 100",
          parent   : "page2",
          exercise : {
            figure1 : [[90, 100]],
            figure2 : [[90, 100]],
            operator: ["*"]
          }
        },
        "page2d" : {
          name     : "Zahlen über und nahe 100",
          parent   : "page2",
          exercise : {
            figure1 : [[100, 110]],
            figure2 : [[100, 110]],
            operator: ["*"]
          }
        },
        "page3" : {
          name     : "Einer mehr als der zuvor",
          exercise : {
            figure1 : [5, 15, 25, 35, 45, 55, 65, 75, 85, 95],
            figure2 : "figure1",
            operator: ["*"]
          }
        },
        "page4" : {
          name     : "Multiplikation mit 11",
          exercise : {
            figure1 : [[10, 99]],
            figure2 : [11],
            operator: ["*"]
          }
        },
        "page5" : {
          name     : "Division durch 9",
          exercise : {
            figure1 : [[10, 99]],
            figure2 : [9],
            operator: ["/"]
          }
        }
      }
    }
  });
  
  App.Controller.pickModule(App.Modules.mathematics);
})();
