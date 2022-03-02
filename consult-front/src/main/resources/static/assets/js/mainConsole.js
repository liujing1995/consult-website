/** EasyWeb spa v3.1.4 date:2019-07-12 License By http://easyweb.vip */

layui.config({
    version: true,   // 更新组件缓存，设为true不缓存，也可以设一个固定值
    base: 'assets/module/'
}).extend({
    formSelects: 'formSelects/formSelects-v4',
    iconPicker: 'iconPicker/iconPicker',
    treetableLite: 'treetable/treetableLite',
    treetable: 'treetable-lay/treetable',
    treeSelect: 'treeSelect/treeSelect',
    dropdown: 'dropdown/dropdown',
    notice: 'notice/notice',
    step: 'step-lay/step',
    dtree: 'dtree/dtree',
    steps: 'steps/steps',
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
    numberInput: 'numberInput/numberInput',
}).use(['config', 'layer', 'element', 'indexPortal', 'admin', 'laytpl'], function () {
    var $ = layui.jquery;
    var layer = layui.layer;
    var element = layui.element;
    var config = layui.config;
    var index = layui.indexPortal;
    var admin = layui.admin;
    var laytpl = layui.laytpl;

    var innerFun = {
        //获取主页项
        getHomeItem: function (menus) {
            var jo = {};
            var hash = '#'+index.getHashPath(location.hash);
            if(admin.util.isNotNullOrEmpty(location.hash)){
                //有默认页
                var res = config.getPortalResource();
                var parents = [];
                $.each(res,function(i,d){
                    if(d.url==hash){
                        parents = admin.util.getParent(res,d.id);
                        jo = parents;
                        return false;
                    }
                })

            }else{
                $.each(menus, function (i, data) {
                    if (data.url && data.url.indexOf('#') == 0) {
                        jo = data;
                        return false;
                    } else if (data.children) {
                        jo = innerFun.getHomeItem(data.children);
                        return false;
                    }
                });
            }
            return jo;
        },
        //隐藏或展开侧边菜单
        optSideMenu:function(sideMenu){
            if(sideMenu.length>0){
                $('.layui-side').show();
                setTimeout(function(){innerFun.initNav(sideNav.innerHTML,$('.layui-layout-admin .layui-side .layui-nav'),sideMenu);},200)
            }else{
                $('.layui-side').hide();
            }
        },
        //渲染导航组件
        initNav: function (sHTML, elem, jo) {
            laytpl(sHTML).render(jo, function (html) {
                elem.html(html);
                if(elem==$('.ali-nav')){
                    $.get('/assets/libs/aliNav/common-header.js', undefined, null, "script");
                }else{
                    element.render('nav');
                }
            });
        },
        //按条件递归查询
        getObjectByCondition: function (menus, matchKey, matchVal, getKey) {
            var arr = [];
            $.each(menus, function (i, data) {
                if (data[matchKey] == matchVal) {
                    arr = data[getKey];
                    return false;
                } else if (data.subRes && data.subRes.length > 0) {
                    arr = innerFun.getObjectByCondition(data.subRes, matchKey, matchVal, getKey);
                    return false;
                }
            });
            return arr;
        }
    }

    var user = config.getUser();
    if (config.getToken() && user) {
        $('#huName').text('欢迎您，' + user.fullName);
        $('.layui-layout-right .item-login').hide();
        $('.layui-layout-right .item-info').show();
    }

    // 加载白色主题以及门户自定义样式
    // layui.link(admin.getThemeDir() + 'theme-white' + admin.getCssSuffix(), config.defaultTheme);
    // layui.link('assets/css/portal' + admin.getCssSuffix(), '');
    // 加载导航

    //加载系统名称等
    $('#appName').html(config.appName);

    admin.req(config.ms_admin_api + 'nav/findAlls', {}, function (res) {
        if (res.code == 0) {
            //保存资源数据
            config.putPortalResource(res.data);
            admin.renderPerm();
            //过滤隐藏的菜单
            var cloneData = admin.util.cloneArr(res.data,true);
            var arr = [];
            for(var i=0;i<cloneData.length;i++){
                if(!JSON.parse(cloneData[i].hidden))arr.push(cloneData[i]);
            }
            var filterData = admin.util.ArrayToTreeData(arr);
            var data = admin.util.ArrayToTreeData(res.data);
            if ($('#topNav').html()) {
                var homeURL = '', sideMenus = [];
                var defItem = innerFun.getHomeItem(data);//含所有父级
                homeItem = admin.util.isArray(defItem)?defItem[0]:defItem;
                // var parents = innerFun.getParent(config.getResource(),homeItem.id);
                //顶部菜单默认选中
                var curTopMenuId = homeItem.id?homeItem.id:'';
                if(admin.util.isNotNullOrEmpty(curTopMenuId)){
                    for(var i=0;i<filterData.length;i++){
                        if(filterData[i].id==curTopMenuId)filterData[i].selected=true;
                    }
                }else{
                    filterData[0].selected=true;
                }

                innerFun.initNav(topNav.innerHTML, $('.ali-nav'), filterData);

                // $('.top-menu-item').click(function(){
                //     $(this).siblings('.top-menu-item').removeClass('top-menu-item-cur');
                //     $(this).addClass('top-menu-item-cur');
                //     var curMenuId = $(this).find('a.menu-hd').attr('id');
                //     var sideArr = [];
                //     for(var i=0;i<res.data.length;i++){
                //         if(res.data[i].pid==curMenuId&&!res.data[i].hidden){
                //             res.data[i].selected = false;
                //             sideArr.push(res.data[i]);
                //         }
                //     }
                //     if(sideArr.length)sideArr[0].selected=true;
                //     innerFun.optSideMenu(sideArr);

                // })

                // for(var i=0;i<res.data.length;i++){
                //     if(res.data[i].pid==homeItem.id&&!res.data[i].hidden)sideMenus.push(res.data[i]);
                // }

                // //侧边栏默认选中
                // if(sideMenus.length){
                //     var curSideMenu = defItem.length>1?defItem[1].url:'#'+index.getHashPath(location.hash);
                //     if(admin.util.isNotNullOrEmpty(curSideMenu)){
                //         for(var i=0;i<sideMenus.length;i++){
                //             if(sideMenus[i].url==curSideMenu)sideMenus[i].selected=true;
                //         }
                //     }else{
                //         sideMenus[0].selected=true;
                //     }
                //     innerFun.optSideMenu(sideMenus);

                // }

                index.regRouter(data);  // 注册路由
                homeURL = homeItem.url;
                if (homeURL) {
                    index.loadHome({  // 加载主页
                        url: homeURL,//'#/console/console',
                        id: homeItem.id,
                        name: '<i class="layui-icon layui-icon-home"></i>'
                    });
                }
                config.putTempData('bRouter',true);
            }
        }

    }, 'GET');


    // 移除loading动画
    setTimeout(function () {
        admin.removeLoading();
    }, 300);

    //解决浏览器返回不刷新问题[begin]
//     $(document).ready(function () {
//         if (window.history && window.history.pushState) {
//             $(window).on('popstate', function () {
//                 config.putTempData('bRouter',false);
//                 setTimeout(function(){if(!config.getTempData('bRouter'))window.location.reload()},200)
//             });
//         }
// 　　　　　
//     });

//     $(document).click(function(){
//         var curHash = location.hash;
//         var timer = setInterval(function () {
//             // if (curHash != location.hash){
//                 config.putTempData('bRouter',true);
//                 clearInterval(timer);
//             // }
//         }, 100);

//     })
    //解决浏览器返回不刷新问题[end]


});



