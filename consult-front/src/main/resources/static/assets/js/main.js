/** EasyWeb spa v3.1.4 date:2019-07-12 License By http://easyweb.vip */

layui.config({
    version: true,   // 更新组件缓存，设为true不缓存，也可以设一个固定值
    base: '/assets/module/'
}).extend({
    formSelects: 'formSelects/formSelects-v4',
    iconPicker: 'iconPicker/iconPicker',
    treetableLite: 'treetable/treetableLite',
    treetable: 'treetable-lay/treetable',
    treeSelect: 'treeSelect/treeSelect',
    dropdown: 'dropdown/dropdown',
    notice: 'notice/notice',
    step: 'step-lay/step',
    steps: 'steps/steps',
    dtree: 'dtree/dtree',
    citypicker: 'city-picker/city-picker',
    tableSelect: 'tableSelect/tableSelect',
    Cropper: 'Cropper/Cropper',
    zTree: 'zTree/zTree',
    introJs: 'introJs/introJs',
    fileChoose: 'fileChoose/fileChoose',
    tagsInput: 'tagsInput/tagsInput',
    CKEDITOR: 'ckeditor/ckeditor',
    Split: 'Split/Split',
    cascader: 'cascader/cascader',
    treeView:'treeView/treeView',
    flowEngine: 'flowEngine/flowEngine',
    flowBiz: 'flowEngine/flowBiz',
    flowForm: 'flowEngine/flowForm',
    treeView:'treeView/treeView',
    numberInput: 'numberInput/numberInput',
}).use(['config', 'layer', 'element', 'index', 'admin', 'laytpl'], function () {
    var $ = layui.jquery;
    var layer = layui.layer;
    var element = layui.element;
    var config = layui.config;
    var index = layui.index;
    var admin = layui.admin;
    var laytpl = layui.laytpl;

    var defOpenItem;

    var innerFun = {
        //获取主页项
        getHomeItem:function (menus){
            var jo = '';
            $.each(menus, function (i, data) {
                if (data.url && data.url.indexOf('#') == 0) {
                    jo = data;
                    return false;
                }else if(data.subRes) {
                    jo = innerFun.getHomeItem(data.subRes);
                    return false;
                }
            });
            return jo;
        },
        //获取默认跳转页
        getDefItem:function(menus){
            var defHash = location.hash;
            $.each(menus, function (i, data) {
                if (data.url && data.url.indexOf('#') == 0 && defHash == data.url) {
                    defOpenItem = data;
                    return false;
                }else if(data.subRes) {
                    innerFun.getDefItem(data.subRes);
                }
            });
        },
        filterTreeData(arr){
            for(var i=0;i<arr.length;i++){
                if(arr[i].hidden){
                    arr.splice(i);
                }else if(arr[i].subRes&&arr[i].subRes.length){
                    innerFun.filterTreeData(arr[i].subRes);
                }
            }
        },
        //获取所有父级
        getParent(data2, nodeId2) {
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
                    if (node.id == nodeId) {
                        arrRes.unshift(node)
                        rev(data2, node.pid);
                        break;
                    }else {
                        if (!!node.subRes) {
                            rev(node.subRes, nodeId);
                        }
                    }
                }
                return arrRes;
            };
            arrRes = rev(data2, nodeId2);
            return arrRes;
        },
        //渲染导航组件
        initNav:function(sHTML,elem,jo){
            laytpl(sHTML).render(jo, function (html) {
                elem.html(html);
                element.render('nav');
            });
        },
        //根据窗口大小处理顶部导航所需的数据格式
        delTopNavData:function(arr_top){
            var arr_temp = $.extend(true, [], arr_top);;
            //计算导航菜单项可放置个数
            var itemCnt = parseInt(($(window).width()-$('.layui-logo').width()-$('.layui-layout-right').width())/120);

            if(itemCnt&&itemCnt<arr_top.length){
                var arr_close = [];
                for(var k=itemCnt-1;k<arr_top.length;k++){
                    arr_close.push(arr_top[k]);
                }
                arr_temp.length = itemCnt;
                arr_temp[itemCnt-1] = {
                    "resName": "更多",
                    "url": "javascript:;",
                    "icon": "layui-icon layui-icon-home",
                    "subRes":arr_close
                }
            }
            return arr_temp;
        },
        //隐藏或展开侧边菜单
        optSideMenu:function(sideMenu){
            //过滤隐藏的菜单
            var arr = [];
            $(sideMenu).each(function(i,d){
                if(!d.hidden)arr.push(d);
            })
            setTimeout(function(){
                if(arr.length>0){
                    var iW = $('.layui-side').width();
                    $('.layui-side').show();
                    $('.layui-body').css('left',iW+'px');
                    $('.layui-footer').css('left',iW+'px');
                }else{
                    $('.layui-side').hide();
                    $('.layui-body').css('left','0px');
                    $('.layui-footer').css('left','0px');
                }
                admin.resizeTable(200);
            }, 300);

        },
        //侧边导航数据增加对应顶部导航id
        dealSideMenusData:function(sideMenus,topMenuId){
            if(sideMenus.length>0){
                for(var i=0;i<sideMenus.length;i++){
                    sideMenus[i].topMenuId = topMenuId;
                    if(sideMenus[i].subRes&&sideMenus[i].subRes.length>0)innerFun.dealSideMenusData(sideMenus[i].subRes,topMenuId);
                }
            }
        },
        //越权消息提醒
        initMsgTips:function(){
            admin.req(config.ms_admin_api+'announcement/listByUser', {}, function (res) {
                if(res.code==0){
                    if(res.data.anntMsgTotal||res.data.sysMsgTotal){
                        $('.layui-header .layui-badge-dot').show();
                    }else{
                        $('.layui-header .layui-badge-dot').hide();
                    }
                    if (res.data.sysMsgTotal) {
                        admin.alert('您有'+res.data.sysMsgTotal+'条未读告警信息，点击确认前往查看详情！',{time:3000,btn:['确认'],offset:'rb'},function(idx){
                            index.go('/personal/userMsg');
                            layer.close(idx);
                        })
                    }
                }
            },'get')
        },
        //心跳监控
        heartBeat:function(){
            var token = config.getToken();
            if(token){
                $.ajax({
                    url: config.base_server + config.ms_auth_api+'heartBeat/keep',
                    type: 'post',
                    //dataType: 'json',
                    crossDomain: true == !(document.all),
                    contentType: "application/x-www-form-urlencoded",
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'Bearer ' + token.access_token);
                    },
                    success: function (res) {
                        if(res.code == 401){
                            admin.error(res.data||'登录过期！');
                            config.jumpToLoginPage(null,true);
                        }
                    },
                    error:function(res){
                        admin.error('登录过期！');
                    	config.jumpToLoginPage(null,true);
                    }
                });
            }else{
                //admin.error('token失效');
                config.jumpToLoginPage();
            }
        }
    }


     // 加载缓存的主题
     if (config.getTheme()) {
         (config.getTheme() == admin.getThemeAdmin()) || layui.link(admin.getThemeDir() + config.getTheme() + admin.getCssSuffix(), config.getTheme());
     } else if (admin.getThemeAdmin() != config.defaultTheme) {
         layui.link(admin.getThemeDir() + config.defaultTheme + admin.getCssSuffix(), config.defaultTheme);
     }

    // $('.layui-body').addClass('mouseoverBody');

    // $('.layui-body').mouseover(function(){
    //     $(this).removeClass('mouseoverBody');
    // })

    // $('.layui-body').mouseout(function(){
    //     $(this).addClass('mouseoverBody');
    // })



    //加载系统名称等
    $('#appName').html(config.appName);
	$('#appBootDiv').html(config.appBootName + '<span class="pull-right">'+ config.appVersion+'</span>') ;

    // 检查是否登录
    if (!config.getToken()) {
        try {
            var token = config.getToken();
            if(token&&token.access_token){
                var removeTokenUrl = config.base_server+config.ms_auth_api+ "oauth/remove/token?access_token="+token.access_token;
                if(config.isEnableIsc){
                    removeTokenUrl = config.base_server+"iscLoginOut?access_token="+token.access_token;//+ config.getTempData('ticket')
                }
                admin.ajax({
                    url: removeTokenUrl,
                    xhrFields: {
                        withCredentials: true
                    },
                    type: 'GET',
                    async:false,
                    dataType: 'JSON'

                });
            }
            config.jumpToLoginPage();
        } catch (error) {
            config.jumpToLoginPage();
        }

    }else{
        var user = config.getUser();
        $('#huName').text(user.fullName);

        //页面重载
        config.putChangeMode(1);

        // 加载导航
        // admin.req(config.ms_user_api+'res/current', {}, function (res) {
        // 判断是否是ISC来获取菜单；
        let getTreeByUser = '';
        let param = {};
        if(config.isEnableIsc){
            getTreeByUser = config.ms_auth_api+'iscJump/getFuncTreeByUserId';
            param = {userId: user.id};
        } else {
            getTreeByUser = config.ms_user_api+'res/current';
            param = {};
        }


        admin.req(getTreeByUser, param, function (res) {
            //构造menuList，百度运行平台需要
            if(res){
                let menuList = []
                $.each(res, function (index, item) {
                    if(config.isEnableIsc? true:!item.hidden){
                        let url = item.url;
                        let sort = item.sort;
                        let name = item.resName;
                        let value = item.id;
                        let subRes = item.subRes;
                        if (url.startsWith("#")) {
                            url = "/index-factory.html" + url;
                        } else if (url == '/aic') {
                            value = 'aic';
                        } else if (url.indexOf('javascript:') >= 0) {
                            if (subRes != undefined && subRes.length > 0) {
                                url = "/index-factory.html" + subRes[0].url;
                            }
                        }
                        menuList.push({"name": name, "sort": sort, "url": url, "value": value});
                    }
                });
                menuList.sort(compare("sort"));
                layui.data(config.tableName, {
                    key: 'menuList',
                    value: menuList
                });
            }
            index.regRouter(res);  // 注册路由
            //保存资源数据
            config.putResource(res);
            var arr_top = [],arr_side = res,homeURL = '';
            var homeItem = innerFun.getHomeItem(res);
            innerFun.getDefItem(res);
            defOpenItem = defOpenItem||{};
            if($('#topNav').html()){
                //厂字型布局,一级菜单顶部横向放置，对应的二级菜单左边垂直放置
                var sHTML = '';
                for(var i=0;i<res.length;i++){
                    if(!i)arr_side = res[i].subRes?res[i].subRes:[];
                    var jo = {};
                    jo.resName = res[i].resName;
                    jo.url = res[i].url;
                    jo.icon = res[i].icon;
                    jo.id = res[i].id;
                    jo.hidden = res[i].hidden;
                    if(!jo.hidden)arr_top.push(jo);
                    //侧边导航数据增加对应顶部导航id，便于选项卡切换时，顶部导航菜单的切换
                    if (res[i].subRes&&res[i].subRes.length>0) {innerFun.dealSideMenusData(res[i].subRes,res[i].id)}
                }
                var arr_top_fact = [];

                $(window).resize(function() {
                    arr_top_fact = innerFun.delTopNavData(arr_top);
                    innerFun.initNav(topNav.innerHTML,$('.layui-header .layui-layout-left'),arr_top_fact);
                });

                arr_top_fact = innerFun.delTopNavData(arr_top);
                innerFun.optSideMenu(arr_side);
                innerFun.initNav(topNav.innerHTML,$('.layui-header .layui-layout-left'),arr_top_fact);
                // index.regRouter(arr_top);

                setTimeout(function(){
                    if(!$('.layui-header .layui-layout-left li.layui-this').length)$('.layui-header .layui-layout-left li').first().addClass('layui-this');
                },100)


                element.on('nav(admin-top-nav)', function (elem) {

                    for(var j=0;j<res.length;j++){
                        if(res[j].resName == elem.attr('sName')){
                            var sideMenus = [];
                            if(res[j].subRes&&res[j].subRes.length>0){
                                sideMenus = res[j].subRes;
                            }
                            innerFun.optSideMenu(sideMenus);
                            //过滤隐藏
                            innerFun.filterTreeData(sideMenus);
                            //当侧边栏为空或者所选顶部菜单与当前菜单不一致时触发重新加载侧边栏
                            if((!$('.layui-layout-admin .layui-side .layui-nav li').length)||res[j].id!=$('.layui-layout-admin .layui-side .layui-nav li').attr('pid'))innerFun.initNav(sideNav.innerHTML,$('.layui-layout-admin .layui-side .layui-nav'),sideMenus);
                            var defItem = $.isEmptyObject(defOpenItem)?innerFun.getHomeItem(sideMenus.length?sideMenus:res):defOpenItem;
                            var mTabList = config.getTempData('indexTabs');
                            if(mTabList&&mTabList.length>0&&config.getChangeMode()){
                                for(var k=0;k<mTabList.length;k++){
                                    if(!mTabList[k].noChange){
                                        defItem = {url:'#'+mTabList[k].menuId,resName:mTabList[k].menuName}
                                        break;
                                    }
                                }
                            }
                            defItem.topMenuId = res[j].id;
                             //当多标签或者单标签页模式下默认选中侧边子菜单
                            admin.activeNav(defItem.url.substring(1));
                            // if(config.pageTabs||(!config.pageTabs&&defItem.url!=homeItem.url))
                            index.go(defItem.url.substring(1));//index.regRouter([defItem]);
                            defOpenItem = {};
                            break;
                        }
                    }
                })

            }else{
                for(var i=0;i<arr_side.length;i++){
                    if(arr_side[i].subRes)innerFun.dealSideMenusData(arr_side[i].subRes,arr_side[i].id);
                }
            }
            if(arr_side.length>0){
                //过滤隐藏菜单
                innerFun.filterTreeData(arr_side);
                innerFun.initNav(sideNav.innerHTML,$('.layui-layout-admin .layui-side .layui-nav'),arr_side);
            }

            var param  = {
                url: homeItem.url,//'#/console/console',
                topMenuId:(innerFun.getParent(res,homeItem.id)[0]||{}).id,
                resName:homeItem.resName,
                name: '<i class="layui-icon layui-icon-home"></i>'
            }

            var defOpenParam  = {
                url: defOpenItem.url,
                topMenuId:(innerFun.getParent(res,defOpenItem.id)[0]||{}).id,
                resName:defOpenItem.resName,
                name: defOpenItem.resName
            }


            index.loadHome(config.pageTabs?param:$.extend(true,param,defOpenParam));

            if(config.pageTabs&&defOpenItem.url)index.openNewTab(defOpenParam);


        }, config.isEnableIsc? 'post' : 'get');
    }

    function compare(property){
        return function(a,b){
            var value1 = a[property];
            var value2 = b[property];
            return value1 - value2;
        }
    }

    // 移除loading动画
    setTimeout(function () {
        admin.removeLoading();
    }, 300);

     //心跳监控，循环请求
     setInterval(function() {
    	 if(config.isEnableHeartBeat){
    		 innerFun.heartBeat();
    	 }
     },3000);

    //越权消息提醒
    innerFun.initMsgTips();

    setInterval(function(){
        innerFun.initMsgTips();
    },300000);



    // 提示
    if (!config.pageTabs) {
        return;
        layer.confirm('SPA版本默认关闭多标签功能，你可以在设置界面开启', {
            skin: 'layui-layer-admin',
            area: '280px',
            title: '温馨提示',
            shade: 0,
            btn: ['打开设置', '知道了']
        }, function (i) {
            layer.close(i);
            $('a[ew-event="theme"]').trigger('click');
        });
    }



});


