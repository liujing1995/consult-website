/** EasyWeb spa v3.1.4 date:2019-08-05 License By http://easyweb.vip */

layui.define(['layer', 'element', 'config', 'layRouter', 'admin','laytpl'], function (exports) {
    var $ = layui.jquery;
    var layer = layui.layer;
    var element = layui.element;
    var config = layui.config;
    var layRouter = layui.layRouter;
    var laytpl = layui.laytpl;
    var admin = layui.admin;
    var headerDOM = '.layui-layout-admin>.layui-header';
    var bannerDOM = '.layui-layout-admin>.ew-banner';
    var bodyDOM = '.layui-layout-admin>.layui-main>.layui-body-portal';
    var tabDOM = bodyDOM + '>.layui-tab';
    var navFilter = 'admin-side-nav';
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
                    layRouter.reg(hashPath, function (r) {
                        index.loadView({
                            menuId: r.href,
                            menuPath: config.viewPath + hashPath + index.getViewSuffix(hashPath),
                            menuName: data.name,
                            id:data.id
                        });
                    });
                }
                if (data.children) {
                    index.regRouter(data.children);
                }
            });
        },
        // 路由加载组件
        loadView: function (param) {
            var menuId = param.menuId;  // 完整的hash地址
            var menuPath = param.menuPath;  // 组件的路径
            var menuName = param.menuName;  // tab标题
            var id = param.id;
            var hashPath = index.getHashPath('#' + menuId);  // hash路径不带参数
            var contentDom = bodyDOM ;
            index.activeNav(id,hashPath);  // 设置导航栏选中
            index.renderView(menuPath, contentDom); // 渲染内容页面
        },
        //设置导航选中与左侧目录选中
        activeNav:function(id,hashPath){
            var res = config.getPortalResource();
            var parents = [];
            $.each(res,function(i,d){
                if(d.url=='#'+hashPath){
                    parents = admin.util.getParent(res,d.id);
                    return false;
                }
            })
            var curId = parents.length?parents[0].id:'';
            $('#'+curId).parent().siblings('.top-menu-item').removeClass('top-menu-item-cur');
            $('#'+curId).parent().addClass('top-menu-item-cur');
            // //头部导航选中
            // $('.layui-nav .layui-nav-item .layui-nav-child dd.layui-this').removeClass('layui-this');
            // $('.layui-nav .layui-nav-item .layui-this').removeClass('layui-this');
            // $('.layui-nav a[href="#' + url + '"]').parent().addClass('layui-this');
            // var jo = config.getSideMenus();
            // if(jo.children&&jo.children.length>0)$('#'+jo.id).parent().addClass('layui-this');//顶部导航二级菜单
            // //左侧目录选中
            // $('.layui-tree dd a').removeClass('active');
            // if($('.site-tree').is(':visible'))$('#'+id).addClass('active');
        },
        // 异步加载子页面
        renderView: function (url, contentDom,loadingDOM) {
            layer.closeAll();
            var $contentDom = $(contentDom);
            $contentDom.html('');
            $(bannerDOM+'>.layui-container').hide();
            !loadingDOM && (loadingDOM = $contentDom.parent());
            admin.showLoading({elem: loadingDOM, size: ''});
            $contentDom.load(url, function (r) {
                if($('.layui-side').is(":visible")){
                    var iW = $('.layui-side').width();
                    var container = $('.layui-body>.section-page>.section>.layui-container');
                    var iLeft = ($(window).width()-1170)/2;
                    container.css('margin-left',iLeft+iW+20);
                    container.css('width',1170-iW);
                    $('.layui-side').css('left',iLeft);
                }
                // setTimeout(function(){
                //     if($(bannerDOM).is(":visible")&&$(bannerDOM).scrollTop>300&&!$(bannerDOM).find('.layui-input'))$('html,body').animate({scrollTop:300}, 100);
                // },200)
                
                admin.removeLoading(loadingDOM);
            });
        },
        // 加载主页
        loadHome: function (param) {
            var menuId = param.url;
            var menuName = param.name;
            // 加载主页
            homeUrl = menuId.substring(1);
            index.regRouter([param]);
            
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
        }
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

    exports('indexPortal', index);
});
