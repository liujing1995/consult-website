/** EasyWeb spa v3.1.4 date:2019-08-05 License By http://easyweb.vip */

layui.define(['jquery','signUtils','sm','configExtend'], function (exports) {
    var $ = layui.jquery;
    var bMs = false;//是否为微服务
    var signUtils = layui.signUtils;
    var SM = layui.sm;
    var configExtend = layui.configExtend;
    var config = {
        contextPath:'/',//前端上下文
        bMs:bMs,//是否为微服务，供系统调用
        version: '313',  // 版本号，模块js和页面加版本号防止缓存
        isolationVersion: '', // 隔离版本
        base_server: bMs?'http://127.0.0.1:9900/':'/',//上下文地址，生产环境下微服务模式需启用置方向代理 '/csp/'
        ms_auth_api: bMs?'api-auth/':'',//认证中心微服务
        ms_user_api: bMs?'api-user/':'',//用户微服务
        ms_admin_api:bMs?'csp-admin/':'',//admin微服务
        ms_engine_api:bMs?'api-engine/':'',//流程引擎微服务
        ms_generator_api:bMs?'api-generator/':'',//代码生成微服务
        ms_file_api:bMs?'api-file/':'',//文件中心微服务
        ms_mobile_api:bMs?'api-mobile/':'',//移动端微服务
        ms_Interface_api:bMs?'api-integration/':'',//Api服务中心微服务
        ticket:"",
        iscServerLoginUrl:'http://sgcc.isc.com:22001/isc_sso/login?service=http://127.0.0.1:8000/index.html',// 统一认证地址
        iscServerLogoutUrl:'http://sgcc.isc.com:22001/isc_sso/logout?service=http://127.0.0.1:8000/index.html',// 注销地址
        iscLoginEnableRedirect:false,//isc开启后端跳转模式。isc登录页登录>服务端iscLoginAndRedirect>前端首页>调用服务端获取token
        tableName: 'csp_portal',  // 存储表名
        clientId:'webApp',
        clientSecret:'60b2e0786424a778163ae7644c3aeca1',
        pageTabs: false,   // 是否开启多标签
        openTabCtxMenu: true,   // 是否开启Tab右键菜单
        maxTabNum: 20,  // 最多打开多少个tab
        viewPath: 'components', // 视图位置
        viewSuffix: '.html',  // 视图后缀
        defaultTheme: 'theme-admin',  // 默认主题
        defaultLayout: 'side', // 默认布局
        reqPutToPost: true,  // req请求put方法变成post
        cacheTab: true,  // 是否记忆Tab
        stripScript:true,//是否开启数据脚本过滤
        isNeedReqPerm:true,//请求是否需要权限判断,默认为true
        appName:"统一应用开发平台",//系统名称。业务系统可自定义。
        appBootName:"Copyright ©2019 Powered By 统一应用开发平台",//系统底部描述。业务系统可自定义。
        appVersion:"Version 2.1.6",//系统版本号。业务系统可自定义。
        isEnableInit:false,//是否开启重新加密按钮
		appIsSecurityModel:true,//应用管理是否开启安全模式
        isEnableMutex:true,//是否开启互斥按钮可见
        isEnableHeartBeat:true,//是否开启前端心跳检测
        isEnableIsc:false,//是否启用isc
        isEnableBase64:false,//是否使用base64加密client
        isEnableIdCardNoCheck:true,//是否开启身份证唯一验证
        isEnableMobileNoCheck:true,//是否开启手机号唯一验证
        isEnableUserSelectRoleRadio:true,//是否开启用户页面选择角色只能单选
        isEnableInternalRoleOperation: false,//角色管理-是否开启内置角色操作权限
        isEnableSmsVerify:false,//是否开启短信验证，注意：需要服务端同时开启才能使用
        
        //获取登录页
        getLoginPage:function(){
            var cacheSetting = layui.data(config.tableName);
            var loginPage = 'login.html';
            if (cacheSetting && cacheSetting.loginPage) {
                loginPage = cacheSetting.loginPage;
            }
            return loginPage;
        },
        //保存登录页
        putLoginPage: function (loginPageType) {
            var loginPage = 'login'+(loginPageType?loginPageType:'')+'.html';
            layui.data(config.tableName, {
                key: 'loginPage',
                value: loginPage
            });
        },
        //获取布局
        getLayout:function(){
            var layoutType = config.defaultLayout;
            var cacheSetting = layui.data(config.tableName);
            if (cacheSetting && cacheSetting.layoutType) {
                layoutType = cacheSetting.layoutType;
            }
            return layoutType;
        },
         //获取当前主题
         getTheme:function(){
            var theme = config.defaultTheme;
            var cacheSetting = layui.data(config.tableName);
            if (cacheSetting && cacheSetting.theme) {
                theme = cacheSetting.theme;
            }
            return theme;
        },
        //保存当前主题
        putTheme:function(theme){
            layui.data(config.tableName, {
                key: 'theme',
                value: theme
            });
        },
        //保存模式切换状态
        putChangeMode:function(modeChange){
            layui.data(config.tableName, {
                key: 'modeChange',
                value: modeChange
            });
        },
        //是否模式切换（包括布局或者多标签,1:代表切换；0：代表未切换）
        getChangeMode:function(){
            var cacheSetting = layui.data(config.tableName);
            var modeChange = 0;
            if (cacheSetting && cacheSetting.modeChange) {
                modeChange = cacheSetting.modeChange;
            }
            return modeChange;
        },
        //保存资源
        putResource:function(resource){
            layui.data(config.tableName, {
                key: 'resource',
                value: resource
            });
        },
        //获取资源
        getResource:function(){
            var cacheSetting = layui.data(config.tableName);
            var resource = [];
            if (cacheSetting && cacheSetting.resource) {
                resource = cacheSetting.resource;
            }
            return resource;
        },
        //缓存布局
        putLayout:function(layoutType){
            layui.data(config.tableName, {
                key: 'layoutType',
                value: layoutType
            });
        },
        // 获取缓存的publicKey
        getPublicKey: function () {
            var cacheData = layui.data(config.tableName);
            if (cacheData) {
                return cacheData.publicKey;
            }
        },
        // 缓存publicKey
        putPublicKey: function (publicKey) {
            layui.data(config.tableName, {
                key: 'publicKey',
                value: publicKey
            });
        },
        // 获取缓存的privateKey
        getPrivateKey: function () {
            var cacheData = layui.data(config.tableName);
            if (cacheData) {
                return cacheData.privateKey;
            }
        },
        // 缓存PrivateKey
        putPrivateKey: function (privateKey) {
            layui.data(config.tableName, {
                key: 'privateKey',
                value: privateKey
            });
        },
        //设置cookie (本项目cookie仅应用于判断浏览器是否关闭，利用cookie不设置生命周期，随浏览器关闭而销毁)
        setCookie:function(name, value, seconds) {
            seconds = seconds || 0;   //seconds有值就直接赋值，没有为0
            var expires = "";
            if (seconds != 0 ) {     //设置cookie生存时间
                var date = new Date();
                date.setTime(date.getTime()+(seconds*1000));
                expires = "; expires="+date.toGMTString();
            }
            document.cookie = name+"="+escape(value)+expires+"; path=/";   //转码并赋值
        },
        //取得cookie
        getCookie:function(name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');    //把cookie分割成组
            for(var i=0;i < ca.length;i++) {
                var c = ca[i];                      //取得字符串
                while (c.charAt(0)==' ') {          //判断一下字符串有没有前导空格
                    c = c.substring(1,c.length);      //有的话，从第二位开始取
                }
                if (c.indexOf(nameEQ) == 0) {       //如果含有我们要的name
                    return unescape(c.substring(nameEQ.length,c.length));    //解码并截取我们要值
                }
            }
            return false;
        },
        // 获取缓存的token
        getToken: function () {
            var cacheData = layui.data(config.tableName);
            if (cacheData) {
                return cacheData.token;
            }
        },
        // 清除token
        removeToken: function () {
            layui.data(config.tableName, {
                key: 'token',
                remove: true
            });
        },
        // 缓存token
        putToken: function (token) {
            layui.data(config.tableName, {
                key: 'token',
                value: token
            });
        },
        //判断token是否有效
        isEffectiveToken:function(){
            var isEffective = false;
            try {
                var token = config.getToken();
                if(token&&token.expires_in){
                    isEffective = (new Date().getTime() - token.token_createTime)/1000 < token.expires_in-5;
                }
            } catch (e) {}

            return isEffective;
        },
        //token过期处理
        delTokenTimeout:function(param,callback){
                var token = config.getToken();
                var isActive = false;
                if(config.getLastReqTime()&&token&&token.expires_in&&token.refresh_token){
                    isActive = (new Date().getTime() - config.getLastReqTime())/1000 < token.expires_in;
                    //活跃用户刷新token
                    if(isActive){
                        layui.jquery.ajax({
                            url: config.base_server+config.ms_auth_api+'oauth/user/refresh_token',
                            xhrFields: {
                                withCredentials: true
                            },
                            asyn:false,
                            data: {refresh_token:token.refresh_token},
                            type: 'POST',
                            dataType: 'JSON',
                            crossDomain: true == !(document.all),
                            beforeSend: function (xhr) {
                                //var loginHeaders = SM.SG_sm2Encrypt(config.clientId + ":" + config.clientSecret,config.getPublicKey());
                                //xhr.setRequestHeader('Authorization', 'Basic ' +  loginHeaders);
                                xhr.setRequestHeader('Authorization', config.getBasicAuthHeader());
                                //获取签名头部
                                var headers = signUtils.geSignHeadersByClient(config.clientId, config.clientSecret);
                                for (var i = 0; i < headers.length; i++) {
                                    xhr.setRequestHeader(headers[i].name, headers[i].value);
                                }
                            },
                            success: function (res) {
                                // res.data.expires_in = 60;
                                res.data.token_createTime = new Date().getTime();
                                config.putToken(res.data);
                                var headers =  config.doGetAjaxHeaders(param);
                                callback(headers);
                            },
                            error:function(xhr,state,errorThrown){
                            	var errmsg = '刷新token失败';
                            	if(xhr.responseJSON){
                            		errmsg = xhr.responseJSON.msg;
                            	}
                                layer.msg(errmsg, {icon: 2, time: 1500}, function () {
                                    config.jumpToLoginPage();
                                });
                            }
                        })
                    }

                }
                if(!isActive){
                    //销毁token，跳转登录页
                    config.jumpToLoginPage();
                }

        },
        //跳转登录页(iscLogout是否调用isc注销地址)
        jumpToLoginPage:function(iscLogout,isDelay){
            config.removeToken();
            config.removeTempData('indexTabs');
            //延迟退出，系统显示提示信息
            if(isDelay){
              setTimeout(function(){
                location.replace(config.isEnableIsc?(iscLogout?config.iscServerLogoutUrl:config.iscServerLoginUrl):config.contextPath+config.getLoginPage());
              },1500)
            }else{
            	location.replace(config.isEnableIsc?(iscLogout?config.iscServerLogoutUrl:config.iscServerLoginUrl):config.contextPath+config.getLoginPage());
            }
        },
        // 缓存最后请求时间
        putLastReqTime: function (lastReqTime) {
            config.putTempData('lastReqTime',lastReqTime);
        },
        // 获取最后请求时间
        getLastReqTime: function () {
            return config.getTempData('lastReqTime');
        },

        /* 缓存临时数据 仅config内部调用*/
        putTempData: function (key, value) {
            var tableName = config.tableName + '_tempData';
            if (value != undefined && value != null) {
                layui.sessionData(tableName, {key: key, value: value});
            } else {
                layui.sessionData(tableName, {key: key, remove: true});
            }
        },
        /* 获取缓存临时数据 仅config内部调用*/
        getTempData: function (key) {
            var tableName = config.tableName + '_tempData';
            var tempData = layui.sessionData(tableName);
            if (tempData) {
                return tempData[key];
            } else {
                return false;
            }
        },
        removeTempData:function(sKey){
            var tableName = config.tableName + '_tempData';
            layui.sessionData(tableName, {
                key: sKey,
                remove: true
            });
        },
        // 当前登录的用户
        getUser: function () {
            var cacheData = layui.data(config.tableName);
            if (cacheData) {
                return cacheData.login_user;
            }
        },
        // 缓存user
        putUser: function (user) {
            layui.data(config.tableName, {
                key: 'login_user',
                value: user
            });
        },
        // 获取用户所有权限
        getUserAuths: function () {
            var auths = [];
            var permissions = config.getUser().permissions;
            if(permissions&&permissions.length>0){
                for (var i = 0; i < permissions.length; i++) {
                    auths.push(permissions[i]);
                }
            }
            return auths;
        },

        //获取登陆所需认证Header
        getBasicAuthHeader:function(){
        	var plaintext = config.clientId + ":" + config.clientSecret;
        	var result = "";
        	//开启base64加密
        	if(config.isEnableBase64){
        		result = 'Basic ' + window.btoa(plaintext);
        	}
        	//默认sm2加密
        	else{
        		var publicKey = config.getPublicKey();
        		if(null == publicKey || '' == publicKey){
        			layer.msg('获取Header失败,公钥为空！',{icon: 2});
        			return null;
        		}
        		result = 'Basic ' + SM.SG_sm2Encrypt(plaintext,publicKey);
        	}
        	return result;
        },
        // ajax请求的header（对象形式）
        /**
         * param 为请求体，包括
         * 格式如下：
         * { "url" :"" ,"data": {} }
         */
        getAjaxHeadersJo: function (param) {
            var jo = {};
            config.getAjaxHeaders(param,function(headers){
                for(var i=0;i<headers.length;i++){
                    jo[headers[i].name] = headers[i].value;
                }
                return jo;
            });
            return jo;
        },

        // ajax请求的header（数组形式）
        /**
         * param 为请求体，包括
         * 格式如下：
         * { "url" :"" ,"data": {} }
         */
        getAjaxHeaders: function (param,callback) {
            var headers = [];
            if(!config.isEffectiveToken()){
                config.delTokenTimeout(param,callback);
            }else{
                headers =  config.doGetAjaxHeaders(param);
                callback(headers);
            }
        },

        doGetAjaxHeaders:function(param){
            var headers = [];
            var token = config.getToken();
            if (token) {
                var publicKey = config.getPublicKey();
                headers = signUtils.geSignHeadersByToken(token,param);
                headers.push({
                  name: 'Authorization',
                  value: 'Bearer ' + token.access_token
                });
            }
            return headers;
        },
        //过滤请求回来的数据中包含的脚本
        fnStripScript:function(obj){
            try {
                if(typeof(obj)=='string'){
                    try {
                        obj = obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>|<script.*?>|<\/script>/ig, '');
                    } catch (error) {}
                }else if(typeof(obj)=='object'&&Array.isArray(obj)){
                    //数组对象
                    obj.forEach(function(o,i){
                        o = config.fnStripScript(o);
                    })
                }else if(typeof(obj)=='object'&&!Array.isArray(obj)){
                    //json对象
                    for(var key in obj){
                        if(typeof(obj[key])=='string'){
                            try {
                                obj[key] = obj[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>|<script.*?>|<\/script>/ig, '');
                            } catch (error) {}

                        }else if(obj[key]!=null&&typeof(obj[key])=='object'){
                            obj[key] = config.fnStripScript(obj[key]);
                        }
                    }
                }
                return obj;
            } catch (error) {
                return obj;
            }

        },
        // layui组件请求结束后的处理
        layuiAjaxSuccessBefore:function(res){
            if (res.code == 401&&config.isNeedReqPerm) {
            	var errmsg = '登录过期';
            	if(res.data){
            		errmsg = res.data;
            	}
//                layer.msg(errmsg, {icon:2,time:1500},function () {
//                    config.jumpToLoginPage();
//                });
                admin.error(errmsg);
                config.jumpToLoginPage(null,true);
                return false;
            } else if (res.code == 403) {
                layer.msg('没有访问权限', {icon:2,time:1500});
            } else if (res.code == 404) {
                layer.msg('404访问不存在', {icon:2,time:1500});
            }
            //记录最后请求时间，用于判断用户是否活跃
            config.putLastReqTime(new Date().getTime());
            if(config.stripScript)config.fnStripScript(res.data?res.data:res);

            return res;
        },
        // ajax请求结束后的处理，返回false阻止代码执行
        ajaxSuccessBefore: function (res, requestUrl) {
            if (res.code == 401&&config.isNeedReqPerm) {
                config.removeToken();
                var errmsg = '登录过期';
            	if(res.data){
            		errmsg = res.data;
            	}
                layer.msg(errmsg, {icon: 2, time: 1500}, function () {
                    config.jumpToLoginPage();
                });
                return false;
            } else if (res.code == 403) {
                layer.msg('没有访问权限',{icon: 2});
            } else if (res.code == 404) {
                layer.msg('404访问不存在',{icon: 2});
            }
            //记录最后请求时间，用于判断用户是否活跃
            if(requestUrl.indexOf("heartBeat/keep") == -1){
                config.putLastReqTime(new Date().getTime());
            }
            if(config.stripScript)config.fnStripScript(res.data?res.data:res);
            return true;
        }
    };

    $.extend(true,config,configExtend);

    // 更新组件缓存
    layui.config({
        version: config.version
    });

    exports('config', config);
});
