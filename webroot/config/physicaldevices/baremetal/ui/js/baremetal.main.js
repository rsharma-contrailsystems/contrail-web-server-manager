/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var baremetalPageLoader = new BaremetalPageLoader();
function BaremetalPageLoader() {
    this.load = function (paramObject) {
        var currMenuObj = globalObj.currMenuObj,
            rootDir = currMenuObj['resources']['resource'][0]['rootDir'],
            pathBaremetalView = rootDir + '/js/views/BaremetalView.js',
            hashParams = paramObject['hashParams'];

        check4SMInit(function () {
            requirejs([pathBaremetalView], function (BaremetalView) {
                var baremetalView = new BaremetalView();
                baremetalView.render({hashParams: hashParams});
            });
        });
    };
    this.updateViewByHash = function (hashObj, lastHashObj) {
        this.load({hashParams : hashObj});
    };
    this.destroy = function () {
    };
};

function check4SMInit(callback) {
    if (!smInitComplete) {
        requirejs(['sm-init'], function () {
            smInitComplete = true;
            callback()
        });
    } else {
        callback();
    }
};