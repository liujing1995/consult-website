/** EasyWeb spa v3.1.4 date:2019-08-05 License By http://easyweb.vip */

layui.define(['layer', 'config', 'layRouter','md5','form','sm','signUtils'], function (exports) {
    var $ = layui.jquery;
    var layer = layui.layer;
    var config = layui.config;
    var layRouter = layui.layRouter;
    var signUtils = layui.signUtils;
    var form = layui.form;
    var md5 = layui.md5;
    var SM = layui.sm;
    var bodyDOM = '.layui-layout-admin>.layui-body';
    var tabDOM = bodyDOM + '>.layui-tab';
    var sideDOM = '.layui-layout-admin>.layui-side>.layui-side-scroll';
    var headerDOM = '.layui-layout-admin>.layui-header';
    var tabFilter = 'admin-pagetabs';
    var navFilter = 'admin-side-nav';
    var themeAdmin = 'theme-admin';  // 自带的主题
    var popupRightIndex, popupCenterIndex, popupCenterParam,popupRightParam;

    var admin = {
        /* 获取自带主题 */
        getThemeAdmin:function(){
            return themeAdmin;
        },
        /* 设置侧栏折叠 */
        flexible: function (expand) {
            var isExapnd = $('.layui-layout-admin').hasClass('admin-nav-mini');
            (expand == undefined) && (expand = isExapnd);
            if (isExapnd == expand) {
                if (expand) {
                    admin.hideTableScrollBar();
                    $('.layui-layout-admin').removeClass('admin-nav-mini');
                } else {
                    $('.layui-layout-admin').addClass('admin-nav-mini');
                }
            }
            admin.resizeTable(360);
        },
        /* 设置导航栏选中 */
        activeNav: function (url) {
            if (!url) {
                url = location.hash;
            }
            if (url && url != '') {
                $(sideDOM + '>.layui-nav .layui-nav-item .layui-nav-child dd.layui-this').removeClass('layui-this');
                $(sideDOM + '>.layui-nav .layui-nav-item.layui-this').removeClass('layui-this');
                var $a = $(sideDOM + '>.layui-nav a[href="#' + url + '"]');
                if ($a && $a.length > 0) {
                    var isMini = $('.layui-layout-admin').hasClass('admin-nav-mini');
                    if ($(sideDOM + '>.layui-nav').attr('lay-accordion') == 'true') {  // 手风琴效果
                        var $pChilds = $a.parent('dd').parents('.layui-nav-child');
                        if (isMini) {
                            $(sideDOM + '>.layui-nav .layui-nav-itemed>.layui-nav-child').not($pChilds).css('display', 'none');
                        } else {
                            $(sideDOM + '>.layui-nav .layui-nav-itemed>.layui-nav-child').not($pChilds).slideUp('fast');
                        }
                        $(sideDOM + '>.layui-nav .layui-nav-itemed').not($pChilds.parent()).removeClass('layui-nav-itemed');
                    }
                    $a.parent().addClass('layui-this');  // 选中当前
                    var $asParents = $a.parent('dd').parents('.layui-nav-child').parent();
                    if (isMini) {
                        $asParents.not('.layui-nav-itemed').children('.layui-nav-child').css('display', 'block');
                    } else {
                        $asParents.not('.layui-nav-itemed').children('.layui-nav-child').slideDown('fast', function () {
                            // 菜单超出屏幕自动滚动
                            var topBeyond = $a.offset().top + $a.outerHeight() + 30 - admin.getPageHeight();
                            var topDisparity = 50 + 65 - $a.offset().top;
                            if (topBeyond > 0) {
                                $(sideDOM).animate({'scrollTop': $(sideDOM).scrollTop() + topBeyond}, 100);
                            } else if (topDisparity > 0) {
                                $(sideDOM).animate({'scrollTop': $(sideDOM).scrollTop() - topDisparity}, 100);
                            }
                        });
                    }
                    $asParents.addClass('layui-nav-itemed');  // 展开所有父级
                    // 适配多系统模式
                    $('ul[lay-filter="' + navFilter + '"]').addClass('layui-hide');
                    var $aUl = $a.parents('.layui-nav');
                    $aUl.removeClass('layui-hide');
                    //$(headerDOM + '>.layui-nav>.layui-nav-item').removeClass('layui-this');//[修改]注释掉解决厂字型布局时导航联动的bug
                    $(headerDOM + '>.layui-nav>.layui-nav-item>a[nav-bind="' + $aUl.attr('nav-id') + '"]').parent().addClass('layui-this');
                } else {
                    // console.warn(url + ' is not in left side');
                }
                //厂字型布局
                if(config.getLayout()=='factory'){
                    var res = config.getResource();
                    var curItem = {};
                    function getCurrentRes(menus,url){
                        $.each(menus, function (i, data) {
                            if (data.url  == '#'+url) {
                                curItem = data;
                                return;
                            }else if(data.subRes&&data.subRes.length>0) {
                                getCurrentRes(data.subRes,url);
                            }
                        });
                    }
                    getCurrentRes(res,url);
                    var parents = admin.util.getParent(res,curItem.id,'id','pid','subRes')||[];
                    if(parents&&parents.length)$('#topNav_'+parents[0].id).addClass('layui-this');
                }
            } else {
                console.warn('active url is null');
            }
        },
        /* 路由不存在处理 [修改]由config移至admin*/
        routerNotFound: function (r) {
            // location.replace('#/template/error/error-404');
            admin.req(config.ms_auth_api+'oauth/authverify',{resUrl:location.hash},function(res){
                admin.alert(res.msg, {offset: '30px',btn: ['确定']},function(idx){
                    if(/越权访问/i.test(res.msg)){
                        config.jumpToLoginPage();
                    }
                    layer.close(idx);
                });
            })

        },
        /* 提示层 */
        msg: function(sText,option){
            option = option?option:{};
            layer.msg(sText,option);
        },
        /* tips提示层 */
        tips: function(sText,elem,option){
            var defOption = {time:3000};
            option = option?$.extend(defOption, option):defOption;
            layer.tips(sText,elem,option);
        },
        /* 成功提示 */
        success: function(sText,callback){
            layer.msg(sText, {icon: 1},callback);
        },
        /* 警告提示 */
        info: function(sText,callback){
            layer.msg(sText, {icon: 0},callback);
        },
        /* 错误提示 */
        error: function(sText,callback){
            layer.msg(sText, {icon: 2},callback);
        },
        /* 弹出提示 */
        alert: function(sText,option,callback){
            var defOption = {title: '提示',skin: 'layui-layer-admin',btn: [],anim: 6,shadeClose: true}
            option = option?$.extend(defOption, option):defOption;
            layer.alert(sText,option,callback);
        },
        /* 询问框 */
        confirm: function(sText,callback,option){
            option = option?option:{};
            layer.confirm(sText,option,callback);
        },
        /* prompt层 */
        prompt: function(sTit,option,callback){
            //formType 1为input，2为textarea
            var defOption = $.extend({title:'',formType:1},{title:sTit});
            option = option?$.extend(defOption, option):defOption;
            layer.prompt(option, callback);
        },
        /* 右侧弹出 */
        popupRight: function (param) {
            if (param.title == undefined) {
                param.title = false;
                param.closeBtn = false;
            }
            if (param.fixed == undefined) {
                param.fixed = true;
            }
            param.anim = -1;
            param.offset = 'r';
            param.shadeClose = true;
            param.area || (param.area = '336px');
            param.skin || (param.skin = 'layui-anim layui-anim-rl layui-layer-adminRight');
            param.move = false;
            // [修改]
            popupRightParam = param;
            popupRightIndex = admin.open(param);
            return popupRightIndex;
        },
        // 中间弹出
        popupCenter: function (param) {
            param.id = 'adminPopupC';
            popupCenterParam = param;
            popupCenterIndex = admin.open(param);
            return popupCenterIndex;
        },
        // 关闭中间弹出并且触发finish回调
        finishPopupCenter: function (data) {
            layer.close(popupCenterIndex);
            popupCenterParam.finish ? popupCenterParam.finish(data) : '';
        },
        // 关闭中间弹出
        closePopupCenter: function () {
            layer.close(popupCenterIndex);
        },
        // [新增]关闭右侧弹出
        closePopupRight: function () {
            layer.close(popupRightIndex);
        },
        // 关闭右边弹出并且触发finish回调
        finishPopupRight:function(data){
            layer.close(popupRightIndex);
            popupRightParam.finish?popupRightParam.finish(data):'';
        },
        /* 封装layer.open */
        open: function (param) {
            if (!param.area) {
                param.area = (param.type == 2) ? ['360px', '300px'] : '360px';
            }
            if (!param.skin) {
                param.skin = 'layui-layer-admin';
            }
            if (!param.offset) {
                if (admin.getPageWidth() < 768) {
                    param.offset = '15px';
                } else {
                    param.offset = '70px';
                }
            }
            if (param.fixed == undefined) {
                param.fixed = false;
            }
            param.resize = param.resize != undefined ? param.resize : false;
            param.shade = param.shade != undefined ? param.shade : .1;
            var eCallBack = param.end;
            param.end = function () {
                layer.closeAll('tips');
                eCallBack && eCallBack();
            };
            if (param.url) {
                (param.type == undefined) && (param.type = 1);
                var sCallBack = param.success;
                param.success = function (layero, index) {
                    // 防止缓存
                    var dialogUrl = param.url;
                    if (config.version != undefined) {
                        if (dialogUrl.indexOf('?') == -1) {
                            dialogUrl += '?v=';
                        } else {
                            dialogUrl += '&v=';
                        }
                        if (config.version == true) {
                            dialogUrl += new Date().getTime();
                        } else {
                            dialogUrl += config.version;
                        }
                    }
                    admin.showLoading(layero, 1);
                    $(layero).children('.layui-layer-content').load(dialogUrl, function () {
                        sCallBack ? sCallBack(layero, index) : '';
                        admin.removeLoading(layero, false);
                    });
                };
            }
            var layIndex = layer.open(param);
            (param.data) && (admin.layerData['d' + layIndex] = param.data);
            return layIndex;
        },
        /* 弹窗数据 */
        layerData: {},
        /* 获取弹窗数据 */
        getLayerData: function (index, key) {
            if (index == undefined) {
                index = parent.layer.getFrameIndex(window.name);
                return parent.layui.admin.getLayerData(index, key);
            } else if (index.toString().indexOf('#') == 0) {
                index = $(index).parents('.layui-layer').attr('id').substring(11);
            }
            var layerData = admin.layerData['d' + index];
            if (key) {
                return layerData ? layerData[key] : layerData;
            }
            return layerData;
        },
        /* 放入弹窗数据 */
        putLayerData: function (key, value, index) {
            if (index == undefined) {
                index = parent.layer.getFrameIndex(window.name);
                return parent.layui.admin.putLayerData(key, value, index);
            } else if (index.toString().indexOf('#') == 0) {
                index = $(index).parents('.layui-layer').attr('id').substring(11);
            }
            var layerData = admin.getLayerData(index);
            layerData || (layerData = {});
            layerData[key] = value;
            admin.layerData['d' + index] = layerData;
        },
        /* 封装组织选择框 reqParam:{type:1}*/
        showOrgSelectDialog:function(bMulti,reqParam,callback,title){
            admin.open({
                type: 1,
                title: title||'组织选择',
                data:{treeReqParam:reqParam||{},bMultiSelect:admin.util.def(bMulti,false)},
                scrollbar: false,
                area: ['500px','550px'],
                url: '/components/common/selectOrgs.html',
                end: function () {
                    //选择结果 top.OrgSelRes
                    callback(top.OrgSelRes);
                }
            });
        },
        /* 封装组织用户选择框 reqParam:{type:1}*/
        showUserSelectDialog:function(bMulti,reqParam,callback,title){
            admin.open({
                type: 1,
                title: title||'用户选择',
                data:{treeReqParam:reqParam||{},bMultiSelect:admin.util.def(bMulti,true)},
                scrollbar: false,
                area: ['550px','500px'],
                url: '/components/common/selectUsers.html',
                end: function () {
                    callback(top.UserSelRes);
                }
            });
        },
        /* 封装二次密码验证框*/
        showPwdConfirm:function(sText,callback){
            sText = sText||'验证密码成功后，才能继续执行该操作！';
            var sHTML = '';
            sHTML +='<form id="confirm-password-form" class="layui-form model-form">';
            sHTML +='<div class="model-form-body-noscroll">';
            sHTML +='   <blockquote class="layui-elem-quote">'+sText+'</blockquote>';
            sHTML +='    <div id="confirmPasswordFrom" class="layui-form-item ">';
            sHTML +='        <label class="layui-form-label form-item-required">验证密码</label>';
            sHTML +='        <div class="layui-input-block">';
            sHTML +='            <input type="password" name="password" lay-verify="required" placeholder="请输入验证密码" class="layui-input">';
            sHTML +='        </div>';
            sHTML +='    </div>';
            sHTML +='</div>';
            sHTML +='<div class="text-right model-form-footer">';
            sHTML +='    <button class="layui-btn layui-btn-primary" type="button" ew-event="closeDialog">取消</button>';
            sHTML +='    <button class="layui-btn" lay-filter="confirm-password-submit" lay-submit>确认</button>';
            sHTML +='</div>';
            sHTML +='</form>';

            var bSuccess = false;

            var layerPwdConfirm = admin.popupCenter({
                type: 1,
                title: '密码验证',
                scrollbar: false,
                area: '450px',
                content: sHTML,
                success:function(){
                    form.on('submit(confirm-password-submit)', function (data) {
                        layer.load(2);
                        var field = data.field;
                        var signCode = md5.hex_md5(field.password);
                        field.password = SM.SG_sm2Encrypt(field.password,config.getPublicKey());
                        var url = config.ms_admin_api+'users/confirmPassword';
                        admin.req(url, field, function (data) {
                            layer.closeAll('loading');
                            if (data.code === 0) {
                                if(null == data.data || data.data != signCode){
                                    admin.error("密码错误，验证失败!");
                                    return;
                                }
                                bSuccess = true;
                                layer.close(layerPwdConfirm);
                            } else {
                                admin.error(data.msg);
                            }
                        },'POST');
                        return false;
                    });
                },
                end: function () {
                    callback(bSuccess);
                }
            });
        },
        /* 封装ajax请求，返回数据类型为json */
        req: function (url, data, success, method,contentType) {
            if (config.reqPutToPost != false && method) {
                if ('put' == method.toLowerCase()) {
                    method = 'POST';
                    data._method = 'PUT';
                } else if ('delete' == method.toLowerCase()) {
                    method = 'POST';
                    data._method = 'DELETE';
                }
            }
            admin.ajax({
                url: config.base_server + url,
                data: data,
                type: method||'GET',
                dataType: 'json',
                contentType: typeof(contentType) === 'undefined'?"application/x-www-form-urlencoded":contentType,
                success: success
            });
        },
        /* 封装ajax请求 */
        ajax: function (param) {
            param.url = admin.util.addURLParam(param.url,'t',(new Date()).getTime().toString());
            param.crossDomain = (true == !(document.all));
            var currentHeader = param.headers;

            /* headers加入csrftoken(百度需要) */
            currentHeader = $.extend({"csrftoken": getUuid()}, currentHeader);

            param.dataType || (param.dataType = 'json');
            var successCallback = param.success;
            param.success = function (result, status, xhr) {
                // 判断登录过期和没有权限
                var jsonRs;
                if ('json' == param.dataType.toLowerCase()) {
                    jsonRs = result;
                } else {
                    jsonRs = admin.parseJSON(result);
                }
                jsonRs && (jsonRs = result);
                if (config.ajaxSuccessBefore(jsonRs, param.url) == false) {
                    return;
                }
                successCallback(result, status, xhr);
            };
            param.error = function (xhr) {
                var jo = {code: xhr.status, msg: xhr.statusText}
                if(admin.util.isNotNullOrEmpty(xhr.responseJSON)){
                    jo.code = xhr.responseJSON.code;
                    jo.msg = xhr.responseJSON.msg;
                }
                param.success(jo);
            };

            var headers = [];
            if(config.isNeedReqPerm){
                config.getAjaxHeaders(param,function(headers){
                    param.beforeSend = function (xhr) {
                        for (var f in currentHeader) {
                            xhr.setRequestHeader(f, currentHeader[f]);
                        }

                        for (var i = 0; i < headers.length; i++) {
                            xhr.setRequestHeader(headers[i].name, headers[i].value);
                        }
                        var isolationVersion = config.isolationVersion;
                        if (isolationVersion) {
                            xhr.setRequestHeader('c-s-p-version', isolationVersion);
                        }
                    };
                    $.ajax(param);
                });
            }else{
                param.beforeSend = function (xhr) {
                    for (var f in currentHeader) {
                        xhr.setRequestHeader(f, currentHeader[f]);
                    }

                    for (var i = 0; i < headers.length; i++) {
                        xhr.setRequestHeader(headers[i].name, headers[i].value);
                    }

                    var isolationVersion = config.isolationVersion;
                    if (isolationVersion) {
                        xhr.setRequestHeader('c-s-p-version', isolationVersion);
                    }
                };
                $.ajax(param);
            }
            // $.ajax(param);
        },
        /* 判断是否为json */
        parseJSON: function (str) {
            if (typeof str == 'string') {
                try {
                    var obj = JSON.parse(str);
                    if (typeof obj == 'object' && obj) {
                        return obj;
                    }
                } catch (e) {
                }
            }
        },
        /* 显示加载动画 */
        showLoading: function (elem, type, opacity) {
            var size;
            if (elem != undefined && (typeof elem != 'string') && !(elem instanceof $)) {
                type = elem.type;
                opacity = elem.opacity;
                size = elem.size;
                elem = elem.elem;
            }
            (!elem) && (elem = 'body');
            (type == undefined) && (type = 1);
            (size == undefined) && (size = 'sm');
            size = ' ' + size;
            var loader = [
                '<div class="ball-loader' + size + '"><span></span><span></span><span></span><span></span></div>',
                '<div class="rubik-loader' + size + '"></div>',
                '<div class="signal-loader' + size + '"><span></span><span></span><span></span><span></span></div>'
            ];
            $(elem).addClass('page-no-scroll');  // 禁用滚动条
            var $loading = $(elem).children('.page-loading');
            if ($loading.length <= 0) {
                $(elem).append('<div class="page-loading">' + loader[type - 1] + '</div>');
                $loading = $(elem).children('.page-loading');
            }
            opacity && $loading.css('background-color', 'rgba(255,255,255,' + opacity + ')');
            $loading.show();
        },
        /* 移除加载动画 */
        removeLoading: function (elem, fade, del) {
            if (!elem) {
                elem = 'body';
            }
            if (fade == undefined) {
                fade = true;
            }
            var $loading = $(elem).children('.page-loading');
            if (del) {
                $loading.remove();
            } else {
                fade ? $loading.fadeOut() : $loading.hide();
            }
            $(elem).removeClass('page-no-scroll');
        },
        // 缓存临时数据
        putTempData: function (key, value) {
            if (value) {
                layui.sessionData('tempData', {key: key, value: value});
            } else {
                layui.sessionData('tempData', {key: key, remove: true});
            }
        },
        // 获取缓存临时数据
        getTempData: function (key) {
            return layui.sessionData('tempData')[key];
        },

        /* 滑动选项卡 */
        rollPage: function (d) {
            var $tabTitle = $(tabDOM + '>.layui-tab-title');
            var left = $tabTitle.scrollLeft();
            if ('left' === d) {
                $tabTitle.animate({'scrollLeft': left - 120}, 100);
            } else if ('auto' === d) {
                var autoLeft = 0;
                $tabTitle.children("li").each(function () {
                    if ($(this).hasClass('layui-this')) {
                        return false;
                    } else {
                        autoLeft += $(this).outerWidth();
                    }
                });
                $tabTitle.animate({'scrollLeft': autoLeft - 120}, 100);
            } else {
                $tabTitle.animate({'scrollLeft': left + 120}, 100);
            }
        },
        /* 刷新当前tab */
        refresh: function (url) {
            layRouter.refresh(url);
        },
        /* 关闭当前选项卡 */
        closeThisTabs: function (url) {
            admin.closeTabOperNav();
            var $title = $(tabDOM + '>.layui-tab-title');
            if (!url) {
                if ($title.find('li').first().hasClass('layui-this')) {
                    admin.error('主页不能关闭');
                    return;
                }
                $title.find('li.layui-this').find(".layui-tab-close").trigger("click");
            } else {
                if (url == $title.find('li').first().attr('lay-id')) {
                    admin.error('主页不能关闭');
                    return;
                }
                $title.find('li[lay-id="' + url + '"]').find(".layui-tab-close").trigger("click");
            }
        },
        /* 关闭其他选项卡 */
        closeOtherTabs: function (url) {
            if (!url) {
                $(tabDOM + '>.layui-tab-title li:gt(0):not(.layui-this)').find('.layui-tab-close').trigger('click');
            } else {
                $(tabDOM + '>.layui-tab-title li:gt(0)').each(function () {
                    if (url != $(this).attr('lay-id')) {
                        $(this).find('.layui-tab-close').trigger('click');
                    }
                });
            }
            admin.closeTabOperNav();
        },
        /* 关闭所有选项卡 */
        closeAllTabs: function () {
            $(tabDOM + '>.layui-tab-title li:gt(0)').find('.layui-tab-close').trigger('click');
            $(tabDOM + '>.layui-tab-title li:eq(0)').trigger('click');
            admin.closeTabOperNav();
        },
        /* 关闭选项卡操作菜单 */
        closeTabOperNav: function () {
            $('.layui-icon-down .layui-nav .layui-nav-child').removeClass('layui-show');
        },
        /* 设置主题 */
        changeTheme: function (theme) {
            if (theme) {
                layui.data(config.tableName, {key: 'theme', value: theme});
                if (themeAdmin == theme) {
                    theme = undefined;
                }
            } else {
                layui.data(config.tableName, {key: 'theme', remove: true});
            }
            try {
                admin.removeTheme(top);
                (theme && top.layui) && top.layui.link(admin.getThemeDir() + theme + admin.getCssSuffix(), theme);
                var ifs = top.window.frames;
                for (var i = 0; i < ifs.length; i++) {
                    try {  // 可能会跨域
                        var tif = ifs[i];
                        admin.removeTheme(tif);
                        if (theme && tif.layui) {
                            tif.layui.link(admin.getThemeDir() + theme + admin.getCssSuffix(), theme);
                        }
                        // iframe下还有iframe的情况
                        var sifs = tif.frames;
                        for (var j = 0; j < sifs.length; j++) {
                            try {  // 可能会跨域
                                var stif = sifs[j];
                                admin.removeTheme(stif);
                                if (theme && stif.layui) {
                                    stif.layui.link(admin.getThemeDir() + theme + admin.getCssSuffix(), theme);
                                }
                            } catch (e) {
                            }

                        }
                    } catch (e) {
                    }
                }
                try {
                    //解决切换主题时，主体框架重新运行脚本、及第三方控件加载对应主题问题
                    //admin.refresh();
                    window.location.reload();
                } catch (error) {}

            } catch (e) {
            }
        },
        /* 移除主题 */
        removeTheme: function (w) {
            if (!w) {
                w = window;
            }
            if (w.layui) {
                var themeId = 'layuicss-theme';
                w.layui.jquery('link[id^="' + themeId + '"]').remove();
            }
        },
        /* 获取主题目录 */
        getThemeDir: function () {
            return layui.cache.base + 'theme/';
        },
        /* 关闭当前iframe层弹窗 */
        closeThisDialog: function () {
            parent.layer.close(parent.layer.getFrameIndex(window.name));
        },
        /* 关闭elem所在的页面层弹窗 */
        closeDialog: function (elem) {
            var id = $(elem).parents('.layui-layer').attr('id').substring(11);
            layer.close(id);
        },
        /* 让当前的ifram弹层自适应高度 */
        iframeAuto: function () {
            parent.layer.iframeAuto(parent.layer.getFrameIndex(window.name));
        },
        /* 获取浏览器高度 */
        getPageHeight: function () {
            return document.documentElement.clientHeight || document.body.clientHeight;
        },
        /* 获取浏览器宽度 */
        getPageWidth: function () {
            return document.documentElement.clientWidth || document.body.clientWidth;
        },
        /* 获取主题文件后缀 */
        getCssSuffix: function () {
            var cssSuffix = '.css';
            if (config.version != undefined) {
                cssSuffix += '?v=';
                if (config.version == true) {
                    cssSuffix += new Date().getTime();
                } else {
                    cssSuffix += config.version;
                }
            }
            return cssSuffix;
        },
        /* 解决窗口缩放表格滚动条闪现 */
        hideTableScrollBar: function (time) {
            if (admin.getPageWidth() > 768) {
                if (window.hsbTimer) {
                    clearTimeout(hsbTimer);
                }
                var $tbView = config.pageTabs ? $(tabDOM + '>.layui-tab-content>.layui-tab-item.layui-show') : $(bodyDOM);
                $tbView.find('.layui-table-body.layui-table-main').addClass('no-scrollbar');
                window.hsbTimer = setTimeout(function () {
                    $tbView.find('.layui-table-body.layui-table-main').removeClass('no-scrollbar');
                }, time == undefined ? 500 : time);
            }
        },
        /* 绑定表单弹窗 */
        modelForm: function (layero, btnFilter, formFilter) {
            var $layero = $(layero);
            $layero.addClass('layui-form');
            if (formFilter) {
                $layero.attr('lay-filter', formFilter);
            }
            // 确定按钮绑定submit
            var $btnSubmit = $layero.find('.layui-layer-btn .layui-layer-btn0');
            $btnSubmit.attr('lay-submit', '');
            $btnSubmit.attr('lay-filter', btnFilter);
        },
        /* loading按钮 */
        btnLoading: function (elem, text, loading) {
            if (text != undefined && (typeof text == "boolean")) {
                loading = text;
                text = undefined;
            }
            (loading == undefined) && (loading = true);
            var $elem = $(elem);
            if (loading) {
                text && $elem.html(text);
                $elem.find('.layui-icon').addClass('layui-hide');
                $elem.addClass('icon-btn');
                $elem.prepend('<i class="layui-icon layui-icon-loading layui-anim layui-anim-rotate layui-anim-loop ew-btn-loading"></i>');
                $elem.prop('disabled', 'disabled');
            } else {
                $elem.find('.ew-btn-loading').remove();
                $elem.removeProp('disabled', 'disabled');
                if ($elem.find('.layui-icon.layui-hide').length <= 0) {
                    $elem.removeClass('icon-btn');
                }
                $elem.find('.layui-icon').removeClass('layui-hide');
                text && $elem.html(text);
            }
        },
        /* 鼠标移入侧边栏自动展开 */
        openSideAutoExpand: function () {
            $('.layui-layout-admin>.layui-side').off('mouseenter.openSideAutoExpand').on("mouseenter.openSideAutoExpand", function () {
                if ($(this).parent().hasClass('admin-nav-mini')) {
                    admin.flexible(true);
                    $(this).addClass('side-mini-hover');
                }
            });
            $('.layui-layout-admin>.layui-side').off('mouseleave.openSideAutoExpand').on("mouseleave.openSideAutoExpand", function () {
                if ($(this).hasClass('side-mini-hover')) {
                    admin.flexible(false);
                    $(this).removeClass('side-mini-hover');
                }
            });
        },
        /* 表格单元格超出内容自动展开 */
        openCellAutoExpand: function () {
            $('body').off('mouseenter.openCellAutoExpand').on('mouseenter.openCellAutoExpand', '.layui-table-view td', function () {
                $(this).find('.layui-table-grid-down').trigger('click');
            });
            $('body').off('mouseleave.openCellAutoExpand').on('mouseleave.openCellAutoExpand', '.layui-table-tips>.layui-layer-content', function () {
                $('.layui-table-tips-c').trigger('click');
            });
        },
        /* 判断是否是主框架 */
        isTop: function () {
            return $(bodyDOM).length > 0;
        },
        /* 字符串形式的parent.parent转window对象 */
        strToWin: function (str) {
            var win = window;
            if (str) {
                var ws = str.split('.');
                for (var i = 0; i < ws.length; i++) {
                    win = win[ws[i]];
                }
            }
            return win;
        },
        /* 判断是否有权限 */
        hasPerm: function (r) {
            var auth = config.getUserAuths();
            if (auth) {
                for (var i = 0; i < auth.length; i++) {
                    if (r == auth[i]) {
                        return true
                    }
                }
            }
            return false
        },
        // 移除没有权限的元素,延迟是为了组件动态渲染的按钮
        renderPerm: function () {
            setTimeout(function(){
                $('[perm-show]').each(function (i, item) {
                    var auth = $(this).attr('perm-show');
                    if (!admin.hasPerm(auth)) {
                        $(this).remove();
                    }
                });
            },200)
        },
        //重置内容页高度
        resizeContentDom:function(curTabId){
            try {
                var contentDom = bodyDOM + '>div[lay-id]';
                var cardContent ;
                var iPd = '';
                if(config.pageTabs){
                    contentDom = tabDOM + '>.layui-tab-content>.layui-tab-item>div[lay-id="' + curTabId + '"]';
                    cardContent = $(contentDom + '>.layui-fluid>.layui-card').children('div[class="layui-card-body"],[class="layui-card-content"]');
                    if($(contentDom + '>.layui-fluid')){
                        iPd = parseInt($(contentDom + '>.layui-fluid').css('padding'))*2;
                        $(contentDom + '>.layui-fluid').css('height',$(contentDom).parent().height()-iPd);
                        $(contentDom + '>.layui-fluid>.layui-card').css('height',$(contentDom).parent().height()-iPd);
                        iPd = iPd + parseInt(cardContent.css('padding'))*2;
                        var iH = $(contentDom).parent().height()-iPd;
                        if($(contentDom + '>.layui-fluid>.layui-card>.layui-card-header')&&$(contentDom + '>.layui-fluid>.layui-card>.layui-card-header').is(":visible") )iH -= $(contentDom + '>.layui-fluid>.layui-card>.layui-card-header').height();
                        cardContent.children('.layui-row').css('height',iH-6);
                        if(cardContent.find('.layui-row>.layui-row-tree'))cardContent.find('.layui-row>.layui-row-tree').css('height',iH);
                        if(cardContent.find('.layui-row>.layui-row-table'))cardContent.find('.layui-row>.layui-row-table').css('height',iH);
                    }
                }else{
                    if($(contentDom + '>.layui-fluid>')){
                        cardContent = contentDom + '>.layui-fluid>.layui-card>div[class="layui-card-body"],[class="layui-card-content"]';
                        iPd = parseInt($(contentDom + '>.layui-fluid').css('padding'))*2;
                        $(contentDom + '>.layui-fluid>.layui-card').css('height',$(contentDom).height()-iPd);
                        iPd = iPd + parseInt($(cardContent).css('padding'))*2;
                        var iH = $(contentDom).height()-iPd;
                        $(cardContent).children('.layui-row').css('height',iH-6);
                        if($(cardContent).find('.layui-row>.layui-row-table'))$(cardContent).find('.layui-row>.layui-row-table').css('height',iH);
                        if($(cardContent).find('.layui-row>.layui-row-tree'))$(cardContent).find('.layui-row>.layui-row-tree').css('height',iH);
                    }
                }
            } catch (error) {

            }
        },
        //计算表格撑满高度（前提表格父级类为layui-row或layui-row-table）
        calTableHeight:function(tableId){
            var oPar = $('#'+tableId).parent();
            if(oPar.height()<100||admin.util.isNullOrEmpty($('#'+tableId).next().height())){
                var curTabId;
                if(config.pageTabs){
                    $(tabDOM + '>.layui-tab-title>li').each(function (i) {
                        var str = location.hash.substring(1);
                        if(str.indexOf($(this).attr('lay-id'))!=-1)curTabId = $(this).attr('lay-id');
                    });
                }
                admin.resizeContentDom(curTabId);
            }
            var iH = 0;
            if(oPar.hasClass('layui-row')||oPar.hasClass('layui-row-table')){
                var iT = 0;
                $('#'+tableId).siblings().each(function(i,o){
                    if(!$(o).hasClass('layui-table-view'))iT += $(o).height();
                })
                iH = oPar.height()-iT-30;
            }
            return iH;
        },
        // 重置表格尺寸
        resizeTable: function (time) {
            setTimeout(function () {
                var $tbView = config.pageTabs ? $(tabDOM + '>.layui-tab-content>.layui-tab-item.layui-show') : $(bodyDOM);
                $tbView.find('.layui-table-view').each(function () {
                    var tbId = $(this).attr("lay-id");
                    layui.table && layui.table.resize(tbId);
                });
            }, time == undefined ? 0 : time);
        },
        // open事件解析layer参数
        parseLayerOption: function (option) {
            // 数组类型进行转换,content字段不处理
            for (var f in option) {
                if (option[f] && option[f].toString().indexOf(',') != -1 && f!='content') {
                    option[f] = option[f].toString().split(',');
                }
            }
            // function类型参数转换
            var funStrs = ['success', 'cancel', 'end', 'full', 'min', 'restore'];
            for (var i = 0; i < funStrs.length; i++) {
                for (var f in option) {
                    if (f == funStrs[i]) {
                        option[f] = window[option[f]];
                    }
                }
            }
            // content取内容
            if (option.content && (typeof option.content === 'string') && option.content.indexOf('#') == 0) {
                option.content = $(option.content).html();
            }
            (option.type == undefined) && (option.type = 2);  // 默认为iframe类型
            return option;
        },
        //根据code获取数据字典
        getDictListByCode:function(code){
            admin.req(config.ms_admin_api+'dictItem/getItemsByDictKey',{paramKey:code},function(res){
                return res.data;
            })
        },
        //设置流程引擎微服务名
        setFlowEngineMsApi:function(msApi){
            var curPageId = $('div[lay-filter="admin-pagetabs"] .layui-tab-title .layui-this').attr('lay-id');
            var paraName = curPageId?curPageId+'_ms_engine_api':'ms_engine_api';
            if(msApi&&!parent[paraName])parent[paraName] = msApi;
        },
        //获取流程引擎的微服务名
        getFlowEngineMsApi:function(){
            var curPageId = $('div[lay-filter="admin-pagetabs"] .layui-tab-title .layui-this').attr('lay-id');
            var paraName = curPageId?curPageId+'_ms_engine_api':'ms_engine_api';
            try {
                if(frameEngine.isEngine)return frameEngine.ms_engine_api;
            } catch (e) {
                return parent[paraName]||config.ms_engine_api;
            }
            return parent[paraName]||config.ms_engine_api;
        },
        //设置流程引擎业务请求
        setFlowEngineServletUrlHttp:function(sURL){
            var curPageId = $('div[lay-filter="admin-pagetabs"] .layui-tab-title .layui-this').attr('lay-id');
            var paraName = curPageId?curPageId+'_engine_servlet_url_http':'engine_servlet_url_http';
            if(sURL&&!parent[paraName])parent[paraName] = sURL;
        },
        //流程引擎交互请求URL
        setFlowEngineServletUrlCore:function(sURL){
            var curPageId = $('div[lay-filter="admin-pagetabs"] .layui-tab-title .layui-this').attr('lay-id');
            var paraName = curPageId?curPageId+'_engine_servlet_url_core':'engine_servlet_url_core';
            if(sURL&&!parent[paraName])parent[paraName] = sURL;
        },
        //截取base_server中的上下文
        getContextPath:function(){
            var arr = config.base_server.split('\/');
            var contextPath = config.base_server.substr(config.base_server.length-1)=='/'?(arr.length-2==2?'':arr[arr.length-2]):(arr.length-1==2?'':arr[arr.length-1]);            return contextPath?('/'+contextPath+'/'):'/';
        },
        //智能平台统一banner(分文字描述与搜索两类)
        initComBanner:function(bSrh,param){

            function getHashPath(hash) {
                var layRouter = layui.router(hash);
                var hashPath = '';
                for (var i = 0; i < layRouter.path.length; i++) {
                    hashPath += ('/' + layRouter.path[i]);
                }
                return hashPath;
            }

            bSrh = typeof(bSrh)=='boolean'?bSrh:false;
            var sHTML = '';
            try {
                if($('#divBannerStat'))$('#divBannerStat').remove();
                if(bSrh){
                    //搜索框参数 param:[{title:xxxx,desc:xxxx}]
                    sHTML +='<div class="layui-row" style="margin-top:50px">';
                    sHTML +='    <input type="text"  class="layui-input fl" name="keywords" id="keywords"placeholder="请输入关键字或应用名称搜索">';
                    sHTML +='    <button type="button" class="layui-btn layui-btn-normal fl" id = "searchBtn" >';
                    sHTML +='        <i class="layui-icon">&#xe615;</i> 搜索';
                    sHTML +='    </button>';
                    sHTML +='    <button type="button" class="layui-btn layui-btn-normal fl" id = "metaSearchBtn" >';
                    sHTML +='        元数据搜索';
                    sHTML +='    </button>';
                    sHTML +='</div>';
                    $('#divBannerContainer').css('padding-top','120px');
                }else{
                    //纯文字描述格式 param:{title:xxxx,desc:xxxx}
                    if(param&&param.title)sHTML += '<h1 >'+param.title+'</h1>';
                    if(param&&param.desc)sHTML += '<p>'+param.desc+'</p>';
                    $('#divBannerContainer').css('padding-top','90px');
                }
                $('#divBannerContainer').html(sHTML);
                $('#divBannerContainer').show();
                if(admin.util.isArray(param)&&param&&param.length){
                    sHTML = '';
                    sHTML +='<div class="stat" id="divBannerStat">';
                    sHTML += '  <ul>';
                    $(param).each(function(i,d){
                        sHTML += '    <li class="'+(i?"":"spreadL")+'">';
                        sHTML += '      <a href="javascript:void(0);">';
                        sHTML += '         <p class="cnt">';
                        sHTML += '           <span id="dataCount">'+d.indexValue+d.indexUnit+'</span>';
                        sHTML += '         </p>';
                        sHTML += '        <p class="tit">'+d.indexName;
                        sHTML += '        </p>';
                        sHTML += '       </a>';
                        sHTML += '     </li>';
                    })
                    sHTML += '  </url>';
                    sHTML += '</div>';
                    $('#divBannerContainer').after(sHTML);
                }

            } catch (e) {}


            $('#searchBtn').click(function () {
                var keywords = $("#keywords").val();
                config.putTempData("searchContent",keywords);
                if(getHashPath(location.hash)!='/home/homeSearch'){
                    layRouter.go("/home/homeSearch");
                }else{
                    reloadData();
                }
            })
            $('#metaSearchBtn').click(function () {
                var keywords = $("#keywords").val();
                config.putTempData("searchContent",keywords);
                if(getHashPath(location.hash)!='/home/homeSearch'){
                    layRouter.go("/home/homeSearch");
                }else{
                    metaReloadData();
                }

            })
        },
        /* 下载文件 */
        download: function(url, jsonParam){
            var xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);
            xhr.responseType = "blob";
            xhr.setRequestHeader('content-type', 'application/json');
            xhr.setRequestHeader("client_type", "DESKTOP_WEB");
            xhr.setRequestHeader("Authorization", "Bearer " + config.getToken().access_token);
            /* xhr.setRequestHeader('SignParam', JSON.stringify(signJson));
            xhr.setRequestHeader('Sign', config.getSignByToken(signJson, config.getToken())); */
            //获取签名头部
            var headers = signUtils.geSignHeadersByToken(config.getToken());
            for (var i = 0; i < headers.length; i++) {
                xhr.setRequestHeader(headers[i].name, headers[i].value);
            }

            xhr.onload = function() {
                if (this.status == 200) {
                    var attachment = this.getResponseHeader('content-disposition');
                    var fileName = attachment.includes('filename=') ? attachment.split('=')[1] : '导出数据'
                    fileName = decodeURI(fileName)
                    if (fileName.startsWith('\'') || fileName.startsWith('\"')) {
                        fileName = fileName.substring(1)
                    }
                    if (fileName.endsWith('\'') || fileName.endsWith('\"')) {
                        fileName = fileName.substring(0, fileName.length - 1)
                    }

                    var blob = this.response;
                    var a = document.createElement('a');
                    a.innerHTML = fileName;
                    // 指定生成的文件名
                    a.download = fileName;
                    a.href = URL.createObjectURL(blob);
                    document.body.appendChild(a);
                    var evt = document.createEvent("MouseEvents");
                    evt.initEvent("click", false, false);
                    a.dispatchEvent(evt);
                    document.body.removeChild(a);
                }
            }
            xhr.send(JSON.stringify(jsonParam));
        }
    };

    /** Generate csrftoken uuid */
    function getUuid(){
        var s = [];
        var hexDigits = "0123456789abcdef";
        for(var i = 0;i<36;i++){
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10),1)

        }
        s[14] = "4";
        s[19] = hexDigits.substr((s[19] & 0x3) |0x8 ,1);
        s[8] = s[13] = s[18] = s[23] = "-";
        var uuid = s.join("");
        return uuid;
    }

    /** admin提供的事件 */
    admin.events = {
        /* 折叠侧导航 */
        flexible: function (e) {
            admin.flexible();
        },
        /* 刷新主体部分 */
        refresh: function () {
            admin.refresh();
        },
        /* 后退 */
        back: function () {
            history.back();
        },
        /* 设置主题 */
        theme: function () {
            var url = $(this).data('url');
            admin.popupRight({
                id: 'layer-theme',
                url: url ? url : './components/personal/theme.html'
            });
        },
        /* 打开便签 */
        note: function () {
            var url = $(this).data('url');
            admin.popupRight({
                id: 'layer-note',
                url: url ? url : './components/tpl/note.html'
            });
        },
        /* 打开消息 */
        message: function () {
            var url = $(this).data('url');
            admin.popupRight({
                id: 'layer-notice',
                url: url ? url : './components/personal/message.html'
            });
        },
        /* 打开修改密码弹窗 */
        psw: function () {
            var url = $(this).data('url');
            admin.popupCenter({
                id: 'pswForm',
                title: '修改密码',
                area:['400px','400px'],
                url: url ? url : './components/personal/password.html'
            });
        },
        /* 退出登录 */
        logout: function () {
            layer.confirm('确定要退出登录吗？', {
                title: '温馨提示',
                skin: 'layui-layer-admin'
            }, function () {
            	admin.logout();
            	/**
                var token = config.getToken();
                if(token&&token.access_token){
                    var param = {};
                    var removeTokenUrl = config.base_server+config.ms_auth_api+ "oauth/remove/token?access_token="+token.access_token;
                    if(config.isEnableIsc){
                        removeTokenUrl = config.base_server+"iscLoginOut?access_token="+token.access_token;//+ config.getTempData('ticket')
                    }
                    admin.ajax({
                        url: removeTokenUrl,
                        xhrFields: {
                            withCredentials: true
                        },
                        crossDomain: true,
                        type: 'GET',
                        dataType: 'JSON',
                        success: function (res) {
                            config.jumpToLoginPage(true);
                        }
                    });
                }**/
            });
        },
        /* 打开弹窗 */
        open: function () {
            var option = $(this).data();
            admin.open(admin.parseLayerOption(admin.util.deepClone(option)));
        },
        /* 打开右侧弹窗 */
        popupRight: function () {
            var option = $(this).data();
            admin.popupRight(admin.parseLayerOption(admin.util.deepClone(option)));
        },
        /* 全屏 */
        fullScreen: function () {
            var ac = 'layui-icon-screen-full', ic = 'layui-icon-screen-restore';
            var $ti = $(this).find('i');
            var isFullscreen = document.fullscreenElement || document.msFullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || false;
            if (isFullscreen) {
                var efs = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
                if (efs) {
                    efs.call(document);
                } else if (window.ActiveXObject) {
                    var ws = new ActiveXObject('WScript.Shell');
                    ws && ws.SendKeys('{F11}');
                }
                $ti.addClass(ac).removeClass(ic);
            } else {
                var el = document.documentElement;
                var rfs = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
                if (rfs) {
                    rfs.call(el);
                } else if (window.ActiveXObject) {
                    var ws = new ActiveXObject('WScript.Shell');
                    ws && ws.SendKeys('{F11}');
                }
                $ti.addClass(ic).removeClass(ac);
            }
        },
        /* 左滑动tab */
        leftPage: function () {
            admin.rollPage("left");
        },
        /* 右滑动tab */
        rightPage: function () {
            admin.rollPage();
        },
        /* 关闭当前选项卡 */
        closeThisTabs: function () {
            var url = $(this).data('url');
            admin.closeThisTabs(url);
        },
        /* 关闭其他选项卡 */
        closeOtherTabs: function () {
            admin.closeOtherTabs();
        },
        /* 关闭所有选项卡 */
        closeAllTabs: function () {
            admin.closeAllTabs();
        },
        /* 关闭当前元素所在弹窗 */
        closeDialog: function () {
            admin.closeDialog(this);
        },
        /* 关闭当前页面层弹窗 */
        closeIframeDialog: function () {
            admin.closeThisDialog();
        }
    };

    /**
     * 统一退出方法调用
     */
    admin.logout = function(){
    	 var token = config.getToken();
         if(token&&token.access_token){
             var param = {};
             var removeTokenUrl = config.base_server+config.ms_auth_api+ "oauth/remove/token?access_token="+token.access_token;
             if(config.isEnableIsc){
                 removeTokenUrl = config.base_server+config.ms_auth_api+"iscLoginOut?access_token="+token.access_token;//+ config.getTempData('ticket')
             }
             admin.ajax({
                 url: removeTokenUrl,
                 xhrFields: {
                     withCredentials: true
                 },
                 crossDomain: true,
                 type: 'GET',
                 dataType: 'JSON',
                 success: function (res) {
                     config.jumpToLoginPage(false);
                 }
             });
         }
    }

    /**
     * 选择位置
     */
    admin.chooseLocation = function (param) {
        var dialogTitle = param.title;  // 弹窗标题
        var onSelect = param.onSelect;  // 选择回调
        var needCity = param.needCity;  // 是否返回行政区
        var mapCenter = param.center;  // 地图中心
        var defaultZoom = param.defaultZoom;  // 地图默认缩放级别
        var pointZoom = param.pointZoom;  // 选中时地图缩放级别
        var searchKeywords = param.keywords;  // poi检索关键字
        var searchPageSize = param.pageSize;  // poi检索最大数量
        var mapJsUrl = param.mapJsUrl;  // 高德地图js的url
        (dialogTitle == undefined) && (dialogTitle = '选择位置');
        (defaultZoom == undefined) && (defaultZoom = 11);
        (pointZoom == undefined) && (pointZoom = 17);
        (searchKeywords == undefined) && (searchKeywords = '');
        (searchPageSize == undefined) && (searchPageSize = 30);
        (mapJsUrl == undefined) && (mapJsUrl = 'https://webapi.amap.com/maps?v=1.4.14&key=006d995d433058322319fa797f2876f5');
        var isSelMove = false, selLocation;
        // 搜索附近
        var searchNearBy = function (lat, lng) {
            AMap.service(["AMap.PlaceSearch"], function () {
                var placeSearch = new AMap.PlaceSearch({
                    type: '',
                    pageSize: searchPageSize,
                    pageIndex: 1
                });
                var cpoint = [lng, lat];
                placeSearch.searchNearBy(searchKeywords, cpoint, 1000, function (status, result) {
                    if (status == 'complete') {
                        var pois = result.poiList.pois;
                        var htmlList = '';
                        for (var i = 0; i < pois.length; i++) {
                            var poiItem = pois[i];
                            if (poiItem.location != undefined) {
                                htmlList += '<div data-lng="' + poiItem.location.lng + '" data-lat="' + poiItem.location.lat + '" class="ew-map-select-search-list-item">';
                                htmlList += '     <div class="ew-map-select-search-list-item-title">' + poiItem.name + '</div>';
                                htmlList += '     <div class="ew-map-select-search-list-item-address">' + poiItem.address + '</div>';
                                htmlList += '     <div class="ew-map-select-search-list-item-icon-ok layui-hide"><i class="layui-icon layui-icon-ok-circle"></i></div>';
                                htmlList += '</div>';
                            }
                        }
                        $('#ew-map-select-pois').html(htmlList);
                    }
                });
            });
        };
        // 渲染地图
        var renderMap = function () {
            var mapOption = {
                resizeEnable: true, // 监控地图容器尺寸变化
                zoom: defaultZoom  // 初缩放级别
            };
            mapCenter && (mapOption.center = mapCenter);
            var map = new AMap.Map('ew-map-select-map', mapOption);
            // 地图加载完成
            map.on("complete", function () {
                var center = map.getCenter();
                searchNearBy(center.lat, center.lng);
            });
            // 地图移动结束事件
            map.on('moveend', function () {
                if (isSelMove) {
                    isSelMove = false;
                } else {
                    $('#ew-map-select-tips').addClass('layui-hide');
                    $('#ew-map-select-center-img').removeClass('bounceInDown');
                    setTimeout(function () {
                        $('#ew-map-select-center-img').addClass('bounceInDown');
                    });
                    var center = map.getCenter();
                    searchNearBy(center.lat, center.lng);
                }
            });
            // poi列表点击事件
            $('#ew-map-select-pois').off('click').on('click', '.ew-map-select-search-list-item', function () {
                $('#ew-map-select-tips').addClass('layui-hide');
                $('#ew-map-select-pois .ew-map-select-search-list-item-icon-ok').addClass('layui-hide');
                $(this).find('.ew-map-select-search-list-item-icon-ok').removeClass('layui-hide');
                $('#ew-map-select-center-img').removeClass('bounceInDown');
                setTimeout(function () {
                    $('#ew-map-select-center-img').addClass('bounceInDown');
                });
                var lng = $(this).data('lng');
                var lat = $(this).data('lat');
                var name = $(this).find('.ew-map-select-search-list-item-title').text();
                var address = $(this).find('.ew-map-select-search-list-item-address').text();
                selLocation = {name: name, address: address, lat: lat, lng: lng};
                isSelMove = true;
                map.setZoomAndCenter(pointZoom, [lng, lat]);
            });
            // 确定按钮点击事件
            $('#ew-map-select-btn-ok').click(function () {
                if (selLocation == undefined) {
                    admin.error('请点击位置列表选择');
                } else if (onSelect) {
                    if (needCity) {
                        var loadIndex = layer.load(2);
                        map.setCenter([selLocation.lng, selLocation.lat]);
                        map.getCity(function (result) {
                            layer.close(loadIndex);
                            selLocation.city = result;
                            admin.closeDialog('#ew-map-select-btn-ok');
                            onSelect(selLocation);
                        });
                    } else {
                        admin.closeDialog('#ew-map-select-btn-ok');
                        onSelect(selLocation);
                    }
                } else {
                    admin.closeDialog('#ew-map-select-btn-ok');
                }
            });
            // 搜索提示
            $('#ew-map-select-input-search').off('input').on('input', function () {
                var keywords = $(this).val();
                if (!keywords) {
                    $('#ew-map-select-tips').html('');
                    $('#ew-map-select-tips').addClass('layui-hide');
                }
                AMap.plugin('AMap.Autocomplete', function () {
                    var autoComplete = new AMap.Autocomplete({
                        city: '全国'
                    });
                    autoComplete.search(keywords, function (status, result) {
                        if (result.tips) {
                            var tips = result.tips;
                            var htmlList = '';
                            for (var i = 0; i < tips.length; i++) {
                                var tipItem = tips[i];
                                if (tipItem.location != undefined) {
                                    htmlList += '<div data-lng="' + tipItem.location.lng + '" data-lat="' + tipItem.location.lat + '" class="ew-map-select-search-list-item">';
                                    htmlList += '     <div class="ew-map-select-search-list-item-icon-search"><i class="layui-icon layui-icon-search"></i></div>';
                                    htmlList += '     <div class="ew-map-select-search-list-item-title">' + tipItem.name + '</div>';
                                    htmlList += '     <div class="ew-map-select-search-list-item-address">' + tipItem.address + '</div>';
                                    htmlList += '</div>';
                                }
                            }
                            $('#ew-map-select-tips').html(htmlList);
                            if (tips.length == 0) {
                                $('#ew-map-select-tips').addClass('layui-hide');
                            } else {
                                $('#ew-map-select-tips').removeClass('layui-hide');
                            }
                        } else {
                            $('#ew-map-select-tips').html('');
                            $('#ew-map-select-tips').addClass('layui-hide');
                        }
                    });
                });
            });
            $('#ew-map-select-input-search').off('blur').on('blur', function () {
                var keywords = $(this).val();
                if (!keywords) {
                    $('#ew-map-select-tips').html('');
                    $('#ew-map-select-tips').addClass('layui-hide');
                }
            });
            $('#ew-map-select-input-search').off('focus').on('focus', function () {
                var keywords = $(this).val();
                if (keywords) {
                    $('#ew-map-select-tips').removeClass('layui-hide');
                }
            });
            // tips列表点击事件
            $('#ew-map-select-tips').off('click').on('click', '.ew-map-select-search-list-item', function () {
                $('#ew-map-select-tips').addClass('layui-hide');
                var lng = $(this).data('lng');
                var lat = $(this).data('lat');
                selLocation = undefined;
                map.setZoomAndCenter(pointZoom, [lng, lat]);
            });
        };
        // 显示弹窗
        var htmlStr = '<div class="ew-map-select-tool" style="position: relative;">';
        htmlStr += '        搜索：<input id="ew-map-select-input-search" class="layui-input icon-search inline-block" style="width: 190px;" placeholder="输入关键字搜索" autocomplete="off" />';
        htmlStr += '        <button id="ew-map-select-btn-ok" class="layui-btn icon-btn pull-right" type="button"><i class="layui-icon">&#xe605;</i>确定</button>';
        htmlStr += '        <div id="ew-map-select-tips" class="ew-map-select-search-list layui-hide">';
        htmlStr += '        </div>';
        htmlStr += '   </div>';
        htmlStr += '   <div class="layui-row ew-map-select">';
        htmlStr += '        <div class="layui-col-sm7 ew-map-select-map-group" style="position: relative;">';
        htmlStr += '             <div id="ew-map-select-map"></div>';
        htmlStr += '             <i id="ew-map-select-center-img2" class="layui-icon layui-icon-add-1"></i>';
        htmlStr += '             <img id="ew-map-select-center-img" src="https://3gimg.qq.com/lightmap/components/locationPicker2/image/marker.png"/>';
        htmlStr += '        </div>';
        htmlStr += '        <div id="ew-map-select-pois" class="layui-col-sm5 ew-map-select-search-list">';
        htmlStr += '        </div>';
        htmlStr += '   </div>';
        admin.open({
            id: 'ew-map-select',
            type: 1,
            title: dialogTitle,
            area: '750px',
            content: htmlStr,
            success: function (layero, dIndex) {
                var $content = $(layero).children('.layui-layer-content');
                $content.css('overflow', 'visible');
                admin.showLoading($content);
                if (undefined == window.AMap) {
                    $.getScript(mapJsUrl, function () {
                        renderMap();
                        admin.removeLoading($content);
                    });
                } else {
                    renderMap();
                    admin.removeLoading($content);
                }
            }
        });
    };

    /**
     * 裁剪图片
     */
    admin.cropImg = function (param) {
        var uploadedImageType = 'image/jpeg';  // 当前图片的类型
        var aspectRatio = param.aspectRatio;  // 裁剪比例
        var imgSrc = param.imgSrc;  // 裁剪图片
        var imgType = param.imgType;  // 图片类型
        var onCrop = param.onCrop;  // 裁剪完成回调
        var limitSize = param.limitSize;  // 限制选择的图片大小
        var acceptMime = param.acceptMime;  // 限制选择的图片类型
        var imgExts = param.exts;  // 限制选择的图片类型
        var dialogTitle = param.title;  // 弹窗的标题
        (aspectRatio == undefined) && (aspectRatio = 1 / 1);
        (dialogTitle == undefined) && (dialogTitle = '裁剪图片');
        imgType && (uploadedImageType = imgType);
        layui.use(['Cropper', 'upload'], function () {
            var Cropper = layui.Cropper;
            var upload = layui.upload;

            // 渲染组件
            function renderElem() {
                var imgCropper, $cropImg = $('#ew-crop-img');
                // 上传文件按钮绑定事件
                var uploadOptions = {
                    elem: '#ew-crop-img-upload',
                    auto: false,
                    drag: false,
                    choose: function (obj) {
                        obj.preview(function (index, file, result) {
                            uploadedImageType = file.type;
                            $cropImg.attr('src', result);
                            if (!imgSrc || !imgCropper) {
                                imgSrc = result;
                                renderElem();
                            } else {
                                imgCropper.destroy();
                                imgCropper = new Cropper($cropImg[0], options);
                            }
                        });
                    }
                };
                (limitSize != undefined) && (uploadOptions.size = limitSize);
                (acceptMime != undefined) && (uploadOptions.acceptMime = acceptMime);
                (imgExts != undefined) && (uploadOptions.exts = imgExts);
                upload.render(uploadOptions);
                // 没有传图片触发上传图片
                if (!imgSrc) {
                    $('#ew-crop-img-upload').trigger('click');
                    return;
                }
                // 渲染裁剪组件
                var options = {
                    aspectRatio: aspectRatio,
                    preview: '#ew-crop-img-preview'
                };
                imgCropper = new Cropper($cropImg[0], options);
                // 操作按钮绑定事件
                $('.ew-crop-tool').on('click', '[data-method]', function () {
                    var data = $(this).data(), cropped, result;

                    if (!imgCropper || !data.method) {
                        return;
                    }
                    data = $.extend({}, data); // Clone a new one
                    cropped = imgCropper.cropped;
                    switch (data.method) {
                        case 'rotate':
                            if (cropped && options.viewMode > 0) {
                                imgCropper.clear();
                            }
                            break;
                        case 'getCroppedCanvas':
                            if (uploadedImageType === 'image/jpeg') {
                                if (!data.option) {
                                    data.option = {};
                                }
                                data.option.fillColor = '#fff';
                            }
                            break;
                    }
                    result = imgCropper[data.method](data.option, data.secondOption);
                    switch (data.method) {
                        case 'rotate':
                            if (cropped && options.viewMode > 0) {
                                imgCropper.crop();
                            }
                            break;
                        case 'scaleX':
                        case 'scaleY':
                            $(this).data('option', -data.option);
                            break;
                        case 'getCroppedCanvas':
                            if (result) {
                                onCrop && onCrop(result.toDataURL(uploadedImageType));
                                admin.closeDialog('#ew-crop-img');
                            } else {
                                admin.error('裁剪失败');
                            }
                            break;
                    }
                });
            }

            // 显示弹窗
            var htmlStr = '<div class="layui-row">';
            htmlStr += '        <div class="layui-col-sm8" style="min-height: 9rem;">';
            htmlStr += '             <img id="ew-crop-img" src="' + (imgSrc ? imgSrc : '') + '" style="max-width:100%;" />';
            htmlStr += '        </div>';
            htmlStr += '        <div class="layui-col-sm4 layui-hide-xs" style="padding: 0 20px;text-align: center;">';
            htmlStr += '             <div id="ew-crop-img-preview" style="width: 100%;height: 9rem;overflow: hidden;display: inline-block;border: 1px solid #dddddd;"></div>';
            htmlStr += '        </div>';
            htmlStr += '   </div>';
            htmlStr += '   <div class="text-center ew-crop-tool" style="padding: 15px 10px 5px 0;">';
            htmlStr += '        <div class="layui-btn-group" style="margin-bottom: 10px;margin-left: 10px;">';
            htmlStr += '             <button title="放大" data-method="zoom" data-option="0.1" class="layui-btn icon-btn" type="button"><i class="layui-icon layui-icon-add-1"></i></button>';
            htmlStr += '             <button title="缩小" data-method="zoom" data-option="-0.1" class="layui-btn icon-btn" type="button"><span style="display: inline-block;width: 12px;height: 2.5px;background: rgba(255, 255, 255, 0.9);vertical-align: middle;margin: 0 4px;"></span></button>';
            htmlStr += '        </div>';
            htmlStr += '        <div class="layui-btn-group layui-hide-xs" style="margin-bottom: 10px;">';
            htmlStr += '             <button title="向左旋转" data-method="rotate" data-option="-45" class="layui-btn icon-btn" type="button"><i class="layui-icon layui-icon-refresh-1" style="transform: rotateY(180deg) rotate(40deg);display: inline-block;"></i></button>';
            htmlStr += '             <button title="向右旋转" data-method="rotate" data-option="45" class="layui-btn icon-btn" type="button"><i class="layui-icon layui-icon-refresh-1" style="transform: rotate(30deg);display: inline-block;"></i></button>';
            htmlStr += '        </div>';
            htmlStr += '        <div class="layui-btn-group" style="margin-bottom: 10px;">';
            htmlStr += '             <button title="左移" data-method="move" data-option="-10" data-second-option="0" class="layui-btn icon-btn" type="button"><i class="layui-icon layui-icon-left"></i></button>';
            htmlStr += '             <button title="右移" data-method="move" data-option="10" data-second-option="0" class="layui-btn icon-btn" type="button"><i class="layui-icon layui-icon-right"></i></button>';
            htmlStr += '             <button title="上移" data-method="move" data-option="0" data-second-option="-10" class="layui-btn icon-btn" type="button"><i class="layui-icon layui-icon-up"></i></button>';
            htmlStr += '             <button title="下移" data-method="move" data-option="0" data-second-option="10" class="layui-btn icon-btn" type="button"><i class="layui-icon layui-icon-down"></i></button>';
            htmlStr += '        </div>';
            htmlStr += '        <div class="layui-btn-group" style="margin-bottom: 10px;">';
            htmlStr += '             <button title="左右翻转" data-method="scaleX" data-option="-1" class="layui-btn icon-btn" type="button" style="position: relative;width: 41px;"><i class="layui-icon layui-icon-triangle-r" style="position: absolute;left: 9px;top: 0;transform: rotateY(180deg);font-size: 16px;"></i><i class="layui-icon layui-icon-triangle-r" style="position: absolute; right: 3px; top: 0;font-size: 16px;"></i></button>';
            htmlStr += '             <button title="上下翻转" data-method="scaleY" data-option="-1" class="layui-btn icon-btn" type="button" style="position: relative;width: 41px;"><i class="layui-icon layui-icon-triangle-d" style="position: absolute;left: 11px;top: 6px;transform: rotateX(180deg);line-height: normal;font-size: 16px;"></i><i class="layui-icon layui-icon-triangle-d" style="position: absolute; left: 11px; top: 14px;line-height: normal;font-size: 16px;"></i></button>';
            htmlStr += '        </div>';
            htmlStr += '        <div class="layui-btn-group" style="margin-bottom: 10px;">';
            htmlStr += '             <button title="重新开始" data-method="reset" class="layui-btn icon-btn" type="button"><i class="layui-icon layui-icon-refresh"></i></button>';
            htmlStr += '             <button title="选择图片" id="ew-crop-img-upload" class="layui-btn icon-btn" type="button"><i class="layui-icon layui-icon-upload-drag"></i></button>';
            htmlStr += '        </div>';
            htmlStr += '        <button data-method="getCroppedCanvas" data-option="{ &quot;maxWidth&quot;: 4096, &quot;maxHeight&quot;: 4096 }" class="layui-btn icon-btn" type="button" style="margin-left: 10px;margin-bottom: 10px;"><i class="layui-icon">&#xe605;</i>完成</button>';
            htmlStr += '   </div>';
            admin.open({
                title: dialogTitle,
                area: '665px',
                type: 1,
                content: htmlStr,
                success: function (layero, dIndex) {
                    $(layero).children('.layui-layer-content').css('overflow', 'visible');
                    renderElem();
                }
            });
        });
    };

    /** 工具类 */
    admin.util = {
        /* 百度地图坐标转高德地图坐标 */
        Convert_BD09_To_GCJ02: function (point) {
            var x_pi = (3.14159265358979324 * 3000.0) / 180.0;
            var x = point.lng - 0.0065,
                y = point.lat - 0.006;
            var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
            var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
            point.lng = z * Math.cos(theta);
            point.lat = z * Math.sin(theta);
            return point;
        },
        /* 高德地图坐标转百度地图坐标 */
        Convert_GCJ02_To_BD09: function (point) {
            var x_pi = (3.14159265358979324 * 3000.0) / 180.0;
            var x = point.lng, y = point.lat;
            var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi);
            var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi);
            point.lng = z * Math.cos(theta) + 0.0065;
            point.lat = z * Math.sin(theta) + 0.006;
            return point;
        },
        /* 动态数字 */
        animateNum: function (elem, isThd, delay, grain) {
            var that = $(elem);  // 目标元素
            var num = that.text().replace(/,/g, '');  // 内容
            isThd = isThd === null || isThd === undefined || isThd === true || isThd === "true";  // 是否是千分位
            delay = isNaN(delay) ? 500 : delay;   // 动画延迟
            grain = isNaN(grain) ? 100 : grain;   // 动画粒度
            var flag = "INPUT,TEXTAREA".indexOf(that.get(0).tagName) >= 0;  // 是否是输入框

            var getPref = function (str) {
                var pref = "";
                for (var i = 0; i < str.length; i++) if (!isNaN(str.charAt(i))) return pref; else pref += str.charAt(i);
            }, getSuf = function (str) {
                var suf = "";
                for (var i = str.length - 1; i >= 0; i--) if (!isNaN(str.charAt(i))) return suf; else suf = str.charAt(i) + suf;
            }, toThd = function (num, isThd) {
                if (!isThd) return num;
                if (!/^[0-9]+.?[0-9]*$/.test(num)) return num;
                num = num.toString();
                return num.replace(num.indexOf(".") > 0 ? /(\d)(?=(\d{3})+(?:\.))/g : /(\d)(?=(\d{3})+(?:$))/g, '$1,');
            };

            var pref = getPref(num.toString());
            var suf = getSuf(num.toString());
            var strNum = num.toString().replace(pref, "").replace(suf, "");
            if (isNaN(strNum) || strNum === 0) {
                flag ? that.val(num) : that.html(num);
                console.error("非法数值！");
                return;
            }
            var int_dec = strNum.split(".");
            var deciLen = int_dec[1] ? int_dec[1].length : 0;
            var startNum = 0.0, endNum = strNum;
            if (Math.abs(endNum) > 10) startNum = parseFloat(int_dec[0].substring(0, int_dec[0].length - 1) + (int_dec[1] ? ".0" + int_dec[1] : ""));
            var oft = (endNum - startNum) / grain, temp = 0;
            var mTime = setInterval(function () {
                var str = pref + toThd(startNum.toFixed(deciLen), isThd) + suf;
                flag ? that.val(str) : that.html(str);
                startNum += oft;
                temp++;
                if (Math.abs(startNum) >= Math.abs(endNum) || temp > 5000) {
                    str = pref + toThd(endNum, isThd) + suf;
                    flag ? that.val(str) : that.html(str);
                    clearInterval(mTime);
                }
            }, delay / grain);
        },
        /* 深度克隆对象 */
        deepClone: function (obj) {
            var result;
            var oClass = admin.util.isClass(obj);
            if (oClass === "Object") {
                result = {};
            } else if (oClass === "Array") {
                result = [];
            } else {
                return obj;
            }
            for (var key in obj) {
                var copy = obj[key];
                if (admin.util.isClass(copy) == "Object") {
                    result[key] = arguments.callee(copy); // 递归调用
                } else if (admin.util.isClass(copy) == "Array") {
                    result[key] = arguments.callee(copy);
                } else {
                    result[key] = obj[key];
                }
            }
            return result;
        },
        /* 获取变量类型 */
        isClass: function (o) {
            if (o === null)
                return "Null";
            if (o === undefined)
                return "Undefined";
            return Object.prototype.toString.call(o).slice(8, -1);
        },
        /***************自己扩展的工具类start*********************/
        /* 获取url参数值 */
        getUrlParam: function (name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
            var r = window.location.search.substr(1).match(reg); //匹配目标参数
            if (r != null) return unescape(r[2]);
            return null; //返回参数值
        },
        /* 检查特殊字符 */
        checkSpecificKey:function(str){
            var patrn = /[`~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、]/im;
            if(!patrn.test(str)){return false;}
            return true;
        },
        /* 正则匹配 str代表字符串;sType代表正则类型;flag代表是否全局区分大小写*/
        regularMatching:function(str,sType,flag){
            if(admin.util.isNullOrEmpty(str)||admin.util.isNullOrEmpty(sType))return false;
            var regularList = [
                {type:1,regular:'^\\d+$'},//非负整数
                {type:2,regular:'^[0-9]*[1-9][0-9]*$'},//正整数
                {type:3,regular:'^((-\\d+)|(0+))$'},//非正整数
                {type:4,regular:'^-[0-9]*[1-9][0-9]*$'},//负整数
                {type:5,regular:'^-?\\d+$'},//整数
                {type:6,regular:'^\\d+(\\.\\d+)?$'},//非负浮点数
                {type:7,regular:'^(([0-9]+\\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\\.[0-9]+)|([0-9]*[1-9][0-9]*))$'},//正浮点数
                {type:8,regular:'^((-\\d+(\\.\\d+)?)|(0+(\\.0+)?))$'},//非正浮点数
                {type:9,regular:'^(-(([0-9]+\\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\\.[0-9]+)|([0-9]*[1-9][0-9]*)))$'},//负浮点数
                {type:10,regular:'^(-?\\d+)(\\.\\d+)?$'},//浮点数
                {type:11,regular:'^[A-Za-z]+$'},//由26个英文字母组成的字符串
                {type:12,regular:'^[A-Z]+$'},//由26个英文字母的大写组成的字符串
                {type:13,regular:'^[a-z]+$'},//由26个英文字母的小写组成的字符串
                {type:14,regular:'^[A-Za-z0-9]+$'},//由数字和26个英文字母组成的字符串
                {type:15,regular:'^\\w+$'},//由数字、26个英文字母或者下划线组成的字符串
                {type:16,regular:'^[\\w-]+(\\.[\\w-]+)*@[\\w-]+(\\.[\\w-]+)+$'},//email地址
                {type:17,regular:'^[a-zA-z]+://(\\w+(-\\w+)*)(\\.(\\w+(-\\w+)*))*(\\?\\S*)?$'},//url
                {type:18,regular:'<script.*?>.*?<\/script>|<script.*?>|<\/script>'}//存在<script>脚本
            ];
            for(var i=0;i<regularList.length;i++){
                if(regularList[i].type == sType){
                    flag = flag?'gi':'';
                    var reg = new RegExp(regularList[i].regular,flag);
                    return reg.test(str);
                }
            }
        },
        /* 格式化日期 format('yyyy-MM-dd hh:mm:ss:SS 星期w 第q季度') */
        dateFormat: function (format, date) {
            if (!date) {
                date = new Date();
            } else if (typeof (date) == 'string') {
                date = new Date(date);
            }
            var Week = ['日', '一', '二', '三', '四', '五', '六'];
            var o = {
                'y+': date.getYear(), //year
                'M+': date.getMonth() + 1, //month
                'd+': date.getDate(), //day
                'h+': date.getHours(), //hour
                'H+': date.getHours(), //hour
                'm+': date.getMinutes(), //minute
                's+': date.getSeconds(), //second
                'q+': Math.floor((date.getMonth() + 3) / 3), //quarter
                'S': date.getMilliseconds(), //millisecond
                'w': Week[date.getDay()]
            }
            if (/(y+)/.test(format)) {
                format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
            }
            for (var k in o) {
                if (new RegExp('(' + k + ')').test(format)) {
                    format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
                }
            }
            return format;
        },
        /* 判断是否为空 */
        isNullOrEmpty: function (obj) {
            if (null == obj || undefined == obj || obj.length == 0) {
                return true;
            } else {
                return false;
            }
        },
        /* 是否不为空（true否，false是）*/
        isNotNullOrEmpty: function (obj) {
            return !admin.util.isNullOrEmpty(obj);
        },
         /* 数组去重 */
        uniqueArr: function (arr) {
            var result = [], hash = {};
            for (var i = 0, elem; (elem = arr[i]) != null; i++) {
                if (!hash[elem]) {
                    result.push(elem);
                    hash[elem] = true;
                }
            }
            return result;
        },
        /* json数组去重 */
        uniqueJsonArr: function (array, key) {
            var result = [array[0]];
            for (var i = 1; i < array.length; i++) {
                var item = array[i];
                var repeat = false;
                for (var j = 0; j < result.length; j++) {
                    if (item[key] == result[j][key]) {
                        repeat = true;
                        break;
                    }
                }
                if (!repeat) {
                    result.push(item);
                }
            }
            return result;
        },
        //手机号加密显示
        mobileForStar:function(mobile){
        	if(admin.util.isNullOrEmpty(mobile)){
        		return mobile;
        	}
        	var showPhone =  mobile.replace(/^(\d{3})\d{4}(\d+)/,"$1****$2")
            return showPhone;
        },
        //显示字符串中间加星号
        plusXing:function (str,frontLen,endLen) {
        	if(str){
	            var len = str.length-frontLen-endLen;
	            var xing = '';
	            for (var i=0;i<len;i++) {
	                xing+='*';
	            }
	            return str.substr(0,frontLen)+xing+str.substr(str.length-endLen);
        	}
        	return str;
        },
        //邮箱脱敏
        noPassByEmail: function(email) {
            let new_email = email;
            if (String(email).indexOf('@') > 0) {
                let str = email.split('@');
                let 　_s = '';
                if (str[0].length > 3) { //@前面多于3位
                    for (let i = 3; i < str[0].length; i++) {
                        _s += '*';
                    }
                    new_email= str[0].substr(0, 3) + _s + '@' + str[1];
                }else{ //@前面小于等于于3位
                    for(let i = 1;i<str[0].length;i++){
                        _s+='*'
                    }
                    new_email = str[0].substr(0,1)+ _s + '@' + str[1]
                }
            }
            return new_email;

        },
        //替代默认值（当value的类型为undefined时，返回def）
        def: function(val,def){
			if (typeof(def)=='undefined') { def=''; } if (typeof(val)=='undefined') { return def; }
			var sVal; try{ sVal=val.toString(); }catch(e){};
			if (typeof(def)=='boolean'){
				if (/(^true$)|(^yes$)|(^1$)|(^-1$)/i.test(sVal)) { return true; }
				if (/(^false$)|(^no$)|(^0$)/i.test(sVal)) { return false; }
				return def;
			};
			if (typeof(def)=='number'){
				if (typeof(sVal)=='string') sVal=sVal.replace(/[A-Za-z]/g,'');
				if (/(^(\+|\-)?\d+$)/i.test(sVal)) { return parseInt(sVal); }
				if (/(^(\+|\-)?\d+\.\d+$)/i.test(sVal)) { return parseFloat(sVal); }
				return def;
			};
			if (typeof(val)=='number') return val.toString();
			return val || def;
        },
        //将 Object 转为字符串
        Obj2Str: function (o) {
			if (o == undefined) { return null; };
			var r = [];
			if (typeof o == "string") return "\"" + o.replace(/([\"\\])/g, "\\$1").replace(/(\n)/g, "\\n").replace(/(\r)/g, "\\r").replace(/(\t)/g, "\\t") + "\"";
			if (typeof o == "object") {
				if (!o.sort) {
					for (var i in o)
						r.push("\"" + i + "\":" + admin.util.Obj2Str(o[i]));
					if (!!document.all && !/^\n?function\s*toString\(\)\s*\{\n?\s*\[native code\]\n?\s*\}\n?\s*$/.test(o.toString)) {
						r.push("toString:" + o.toString.toString());
					};
					r = "{" + r.join() + "}";
				} else {
					for (var i = 0; i < o.length; i++)
						r.push(admin.util.Obj2Str(o[i]));
					r = "[" + r.join() + "]";
				};
				return r;
			};
			return o.toString().replace(/\"\:/g, '":""');
        },
        // 将 JSON 转为字符串
		JSON2Str: function(json){
			if ( window.JSON && window.JSON.stringify ) { return window.JSON.stringify(json,null,'\t'); }
			return admin.util.Obj2Str(json);
        },
        //[Func] 将字符串转为JSON对象。接受一个标准格式的 JSON 字符串，并返回解析后的 JavaScript 对象。@param {String} 要解析的 JSON 字符串。 @Tag <jUI>_Utils
	    parseJSON : function( data ) {
            try{
                window.__TEMP_json; eval('window.__TEMP_json='+data); return window.__TEMP_json;
            }catch(e){};
        },
        //将字符串转为JSON对象 (扩展)。 用DataSplit DataSplit2属性切割字符串<br>当字符串为 aaa,bbb 时自动转为 { &#91;id:'aaa',text:'aaa'&#93;, &#91;id:'bbb',text:'bbb'&#93; }<br>当字符串为 aaa|123,bbb|456 时自动转为 { &#91;id:'aaa',text:'123'&#93;, &#91;id:'bbb',text:'456'&#93; } @param {String} 要处理的字符串 @param {String=,} 数组分隔符 @param {String=|} sSplit2 Key Value 分隔符
		parseJSONEx: function (str, sSplit, sSplit2){
			if ((/^\s*\[[\s\S]*\](\s|\;)*$/.test(str)) || (/^\s*\{[\s\S]*\}(\s|\;)*$/.test(str))) return admin.util.parseJSON(str);
			if (admin.util.def(str).trim()=='') return [];
			sSplit=admin.util.def(sSplit,','); sSplit2=admin.util.def(sSplit2,'|');
			var arr=[]; var arrTem=str.replace('\\'+sSplit,'_*juispl*_').split(sSplit);
			for (var i=0; i<arrTem.length; i++) {
				var arrTem2=arrTem[i].split(sSplit2);
				var txt=arrTem2[arrTem2.length-1].replace('_*juispl*_',sSplit);
				arr.push( {id:arrTem2[0].replace('_*juispl*_',sSplit), text:txt, itemTxt:txt} );
			};
			return arr;
        },
        //是否为数组
        isArray: Array.isArray || function( obj ) {
			return jQuery.type( obj ) === "array";
        },
        //在数组中查找指定值并返回它的索引（如果没有找到，则返回-1）
		inArray: function( elem, arr, i ) {
			var len;
			if ( arr ) {
				if ( indexOf ) {
					return indexOf.call( arr, elem, i );
				}
				len = arr.length;
				i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;
				for ( ; i < len; i++ ) {
					// Skip accessing in sparse arrays
					if ( i in arr && arr[ i ] === elem ) {
						return i;
					}
				}
			}
			return -1;
        },
        //转化特殊字符
        Tranfertext:function(text) {
            if (typeof(text) != "string") text = text.toString();
            return text.replace(/,/g, "，").replace(/;/g, "；").replace(/#$%/g, "").replace(/\r\n/g, "<br>");
        },
        //动态执行函数
        evalFun:function(funcName,param,paramNum){
            if(typeof(funcName)!='function')return;
            var jsStr=funcName+"(";
            var paramStr="";
            for(i=0;i<paramNum;i++){
                paramStr=paramStr+param[i]+",";
            }
            if(paramStr.length>0)paramStr=paramStr.substr(0,paramStr.length-1);
            jsStr=jsStr+paramStr+")";
            $.globalEval(jsStr);
        },
        //表单数据转json对象
        Form2Json: function (aForm){
            //id转对象，jquery对象转dom
            aForm = typeof(aForm)=='string'?document.getElementById(aForm):(aForm instanceof $ ? aForm.get(0):aForm);
            var jPost={};
            for(var i=0;i<aForm.elements.length;i++){
                var obj=aForm.elements[i];
                if ((obj.name=='') || (obj.disabled) ) continue;
                if (admin.util.def($(obj).attr('NotSubmit'),false)) continue;
                var bCheckBox=false;
                if (/input/i.test(obj.nodeName)) {
                    if (obj.type=='checkbox') {
                        if (!obj.checked) continue;
                        bCheckBox=true;
                    };
                    if ( (obj.type=='radio') && (!obj.checked) ) continue;
                };

                if (bCheckBox) {
                    if (typeof(jPost[obj.name])!='undefined') continue;
                    jPost[obj.name]= admin.util.getCheckBoxValue(obj.name,true,false,true);
                }else{
                    jPost[obj.name] = obj.value;
                };
            };
            return jPost;
        },
        //[Func] 获取CheckBox的值，（当bString为false时返回数组[默认],为true时返回以逗号(,)隔开的字符串）
        getCheckBoxValue:function (sCheckBoxName,bString,bFilterEmpty,bEncode){
            var arr=[]; var sRet=''; bString=admin.util.def(bString,false); bFilterEmpty=admin.util.def(bFilterEmpty,false); bEncode=admin.util.def(bEncode,false);
            var objs=document.getElementsByName(sCheckBoxName);
            for (var i=0; i<objs.length; i++){
                if (objs[i].checked) {
                    if ((bFilterEmpty)&&(objs[i].value=='')) continue;
                    if (bString){
                        if (sRet!='') sRet+=',';
                        if (bEncode){
                            sRet += encodeURIComponent(objs[i].value);
                        }else{
                            sRet += objs[i].value;
                        };
                    }else{
                        arr.push(objs[i].value);
                    };
                };
            };
            return bString?sRet:arr;
        },
        //[Func] 获取radio的值
        getRadioValue:function (sRadioName){
            var objs=document.getElementsByName(sRadioName);
            for (var i=0; i<objs.length; i++){
                if (objs[i].checked) return objs[i].value;
            };
            return '';
        },

       getFromForJson:function (data){
    	   if(data){
    		   var ret = '';
    		   try{
    			   var dataType = typeof data ;
    			   if(dataType == "string"){
    				   data = JSON.parse(data);
    			   }
    			   var JsonKeyArray = new Array();
    			   for(x in data) {
    				   JsonKeyArray.push(x);
    			   }
    			   //签名参数进行排序
    			   JsonKeyArray =JsonKeyArray.sort();//对数组升序排列
    			   for(var i=0;i<JsonKeyArray.length;i++){
    		            var value = data[JsonKeyArray[i]];
    		            if(value === null){//处理null值
     	                   continue;
     	               	}
    		            ret += encodeURI(JsonKeyArray[i]) + '=' + encodeURI(value) + '&';
						//ret += encodeURIComponent(JsonKeyArray[i]) + '=' + encodeURIComponent(value) + '&';
    		       }

    	           if(ret.length>0){
    	        	   ret = ret.substr(0,ret.length-1);
    	           }
    		   }
    		   catch(err){
    			//    console.log(err);
    		   }
	           return ret;
    	   }
           return null;
       },
       //[Func] 获取URL中的Hash参数
        getHash:function(sParam,defValue){
            var strTem=window.location.hash.substr(1);
            var reg = new RegExp('\\b' + sParam + '\\b','i');
            if (strTem.match(reg)==null) return defValue;
            //if(strTem.indexOf(sParam)==-1) return defValue;
            return admin.util.getValueFromParam(strTem,sParam,'&');
        },
        //[Func] 设置URL中的Hash参数
        setHash:function(sParam,sValue){
            var sHash=window.location.hash.substr(1);
            var reg = new RegExp('(^|&)' + sParam + '=([^&]*)(&|$)','i');
            var r = sHash.match(reg);
            if (r!=null){
                sHash = sHash.replace(r[0], r[1]+sParam+'='+sValue+r[3]);
            }else{
                sHash += ((sHash=='')?'':'&') + sParam + '=' + sValue;
            };
            self.location.hash=sHash;
        },
        delURLParam:function(sURL,sParam){
            var reg=new RegExp('(\\?|\\&)'+sParam+'=[^&]*','ig');
            return sURL.replace(reg,'$1').replace(/[&]{2,}/ig,'&').replace(/\?&/i,'?');
        },
        //[Func]添加参数, 向URL中的添加参数 @p {String} sURL URL @p {String} 要添加的参数 @p {String} 参数值 @p {Boolean=true} 是否Encode @return {String} @Tag url
        addURLParam:function(sURL,sParam,sValue, bEncode){
            if (admin.util.def(bEncode,true)) sValue=encodeURIComponent(sValue);
            var str=admin.util.delURLParam(sURL,sParam);
            str += (str.indexOf('?')==-1?'?':'&') + sParam + '=' + sValue;
            return str;
        },
        //[Func] 从字符串中获取值（字符串如 "name=Witson&id=001&age=35"）@param {String} 源字符串 @param {String} 要查找的键 @param {String} 分隔符 @Tag <jUI>_Utils
		getValueFromParam: function(str,sName,sSplit){
			if (typeof(str)!='string') return '';
			var reg = new RegExp('(^| |'+sSplit+')' + sName + '=([^'+sSplit+']*)('+sSplit+'|$)','i');
			var r = str.match(reg);
			return (r==null)?'':(r[2]);
        },
        //获取所有父级
        getParent(data2, nodeId2,idKey,pidKey,childKey) {
            idKey = idKey||'id';
            pidKey = pidKey||'pid';
            childKey = childKey||'children';
            var arrRes = [];
            if (data2.length == 0) {
                if (!!nodeId2) {
                    arrRes.unshift(data2)
                }
                return arrRes;
            }
            function rev(data, nodeId){
                for (var i = 0, length = data.length; i < length; i++) {
                    var node = data[i];
                    if (node[idKey] == nodeId) {
                        arrRes.unshift(node)
                        rev(data2, node[pidKey]);
                        break;
                    }else {
                        if (!!node[childKey]) {
                            rev(node[childKey], nodeId);
                        }
                    }
                }
                return arrRes;
            };
            arrRes = rev(data2, nodeId2);
            return arrRes;
        },
        //数组转树形格式
        ArrayToTreeData : function (arrayData,idKey,pidKey,childKey){
            idKey = idKey?idKey:'id';
            pidKey = pidKey?pidKey:'pid';
            childKey = childKey?childKey:'children';
            //返回结果
            var result = [];
            //临时map
            var tmpMap = [];
            //将所有数据存入map，ID为节点id、value为节点对象
            for (i=0, l=arrayData.length; i<l; i++) {
                //获取对象（必须操作原对象）
                var data = arrayData[i];
                //数组节点指向原对象
                tmpMap[data.id] = data;
            }
            //再次循环数组
            for (i=0, l=arrayData.length; i<l; i++) {
                //获取对象（必须操作原对象）
                var data = arrayData[i];
                if (admin.util.isNotNullOrEmpty(tmpMap[data[pidKey]]) && data[idKey] != data[pidKey]) {//其他节点
                    if (!tmpMap[data[pidKey]][childKey]){//如果对象子节点属性不存在，需创建
                        tmpMap[data[pidKey]][childKey] = [];
                    }
                    tmpMap[data[pidKey]][childKey].push(data);
                } else {//根节点
                    result.push(data);
                }
            }
            return result;
        },
        /***************自己扩展的工具类end*********************/
    };

    /** 侧导航折叠状态下鼠标经过无限悬浮效果 */
    var navItemDOM = '.layui-layout-admin.admin-nav-mini>.layui-side .layui-nav .layui-nav-item';
    $(document).on('mouseenter', navItemDOM + ',' + navItemDOM + ' .layui-nav-child>dd', function () {
        if (admin.getPageWidth() > 768) {
            var $that = $(this), $navChild = $that.find('>.layui-nav-child');
            if ($navChild.length > 0) {
                $that.addClass('admin-nav-hover');
                $navChild.css('left', $that.offset().left + $that.outerWidth());
                var top = $that.offset().top;
                if (top + $navChild.outerHeight() > admin.getPageHeight()) {
                    top = top - $navChild.outerHeight() + $that.outerHeight();
                    (top < 60) && (top = 60);
                    $navChild.addClass('show-top');
                }
                $navChild.css('top', top);
                $navChild.addClass('ew-anim-drop-in');
            } else if ($that.hasClass('layui-nav-item')) {
                var tipText = $that.find('cite').text();
                layer.tips(tipText, $that, {
                    tips: [2, '#303133'], time: -1, success: function (layero, index) {
                        $(layero).css('margin-top', '12px');
                    }
                });
            }
        }
    }).on('mouseleave', navItemDOM + ',' + navItemDOM + ' .layui-nav-child>dd', function () {
        layer.closeAll('tips');
        var $this = $(this);
        $this.removeClass('admin-nav-hover');
        var $child = $this.find('>.layui-nav-child');
        $child.removeClass('show-top ew-anim-drop-in');
        $child.css({'left': 'unset', 'top': 'unset'});
    });

    /** 所有ew-event */
    $(document).on('click', '*[ew-event]', function () {
        var event = $(this).attr('ew-event');
        var te = admin.events[event];
        te && te.call(this, $(this));
    });

    /** 所有lay-tips处理 */
    $(document).on('mouseenter', '*[lay-tips]', function () {
        var tipText = $(this).attr('lay-tips');
        var dt = $(this).attr('lay-direction');
        var bgColor = $(this).attr('lay-bg');
        var offset = $(this).attr('lay-offset');
        layer.tips(tipText, this, {
            tips: [dt || 1, bgColor || '#303133'], time: -1, success: function (layero, index) {
                if (offset) {
                    offset = offset.split(',');
                    var top = offset[0], left = offset.length > 1 ? offset[1] : undefined;
                    top && ($(layero).css('margin-top', top));
                    left && ($(layero).css('margin-left', left));
                }
            }
        });
    }).on('mouseleave', '*[lay-tips]', function () {
        layer.closeAll('tips');
    });

    // /** 加载缓存的主题 */
    // var cacheSetting = layui.data(config.tableName);
    // if (cacheSetting && cacheSetting.theme) {
    //     (cacheSetting.theme == themeAdmin) || layui.link(admin.getThemeDir() + cacheSetting.theme + admin.getCssSuffix(), cacheSetting.theme);
    // } else if (themeAdmin != config.defaultTheme) {
    //     layui.link(admin.getThemeDir() + config.defaultTheme + admin.getCssSuffix(), config.defaultTheme);
    // }

    exports('admin', admin);
});
