﻿/**
* jQuery EasyUI 1.3.3
* Copyright (c) 2009-2013 www.jeasyui.com. All rights reserved.
*
* Licensed under the GPL or commercial licenses
* To use it on other terms please contact us: jeasyui@gmail.com
* http://www.gnu.org/licenses/gpl.txt
* http://www.jeasyui.com/license_commercial.php
*
* jQuery EasyUI tabs Extensions 1.0 beta
* jQuery EasyUI tabs 组件扩展
* jeasyui.extensions.tabs.js
* 二次开发 陈建伟
* 最近更新：2013-06-21
*
* 依赖项：
*   1、jquery.jdirk.js v1.0 beta late
*   2、jeasyui.extensions.js v1.0 beta late
*   3、jeasyui.extensions.menu.js v1.0 beta late
*   4、jeasyui.extensions.panel.js v1.0 beta late
*   5、jeasyui.extensions.window.js v1.0 beta late
*   6、jeasyui.extensions.dialog.js v1.0 beta late
*
* Copyright (c) 2013 ChenJianwei personal All rights reserved.
* http://www.chenjianwei.org
*/
(function ($, undefined) {


    $.fn.tabs.extensions = {};


    function initTabsPanelPaddingTopLine(target) {
        var tabs = $.util.parseJquery(target), opts = tabs.tabs("options"), position = opts.tabPosition;
        if ($.isNumeric(opts.lineHeight) && opts.lineHeight > 0) {
            if (!$.array.contains(["top", "bottom", "left", "right"], position)) { position = "top"; }
            tabs.children("div.tabs-panels").css("padding-" + position, opts.lineHeight.toString() + "px").children().children().css("border-" + position + "-width", "1px");
        }
    };

    var _onContextMenu = $.fn.tabs.defaults.onContextMenu;
    var onContextMenu = function (e, title, index) {
        if ($.isFunction(_onContextMenu)) { _onContextMenu.apply(this, arguments); }
        var t = $.util.parseJquery(this), opts = t.tabs("options");
        if (opts.enableConextMenu) {
            e.preventDefault();
            var panel = t.tabs("getTab", index),
                panelOpts = panel.panel("options"),
                leftTabs = t.tabs("leftClosableTabs", index),
                rightTabs = t.tabs("rightClosableTabs", index),
                otherTabs = t.tabs("otherClosableTabs", index),
                allTabs = t.tabs("tabs"),
                selected = t.tabs("isSelected", index),
                m1 = { text: "显示选项卡的 option", iconCls: "icon-standard-application-form", disabled: !opts.showOption, handler: function () { t.tabs("showOption", index); } },
                m2 = { text: "关闭选项卡", iconCls: "icon-standard-application-form-delete", disabled: !panelOpts.closable, handler: function () { t.tabs("closeClosable", index); } },
                m3 = { text: "关闭其他选项卡", iconCls: "icon-standard-cancel", disabled: !otherTabs.length, handler: function () { t.tabs("closeOtherClosable", index); } },
                m4 = { text: "刷新选项卡", iconCls: "icon-standard-table-refresh", disabled: !(selected && panelOpts.refreshable), handler: function () { t.tabs("refresh", index); } },
                m5 = { text: "关闭左侧选项卡", iconCls: "icon-standard-tab-close-left", disabled: !leftTabs.length, handler: function () { t.tabs("closeLeftClosable", index); } },
                m6 = { text: "关闭右侧选项卡", iconCls: "icon-standard-tab-close-right", disabled: !rightTabs.length, handler: function () { t.tabs("closeRightClosable", index); } },
                m7 = { text: "关闭所有选项卡", iconCls: "icon-standard-cross", disabled: !allTabs.length, handler: function () { t.tabs("closeAllClosable"); } },
                m8 = { text: "新建选项卡", iconCls: "icon-standard-tab-add", disabled: !opts.enableNewTabMenu, handler: function () { t.tabs("newTab", index); } },
                m9 = { text: "重复选项卡", iconCls: "icon-standard-control-repeat", disabled: !panelOpts.repeatable, handler: function () { t.tabs("repeat", index); } };
            var items = [];
            if ($.array.likeArray(opts.contextMenu) && !$.util.isString(opts.contextMenu)) { $.array.merge(items, opts.contextMenu); }
            if (opts.showOption) { $.array.merge(items, "-", m1); }
            $.array.merge(items, panelOpts.closable ? ["-", m2, m3] : ["-", m3]);
            if (selected && panelOpts.refreshable) { $.array.merge(items, "-", m4); }
            $.array.merge(items, "-", m5, m6, m7);
            if (panelOpts.repeatable || opts.enableNewTabMenu) {
                var mm = [];
                if (opts.enableNewTabMenu) { mm.push(m8); }
                if (panelOpts.repeatable) { mm.push(m9); }
                $.array.merge(items, "-", mm);
            }
            items = parseContextMenuMap(e, title, index, items, t);
            if (items[0] == "-") { $.array.removeAt(items, 0); }
            $.easyui.showMenu({ left: e.pageX, top: e.pageY, items: items });
        }
    };
    function parseContextMenuMap(e, title, index, menus, tabs) {
        return $.array.map(menus, function (value) {
            if (!value || $.util.isString(value)) { return value; }
            var ret = $.extend({}, value);
            ret.id = $.isFunction(value.id) ? value.id.call(ret, e, title, index, tabs) : value.id;
            ret.text = $.isFunction(value.text) ? value.text.call(ret, e, title, index, tabs) : value.text;
            ret.iconCls = $.isFunction(value.iconCls) ? value.iconCls.call(ret, e, title, index, tabs) : value.iconCls;
            ret.disabled = $.isFunction(value.disabled) ? value.disabled.call(ret, e, title, index, tabs) : value.disabled;
            ret.hideOnClick = $.isFunction(value.hideOnClick) ? value.hideOnClick.call(ret, e, title, index, tabs) : value.hideOnClick;
            ret.onclick = $.isFunction(value.onclick) ? function (e, item, menu) { value.onclick.call(this, e, title, index, tabs, item, menu); } : value.onclick;
            ret.handler = $.isFunction(value.handler) ? function (e, item, menu) { value.handler.call(this, e, title, index, tabs, item, menu); } : value.handler;
            if (ret.children && ret.children.length) { ret.children = parseContextMenuMap(e, title, index, ret.children, tabs); }
            return ret;
        });
    };

    var _updateTab = $.fn.tabs.methods.update;
    function updateTab(target, param) {
        param = $.extend({ tab: null, options: null }, param);
        var tabs = $.util.parseJquery(target), opts = tabs.tabs("options"),
            index = tabs.tabs("getTabIndex", param.tab),
            panelOpts = $.union({}, param.options, $.fn.tabs.extensions.panelOptions),
            tools = panelOpts.tools, onLoad = panelOpts.onLoad,
            refreshButton = { iconCls: "icon-mini-refresh", handler: function () {
                var title = $(this).parent().prev().find("span.tabs-title").text();
                if (title) { $.util.call(function () { tabs.tabs("refresh", title); }); }
            }
            };
        if (panelOpts.refreshable) {
            if ($.array.likeArray(panelOpts.tools)) {
                panelOpts.tools = $.array.merge([], panelOpts.tools, refreshButton);
            } else { panelOpts.tools = [refreshButton]; }
        }
        if ((!$.string.isNullOrWhiteSpace(panelOpts.href) || !$.string.isNullOrWhiteSpace(panelOpts.content)) && !panelOpts.iniframe) {
            $.easyui.messager.progress({ title: "操作提醒", msg: "正在加载...", interval: 100 });
        }
        panelOpts.onLoad = function () {
            if ($.isFunction(onLoad)) { onLoad.apply(this, arguments); }
            $.util.call(function () { $.easyui.messager.progress("close"); });
            $.util.parseJquery(this).panel("options").onLoad = onLoad;
        };
        _updateTab.call(tabs, tabs, { tab: param.tab, options: panelOpts });
        panelOpts = tabs.tabs("getTab", index).panel("options"); panelOpts.tools = tools;
        initTabsPanelPaddingTopLine(target);
        var li = tabs.find(">div.tabs-header>div.tabs-wrap>ul.tabs>li:eq(" + index + ")").off("dblclick.closeOnDblClick").on("dblclick.closeOnDblClick", function () {
            if (panelOpts.closeOnDblClick && panelOpts.closable) { tabs.tabs("close", panelOpts.title); }
        });
        if (panelOpts.closeOnDblClick && panelOpts.closable) { li.attr("title", "双击此选项卡标题可以关闭"); }
    };

    function refreshTab(target, which) {
        var tabs = $.util.parseJquery(target), opts = tabs.tabs("options"),
            panel = tabs.tabs("getTab", which), panelOpts = panel.panel("options"),
            index = tabs.tabs("getTabIndex", panel);
        if ($.string.isNullOrWhiteSpace(panelOpts.href) && $.string.isNullOrWhiteSpace(panelOpts.content)) { return; }
        tabs.tabs("update", { tab: panel, options: panelOpts });
        if ($.isFunction(opts.onRefresh)) { opts.onRefresh.call(target, opts.title, index); }
    };

    function isSelected(target, which) {
        var tabs = $.util.parseJquery(target), selected = tabs.tabs("getSelected"), index = tabs.tabs("getTabIndex", selected);
        var thisTab = tabs.tabs("getTab", which), thisIndex = tabs.tabs("getTabIndex", thisTab);
        return thisIndex == index;
    };

    function isClosable(target, which) {
        var tabs = $.util.parseJquery(target), panel = tabs.tabs("getTab", which), panelOpts = panel.panel("options");
        return panelOpts.closable;
    };

    function newTab(target, which) {
        var content = $("<table></table>").css({ width: "95%", height: "100%" }),
            txtTitle = $("<input type='text' style='width: 98%;'/>"),
            txtHref = $("<input type='text' style='width: 98%;'/>"),
            ckRefreshable = $("<input id='refreshable' type='checkbox' checked='true' />"),
            ckIniframe = $("<input id='iniframe' type='checkbox' />"),
            lblRefreshable = $("<label>是否可刷新</label>"),
            lblIniframe = $("<label>是否嵌至 IFRAME(浏览器内部窗体) 中</label>");

        var tr1 = $("<tr></tr>").append("<td width='24%' align='right'>选项卡标题：</td>").appendTo(content);
        var tr2 = $("<tr></tr>").append("<td width='24%' align='right'>路径(href)：</td>").appendTo(content);
        var tr3 = $("<tr></tr>").appendTo(content);
        $("<td></td>").append(txtTitle).appendTo(tr1);
        $("<td></td>").append(txtHref).appendTo(tr2);
        $("<td width='24%' align='right'></td>").append(ckRefreshable).append(lblRefreshable).appendTo(tr3);
        $("<td align='right'></td>").append(ckIniframe).append(lblIniframe).appendTo(tr3);

        which = which || 0;
        var tabs = $.util.parseJquery(target),
            index = $.isNumeric(which) ? which : tabs.tabs("getTabIndex", tabs.tabs("getTab", which)),
            header = tabs.find(">div.tabs-header>div.tabs-wrap>ul.tabs>li:eq(" + index + ")"),
            offset = header.offset(), position = $.extend({}, { left: offset.left + 10, top: offset.top + 10 });
        var dialogOptions = $.extend({
            iconCls: "icon-standard-application-form",
            title: "新建选项卡 - 设置参数",
            width: 400,
            height: 165,
            maximizable: false,
            resizable: false,
            autoVCenter: false,
            autoHCenter: false,
            enableSaveButton: false,
            topMost: false,
            applyButtonText: "打开",
            onApply: function (dia) {
                var title = txtTitle.val(), href = txtHref.val();
                href = href || $.fn.tabs.extensions.panelOptions.href;
                if ($.string.isNullOrWhiteSpace(title)) { title = "新建选项卡"; }
                var i = 0; while (tabs.tabs("getTab", title = title + (i ? i : ""))) { i++; }
                if ($.string.isNullOrWhiteSpace(href)) { $.easyui.messager.show("操作提醒", "请输入要创建的选项卡的路径！", "info"); txtHref.focus(); return; }
                var iniframe = ckIniframe.prop("checked"), refreshable = ckRefreshable.prop("checked");
                tabs.tabs("add", { title: title, href: href, refreshable: refreshable, closable: true, iniframe: iniframe });
                dia.dialog("close");
            },
            content: content
        }, position);
        var dia = $.easyui.showDialog(dialogOptions);
        $.util.call(function () {
            var enter = dia.find(">div.dialog-button>a:first");
            txtTitle.keydown(function (e) { if (e.which == 13) { txtHref.focus(); } });
            txtHref.keydown(function (e) { if (e.which == 13) { ckRefreshable.focus(); } });
            ckRefreshable.keydown(function (e) { if (e.which == 13) { ckIniframe.focus(); } });
            ckIniframe.keydown(function (e) { if (e.which == 13) { enter.focus(); } });
            lblRefreshable.click(function () { ckRefreshable.click(); });
            lblIniframe.click(function () { ckIniframe.click(); });
            enter.focus();
            txtTitle.focus();
        });
    };

    function repeatTab(target, which) {
        var tabs = $.util.parseJquery(target), panel = tabs.tabs("getTab", which), panelOpts = panel.panel("options");
        var opts = $.extend({}, panelOpts, { selected: true, closable: true }), i = 2, title = opts.title;
        while (tabs.tabs("getTab", opts.title = title + "-" + i.toString())) { i++; }
        tabs.tabs("add", opts);
    };

    function getTabOption(target, which) {
        var t = $.util.parseJquery(target), tab = tabs.tabs("getTab", which), tabOpts = tab.panel("options");
        return tabOpts;
    };

    function getSelectedOption(target) {
        var t = $.util.parseJquery(target), tab = t.tabs("getSelected"), tabOpts = tab.panel("options");
        return tabOpts;
    };

    function getSelectedIndex(target) {
        var t = $.util.parseJquery(target), tab = t.tabs("getSelected"), index = t.tabs("getTabIndex", tab);
        return index;
    };

    function getSelectedTitle(target) {
        var t = $.util.parseJquery(target), tabOpts = t.tabs("getSelectedOption"), title = tabOpts.title;
        return title;
    };

    function leftTabs(target, which) {
        var tabs = $.util.parseJquery(target), index = $.isNumeric(which) ? which : tabs.tabs("getTabIndex", tabs.tabs("getTab", which)),
            panels = tabs.tabs("tabs");
        return $.array.range(panels, 0, index);
    };

    function rightTabs(target, which) {
        var tabs = $.util.parseJquery(target), index = $.isNumeric(which) ? which : tabs.tabs("getTabIndex", tabs.tabs("getTab", which)),
            panels = tabs.tabs("tabs");
        return $.array.range(panels, index + 1);
    };

    function otherTabs(target, which) {
        var tabs = $.util.parseJquery(target), index = $.isNumeric(which) ? which : tabs.tabs("getTabIndex", tabs.tabs("getTab", which)),
            panels = tabs.tabs("tabs");
        return $.array.merge($.array.range(panels, 0, index), $.array.range(panels, index + 1));
    };

    var closableFinder = function (val) {
        if ($.util.isJqueryObject(val) && val.length) {
            var state = $.data(val[0], "panel");
            return state && state.options && state.options.closable;
        } else { return false; }
    };

    function closableTabs(target) {
        var tabs = $.util.parseJquery(target), panels = tabs.tabs("tabs");
        return $.array.filter(panels, closableFinder);
    };

    function leftClosableTabs(target, which) {
        var tabs = $.util.parseJquery(target), panels = tabs.tabs("leftTabs", which);
        return $.array.filter(panels, closableFinder);
    };

    function rightClosableTabs(target, which) {
        var tabs = $.util.parseJquery(target), panels = tabs.tabs("rightTabs", which);
        return $.array.filter(panels, closableFinder);
    };

    function otherClosableTabs(target, which) {
        var tabs = $.util.parseJquery(target), panels = tabs.tabs("otherTabs", which);
        return $.array.filter(panels, closableFinder);
    };

    function closeLeftTabs(target, which) {
        var tabs = $.util.parseJquery(target), panels = tabs.tabs("leftTabs", which);
        $.each(panels, function () { tabs.tabs("close", tabs.tabs("getTabIndex", this)); });
    };

    function closeRightTabs(target, which) {
        var tabs = $.util.parseJquery(target), panels = tabs.tabs("rightTabs", which);
        $.each(panels, function () { tabs.tabs("close", tabs.tabs("getTabIndex", this)); });
    };

    function closeOtherTabs(target, which) {
        var tabs = $.util.parseJquery(target), panels = tabs.tabs("otherTabs", which);
        $.each(panels, function () { tabs.tabs("close", tabs.tabs("getTabIndex", this)); });
    };

    function closeAllTabs(target) {
        var tabs = $.util.parseJquery(target), panels = tabs.tabs("tabs");
        $.each($.array.clone(panels), function () { tabs.tabs("close", tabs.tabs("getTabIndex", this)); });
    };

    function closeClosableTab(target, which) {
        var tabs = $.util.parseJquery(target), panel = tabs.tabs("getTab", which);
        if (panel && panel.panel("options").closable) {
            var index = $.isNumeric(which) ? which : tabs.tabs("getTabIndex", panel);
            tabs.tabs("close", index);
        }
    };

    function closeLeftClosableTabs(target, which) {
        var tabs = $.util.parseJquery(target), panels = tabs.tabs("leftClosableTabs", which);
        $.each($.array.clone(panels), function () { tabs.tabs("close", tabs.tabs("getTabIndex", this)); });
    };

    function closeRightClosableTabs(target, which) {
        var tabs = $.util.parseJquery(target), panels = tabs.tabs("rightClosableTabs", which);
        $.each($.array.clone(panels), function () { tabs.tabs("close", tabs.tabs("getTabIndex", this)); });
    };

    function closeOtherClosableTabs(target, which) {
        var tabs = $.util.parseJquery(target), panels = tabs.tabs("otherClosableTabs", which);
        $.each($.array.clone(panels), function () { tabs.tabs("close", tabs.tabs("getTabIndex", this)); });
    };

    function closeAllClosableTabs(target, which) {
        var tabs = $.util.parseJquery(target), panels = tabs.tabs("closableTabs", which);
        $.each($.array.clone(panels), function () { tabs.tabs("close", tabs.tabs("getTabIndex", this)); });
    };

    function showOption(target, which) {
        which = which || 0;
        var tabs = $.util.parseJquery(target), panel = tabs.tabs("getTab", which), panelOpts = panel.panel("options");
        var index = $.isNumeric(which) ? which : tabs.tabs("getTabIndex", panel),
            header = tabs.find(">div.tabs-header>div.tabs-wrap>ul.tabs>li:eq(" + index + ")"),
            offset = header.offset(), position = $.extend({}, { left: offset.left + 10, top: offset.top + 10 });
        $.easyui.showOption(panelOpts, {
            iconCls: "icon-standard-application-form", title: "显示选项卡 " + panelOpts.title + " 的 option 值",
            left: position.left, top: position.top, topMost: false
        });
    };

    function moveTab(tabTarget, param) {
        if (!param || !param.source || !param.target || !param.point) { return; }
        var source = param.source, target = param.target,
            point = $.array.contains(["before", "after"], param.point) ? param.point : "before",
            t = $.util.parseJquery(tabTarget), tabs = t.tabs("tabs"),
            sourcePanel = t.tabs("getTab", source), targetPanel = t.tabs("getTab", target),
            sourceIndex = t.tabs("getTabIndex", sourcePanel),
            sourceHeader = sourcePanel.panel("header"), targetHeader = targetPanel.panel("header");
        if (!sourcePanel || !targetPanel) { return; }

        $.array.removeAt(tabs, sourceIndex);
        var targetIndex = $.array.indexOf(tabs, targetPanel);
        $.array.insert(tabs, point == "before" ? targetIndex : targetIndex + 1, sourcePanel);

        sourcePanel = sourcePanel.panel("panel"); targetPanel = targetPanel.panel("panel");
        targetPanel[point](sourcePanel); targetHeader[point](sourceHeader);
    };

    function insertTab(tabTarget, options) {
        var target = options.target, t = $.util.parseJquery(tabTarget);
        options.target = undefined;
        t.tabs("add", options);
        var tabs = t.tabs("tabs");
        t.tabs("move", { source: tabs.length - 1, target: target, point: "before" });
    };

    var panelOptions = $.fn.tabs.extensions.panelOptions = {

        //  该选项卡的 href 是否在 iframe 中打开。
        iniframe: false,

        //  该选项卡是否具有重复打开功能
        repeatable: false,

        //  该选项卡是否具有刷新功能。
        refreshable: true,

        //  双击选项卡标题是否能将其关闭，当该选项卡 closable: true 时，该属性有效。
        closeOnDblClick: true,

        href: null,

        iconCls: "icon-standard-application-form"
    };
    var methods = $.fn.tabs.extensions.methods = {
        //  覆盖 easyui-tabs 的原生方法 update，以支持扩展的功能；
        update: function (jq, param) { return jq.each(function () { updateTab(this, param); }); },

        //  刷新指定的选项卡；该方法定义如下参数：
        //      which:  表示被刷新的选项卡的 索引号 或者 标题。
        //  返回值：返回当前选项卡控件 easyui-tabs 的 jQuery 对象。
        refresh: function (jq, which) { return jq.each(function () { refreshTab(this, which); }); },

        //  判断指定的选项卡是否被选中；该方法定义如下参数：
        //      which:  要判断的选项卡的 索引号 或者 标题。
        //  返回值：如果指定的选项卡被选中，则返回 true，否则返回 false。
        isSelected: function (jq, which) { return isSelected(jq[0], which); },

        //  判断指定的选项卡是否可关闭(closable:true)；该方法定义如下参数：
        //      which:  要判断的选项卡的 索引号 或者 标题。
        //  返回值：如果指定的选项卡可被关闭(closable:true)，则返回 true，否则返回 false。
        isClosable: function (jq, which) { return isClosable(jq[0], which); },

        //  弹出一个 easyui-dialog，可以在该 dialog 中输入参数以在当前选项卡组件中创建一个新的选项卡；该方法定义如下参数：
        //      which:  指定的选项卡的 索引号 或者 标题，可选，默认为 0；该参数用于指示弹出的 easyui-dialog 出现的位置。
        //  返回值：返回当前选项卡控件 easyui-tabs 的 jQuery 对象。
        newTab: function (jq, which) { return jq.each(function () { newTab(this, which); }); },

        //  创建一个和指定选项卡相同内容的新选项卡；该方法定义如下参数：
        //      which:  指定的选项卡的 索引号 或者 标题。
        //  返回值：返回当前选项卡控件 easyui-tabs 的 jQuery 对象。
        repeat: function (jq, which) { return jq.each(function () { repeatTab(this, which); }); },

        //  获取指定选项卡的属性值集合(option)；
        getTabOption: function (jq, which) { return getTabOption(jq[0], which); },

        //  获取当前选中的选项卡的属性值集合 (option)；
        getSelectedOption: function (jq) { return getSelectedOption(jq[0]); },

        //  获取当前选中的选项卡的索引号；
        getSelectedIndex: function (jq) { return getSelectedIndex(jq[0]); },

        //  获取当前选中的选项卡的标题。
        getSelectedTitle: function (jq) { return getSelectedTitle(jq[0]); },

        //  获取指定选项卡的左侧所有选项卡元素；该方法定义如下参数：
        //      which:  指定的选项卡的 索引号 或者 标题。
        //  返回值：返回一个数组，数组中的每一项都是一个表示选项卡页的 panel(jQuery) 对象；
        //      如果指定选项卡左侧没有其他选项卡，则返回一个空数组。
        leftTabs: function (jq, which) { return leftTabs(jq[0], which); },

        //  获取指定选项卡的右侧所有选项卡元素；该方法定义如下参数：
        //      which:  指定的选项卡的 索引号 或者 标题。
        //  返回值：返回一个数组，数组中的每一项都是一个表示选项卡页的 panel(jQuery) 对象；
        //      如果指定选项卡右侧没有其他选项卡，则返回一个空数组。
        rightTabs: function (jq, which) { return rightTabs(jq[0], which); },

        //  获取当前选项卡控件中除指定选项卡页在的其他所有选项卡元素；该方法定义如下参数：
        //      which:  指定的选项卡的 索引号 或者 标题。
        //  返回值：返回一个数组，数组中的每一项都是一个表示选项卡页的 panel(jQuery) 对象；
        //      如果当前选项卡控件除指定的选项卡页外没有其他选项卡，则返回一个空数组。
        otherTabs: function (jq, which) { return otherTabs(jq[0], which); },

        //  获取所有可关闭的选项卡页元素集合；该方法定义如下参数：
        //      which:  指定的选项卡的 索引号 或者 标题。
        //  返回值：返回一个数组，数组中的每一项都是一个表示选项卡页的 panel(jQuery) 对象；
        //      如果没有可关闭的选项卡，则返回一个空数组。
        closableTabs: function (jq) { return closableTabs(jq[0]); },

        //  获取指定选项卡左侧的所有可关闭的选项卡元素；该方法定义如下参数：
        //      which:  指定的选项卡的 索引号 或者 标题。
        //  返回值：返回一个数组，数组中的每一项都是一个表示选项卡页的 panel(jQuery) 对象；
        //      如果指定选项卡左侧没有可关闭的选项卡，则返回一个空数组。
        leftClosableTabs: function (jq, which) { return leftClosableTabs(jq[0], which); },

        //  获取指定选项卡右侧的所有可关闭的选项卡元素；该方法定义如下参数：
        //      which:  指定的选项卡的 索引号 或者 标题。
        //  返回值：返回一个数组，数组中的每一项都是一个表示选项卡页的 panel(jQuery) 对象；
        //      如果指定选项卡右侧没有可关闭的选项卡，则返回一个空数组。
        rightClosableTabs: function (jq, which) { return rightClosableTabs(jq[0], which); },

        //  获取当前选项卡控件中除指定选项卡页在的其他所有可关闭的选项卡元素；该方法定义如下参数：
        //      which:  指定的选项卡的 索引号 或者 标题。
        //  返回值：返回一个数组，数组中的每一项都是一个表示选项卡页的 panel(jQuery) 对象；
        //      如果当前选项卡控件除指定的选项卡页外没有其他可关闭的选项卡，则返回一个空数组。
        otherClosableTabs: function (jq, which) { return otherClosableTabs(jq[0], which); },

        //  关闭指定选项卡左侧的所有选项卡；该方法定义如下参数：
        //      which:  指定的选项卡的 索引号 或者 标题。
        //  返回值：返回当前选项卡控件 easyui-tabs 的 jQuery 对象。
        closeLeft: function (jq, which) { return jq.each(function () { closeLeftTabs(this, which); }); },

        //  关闭指定选项卡右侧的所有选项卡；该方法定义如下参数：
        //      which:  指定的选项卡的 索引号 或者 标题。
        //  返回值：返回当前选项卡控件 easyui-tabs 的 jQuery 对象。
        closeRight: function (jq, which) { return jq.each(function () { closeRightTabs(this, which); }); },

        //  关闭除指定选项卡外的其他所有选项卡；该方法定义如下参数：
        //      which:  指定的选项卡的 索引号 或者 标题。
        //  返回值：返回当前选项卡控件 easyui-tabs 的 jQuery 对象。
        closeOther: function (jq, which) { return jq.each(function () { closeOtherTabs(this, which); }); },

        //  关闭所有选项卡；
        //  返回值：返回当前选项卡控件 easyui-tabs 的 jQuery 对象。
        closeAll: function (jq) { return jq.each(function () { closeAllTabs(this); }); },

        //  指定指定的选项卡，但是如果该选项卡不可被关闭(closable:false)，则不执行任何动作；该方法定义如下参数：
        //      which:  指定的选项卡的 索引号 或者 标题。
        //  返回值：返回当前选项卡控件 easyui-tabs 的 jQuery 对象。
        closeClosable: function (jq, which) { return jq.each(function () { closeClosableTab(this, which); }); },

        //  指定指定的选项卡左侧的所有可关闭的选项卡；该方法定义如下参数：
        //      which:  指定的选项卡的 索引号 或者 标题。
        //  返回值：返回当前选项卡控件 easyui-tabs 的 jQuery 对象。
        closeLeftClosable: function (jq, which) { return jq.each(function () { closeLeftClosableTabs(this, which); }); },

        //  指定指定的选项卡右侧的所有可关闭的选项卡；该方法定义如下参数：
        //      which:  指定的选项卡的 索引号 或者 标题。
        //  返回值：返回当前选项卡控件 easyui-tabs 的 jQuery 对象。
        closeRightClosable: function (jq, which) { return jq.each(function () { closeRightClosableTabs(this, which); }); },

        //  指定除指定选项卡外的所有可关闭的选项卡；该方法定义如下参数：
        //      which:  指定的选项卡的 索引号 或者 标题。
        //  返回值：返回当前选项卡控件 easyui-tabs 的 jQuery 对象。
        closeOtherClosable: function (jq, which) { return jq.each(function () { closeOtherClosableTabs(this, which); }); },

        //  指定所有可关闭的选项卡；该方法定义如下参数：
        //      which:  指定的选项卡的 索引号 或者 标题。
        //  返回值：返回当前选项卡控件 easyui-tabs 的 jQuery 对象。
        closeAllClosable: function (jq) { return jq.each(function () { closeAllClosableTabs(this); }); },

        //  以 easyui-dialog 的方式弹出一个 dialog 对话框窗体，该窗体中显示指定选项卡的所有属性值(options)；该方法定义如下参数：
        //      which:  指定的选项卡的 索引号 或者 标题。
        //  返回值：返回当前选项卡控件 easyui-tabs 的 jQuery 对象。
        showOption: function (jq, which) { return jq.each(function () { showOption(this, which); }); },

        //  将指定的 easyui-tabs tab-panel 选项卡页移动至另一位置；该方法定义如下参数：
        //      param:  这是一个 JSON-Object 对象，该对象定义如下属性：
        //          source: Integer 或 String 类型值，表示要移动的 tab-panel 的索引号或者标题 title 值；
        //          target: Integer 或 String 类型值，表示移动目标位置的 tab-panel 的索引号或者标题 title 值；
        //          point:  移动到目标位置的方式，String 类型值，仅限于定义为如下值：
        //              "before":   表示把 source 选项卡移动至 target 选项卡的前面，默认值；
        //              "after":    表示把 source 选项卡移动至 target 选项卡的后面；
        //  返回值：返回当前选项卡控件 easyui-tabs 的 jQuery 对象。
        move: function (jq, param) { return jq.each(function () { moveTab(this, param); }); },

        //  在当前 easyui-tabs 组件上创建一个新的选项卡，并将其移动至指定选项卡的前一格位置；该方法定义如下参数：
        //      options:  表示要创建的新选项卡的属性；是一个 JSON-Object 对象；
        //          该对象的各项属性参考 easyui-tabs 中 add 方法的参数 options，并在此基础上增加了如下属性：
        //          target: Integer 或 String 类型值，表示移动目标位置的 tab-panel 的索引号或者标题 title 值；
        //  返回值：返回当前选项卡控件 easyui-tabs 的 jQuery 对象。
        insert: function (jq, options) { return jq.each(function () { insertTab(this, options); }); }
    };
    var defaults = $.fn.tabs.extensions.defaults = {
        //  增加 easyui-tabs 的自定义扩展属性，该属性表示当前选项卡标题栏和选项卡的 pane-body 之间的空白区域高(宽)度(px)；
        //  该参数是一个 Number 数值，默认为 2.
        lineHeight: 2,

        //  是否启用点击选项卡头的右键菜单。
        enableConextMenu: true,

        //  是否启用 “创建新选项卡” 的右键菜单。
        enableNewTabMenu: false,

        //  定义 easyui-tabs 的 onRefresh 事件，当调用 easyui-tabs 的 refresh 方法后，将触发该事件。
        onRefresh: function (title, index) { },

        //  定义当 enableContextMenu 为 true 时，右键点击选项卡标题时候弹出的自定义右键菜单项内容；
        //  这是一个数组格式对象，数组中的每一项都是一个 menu-item 元素；该 menu-item 元素格式定义如下：
        //      id:         表示菜单项的 id；
        //      text:       表示菜单项的显示文本；
        //      iconCls:    表示菜单项的左侧显示图标；
        //      disabled:   表示菜单项是否被禁用(禁用的菜单项点击无效)；
        //      hideOnClick:    表示该菜单项点击后整个右键菜单是否立即自动隐藏；
        //      bold:           Boolean 类型值，默认为 false；表示该菜单项是否字体加粗；
        //      style:          JSON-Object 类型值，默认为 null；表示要附加到该菜单项的样式；
        //      handler:    表示菜单项的点击事件，该事件函数格式为 function(e, title, index, tabs, item, menu)，其中 this 指向菜单项本身
        contextMenu: null,

        //  覆盖 easyui-tabs 的原生事件属性 onContextMenu，以支持相应扩展功能。
        onContextMenu: onContextMenu,

        //  增加 easyui-tabs 的自定义扩展属性；该属性表示当右键点击选项卡头时，是否显示 "显示该选项卡的 option" 菜单项。
        //  Boolean 类型值，默认为 false。
        showOption: false
    };

    $.extend($.fn.tabs.defaults, defaults);
    $.extend($.fn.tabs.methods, methods);

})(jQuery);