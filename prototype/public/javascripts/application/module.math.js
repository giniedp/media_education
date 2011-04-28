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
      
      this.Controller.showIndexPage(hash.shift());
    },
    Controller : {
      showLearnPage : function(name){
        var content = _.map(I18n.t("app.modules.math.pages.learn." + name), function(item){
          return App.View.templates.article(item);
        }).join(" ");
        
        var navContent = App.View.templates.linkList([{
          name : "Start",
          url  : App.Modules.mathematics.pagePath(true, "index")
        },{
          name : "Seite 1",
          url  : App.Modules.mathematics.pagePath(true, "page1")
        },{
          name : "Seite 2",
          url  : App.Modules.mathematics.pagePath(true, "page2")
        }]);
        
        App.Controller.swapContent(App.View.content, content);
        App.Controller.swapContent(App.View.sidebar, navContent);
      },
      showPractisePage : function(name){
        var content = _.map(I18n.t("app.modules.math.pages.practise." + name), function(item){
          return App.View.templates.article(item);
        }).join(" ");
        
        var navContent = App.View.templates.linkList([{
          name : "Start",
          url  : App.Modules.mathematics.pagePath(false, "index")
        },{
          name : "Seite 1",
          url  : App.Modules.mathematics.pagePath(false, "page1")
        },{
          name : "Seite 2",
          url  : App.Modules.mathematics.pagePath(false, "page2")
        }]);
        
        App.Controller.swapContent(App.View.content, content);
        App.Controller.swapContent(App.View.sidebar, navContent);
      },
      showIndexPage : function(){
        var content = _.map(I18n.t("app.modules.math.pages.index"), function(item){
          return App.View.templates.article(item);
        }).join(" ");

        var navContent = App.View.templates.linkList([{
          name : "Lernen",
          url  : App.Modules.mathematics.pagePath(true, "index")
        },{
          name : "Üben",
          url  : App.Modules.mathematics.pagePath(false, "index")
        }]);
        
        App.Controller.swapContent(App.View.content, content);
        App.Controller.swapContent(App.View.sidebar, navContent);
      }
    }
  });
  
  App.Controller.pickModule(App.Modules.mathematics);
})();