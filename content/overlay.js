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





var sitestalker = { 
  url_to_track: 'url_to_track',
  xpath_to_element: 'xpath_to_element',
  password: 'pwd',
  username: 'sleepycat',
  server_url: "http://sitestalker.heroku.com/",
  activated: false,
  getElementXPath: function(element){
    if (element && element.id)
        return '//*[@id="' + element.id + '"]';
    else
        return this.getElementTreeXPath(element);
  },
  getElementTreeXPath: function(element){
    var paths = [];

    // Use nodeName (instead of localName) so namespace prefix is included (if any).
    for (; element && element.nodeType == 1; element = element.parentNode)
    {
        var index = 0;
        for (var sibling = element.previousSibling; sibling; sibling = sibling.previousSibling)
        {
            // Ignore document type declaration.
            if (sibling.nodeType == Node.DOCUMENT_TYPE_NODE)
                continue;

            if (sibling.nodeName == element.nodeName)
                ++index;
        }

        var tagName = element.nodeName.toLowerCase();
        var pathIndex = (index ? "[" + (index+1) + "]" : "");
        paths.splice(0, 0, tagName + pathIndex);
    }

    return paths.length ? "/" + paths.join("/") : null;
  },
  onLoad: function() {
    // initialization code
  
	this.logit('onload fired');
  
    this.initialized = true;
    this.strings = document.getElementById("sitestalker-strings");
  },

  
  onMenuItemCommand: function(e) {
    that = this;
    
    //replace this rediculousness with $.toggle
    if(this.activated == false){
      this.activated = true;
      this.logit("this.activated set to true");
    }
    else{
      this.activated = false;
      this.logit("this.activated set to false");
    }  

    var doc = window.content.document;
    if(this.activated == true){
      //TODO make another attempt to use jquery.live here.
      $(doc.documentElement).bind('click.sitewatch', function(event){
  
      //This will fire so this when elements are clicked:
      //  alert(getElementXPath(event.target).toString());
  
      //TODO take a look at why this ajax call doesn't seem to be doing anything. 
      //Just a bad url? 
      $.ajax({
        url: "http://sitestalker.heroku.com/pages/create/", 
        type: "POST",
        data: { url: doc.location, xpath: that.getElementXPath(event.target).toLowerCase() },
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
      //  this.logit(url_to_track);
      //  this.logit(xpath_to_element);
      //  this.logit(username);
      //  this.logit(password);
      // 	this.logit(getXPathForElement(event.target, doc));
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
	

  },
  logit: function(msg) {
  var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
                                 .getService(Components.interfaces.nsIConsoleService);
  consoleService.logStringMessage(msg);
  }
};

window.addEventListener("load", function(e) { sitestalker.onLoad(e); }, false);
