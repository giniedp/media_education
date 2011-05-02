(function(){
  
  App.Module.extend({ 
    name          : "mathematics", 
    displayName   : I18n.t("app.modules.math.name"),
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
            url  : App.Modules.mathematics.pagePath(learn, key)
          });
        });
        return links;
      },
      showLearnPage : function(name){
        var math = App.Modules.mathematics;
        var navContent = App.View.templates.linkList(math.Controller.makeLinks(math.Model.LearnPages, true));
        var waiContent = App.View.templates.whereami({
          links : [{
            name : "Mathematik",
            url  : math.pagePath()
          },{
            name : "Lernen - " + name,
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
            name : "Mathematik",
            url  : math.pagePath()
          },{
            name : "Üben - " + name,
            url  : math.pagePath(false, name)
          }],
          statistics : ""
        });
        
        $.get("modules/mathematics/practise/" + name + ".html", function(data){
            App.Controller.swapContent(App.View.content, data, function(){
              //Ap.View.content.find("#exercise")
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
          name : "Um 1 mehr als der davor"
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
          depth    : 0,
          exercise : {
            figure1 : [[0, 10]],
            figure2 : [[0, 10]],
            operator: ["*"]
          }
        },
        "page2b" : {
          name     : "für Zahlen unter und nahe 100",
          depth    : 0,
          exercise : {
            figure1 : [[85, 100]],
            figure2 : [[85, 100]],
            operator: ["*"]
          }
        },
        "page2c" : {
          name     : "für Zahlen über und nahe 100",
          depth    : 0,
          exercise : {
            figure1 : [[100, 125]],
            figure2 : [[100, 125]],
            operator: ["*"]
          }
        },
        "page2d" : {
          name     : "für Summen kleiner Brüche",
          depth    : 0,
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
            figure2 : 9,
            operator: ["/"]
          }
        }
      }
    }
  });
  
  App.Controller.pickModule(App.Modules.mathematics);
})();