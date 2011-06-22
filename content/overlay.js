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
 * The Original Code is sitewatch.
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





var sitewatch = { 
  url_to_track: 'url_to_track',
  xpath_to_element: 'xpath_to_element',
  password: 'pwd',
  username: 'sleepycat',
  server_url: "http://sitewatch.heroku.com/",
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
    that = this;
    that.logit('onload fired');
  },
  sendToServer: function(element){
    that = this;
    var content = $(element).html();
    var hash = hex_sha1(content); 
    that.logit(that.getElementXPath(element).toString());
    $.ajax({
      url: "http://sitewatch.heroku.com/watches",
      //url: "http://localhost:3000/watches",
      username: "mike",
      password: "password",
      type: "POST",
      data: {'url': window.content.document.URL, 'sha1_hash': hash, 'xpath': that.getElementXPath(element).toLowerCase() },
      success: function(data, textStatus, jqXHR){ that.logit("response was: " + textStatus)},
      statusCode:{
        404:function(){that.logit("404 not found!")},
        400:function(){that.logit("400 bad request!")},
        500:function(){that.logit("500 server borked!")},
        401:function(){that.logit("401 unauthorized.")},
        403:function(){that.logit("403 forbidden.")}
      }
    });
  },  
  onMenuItemCommand: function(e) {
    that = this;
    
    that.logit("button was: " + e.button);

    if(that.activated){
      that.activated = false;
      that.logit("this.activated set to false");
    }
    else{
      that.activated = true;
      that.logit("this.activated set to true");
    }  

    var doc = window.content.document.documentElement;
    if(that.activated){

      $('*:not(.sitewatch)',doc).bind('click.sitewatch', function(event){
        event.stopPropagation();
        that.sendToServer(event.target);
        //return false here in case they clicked a link or button.
        return false;
      });
  
      $('*:not(.sitewatch)', doc).bind('mouseenter.sitewatch', function(event){ 
        var padding = 3;
        var border = 7;
        var element = $(event.target);
        var offset = element.offset();
        var element_top = offset.top;
        var element_bottom = offset.top + element.outerHeight();
        var element_left = offset.left;
        var element_right = offset.left + element.outerWidth();
        $('#top',doc).css({
          'top': element_top - padding
          ,'width': element.outerWidth() + (border * 2) + (padding * 2)
          ,'left':element_left - padding - border
          ,'z-index': 1000 
          });
        $('#bottom',doc).css({
          'top': element_bottom + padding
          ,'width': element.outerWidth() + (border * 2) + (padding * 2)
          ,'left': element_left - padding - border
          ,'z-index': 1000
          }).html('<p>Click to keep an eye on this portion of the page.</p>');
        $('#right',doc).css({
            'top': element_top - padding
            ,'height': element.outerHeight() + (padding * 2)
            ,'left': element_right + padding
            ,'z-index': 999
            });
        $('#left',doc).css({
            'top': element_top + padding
            ,'height': element.outerHeight() + (padding * 2)
            ,'left': element_left - padding - border
            ,'z-index': 999
            });
        $('.sitewatch',doc).show();
      });
      $('body', doc).prepend(
          '<div class="sitewatch" id="top"></div>'
          ,'<div class="sitewatch" id="bottom"></div>'
          ,'<div class="sitewatch" id="left"></div>'
          ,'<div class="sitewatch" id="right"></div>'
          );
      $('.sitewatch', doc).css({'position':'absolute'}).hide();
      $('#right', doc).css({
          'border-right': '7px solid #00f'
          , 'border-top-right-radius': '10px'
          });
      $('#left', doc).css({
          'border-left': '7px solid #00f'
          });
      $('#top', doc).css({
          'border-top': '7px solid #00f'
          ,'border-top-left-radius': '10px'
          ,'border-top-right-radius': '10px'
          });
      $('#bottom',doc).css({
          'border-bottom':'7px solid #00f'
          ,'border-bottom-left-radius': '10px'
          ,'border-bottom-right-radius': '10px'
          ,'background-color': '#00f'
        });
      $('#bottom',doc).first().css({
          'font-family':'sans-serif'
          ,'font-size': '10px'
          ,'color': '#fff'
        });

    }
    else{
      $('*', window.content.document).unbind('.sitewatch');
      $('.sitewatch', window.content.document).remove();
    }


  },
  optionsLoad: function() {
    var pref = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.sitewatch.");
          window.document.getElementById("username").value = pref.getCharPref("startUrl");
            window.document.getElementById("password").value = pref.getCharPref("endUrl");
  },
  optionsSave: function() {
    var pref = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.sitewatch.");
    pref.setCharPref("username", window.document.getElementById("startUrl").value);
    pref.setCharPref("password", window.document.getElementById("endUrl").value);
    window.close();
  },
  onToolbarButtonCommand: function(e) {
    sitewatch.onMenuItemCommand(e);
  },
  logit: function(msg) {
  var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
                                 .getService(Components.interfaces.nsIConsoleService);
  consoleService.logStringMessage(msg);
  }
};

window.addEventListener("load", function(e) { sitewatch.onLoad(e); }, false);
