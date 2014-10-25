/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var Messages = function () {
        this.getInvalidErrorMessage = function(fieldKey) {
            return "Please enter a valid " + smwl.getInLowerCase(fieldKey) + '.';
        };
        this.getRequiredMessage = function(fieldKey) {
            return smwl.getFirstCharUpperCase(fieldKey) + ' is required.';
        };
        this.getResolveErrorsMessage = function(fieldKey) {
            return "Please resolve all " + fieldKey + " errors.";
        };
        this.NO_SERVERS_2_SELECT = 'No servers to select.';
        this.NO_SERVERS_SELECTED = 'No servers selected.';
        this.NO_TAGS_FOUND = 'No tags found.';
    };
    return Messages;
});