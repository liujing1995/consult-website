/** 业务系统扩展配置，相同参数则覆盖config.js中参数，否则追加 */

layui.define([], function (exports) {
    var bMs = true;//是否为微服务
    var configExtend = {
        contextPath:'/',//前端上下文
        bMs:bMs,//是否为微服务，供系统调用
        version: '313',  // 版本号，模块js和页面加版本号防止缓存
        isolationVersion: '', // 隔离版本
        base_server: bMs?'sgai-gateway/':'/',//上下文地址，生产环境下微服务模式需启用置方向代理 '/csp/'
        ms_auth_api: bMs?'api-auth/':'',//认证中心微服务
        ms_user_api: bMs?'api-user/':'',//用户微服务
        ms_admin_api:bMs?'csp-admin/':'',//admin微服务
        ms_engine_api:bMs?'api-engine/':'',//流程引擎微服务
        ms_generator_api:bMs?'api-generator/':'',//代码生成微服务
        ms_file_api:bMs?'api-file/':'',//文件中心微服务
        ms_mobile_api:bMs?'api-mobile/':'',//移动端微服务
        ms_Interface_api:bMs?'api-integration/':'',//Api服务中心微服务
        ms_metadata_api:bMs?'uds-metadata/':'',//
        ms_run_api:bMs?'sgai-run/':'',//run库微服务
        ms_samplelib_api:bMs?'sgai-samplelib/':'',//样本库微服务
        ms_train_api:bMs?'sgai-train/':'',//训练平台微服务
        ms_modelcenter_api:bMs?'sgai-modelcenter/':'',//模型中心微服务
        ms_video_api:bMs?'sgai-video/':'',//云边协同模型下发微服务


        ms_isc_api:bMs?'isc-api/':'',//ISC微服务   lcz
        ms_modellib_api:bMs?'sgai-modellib/':'',//模型库微服务
        ms_intelliedge_api:bMs?'sgai-intelliedge/':'',//云边协同模型下发微服务
        ms_gateway_api:bMs?'zuul/':'',//网关微服务
        ms_file_onlineview:bMs?'file-online-view/':'',//
        ms_bd_api:bMs?'bd-api/':'',//百度后端api
        isEnableHeartBeat:false,//是否开启前端心跳检测
        isEnableIsc:false,//是否启用isc
        ticket:"",
        iscServerLoginUrl:'http://sgcc.isc.com:22001/isc_sso/login?service=http://127.0.0.1:8000/index.html',// 统一认证地址
        iscServerLogoutUrl:'http://sgcc.isc.com:22001/isc_sso/logout?service=http://127.0.0.1:8000/index.html',// 注销地址
        tableName: 'sgai_web',  // 存储表名
        clientId:'webApp',
        clientSecret:'60b2e0786424a778163ae7644c3aeca1',
        pageTabs: false,   // 是否开启多标签
        openTabCtxMenu: true,   // 是否开启Tab右键菜单
        maxTabNum: 20,  // 最多打开多少个tab
        viewPath: 'components', // 视图位置
        viewSuffix: '.html',  // 视图后缀
        defaultTheme: 'theme-admin',  // 默认主题
        defaultLayout: 'factory', // 默认布局
        reqPutToPost: true,  // req请求put方法变成post
        cacheTab: true,  // 是否记忆Tab
        stripScript:true,//是否开启数据脚本过滤
        isNeedReqPerm:true,//请求是否需要权限判断,默认为true
        appName:"人工智能平台",//系统名称。业务系统可自定义。
        appBootName:"Copyright ©2019 Powered By 人工智能平台",//系统底部描述。业务系统可自定义。
        appVersion:"Version 1.0",//系统版本号。业务系统可自定义。
        /* 角色管理-是否开启内置角色操作权限, 安全测试时需关闭 */
        isEnableInternalRoleOperation: true,
    }

    // 更新组件缓存
    layui.config({
        version: configExtend.version
    });

    exports('configExtend', configExtend);
});
