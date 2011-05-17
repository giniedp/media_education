(function(){
  
  App.Module.extend({ 
    name          : "login", 
    displayName   : "Profilbereich",
    hasHelpPage    : false,
    helpFunction   : "",
    whereAmIData   : {},
    navigationData : {},
    evaluateHash  : function(hash, last){
      App.Controller.pickModule(this.name);
      var current = hash.shift();
      
      var accessMatch = last.match(/^code/);
      if (accessMatch !== null){
        this.Controller.facebookLogin(last);
      } else {
        if (App.currentUser.signedIn){
          App.View.content.text("Eingeloggt");
        } else {
          this.Controller.facebookLogin();
        }
      }
      //if (last)
      //if (current === "learn"){
      //  this.Controller.showLearnPage(hash.shift());
      //  return;
      //} else if (current === "practise"){
      //  this.Controller.showPractisePage(hash.shift());
      //  return;
      //}
      
      this.Controller.showIndexPage();
    },
    Controller : {
      signIn : function(){
        App.Modules.login.Controller.facebookLogin();
      },
      facebookLogin : function(accessToken){
        var appID = "198012633575807";
        if (!accessToken) {
          var path = 'https://www.facebook.com/dialog/oauth?';
          var queryParams = [
            'client_id=' + appID,
            'redirect_uri=' + window.location,
            'response_type=token'];
          var query = queryParams.join('&');
          var url = path + query;
          log("trying to login: '"+url+"'");
          window.open(url);
        } else {
          var path = "https://graph.facebook.com/me?";
          //this should be access_token already, api says we get the token...
          var query = accessToken.replace("code", "access_token");
          var url = path + query;
          log("got some reply... token: '"+accessToken+"'");
          $.ajax({
            url : url,
            success : function(data){
              
              log(data);
            }
          });
        }
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
        
        $.get("modules/vocabulary/index.html", function(data){
            App.Controller.swapContent(App.View.content, data);
            App.Controller.swapContent(App.View.sidebar, navContent, 0);   
            App.Controller.swapContent(App.View.info, waiContent, 0);       
        });
      }
    },
  });
  
})();
