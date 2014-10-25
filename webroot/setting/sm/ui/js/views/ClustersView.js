/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'setting/sm/ui/js/models/ClusterModel',
    'setting/sm/ui/js/views/ClusterEditView'
], function (_, Backbone, ClusterModel, ClusterEditView) {
    var prefixId = smwc.CLUSTER_PREFIX_ID,
        clusterEditView = new ClusterEditView(),
        gridElId = '#' + prefixId + smwc.RESULTS_SUFFIX_ID;

    var ClusterView = Backbone.View.extend({
        el: $(contentContainer),

        render: function (viewConfig) {
            var hashParams = viewConfig['hashParams']
            if (hashParams['cluster_id'] != null) {
                this.renderCluster(hashParams['cluster_id']);
            } else {
                this.renderClustersList();
            }
        },

        renderClustersList: function () {
            var directoryTemplate = contrail.getTemplate4Id(smwc.SM_PREFIX_ID + smwc.TMPL_SUFFIX_ID);

            this.$el.html(directoryTemplate({name: prefixId}));

            var gridConfig = {
                header: {
                    title: {
                        text: smwl.TITLE_CLUSTERS
                    },
                    advanceControls: headerActionConfig
                },
                columnHeader: {
                    columns: smwgc.CLUSTER_COLUMNS
                },
                body: {
                    options: {
                        actionCell: rowActionConfig,
                        checkboxSelectable: {
                            onNothingChecked: function(e){
                                $('#btnDeleteClusters').addClass('disabled-link');
                            },
                            onSomethingChecked: function(e){
                                $('#btnDeleteClusters').removeClass('disabled-link');
                            }
                        },
                        detail: {
                            template: $('#sm-grid-2-row-group-detail-template').html(),
                            templateConfig: detailTemplateConfig
                        }
                    },
                    dataSource: {
                        remote: {
                            ajaxConfig: {
                                url: smwu.getObjectDetailUrl(prefixId, smwc.SERVERS_STATE_PROCESSOR)
                            }
                        }
                    }
                }
            };

            smwu.renderGrid(gridElId, gridConfig);
        },

        renderCluster: function (clusterId) {
            var detailTemplate = contrail.getTemplate4Id(smwc.TMPL_2ROW_GROUP_DETAIL),
                clusterTemplate = contrail.getTemplate4Id(smwc.TMPL_CLUSTER),
                clusterActionTemplate = contrail.getTemplate4Id(smwc.TMPL_CLUSTER_ACTION),
                ajaxConfig = {}, that = this;
            ajaxConfig.type = "GET";
            ajaxConfig.cache = "true";
            ajaxConfig.url = smwu.getObjectDetailUrl(smwc.CLUSTER_PREFIX_ID, smwc.SERVERS_STATE_PROCESSOR) + "&id=" + clusterId;

            that.$el.html(clusterTemplate({cluster_id: clusterId}));
            contrail.ajaxHandler(ajaxConfig, function () {}, function (response) {
                var actionConfigItem = null, i = 0;
                $.each(clusterActionCallbackConfig, function(rowActionCallbackConfigKey, rowActionCallbackConfigValue) {
                    actionConfigItem = $(clusterActionTemplate(rowActionConfig[i]));
                    that.$el.find("#cluster-actions").append(actionConfigItem);

                    actionConfigItem.on('click', function() {
                        rowActionCallbackConfigValue(response[0]);
                    });
                    i++;
                });

                that.$el.find("#cluster-details").html(detailTemplate({dc: response[0], templateConfig: detailTemplateConfig}));
                requirejs(["/setting/sm/ui/js/views/ServersView.js"], function (ServersView) {
                    var serversView = new ServersView({
                        el: that.$el.find("#cluster-server-list")
                    });
                    serversView.render({serverColumnsType: smwc.CLUSTER_PREFIX_ID, showAssignRoles: true, hashParams: {"cluster_id": clusterId}});
                });
            }, function () {});
        }
    });

    var clusterActionCallbackConfig = {
        renderAddServers: function(dataItem) {
            var clusterModel = new ClusterModel(dataItem);

            clusterEditView.model = clusterModel;
            clusterEditView.renderAddServers({"title": smwl.TITLE_ADD_SERVERS, callback: function () {
                loadFeature({p: smwc.URL_HASH_SM_CLUSTERS, q: {cluster_id: dataItem['id']}});
            }});
        },
        renderRemoveServers: function(dataItem) {
            var clusterModel = new ClusterModel(dataItem);

            clusterEditView.model = clusterModel;
            clusterEditView.renderRemoveServers({"title": smwl.TITLE_REMOVE_SERVERS, callback: function () {
                loadFeature({p: smwc.URL_HASH_SM_CLUSTERS, q: {cluster_id: dataItem['id']}});
            }});
        },
        renderAssignRoles: function(dataItem) {
            var clusterModel = new ClusterModel(dataItem),
                checkedRow = [dataItem];

            clusterEditView.model = clusterModel;
            clusterEditView.renderAssignRoles({"title": smwl.TITLE_ASSIGN_ROLES, checkedRows: checkedRow, callback: function () {
                loadFeature({p: smwc.URL_HASH_SM_CLUSTERS, q: {cluster_id: dataItem['id']}});
            }});
        },
        renderConfigure: function(dataItem) {
            var clusterModel = new ClusterModel(dataItem),
                checkedRow = [dataItem];

            clusterEditView.model = clusterModel;
            clusterEditView.renderConfigure({"title": smwl.TITLE_EDIT_CONFIG, checkedRows: checkedRow, callback: function () {
                loadFeature({p: smwc.URL_HASH_SM_CLUSTERS, q: {cluster_id: dataItem['id']}});
            }});
        },
        renderReimage: function(dataItem) {
            var clusterModel = new ClusterModel(dataItem),
                checkedRow = [dataItem];

            clusterEditView.model = clusterModel;
            clusterEditView.renderReimage({"title": smwl.TITLE_REIMAGE, checkedRows: checkedRow, callback: function () {
                loadFeature({p: smwc.URL_HASH_SM_CLUSTERS, q: {cluster_id: dataItem['id']}});
            }});
        },
        renderProvision: function(dataItem) {
            var clusterModel = new ClusterModel(dataItem),
                checkedRow = [dataItem];

            clusterEditView.model = clusterModel;
            clusterEditView.renderProvision({"title": smwl.TITLE_PROVISION_CLUSTER, checkedRows: checkedRow, callback: function () {
                loadFeature({p: smwc.URL_HASH_SM_CLUSTERS, q: {cluster_id: dataItem['id']}});
            }});
        },
        renderDelete: function (dataItem) {
            var clusterModel = new ClusterModel(dataItem),
                checkedRow = dataItem;

            clusterEditView.model = clusterModel;
            clusterEditView.renderDeleteCluster({"title": smwl.TITLE_DEL_CLUSTER, checkedRows: checkedRow, callback: function () {
                loadFeature({p: smwc.URL_HASH_SM_CLUSTERS, q: {}});
            }});
        }
    };

    var rowActionCallbackConfig = {
        renderAddServers: function(dataItem) {
            var clusterModel = new ClusterModel(dataItem),
                _title = smwl.TITLE_ADD_SERVERS + ' ('+ dataItem['id'] +')';

            clusterEditView.model = clusterModel;
            clusterEditView.renderAddServers({"title": _title, callback: function () {
                var dataView = $(gridElId).data("contrailGrid")._dataView;
                dataView.refreshData();
            }});
        },
        renderRemoveServers: function(dataItem) {
            var clusterModel = new ClusterModel(dataItem),
                _title = smwl.TITLE_REMOVE_SERVERS + ' ('+ dataItem['id'] +')';

            clusterEditView.model = clusterModel;
            clusterEditView.renderRemoveServers({"title": _title, callback: function () {
                var dataView = $(gridElId).data("contrailGrid")._dataView;
                dataView.refreshData();
            }});
        },
        renderAssignRoles: function(dataItem) {
            var clusterModel = new ClusterModel(dataItem),
                checkedRow = [dataItem],
                _title = smwl.TITLE_ASSIGN_ROLES + ' ('+ dataItem['id'] +')';

            clusterEditView.model = clusterModel;
            clusterEditView.renderAssignRoles({"title": _title, checkedRows: checkedRow, callback: function () {
                var dataView = $(gridElId).data("contrailGrid")._dataView;
                dataView.refreshData();
            }});
        },
        renderConfigure: function(dataItem) {
            var clusterModel = new ClusterModel(dataItem),
                checkedRow = [dataItem],
                _title = smwl.TITLE_EDIT_CONFIG + ' ('+ dataItem['id'] +')';

            clusterEditView.model = clusterModel;
            clusterEditView.renderConfigure({"title": _title, checkedRows: checkedRow, callback: function () {
                var dataView = $(gridElId).data("contrailGrid")._dataView;
                dataView.refreshData();
            }});
        },
        renderReimage: function(dataItem) {
            var clusterModel = new ClusterModel(dataItem),
                checkedRow = [dataItem],
                _title = smwl.TITLE_REIMAGE + ' ('+ dataItem['id'] +')';

            clusterEditView.model = clusterModel;
            clusterEditView.renderReimage({"title": _title, checkedRows: checkedRow, callback: function () {
                var dataView = $(gridElId).data("contrailGrid")._dataView;
                dataView.refreshData();
            }});
        },
        renderProvision: function(dataItem) {
            var clusterModel = new ClusterModel(dataItem),
                checkedRow = [dataItem],
                _title = smwl.TITLE_PROVISION_CLUSTER + ' ('+ dataItem['id'] +')';

            clusterEditView.model = clusterModel;
            clusterEditView.renderProvision({"title": _title, checkedRows: checkedRow, callback: function () {
                var dataView = $(gridElId).data("contrailGrid")._dataView;
                dataView.refreshData();
            }});
        },
        renderDelete: function (dataItem) {
            var clusterModel = new ClusterModel(dataItem),
                checkedRow = dataItem,
                _title = smwl.TITLE_ADD_SERVERS + ' ('+ dataItem['id'] +')';

            clusterEditView.model = clusterModel;
            clusterEditView.renderDeleteCluster({"title": _title, checkedRows: checkedRow, callback: function () {
                var dataView = $(gridElId).data("contrailGrid")._dataView;
                dataView.refreshData();
            }});
        }
    };

    var rowActionConfig = [
        smwgc.getAddServersAction(function (rowIndex) {
            var dataItem = $('#' + prefixId + smwc.RESULTS_SUFFIX_ID).data('contrailGrid')._dataView.getItem(rowIndex);
            rowActionCallbackConfig.renderAddServers(dataItem);
        }),
        smwgc.getRemoveServersAction(function (rowIndex) {
            var dataItem = $('#' + prefixId + smwc.RESULTS_SUFFIX_ID).data('contrailGrid')._dataView.getItem(rowIndex);
            rowActionCallbackConfig.renderRemoveServers(dataItem);
        }),
        smwgc.getAssignRoleAction(function (rowIndex) {
            var dataItem = $('#' + prefixId + smwc.RESULTS_SUFFIX_ID).data('contrailGrid')._dataView.getItem(rowIndex);
            rowActionCallbackConfig.renderAssignRoles(dataItem)
        }),
        smwgc.getConfigureAction(function (rowIndex) {
            var dataItem = $('#' + prefixId + smwc.RESULTS_SUFFIX_ID).data('contrailGrid')._dataView.getItem(rowIndex);
            rowActionCallbackConfig.renderConfigure(dataItem);
        }),
        smwgc.getReimageAction(function (rowIndex) {
            var dataItem = $('#' + prefixId + smwc.RESULTS_SUFFIX_ID).data('contrailGrid')._dataView.getItem(rowIndex);
            rowActionCallbackConfig.renderReimage(dataItem);
        }, true),
        smwgc.getProvisionAction(function (rowIndex) {
            var dataItem = $('#' + prefixId + smwc.RESULTS_SUFFIX_ID).data('contrailGrid')._dataView.getItem(rowIndex);
            rowActionCallbackConfig.renderProvision(dataItem);
        }),
        smwgc.getDeleteAction(function (rowIndex) {
            var dataItem = $('#' + prefixId + smwc.RESULTS_SUFFIX_ID).data('contrailGrid')._dataView.getItem(rowIndex);
            rowActionCallbackConfig.renderDelete(dataItem);
        }, true)
    ];

    var detailTemplateConfig = [
        [
            {
                title: smwl.TITLE_DETAILS,
                keys: ['id', 'email']
            },
            {
                title: smwl.TITLE_OPENSTACK,
                keys: ['parameters.openstack_mgmt_ip', 'parameters.keystone_tenant', 'parameters.keystone_username']
            },
            {
                title: smwl.TITLE_CONTRAIL,
                keys: ['parameters.analytics_data_ttl', 'parameters.haproxy', 'parameters.multi_tenancy', 'parameters.use_certificates', 'parameters.external_bgp', 'parameters.encapsulation_priority', 'parameters.router_asn', 'parameters.database_dir']
            }
        ],
        [
            {
                title: smwl.TITLE_STATUS,
                keys: ['ui_added_parameters.servers_status.total_servers', 'ui_added_parameters.servers_status.new_servers', 'ui_added_parameters.servers_status.configured_servers', 'ui_added_parameters.servers_status.inprovision_servers', 'ui_added_parameters.servers_status.provisioned_servers']
            },
            {
                title: smwl.TITLE_SERVERS_CONFIG,
                keys: ['parameters.domain', 'parameters.gateway', 'parameters.subnet_mask', 'base_image_id', 'package_image_id']
            },
            {
                title: smwl.TITLE_STORAGE,
                keys: ['parameters.uuid', 'parameters.storage_virsh_uuid', 'parameters.storage_fsid']
            },
        ]
    ];

    var headerActionConfig = [
        /*
        {
            "type": "link",
            linkElementId: 'btnDeleteClusters',
            disabledLink: true,
            "title": smLabels.TITLE_DEL_CLUSTERS,
            "iconClass": "icon-trash",
            "onClick": function () {
            }
        },
        */
        {
            "type": "link",
            "title": smwl.TITLE_ADD_CLUSTER,
            "iconClass": "icon-plus",
            "onClick": function () {
                var clusterModel = new ClusterModel();

                clusterEditView.model = clusterModel;
                clusterEditView.renderAddCluster({"title": smwl.TITLE_ADD_CLUSTER, callback: function () {
                    var dataView = $(gridElId).data("contrailGrid")._dataView;
                    dataView.refreshData();
                }});
            }
        }
    ];
    return ClusterView;
});