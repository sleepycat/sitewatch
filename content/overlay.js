/* ***** BEGIN LICENSE BLOCK *****
 *   Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 * 
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is sitestalker.
 *
 * The Initial Developer of the Original Code is
 * Mike Williamson.
 * Portions created by the Initial Developer are Copyright (C) 2010
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 * 
 * ***** END LICENSE BLOCK ***** */
 var url_to_track = 'url_to_track';
 var xpath_to_element = 'xpath_to_element';
 var username = 'uname';
 var password = 'pwd';
 var server_url = '';
 var username = 'sleepycat';

var  logit = function(msg) {
  var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
                                 .getService(Components.interfaces.nsIConsoleService);
  consoleService.logStringMessage(msg);
  }

var getXPathForElement = function(el, xml) {
	var xpath = '';
	var pos, tempitem2;
	
	while(el !== xml.documentElement) {		
		pos = 0;
		tempitem2 = el;
		while(tempitem2) {
			if (tempitem2.nodeType === 1 && tempitem2.nodeName === el.nodeName) { // If it is ELEMENT_NODE of the same name
				pos += 1;
			}
			tempitem2 = tempitem2.previousSibling;
		}
		
		xpath = "*[name()='"+el.nodeName+"' and namespace-uri()='"+(el.namespaceURI===null?'':el.namespaceURI)+"']["+pos+']'+'/'+xpath;

		el = el.parentNode;
	}
	xpath = '/*'+"[name()='"+xml.documentElement.nodeName+"' and namespace-uri()='"+(el.namespaceURI===null?'':el.namespaceURI)+"']"+'/'+xpath;
	xpath = xpath.replace(/\/$/, '');
	return xpath;
  }


var sitestalker = {
  
  //doc : window.content,document,

  onLoad: function() {
    // initialization code
  
	logit('onload fired');
  
    this.initialized = true;
    this.strings = document.getElementById("sitestalker-strings");
  },

  username: "sleepycat",

  server_url: "http://localhost:3000/",

  activated: false,
  
  onMenuItemCommand: function(e) {

    //var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                  //.getService(Components.interfaces.nsIPromptService);
//    promptService.alert(window, this.strings.getString("helloMessageTitle"),
   //                             this.strings.getString("helloMessage"));
  //$(this).toggle(function(){this.activated = true}, function(){this.activated = false});
  if(this.activated == false){
    this.activated = true;
 
    logit("this.activated set to true");
  }
  else{
    this.activated = false;
    logit("this.activated set to false");
    
  }  

   var doc = window.content.document;
if(this.activated == true){

    
//I can't get to my server_url from inside the function below. 
  $(doc.documentElement).bind('click.sitewatch', function(event){
   
  //Time to see if I can get the jhighlight working.  
  $(event.target).attr("title", event.target.nodeName).addClass(".jhighlight");
   $(event.target).jhighlight();
    $(event.target).trigger('click');
    

  $.ajax({
  url: "http://localhost:3000/users/sleepycat/watches", 
 type: "POST",
  data: { url: doc.location, xpath: getXPathForElement(event.target, doc).toLowerCase() },
  success: function(){alert('We stored it.')}
  });
  event.stopPropagation();
  //return false here in case they clicked a link or button.
  return false;
});

//using the new namespaced events from jQuery 1.4 W00T!
  $('*', doc).bind('mouseenter.sitewatch', function(event){
 //     var b = $(event.target).css("border");
 //     var m = $(event.target).css("MozBorderRadius");
 //     $(event.target).data("border", b );
 //     $(event.target).data("MozBorderRadius", m);      

      $(event.target).css('border', 'solid 3px');
          $(event.target).css('MozBorderRadius', '20px');
 //    logit(url_to_track);
 //   logit(xpath_to_element);
 //     logit(username);
 //     logit(password);
 //	  	logit(getXPathForElement(event.target, doc));
	  });

$(doc.documentElement).bind('mouseout.sitewatch', function(event){
//This is stripping off the border from the search box:
//http://start.ubuntu.com/9.10/

//Pulling stuff from the jquery data api is a little slow... Updates to the page 
//var b = $(event.target).data("border");
//  var m = $(event.target).data("MozBorderRadius");
//    $(event.target).css("border", b);
//      $(event.target).css("MozBorderRadius", m);
          $(event.target).css('-moz-border-radius', '');
          $(event.target).css('border', '');
    });
	}
else{

  $('*', doc).unbind('.sitewatch');

}


  },
  onToolbarButtonCommand: function(e) {
    // just reuse the function above.  you can change this, obviously!
    sitestalker.onMenuItemCommand(e);
	

  }


};
window.addEventListener("load", function(e) { sitestalker.onLoad(e); }, false);
