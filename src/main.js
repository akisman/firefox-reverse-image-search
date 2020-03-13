/*
 * Image Search, Firefox Addon
 *
 * Copyright (c) 2015 Akis Manolis https://github.com/akisman
 * and licenced under the MIT licence. All rights not explicitly
 * granted in the MIT license are reserved. See the included
 * LICENSE file for more details.
 */
'use strict';

var self = require('sdk/self');
var contextMenu = require('sdk/context-menu');
var tabs = require('sdk/tabs');
var preferences = require('sdk/simple-prefs').prefs;

// Search engines data
var engines = [
    {
        name: 'Google',
        prefName: 'showGoogle',
        icon: self.data.url('google-icon.png'),
        url: 'https://www.google.com/searchbyimage?image_url={imageUrl}'
    },
    {
        name: 'TinEye',
        prefName: 'showTineye',
        icon: self.data.url('tineye-icon.png'),
        url: 'https://www.tineye.com/search/?&url={imageUrl}'
    },
    {
        name: 'Bing',
        prefName: 'showBing',
        icon: self.data.url('bing-icon.png'),
        url: 'https://www.bing.com/images/searchbyimage?FORM=IRSBIQ&cbir=sbi&imgurl={imageUrl}'
    },
    {
        name: 'Karma Decay',
        prefName: 'showKarma',
        icon: self.data.url('karma-icon.png'),
        url: 'http://karmadecay.com/search?kdtoolver=b1&q={imageUrl}'
    },
    {
        name: 'Yandex',
        prefName: 'showYandex',
        icon: self.data.url('yandex-icon.png'),
        url: 'https://yandex.com/images/search?url={imageUrl}&rpt=imageview'
    },
    {
        name: 'Baidu',
        prefName: 'showBaidu',
        icon: self.data.url('baidu-icon.png'),
        url: 'http://image.baidu.com/n/pc_search?queryImageUrl={imageUrl}&fm=searchresult&uptype=paste'
    }
];

// Populate and return the the menu array depending on the selected options
function createMenuItems() {
    var menuArray = [];
    // Create the menu entry for searching with all engines
    if (preferences['showAll']) {
        menuArray.push(contextMenu.Item({
            label: 'All Engines',
            data: '-all'
        }));
        menuArray.push(contextMenu.Separator());
    }
    engines.forEach(function (engine) {
        if (preferences[engine.prefName]) {
            menuArray.push(contextMenu.Item({
                label: engine.name,
                data: engine.url,
                image: engine.icon
            }));
        }
    });
    return menuArray;
}

// Open tab(or tabs) with image search results
function searchImage(data) {
    if (data.url === '-all') {
        engines.forEach(function (engine) {
            if (preferences[engine.prefName]) {
                tabs.open({
                    url: engine.url.replace('{imageUrl}', encodeURIComponent(data.img)),
                    inBackground: preferences.openInBackground
                });
            }
        });
    } else {
        tabs.open({
            url: data.url.replace('{imageUrl}', encodeURIComponent(data.img)),
            inBackground: preferences.openInBackground
        });
    }
}

// Register an event listener listening for any preference change
require("sdk/simple-prefs").on("", onPrefChange);

// Setup context menu
var menu = contextMenu.Menu({
    label: 'Search image on...',
    image: self.data.url('icon.png'),
    context: contextMenu.SelectorContext('img'),
    contentScript: 'self.on("click", function (node, data) { self.postMessage( { url: data, img: node.src } ) });',
    items: createMenuItems(),
    onMessage: function (data) {
        searchImage(data);
    }
});

// On any preferences change re-set the menu items
function onPrefChange(prefName) {
    menu.items = createMenuItems();
}
