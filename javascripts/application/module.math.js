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
      magicMapping : function(options){
        var result = {};
        
        _.each(options, function(data, key){
          var value = 0;
          var loopCounter = 100;
          
          while(loopCounter > 0){
            loopCounter -= 1;
            
            // get a value from range, array, key or value
            if (data.in_range){
              value = data.in_range.min + Math.round((Math.random() * (data.in_range.max - data.in_range.min)));
            } else if (data.in_array){
              value = data.in_array[Math.round(Math.random() * (data.in_array.length - 1))];
            } else if (data.key){
              value = result[data.key];
              break;
            } else if (data.value){
              value = data.value;
              break;
            }
            
            var valid = true;
            if (data.lt){
              var toCheck = (result[data.lt] || data.lt);
              valid = valid && (value < toCheck)
            }
            if (data.lte){
              var toCheck = (result[data.lte] || data.lte);
              valid = valid && (value <= toCheck)
            }
            if (data.gt){
              var toCheck = (result[data.gt] || data.gt);
              valid = valid && (value > toCheck)
            }
            if (data.gte){
              var toCheck = (result[data.gte] || data.gte);
              valid = valid && (value >= toCheck)
            }
            
            if (valid){
              break;
            }
            if (loopCounter == 0){
              value = 0;
            }
          }
          
          result[key] = value;
        });
        
        return result;
      },
      validateExercise : function(container){
        var $this = container;

        var figure1 = $this.find(".figure-1").text();
        var figure2 = $this.find(".figure-2").text();
        var operator = $this.find(".operator").text();
        
        // get user result and format it to number with two decimals decimal
        // example:
        //    3 => 3,00
        //    3,3 => 3,30
        //    3,36 => 3,36
        //    3,367 => 3,37
        var userResult = $this.find("input.result").val().replace(",", ".").formatNumber(2, ",", ".");
        // substring the user result. get all but least decimal
        // example:
        //    3,30 => 3,3
        //    3,36 => 3,3
        userResult = userResult.toString().substring(0, userResult.toString().length - 1);
        //  update the input value to display the user what value is used for valuation
        $this.find("input.result").val(userResult);
        // do the same with the result value
        var result = eval([figure1, operator, figure2].join(" ")).formatNumber(2, ",", ".");
        result = result.toString().substring(0, result.toString().length - 1);
        
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
      addExercise : function(name){
        var math = App.Modules.mathematics;
        math.Model.lastExercise = (name || math.Model.lastExercise);
        
        var data = math.Model.PractisePages[math.Model.lastExercise];
        var content = App.View.content.find("#exercise");
        
        if (!data.exercise){ return; }
        var obj = math.Controller.magicMapping(data.exercise);

        App.Modules.mathematics.fadeExercises(content);

        var temp = _.template(
          '<div class="exercise">\
             <span class="figure-1"><%= figure1 %></span>\
             <span class="operator"><%= operator %></span>\
             <span class="figure-2"><%= figure2 %></span>\
             <span class="equal-sign">=</span>\
             <input class="result" type="text" autocomplete="off"></input>\
             <span class="validation"></span>\
           </div>', obj);
        
        $(temp).hide().prependTo(content).fadeIn('slow').find("input")
        .bind("keydown", "return", function(){
          $(this).trigger("evaluate");
          $(this).attr('disabled', 'disabled');
        })
        .bind("evaluate", function(){
          App.Modules.mathematics.Controller.validateExercise($(this).parent());
          if ($(this).parent(".exercise").prev(".exercise").length == 0){
            App.Modules.mathematics.Controller.addExercise(name);
          }
        }).focus();
      },
      showLearnPage : function(name){
        name = name || "index";
        var math = App.Modules.mathematics;
        math.hasHelpPage = false;
        math.helpFunction = "";
        math.helpTitle = undefined;
        
        math.navigationData = math.Controller.makeLinks(math.Model.LearnPages, name, true);
        math.navigationData = [{
          name   : "Zurück",
          url    : "#app/mathematics",
          active : false
        }].concat(math.navigationData);
        
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
        math.hasHelpPage = true;
        math.helpFunction = "App.Modules.mathematics.Controller.showPractiseHelpPage('" + name + "')";
        math.helpTitle = undefined;
        
        math.navigationData = math.Controller.makeLinks(math.Model.PractisePages, name, false);
        math.navigationData = [{
          name   : "Zurück",
          url    : "#app/mathematics",
          active : false
        }].concat(math.navigationData);
        
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
              App.Modules.mathematics.Controller.addExercise(name);
            });
            App.Controller.swapContent(App.View.sidebar, navContent, 0); 
            App.Controller.swapContent(App.View.info, waiContent, 0);         
        });
      },
      showPractiseHelpPage : function(name){
        $.get("modules/mathematics/learn/" + name + ".html", function(data){
          
          var content = $("<div>" + data + "</div>").find(".help");
          App.Controller.showDialog(content, {
            width : "90%",
            height : 600,
            modal : true,
            title : "Hilfe"
          });
        });
      },
      showIndexPage : function(){
        var math = App.Modules.mathematics;
        math.hasHelpPage = false;
        math.helpFunction = "";
        math.helpTitle = undefined;
        
        math.navigationData = [{
          name   : "Zurück",
          url    : "#index",
          active : false
        },{
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
        //"page2" : {
        //  name     : "Vertikal und kreuzweise",
        //  backpage : "index"
        //},
        //"page2a" : {
        //  name  : "Zahlen unter und nahe 10",
        //  parent: "page2"
        //},
        //"page2b" : {
        //  name  : "Zahlen über und nahe 10",
        //  parent: "page2"
        //},
        //"page2c" : {
        //  name : "Zahlen unter und nahe 100",
        //  parent: "page2"
        //},
        //"page2d" : {
        //  name : "Zahlen über und nahe 100",
        //  parent: "page2"
        //},
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
            figure1 : {
              in_array : [10, 100, 1000]
            },
            figure2 : {
              in_range : { min : 0, max : 1000 },
              lte : "figure1"
            },
            operator: { value : "-" }
          }
        },
        //"page2" : {
        //  name     : "Vertikal und Kreuzweise",
        //  backpage : "index"
        //},
        //"page2a" : {
        //  name     : "Zahlen unter und nahe 10",
        //  parent   : "page2",
        //  exercise : {
        //    figure1 : { in_range : { min : 6, max : 10 } },
        //    figure2 : { in_range : { min : 6, max : 10 } },
        //    operator: { value : "*" }
        //  }
        //},
        //"page2b" : {
        //  name     : "Zahlen über und nahe 10",
        //  parent   : "page2",
        //  exercise : {
        //    figure1 : { in_range : { min : 10, max : 15 } },
        //    figure2 : { in_range : { min : 10, max : 15 } },
        //    operator: { value : "*" }
        //  }
        //},
        //"page2c" : {
        //  name     : "Zahlen unter und nahe 100",
        //  parent   : "page2",
        //  exercise : {
        //    figure1 : { in_range : { min : 90, max : 100 } },
        //    figure2 : { in_range : { min : 90, max : 100 } },
        //    operator: { value : "*" }
        //  }
        //},
        //"page2d" : {
        //  name     : "Zahlen über und nahe 100",
        //  parent   : "page2",
        //  exercise : {
        //    figure1 : { in_range : { min : 100, max : 110 } },
        //    figure2 : { in_range : { min : 100, max : 110 } },
        //    operator: { value : "*" }
        //  }
        //},
        "page3" : {
          name     : "Einer mehr als der zuvor",
          exercise : {
            figure1 : { in_array : [5, 15, 25, 35, 45, 55, 65, 75, 85, 95] },
            figure2 : { key : "figure1" },
            operator: { value : "*" }
          }
        },
        "page4" : {
          name     : "Multiplikation mit 11",
          exercise : {
            figure1 : { in_range : { min : 10, max : 99 } },
            figure2 : { value : 11 },
            operator: { value : "*" }
          }
        },
        "page5" : {
          name     : "Division durch 9",
          exercise : {
            figure1 : { in_range : { min : 10, max : 99 } },
            figure2 : { value : 9 },
            operator: { value : "/" }
          }
        }
      }
    }
  });
  
  App.Controller.pickModule(App.Modules.mathematics);
})();
