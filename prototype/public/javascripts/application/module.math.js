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
      showLearnPage : function(name){
        var math = App.Modules.mathematics;
        var navContent = App.View.templates.linkList([{
          name : "Start",
          url  : math.pagePath(true, "index")
        },{
          name : "Alle von 9, den letzten von 10",
          url  : math.pagePath(true, "page1")
        },{
          name : "Vertikal und kreuzweise",
          url  : math.pagePath(true, "page2"),
          subnav : [{
            name : "für einstellige Zahlen",
            url  : math.pagePath(true, "page2a")
          },{
            name : "für Zahlen unter und nahe 100",
            url  : math.pagePath(true, "page2b")
          },{
            name : "für Zahlen über und nahe 100",
            url  : math.pagePath(true, "page2c")
          },{
            name : "für Summen kleiner Brüche",
            url  : math.pagePath(true, "page2d")
          }]
        },{
          name : "Um 1 mehr als der davor",
          url  : math.pagePath(true, "page3")
        },{
          name : "Multiplikation mit 11",
          url  : math.pagePath(true, "page4")
        },{
          name : "Division durch 9",
          url  : math.pagePath(true, "page5")
        }]);
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
        var navContent = App.View.templates.linkList([{
          name : "Start",
          url  : math.pagePath(false, "index")
        },{
          name : "Alle von 9 und den letzten von 10",
          url  : math.pagePath(false, "page1")
        },{
          name : "Vertikal und Kreuzweise",
          url  : math.pagePath(false, "page2"),
          subnav : [{
            name : "für einstellige Zahlen",
            url  : math.pagePath(false, "page2a")
          },{
            name : "für Zahlen unter und nahe 100",
            url  : math.pagePath(false, "page2b")
          },{
            name : "für Zahlen über und nahe 100",
            url  : math.pagePath(false, "page2c")
          },{
            name : "für Summen kleiner Brüche",
            url  : math.pagePath(false, "page2d")
          }]
        },{
          name : "Um 1 mehr als dem davor",
          url  : math.pagePath(false, "page3")
        },{
          name : "Multiplikation mit 11",
          url  : math.pagePath(false, "page4")
        },{
          name : "Division durch 9",
          url  : math.pagePath(false, "page5")
        }]);
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
            App.Controller.swapContent(App.View.content, data);
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
    }
  });
  
  App.Controller.pickModule(App.Modules.mathematics);
})();