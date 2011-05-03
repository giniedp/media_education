(function(){
  
  App.Module.extend({ 
    name          : "mathematics", 
    displayName   : I18n.t("app.modules.math.name"),
    hasHelpPage   : false,
    helpFunction  : "",
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
      makeLinks : function(pages, learn){
        var links = [];
        _.each(_.keys(pages), function(key){
          links.push({
            name : pages[key].name,
            url  : App.Modules.mathematics.pagePath(learn, key),
            depth: pages[key].depth || 0
          });
        });
        return links;
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
      initializeExercises : function(name){
        var math = App.Modules.mathematics;
        var data = math.Model.PractisePages[name];
        var content = App.View.content.find("#exercise");
        content.fadeOut(500, function(){
          $(this).html("").show();

          if (!data.exercise){ return; }
        
          for (var i = 0; i < 10; i++){
            var obj = {};
            
            obj.figure1 = math.Controller.figureFor(data.exercise.figure1);
            obj.figure2 = math.Controller.figureFor(data.exercise.figure2, obj.figure1);
            obj.operator= data.exercise.operator[0];
            
            var temp = _.template('<div class="exercise"><span class="figure-1"><%= figure1 %></span><span class="operator"><%= operator %></span><span class="figure-2"><%= figure2 %></span><span class="equal-sign">=</span><input class="result" type="text" autocomplete="off"></input><span class="validation"></span></div>',obj);
            $(temp).hide().appendTo(content).fadeIn(500);
          }

          var temp = $("<a href='#' onclick=\"App.Modules.mathematics.Controller.initializeExercises('" + name + "'); return false;\">Neue Aufgaben</a>");
          $(temp).hide().appendTo(content).fadeIn(500);          
        });
        

      },
      showLearnPage : function(name){
        var math = App.Modules.mathematics;
        var navContent = App.View.templates.linkList(math.Controller.makeLinks(math.Model.LearnPages, true));
        var waiContent = App.View.templates.whereami({
          links : [{
            name : math.displayName,
            url  : math.pagePath()
          },{
            name : "Lernen - " + math.Model.LearnPages[name].name,
            url  : math.pagePath(true, name)
          }],
          statistics : ""
        });
        
        $.get("modules/mathematics/learn/" + name + ".html", function(data){
            App.Controller.swapContent(App.View.content, data);
            App.Controller.swapContent(App.View.sidebar, navContent);
            App.Controller.swapContent(App.View.info, waiContent);
        });
      },
      showPractisePage : function(name){
        var math = App.Modules.mathematics;
        var navContent = App.View.templates.linkList(math.Controller.makeLinks(math.Model.PractisePages, false));
        var waiContent = App.View.templates.whereami({
          links : [{
            name : math.displayName,
            url  : math.pagePath()
          },{
            name : "Üben - " + math.Model.PractisePages[name].name,
            url  : math.pagePath(false, name)
          }],
          statistics : ""
        });

        $.get("modules/mathematics/practise/" + name + ".html", function(data){
            App.Controller.swapContent(App.View.content, data, function(){
              App.Modules.mathematics.Controller.initializeExercises(name);
            });
            App.Controller.swapContent(App.View.sidebar, navContent); 
            App.Controller.swapContent(App.View.info, waiContent);         
        });
      },
      showIndexPage : function(){
        var math = App.Modules.mathematics;
        var navContent = App.View.templates.linkList([{
          name : "Lernen",
          url  : math.pagePath(true, "index")
        },{
          name : "Üben",
          url  : math.pagePath(false, "index")
        }]);
        var waiContent = App.View.templates.whereami({
          links : [{
            name : "Mathematik",
            url  : math.pagePath()
          }],
          statistics : ""
        });
        
        $.get("modules/mathematics/index.html", function(data){
            App.Controller.swapContent(App.View.content, data);
            App.Controller.swapContent(App.View.sidebar, navContent);   
            App.Controller.swapContent(App.View.info, waiContent);       
        });
      }
    },
    Model : {
      LearnPages : {
        "index" : {
          name : "Start",
          depth: 0
        },
        "page1" : {
          name : "Alle von 9, den letzten von 10",
          depth: 0
        },
        "page2" : {
          name : "Vertikal und kreuzweise",
          depth: 0
        },
        "page2a" : {
          name : "für einstellige Zahlen",
          depth: 1
        },
        "page2b" : {
          name : "für Zahlen unter und nahe 100",
          depth: 1
        },
        "page2c" : {
          name : "für Zahlen über und nahe 100",
          depth: 1
        },
        "page2d" : {
          name : "für Summen kleiner Brüche",
          depth: 1
        },
        "page3" : {
          name : "Um 1 mehr als der davor",
          depth: 0
        },
        "page4" : {
          name : "Multiplikation mit 11",
          depth: 0
        },
        "page5" : {
          name : "Division durch 9",
          depth: 0
        }
      },
      PractisePages : {
        "index" : {
          name : "Start",
          depth: 0
        },
        "page1" : {
          name     : "Alle von 9 und den letzten von 10",
          depth    : 0,
          exercise : {
            figure1 : [10, 100, 1000],
            figure2 : [[0, 9], [0, 99], [0, 999]],
            operator: ["-"]
          }
        },
        "page2" : {
          name : "Vertikal und Kreuzweise",
          depth: 0
        },
        "page2a" : {
          name     : "für einstellige Zahlen",
          depth    : 1,
          exercise : {
            figure1 : [[0, 10]],
            figure2 : [[0, 10]],
            operator: ["*"]
          }
        },
        "page2b" : {
          name     : "für Zahlen unter und nahe 100",
          depth    : 1,
          exercise : {
            figure1 : [[85, 100]],
            figure2 : [[85, 100]],
            operator: ["*"]
          }
        },
        "page2c" : {
          name     : "für Zahlen über und nahe 100",
          depth    : 1,
          exercise : {
            figure1 : [[100, 125]],
            figure2 : [[100, 125]],
            operator: ["*"]
          }
        },
        "page2d" : {
          name     : "für Summen kleiner Brüche",
          depth    : 1,
          exercise : {
            figure1 : [[0, 10]],
            figure2 : [[0, 10]],
            operator: ["/"]
          }
        },
        "page3" : {
          name     : "Um 1 mehr als dem davor",
          depth    : 0,
          exercise : {
            figure1 : [5, 15, 25, 35, 45, 55, 65, 75, 85, 95],
            figure2 : "figure1",
            operator: ["*"]
          }
        },
        "page4" : {
          name     : "Multiplikation mit 11",
          depth    : 0,
          exercise : {
            figure1 : [[10, 99]],
            figure2 : [11],
            operator: ["*"]
          }
        },
        "page5" : {
          name     : "Division durch 9",
          depth    : 0,
          exercise : {
            figure1 : [[10, 1000]],
            figure2 : [9],
            operator: ["/"]
          }
        }
      }
    }
  });
  
  App.Controller.pickModule(App.Modules.mathematics);
})();