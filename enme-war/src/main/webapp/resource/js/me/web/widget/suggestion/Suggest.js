/*
 * Copyright 2013 encuestame
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

/***
 *  @author juanpicado19D0Tgmail.com
 *  @version 1.146
 *  @module Suggest
 *  @namespace Widget
 *  @class Suggest
 */
define([ "dojo/parser",
         "dojo/ready",
         "dojo/_base/lang",
         "dijit/registry",
         "dojo/_base/declare",
         "dijit/_WidgetBase",
         "dijit/_TemplatedMixin",
     "dijit/form/TextBox",
     "dijit/form/Button",
     "dojox/data/QueryReadStore",
     "dijit/form/FilteringSelect",
     "dijit/_WidgetsInTemplateMixin",
     "me/core/enme",
     "me/core/main_widgets/EnmeMainLayoutWidget",
     "me/web/widget/suggestion/SuggestItem",
     "dojo/text!me/web/widget/suggestion/templates/suggest.html" ], function(
    parser,
    ready,
    lang,
    registry,
    declare,
    _WidgetBase,
    _TemplatedMixin,
    text_box,
    button,
    queryReadStore,
    FilteringSelect,
    _WidgetsInTemplateMixin,
    _ENME,
    main_widget,
    SuggestItem,
    template) {

  lang.extend(dojox.data.QueryReadStore, {
        _filterResponse: function(data) {
         data = data.success;
         return data;
     }
  });

  return declare([ _WidgetBase, _TemplatedMixin, main_widget, queryReadStore ], {

        /**
         * @property templateString
         */
        templateString: template,

        /**
         * @property store
         */
        store: null,

        /**
         * @property label
         */
        label : ENME.getMessage("button_add"),

        /**
         * @property url
         */
        url : 'encuestame.service.list.hashtags',

        /**
         * @property textBoxWidget
         */
        textBoxWidget : null,

        /**
         * @property buttonWidget
         */
        buttonWidget : null,

        /**
         * @property hideLabel
         */
        hideLabel : false,

        /**
         * @property selectedItem
         */
        selectedItem : null,

        /**
         * @property addButton
         */
        addButton : true,

        /**
         * @property ignoreCase
         */
        ignoreCase: true,

        /**
         * @property modeMultiSearch
         */
        modeMultiSearch : false,

        /**
         * @property multiStores
         */
        multiStores : [],

        /**
         * @property modeQuery
         */
        modeQuery : "get",

        /**
         * @property limit
         */
        limit : 10,

        /**
         * @property label
         */
        label : "Label",

        /**
         * @property query
         */
        query :  {hashTagName : "*"},

        /**
         * @property sortFields
         */
        sortFields : [{attribute: 'hashTagName', descending: true}],

        /*
         * Default search parameters.
         */
        searchParam: { limit : 10, keyword : ""},

        /*
         * A filter list to exluce from suggested items.
         */
        exclude : [],

        /**
         *
         * @property
         */
        _itemStored : [],

        /**
         *
         * @property
         */
        _delay : 700,

        /**
         *
         * @property
         */
        _inProcessKey : false,

        /**
         * Array of items appear in the suggestion, usefull to navigate
         * in the collection of item displayed after the search
         * @property _temp_suggestion_items
         */
        _temp_suggestion_items : [],

        /*
         * post create life cylce.
         * @method postCreate
         */
        postCreate: function() {
            this.textBoxWidget = registry.byId(this._suggest);
            var parent = this;
            if (this.textBoxWidget) {
              //enable keyword events
                dojo.connect(this.textBoxWidget, "onKeyUp", dojo.hitch(this, function(e) {
                    if (!this._inProcessKey) {
                        this._inProcessKey = true;
                        var parent = this;
                        dojo.hitch(this, setTimeout(function () {
                            parent._inProcessKey = false;
                            if (dojo.keys.SPACE == e.keyCode || dojo.keys.ENTER == e.keyCode) {
                                parent.processSpaceAction();
                            } else if (dojo.keys.UP_ARROW == e.keyCode) {
                                //TODO: down by suggestion list.
                                parent.moveBetweenItems(-1);
                            } else if (dojo.keys.DOWN_ARROW == e.keyCode) {
                                //TODO: up by suggestion list.
                                parent.moveBetweenItems(+1);
                            } else {
                                parent._setParams(
                                        { limit: parent.limit,
                                          keyword : parent.textBoxWidget.get("value"),
                                          excludes : parent.exclude});
                                //console.debug("suggest", this.textBoxWidget.get("value"));
                                if (!encuestame.utilities.isEmpty(parent.textBoxWidget.get("value"))) {
                                    //call first time suggest.
                                     parent.callSuggest();
                                 }
                              }
                              // this.textBoxWidget //TODO: this.hide() on lost focus.
                        }, this._delay));
                      }
                }));
                //query read store.
                this.store = new dojox.data.QueryReadStore({
                    url : this.getURLService().service(this.url),
                    sortFields : this.sortFields,
                    requestMethod : this.modeQuery}
                );
                 this.callSuggest();
                //enable add button, if not the default add is click on item.
                if (this.addButton) {
                  //check if node exist.
                  if (this._suggestButton) {
                      dojo.style(this._suggestButton, "display", "block");
                      this.buttonWidget = new dijit.form.Button({
                          label: _ENME.getMessage("button_add", "Add"),
                          onClick: dojo.hitch(this, function(event) {
                              dojo.stopEvent(event);
                              this.processSelectedItemButton();
                          })
                      },
                      this._suggestButton);
                  }
                }
                if (this.hideLabel) {
                   if(this._label) {
                     dojo.addClass(this._label,"defaultDisplayHide");
                   }
                }
            } else {
                console.error("Error");
            }
        },

        block : function() {

        },

        unblock : function() {

        },

        /*
         * if user click up space bar.
         */
        processSpaceAction : function() {
            //overide.
        },

        _setParams: function(value){
            this.searchParam = value;
        },

        /*
         * start suggestion call.
         */
        callSuggest : function(){
            var fetch = {
                    query: this.query,
                    queryOptions: {
                        ignoreCase: this.ignoreCase,
                        deep: true
                    },
                    serverQuery: this.searchParam,
                    onComplete: dojo.hitch(this, function(result, dataObject){
                        this._itemStored = result;
                        this.evaluateItems();
                    }),
                    onError: function(errText){
                        console.error('dijit.form.FilteringSelect: ' + errText);
                    }
                };
            this.store.fetch(fetch);
        },

        /**
         * Evaluate Items.
         * @method evaluateItems
         */
        evaluateItems : function() {
            // reset the temporal suggestion list
            this._temp_suggestion_items = [];
            if (this._itemStored.length > 0) {
                 dojo.empty(this._suggestItems);
                 var fadeArgs = {
                         node: this._suggestItems
                 };
                 dojo.fadeIn(fadeArgs).play();
                 dojo.forEach(
                        this._itemStored,
                        dojo.hitch(this, function(data, index) {
                            this.buildRow(data.i);
                        }));
            } else {
                var fadeArgs = {
                     node: this._suggestItems
                 };
                 dojo.fadeOut(fadeArgs).play();
            }
        },

        /*
         * hide with fade out the suggest box.
         */
        hide : function() {
            //console.info("HIDE");
            this._itemStored = [];
            var fadeArgs = {
                    node: this._suggestItems
            };
            dojo.fadeOut(fadeArgs).play();
            this.clear();
        },

        /**
         * Add the capability to move between suggestion displayed items
         * @method
         * @param
         */
        moveBetweenItems : function (flag) {
            var isAnySelected = true;
            dojo.forEach(this._temp_suggestion_items, dojo.hitch(this, function(entry, i) {
                // move to  up
                if( entry.isSelected()) {
                    isAnySelected = false;
                    entry.unSelect();
                    var next_item = this._temp_suggestion_items[i + flag];
                    next_item.selected();
                    return false;
                }
            }));

            if (isAnySelected)
            this._temp_suggestion_items[flag ? 0 : this._temp_suggestion_items.length - 1].selected();
        },

       /**
        * Build a row on the suggestion.
        * @method buildRow
        * @param data hashtag item
        */
        buildRow : function(/** hashtag item. **/ data) {
            var widget = new SuggestItem(
                    {
                        data: { id : data.id, label : data.hashTagName},
                        parentWidget : this
                    });
            this._suggestItems.appendChild(widget.domNode);
            widget.processItem = this.processSelectedItem;
            this._temp_suggestion_items.push(widget);
        },

        //Process after click add button.
        processSelectedItemButton : function() {
            if (this.textBoxWidget && this.addButton) {
                this.hide();
                var newValue = {id:null, label:"", newValue: true};
                newValue.label = this.textBoxWidget.get("value");
                this.selectedItem = newValue;
                if (!encuestame.utilities.isEmpty(newValue.label)) {
                    this.processSelectedItem(this.selectedItem);
                }
                this.clear();
            }
        },

        clear : function(){
              if(this.textBoxWidget){
                  this.selectedItem = null;
                  this.textBoxWidget.set("value", "");
              }
              dojo.empty(this._suggestItems);
        },

        //Process Selected Item.
        processSelectedItem : function(selectedItem){
            console.info("implemt this method in the parent widget 2", selectedItem);
        }
  });
});