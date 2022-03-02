/** EasyWeb spa v3.1.4 date:2019-08-05 License By http://easyweb.vip */

layui.define(['layer', 'element', 'config', 'layRouter', 'admin', 'contextMenu'], function (exports) {
    var $ = layui.jquery;
    var layer = layui.layer;
    var element = layui.element;
    var config = layui.config;
    var layRouter = layui.layRouter;
    var admin = layui.admin;
    var contextMenu = layui.contextMenu;
    var headerDOM = '.layui-layout-admin>.layui-header';
    var sideDOM = '.layui-layout-admin>.layui-side>.layui-side-scroll';
    var bodyDOM = '.layui-layout-admin>.layui-body';
    var tabDOM = bodyDOM + '>.layui-tab';
    var titleDOM = bodyDOM + '>.layui-body-header';
    var tabFilter = 'admin-pagetabs';
    var navFilter = 'admin-side-nav';
    var navTopFilter = 'admin-top-nav';
    var homeUrl;  // 主页地址
    

    var index = {
        mTabPosition: undefined, // 当前选中Tab
        mTabList: [], // 当前打开的Tab
        isTabClick:false,//用来判断是否为标签单点击事件
        // 递归注册路由
        //[修改]json串的key
        regRouter: function (menus) {
            $.each(menus, function (i, data) {
                if (data.url && data.url.indexOf('#') == 0) {
                    var hashPath = index.getHashPath(data.url);
                    //[修改]data.url.substr(1)带参数注册，取代原先hashPath
                    layRouter.reg(hashPath, function (r) {
                        //[修改]厂字型布局下增加topMenuId属性
                        var topMenuId = '';
                        if(data.topMenuId)topMenuId = data.topMenuId;
                        index.loadView({
                            menuId: r.href,
                            menuPath: config.viewPath + hashPath + index.getViewSuffix(hashPath),
                            menuName: data.resName,
                            topMenuId:topMenuId
                        });
                    });
                }
                if (data.subRes) {
                    index.regRouter(data.subRes);
                }
            });
        },
        // 路由加载组件
        loadView: function (param) {
            var menuId = param.menuId;  // 完整的hash地址
            var menuPath = param.menuPath;  // 组件的路径
            var menuName = param.menuName;  // tab标题
            var hashPath = index.getHashPath('#' + menuId);  // hash路径不带参数
            var contentDom = bodyDOM + '>div[lay-id]';
            //[修改]增加topMenuId属性
            var topMenuId = '';
            if(param.topMenuId)topMenuId = param.topMenuId;
            if (config.pageTabs) {  // 多标签模式
                var flag;  // 选项卡是否已经添加
                $(tabDOM + '>.layui-tab-title>li').each(function (i) {
                    if ($(this).attr('lay-id') == hashPath) {
                        flag = true;
                        return false;
                    }
                });
                if (!flag) {  // 添加选项卡
                    if ((index.mTabList.length + 1) >= config.maxTabNum) {
                        admin.error('最多打开' + config.maxTabNum + '个选项卡');
                        index.go(index.mTabPosition);
                        return;
                    }
                    element.tabAdd(tabFilter, {
                        id: hashPath,
                        title: '<span class="title" topMenuId="'+topMenuId+'">' + (menuName ? menuName : '') + '</span>',
                        content: '<div lay-id="' + hashPath + '" lay-hash="' + menuId + '"></div>'
                    });
                    (menuId != homeUrl) && index.mTabList.push(param);  // 记录tab
                    (config.cacheTab) && config.putTempData('indexTabs', index.mTabList);  // 记忆选项卡
                }
                contentDom = tabDOM + '>.layui-tab-content>.layui-tab-item>div[lay-id="' + hashPath + '"]';
                var oldMenuId = $(contentDom).attr('lay-hash');
                if (menuId != oldMenuId) {  // 同一个hash参数不同
                    $(contentDom).attr('lay-hash', menuId);
                    flag = false;  // 同一个hash参数不同刷新内容
                    //[修改]修改选项卡名称（解决hashPath相同，路由注册名称会被覆盖）
                    // try {
                    //     var sideNavText = $('ul[lay-filter="' + navFilter + '"]').find('.layui-this cite').html();
                    //     var topNavText = $('ul[lay-filter="' + navTopFilter + '"]').find('li.layui-this cite').html();
                    //     param.menuName = sideNavText||topNavText;
                    //     index.setTabTitle(param.menuName,hashPath);
                    // } catch (e) {}
                    index.setTabTitle(param.menuName,hashPath);
                    for (var i = 0; i < index.mTabList.length; i++) {
                        if (index.mTabList[i].menuId == oldMenuId) {
                            index.mTabList[i] = param;
                        }
                    }
                    (config.cacheTab) && config.putTempData('indexTabs', index.mTabList);  // 记忆选项卡
                }
                if (!flag || layRouter.isRefresh) {
                    index.renderView(menuPath, contentDom); // 渲染内容页面
                }
                if (!param.noChange) {
                    element.tabChange(tabFilter, hashPath);  // 切换到此tab
                }
            } else {  // 单标签模式
                var $contentDom = $(contentDom);
                if (!$contentDom || $contentDom.length <= 0) {  // 第一次补充标题栏
                    var contentHtml = '<div class="layui-body-header" topMenuId="'+topMenuId+'">';
                    contentHtml += '      <span class="layui-body-header-title"></span>';
                    contentHtml += '      <span class="layui-breadcrumb pull-right">';
                    contentHtml += '         <a href="#' + homeUrl + '">首页</a>';
                    contentHtml += '         <a><cite></cite></a>';
                    contentHtml += '      </span>';
                    contentHtml += '   </div>';
                    contentHtml += '   <div lay-id="' + menuId + '"></div>';
                    $(bodyDOM).html(contentHtml);
                    element.render('breadcrumb');
                } else {
                    $contentDom.attr('lay-id', menuId);
                }
                
                if (homeUrl != menuId) {
                    //[修改]修改选项卡名称（解决hashPath相同，路由注册名称会被覆盖）
                    // try {
                    //     var sideNavText = $('ul[lay-filter="' + navFilter + '"]').find('.layui-this cite').html();
                    //     var topNavText = $('ul[lay-filter="' + navTopFilter + '"]').find('li.layui-this cite').html();
                    //     param.menuName = sideNavText||topNavText;
                    //     index.setTabTitle(param.menuName,hashPath);
                    // } catch (e) {index.setTabTitle(menuName);}
                    index.setTabTitle(param.menuName,hashPath);
                } else {
                    index.setTabTitle(param.menuName);
                }
                //[修改]厂字型布局下切换到单标签模式，顶部菜单联动；
                if((config.getLayout() != 'side')&&(index.isTabClick||config.getChangeMode()))$('#topNav_'+topMenuId+' a').click();
                admin.activeNav(menuId);  // 设置导航栏选中
                index.mTabList.splice(0, index.mTabList.length);  // 单标签清空tab
                //(homeUrl != menuId) && index.mTabList.push(param);  // 记录tab
                (config.cacheTab) && config.putTempData('indexTabs', index.mTabList);  // 记忆选项卡
                index.mTabPosition = menuId;  // 记录当前Tab位置
                index.renderView(menuPath, contentDom); // 渲染内容页面
            }
            (admin.getPageWidth() <= 768) && admin.flexible(true); // 移动设备切换页面隐藏侧导航
            $('.layui-table-tips-c').trigger('click'); // 切换tab关闭表格内浮窗
        },
        // 异步加载子页面
        renderView: function (url, contentDom, loadingDOM) {
            config.putChangeMode(0);
            var $contentDom = $(contentDom);
            !loadingDOM && (loadingDOM = $contentDom.parent());
            admin.showLoading({elem: loadingDOM, size: ''});
            $contentDom.load(url, function () {
                
                //[修改]多标签页模式下，内容页头添加路径
                var curTabId = '';
                if(config.pageTabs){
                    //获取主页url跟当前页名称
                    var homeURL = '',menuName = '';
                    $(tabDOM + '>.layui-tab-title>li').each(function (i) {
                        if(!i)homeURL = '#'+$(this).attr('lay-id');
                        var str = url.replace(config.viewPath,'');
                        if ($(this).attr('lay-id') == str.substring(0,str.indexOf('.'))) {
                            menuName = $(this).find('span').html();
                            curTabId = $(this).attr('lay-id');
                        }
                    });
                    
                    // if($(contentDom + '>.layui-fluid>.layui-card>.layui-content-breadcrumb')){
                    //     var sHTML = '';
                    //     sHTML +='<h2 class="layui-card-header-title">'+menuName+'</h2>';
                    //     sHTML +='<span class="layui-breadcrumb pull-right">';
                    //     sHTML +=    '<a href="'+homeURL+'">首页</a>';
                    //     sHTML +=    '<span lay-separator="">/</span>';
                    //     sHTML +=    '<a><cite>'+menuName+'</cite></a>';
                    //     sHTML +='</span>';
                    //     $(contentDom + '>.layui-fluid>.layui-card>.layui-content-breadcrumb').html(sHTML);
                    //     $(contentDom + '>.layui-fluid>.layui-card>.layui-content-breadcrumb').show();
                    // }
                }else{
                    // $(contentDom + '>.layui-fluid>.layui-card>.layui-card-content').css('padding-top','10px');
                }
                //[修改]内容页最小高度100% 
                admin.resizeContentDom(curTabId);
                // $(contentDom + '>.layui-fluid>.layui-card>.layui-card-content').css('margin-top','7px');
                admin.renderPerm();  // 移除没有权限的元素
                
                setTimeout(function () {
                    admin.removeLoading(loadingDOM);
                }, 100);
            });
        },
        // 加载主页
        loadHome: function (param) {
            var menuId = param.url;
            var menuName = param.name;
            var indexTabs = config.getTempData('indexTabs');  // 缓存的选项卡
            // 加载主页
            homeUrl = menuId.substring(1);
            index.regRouter([param]);
            if (config.pageTabs) {
                var hashPath = index.getHashPath(menuId);
                //[修改]厂字型布局下增加topMenuId属性
                var topMenuId = '';
                if(param.topMenuId)topMenuId = param.topMenuId;
                index.loadView({
                    menuId: homeUrl,
                    menuPath: config.viewPath + hashPath + index.getViewSuffix(hashPath),
                    menuName: menuName,
                    topMenuId:topMenuId,
                    noChange: true
                });
            }
            // 恢复其他选项卡
            var loadSetting = (param.loadSetting == undefined ? true : param.loadSetting);
            if (loadSetting) {
                index.loadSettings(indexTabs);
            }
            // 配置路由
            layRouter.init({
                index: homeUrl,
                notFound: function (r) {
                    //[修改]由config移至admin
                    admin.routerNotFound && admin.routerNotFound(r);
                }
            });
        },
        // 打开新页面
        openNewTab: function (param) {
            index.regRouter([param]);
            index.go(param.url.substring(1));
        },
        // 关闭选项卡
        closeTab: function (menuId) {
            var hashPath = index.getHashPath('#' + menuId);
            element.tabDelete(tabFilter, hashPath);
        },
        // 跳转页面
        go: function (hash) {
            layRouter.go(hash);
        },
        // 获取hash的view路径
        getHashPath: function (hash) {
            var layRouter = layui.router(hash);
            var hashPath = '';
            for (var i = 0; i < layRouter.path.length; i++) {
                hashPath += ('/' + layRouter.path[i]);
            }
            return hashPath;
        },
        // 设置Tab标题
        setTabTitle: function (title, tabId) {
            if (!config.pageTabs) {
                if (title) {
                    $(titleDOM).addClass('show');
                    var $titleTvDom = $(titleDOM + '>.layui-body-header-title');
                    $titleTvDom.html(title);
                    $titleTvDom.next('.layui-breadcrumb').find('cite').last().html(title);
                } else {
                    $(titleDOM).removeClass('show');
                }
            } else {
                title || (title = '');
                tabId || (tabId = index.getHashPath());
                tabId && $(tabDOM + '>.layui-tab-title>li[lay-id="' + tabId + '"] .title').html(title);
            }
        },
        // 自定义Tab标题
        setTabTitleHtml: function (html) {
            if (!config.pageTabs) {
                if (html) {
                    $(titleDOM).addClass('show');
                    $(titleDOM).html(html);
                } else {
                    $(titleDOM).removeClass('show');
                }
            }
        },
        // 获取组件后缀
        getViewSuffix: function (url) {
            var viewSuffix;
            if (typeof config.viewSuffix === 'string') {
                viewSuffix = config.viewSuffix;
            } else {
                viewSuffix = config.viewSuffix(url);
            }
            if (config.version != undefined) {
                if (viewSuffix.indexOf('?') == -1) {
                    viewSuffix += '?v=';
                } else {
                    viewSuffix += '&v=';
                }
                if (config.version == true) {
                    viewSuffix += new Date().getTime();
                } else {
                    viewSuffix += config.version;
                }
            }
            return viewSuffix;
        },
        // 加载设置
        loadSettings: function (cacheTabs) {
            // 恢复记忆的tab选项卡
            if (config.cacheTab) {
                var indexTabs = cacheTabs;
                if (indexTabs) {
                    for (var i = 0; i < indexTabs.length; i++) {
                        if (config.pageTabs) {
                            indexTabs[i].noChange = true;
                            index.loadView(indexTabs[i]);
                        }
                    }
                }
            }
            // 读取本地配置
            var cacheSetting = layui.data(config.tableName);
            if (cacheSetting) {
                // 页脚
                var openFooter = cacheSetting.openFooter;
                if (openFooter != undefined && openFooter == false) {
                    $('body.layui-layout-body').addClass('close-footer');
                }
                // 设置导航小箭头
                if (cacheSetting.navArrow != undefined) {
                    $(sideDOM + '>.layui-nav-tree').removeClass('arrow2 arrow3');
                    cacheSetting.navArrow && $(sideDOM + '>.layui-nav-tree').addClass(cacheSetting.navArrow);
                }
            }
        }
    };

    // 读取本地缓存配置，是否开启多标签
    var cacheSetting = layui.data(config.tableName);
    if (cacheSetting) {
        var openTab = cacheSetting.openTab;
        if (openTab != undefined) {
            config.pageTabs = openTab;
        }
    }

    // 移动设备遮罩层
    var siteShadeDom = '.layui-layout-admin .site-mobile-shade';
    if ($(siteShadeDom).length <= 0) {
        $('.layui-layout-admin').append('<div class="site-mobile-shade"></div>');
    }
    $(siteShadeDom).click(function () {
        admin.flexible(true);
    });

    // 补充tab的dom
    if (config.pageTabs && $(tabDOM).length <= 0) {
        var tabDomHtml = '<div class="layui-tab" lay-allowClose="true" lay-filter="admin-pagetabs">';
        tabDomHtml += '       <ul class="layui-tab-title"></ul>';
        tabDomHtml += '      <div class="layui-tab-content"></div>';
        tabDomHtml += '   </div>';
        tabDomHtml += '   <div class="layui-icon admin-tabs-control layui-icon-prev" ew-event="leftPage"></div>';
        tabDomHtml += '   <div class="layui-icon admin-tabs-control layui-icon-next" ew-event="rightPage"></div>';
        tabDomHtml += '   <div class="layui-icon admin-tabs-control layui-icon-down">';
        tabDomHtml += '      <ul class="layui-nav admin-tabs-select" lay-filter="admin-pagetabs-nav">';
        tabDomHtml += '         <li class="layui-nav-item" lay-unselect>';
        tabDomHtml += '            <a></a>';
        tabDomHtml += '            <dl class="layui-nav-child layui-anim-fadein">';
        tabDomHtml += '               <dd ew-event="closeThisTabs" lay-unselect><a>关闭当前标签页</a></dd>';
        tabDomHtml += '               <dd ew-event="closeOtherTabs" lay-unselect><a>关闭其它标签页</a></dd>';
        tabDomHtml += '               <dd ew-event="closeAllTabs" lay-unselect><a>关闭全部标签页</a></dd>';
        tabDomHtml += '            </dl>';
        tabDomHtml += '         </li>';
        tabDomHtml += '      </ul>';
        tabDomHtml += '   </div>';
        $(bodyDOM).html(tabDomHtml);
        element.render('nav');
    }

    // 监听侧导航栏点击事件
    element.on('nav(' + navFilter + ')', function (elem) {
        // var $that = $(elem);
        // // 手风琴侧边栏(已由element模块实现)
        // if ('true' == $(sideDOM + '>.layui-nav-tree').attr('lay-accordion')) {
        //     if ($that.parent().hasClass('layui-nav-itemed') || $that.parent().hasClass('layui-this')) {
        //         $(sideDOM + '>.layui-nav .layui-nav-itemed').not($that.parents('.layui-nav-child').parent()).removeClass('layui-nav-itemed');
        //         $that.parent().addClass('layui-nav-itemed');
        //     }
        //     $that.trigger('mouseenter');
        // }
    });

    // tab选项卡切换监听
    element.on('tab(' + tabFilter + ')', function (data) {
        index.isTabClick = true;
        if(config.pageTabs)$('#topNav_'+$('div.layui-tab li.layui-this span').attr('topMenuId')+' a').click();
        var tabId = $(this).attr('lay-id');
        var menuId = $(tabDOM + '>.layui-tab-content>.layui-tab-item>div[lay-id="' + tabId + '"]').attr('lay-hash');
        index.mTabPosition = menuId;  // 记录当前Tab位置
        admin.activeNav(menuId);  // 设置导航栏选中
        index.go(menuId);  // 联动改变hash地址
        admin.resizeTable(0);
        admin.rollPage('auto');
    });

    // tab选项卡删除监听
    element.on('tabDelete(' + tabFilter + ')', function (data) {
        var mTab = index.mTabList[data.index - 1];
        if (mTab) {
            index.mTabList.splice(data.index - 1, 1);
            (config.cacheTab) && config.putTempData('indexTabs', index.mTabList);
        }
        // 解决偶尔出现关闭后没有选中任何Tab的bug
        if ($(tabDOM + '>.layui-tab-title>li.layui-this').length <= 0) {
            $(tabDOM + '>.layui-tab-title>li:last').trigger('click');
        }
    });

    // 多系统切换事件
    $('body').off('click.navMore').on('click.navMore', '[nav-bind]', function () {
        var navId = $(this).attr('nav-bind');
        $('ul[lay-filter="' + navFilter + '"]').addClass('layui-hide');
        $('ul[nav-id="' + navId + '"]').removeClass('layui-hide');
        if (admin.getPageWidth() <= 768) {
            admin.flexible(false);  // 展开侧边栏
        }
        $(headerDOM + '>.layui-nav .layui-nav-item').removeClass('layui-this');
        $(this).parent('.layui-nav-item').addClass('layui-this');
    });

    // 开启Tab右键菜单
    if (config.openTabCtxMenu && config.pageTabs) {
        $(tabDOM + '>.layui-tab-title').off('contextmenu.tab').on('contextmenu.tab', 'li', function (e) {
            var layId = $(this).attr('lay-id');
            var url = $(this).attr('lay-hash');//[修改]带参数注册路由
            contextMenu.show([{
                icon: 'layui-icon layui-icon-refresh',
                name: '刷新当前',
                click: function () {
                    element.tabChange(tabFilter, layId);
                    // admin.refresh(index.getHashPath('#' + layId));
                    admin.refresh(url);//[修改]带参数注册路由
                }
            }, {
                icon: 'layui-icon layui-icon-close-fill ctx-ic-lg',
                name: '关闭当前',
                click: function () {
                    admin.closeThisTabs(layId);
                }
            }, {
                icon: 'layui-icon layui-icon-unlink',
                name: '关闭其他',
                click: function () {
                    admin.closeOtherTabs(layId);
                }
            }, {
                icon: 'layui-icon layui-icon-close ctx-ic-lg',
                name: '关闭全部',
                click: function () {
                    admin.closeAllTabs();
                }
            }], e.clientX, e.clientY);
            return false;
        });
    }

    exports('index', index);
});
