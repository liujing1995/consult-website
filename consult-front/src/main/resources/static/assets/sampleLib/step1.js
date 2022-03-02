layui.use(['form', 'table', 'util', 'config', 'admin', 'laydate', 'formSelects', 'layedit','iconPicker','xmSelect','cascader', 'tagsInput', 'treeSelect', 'step'], function () {
    var table = layui.table;
    var layer = layui.layer;
    var admin = layui.admin;
    var form = layui.form;
    var laydate = layui.laydate;
    var $ = layui.jquery;
    var iconPicker = layui.iconPicker;
    var layedit = layui.layedit;
    var xmSelect = layui.xmSelect;
    var cascader = layui.cascader;
    var config = layui.config;
    var treeSelect = layui.treeSelect;
    var step = layui.step;

    var annotateTypeSelector;
    var labelSelect = null;

    // 读取传递给弹出层的数据, 赋值到 form 中
    let receiveData = null;

    let setting = {
        check: {enable: false},
        data: {
            simpleData: {
                enable: true,
                idKey : "id",//节点数据中保存唯一标识的属性名称。[setting.data.simpleData.enable = true 时生效]
                pIdKey : "pid",
            },
            key :{
                name:"name",
                url:""
            }
        },
        async:{
            headers:config.getAjaxHeadersJo()
        },
        callback:{
            beforeClick:zTreeBeforeClick
        }
    };

    function zTreeBeforeClick(treeId, treeNode, clickFlag) {
        if(undefined != treeNode.children && treeNode.children.length != 0){
            admin.error("只能选择末级目录")
            return false;
        }
    };

    treeSelect.render({
        // 选择器
        elem: '#res-select-tree',
        // 数据
        data:config.base_server+ config.ms_samplelib_api+'bizClassification/findOnes?type=1',
        // 异步加载方式：get/post，默认get
        type: 'get',
        search: true,
        headers: config.getAjaxHeadersJo(),
        zSetting:setting,
        style: {
            folder: {
                enable: true
            },
            line: {
                enable: true
            }
        },
        // 占位符
        placeholder: '请选择末级资源目录',
        // 点击回调
        click: function(d){
            $('#bizClsId').val(d.current.id);
        },
        // 加载完成后的回调函数
        success: function (d) {
            layer.closeAll('loading');
            $('#sampleLib-form').attr('method', 'POST');
            if (receiveData) {
                form.val('sampleLib-form', receiveData);
                if(receiveData.icon){
                    iconPicker.checkIcon('iconPicker', receiveData.icon);
                }
            }
            let bizClsId = $('#bizClsId').val();
            if(admin.util.isNotNullOrEmpty(bizClsId)) {
                treeSelect.checkNode('res-select-tree',bizClsId);
            }
            if(receiveData && receiveData.tagsList){
                let tags = receiveData.tagsList;
                let labelValue = [];
                for(let i in tags){
                    labelValue.push({name:tags[i].labelName, value:tags[i].id})
                }
                labelSelect.setValue(labelValue);
            }
            // if(!receiveData || !receiveData.icon){
            //     // iconPicker.checkIcon('iconPicker', 'layui-icon-rate-half');
            // }
            form.render();  //菜单渲染 把内容加载进去
        }
    });
    // 初始化加载
    $(function () {
        $('#preDealOper').hide();
        $('#preDealSel').hide();
        initAnnotateTypeSelector();
        //加载标签
        initLabels();
        initPicker();
        form.render();
        // if(receiveData && receiveData.annotateLabels){
        //     $('#annotate-labels').importTags(receiveData.annotateLabels);
        // }
        // if(receiveData && receiveData.connectionLabels){
        //     $('#connection-labels').importTags(receiveData.connectionLabels);
        // }
        // $('#annotate-labels').tagsInput();
        // $('#connection-labels').tagsInput();
    });
    function initPicker(){
        iconPicker.render({
            // 选择器，推荐使用input
            elem: '#iconPicker',
            // 数据类型：fontClass/unicode，推荐使用fontClass
            type: 'fontClass',
            // 是否开启搜索：true/false
            search: true,
            // 是否开启分页：true/false，默认true
            page: true,
            // 每页显示数量，默认12
            limit: 12,
            // 点击回调
            click: function (data) {
                $("#iconPicker").val(data.icon);
            }
        });
    }

    // 初始化标注类型级联选择框
    function initAnnotateTypeSelector() {
        annotateTypeSelector = cascader.render({
            elem: '#annotate-type-select',
            data: [
                {label: '文本', value: 1, children: [
                        {label: '文本分类', value: 11},
                        {label: '文本实体提取', value: 12},
                        {label: '三元组提取', value: 13},
                        // {label: '通用文本实体提取', value: 14},
                    ]},
                {label: '图像', value: 2, children: [
                        {label: '图像目标检测', value: 21},
                        {label: '图像分类', value: 22},
                        // {label: '图像相似度计算', value: 23},
                    ]},
                {label: '语音', value: 3, children: [
                        {label: '语音转文字', value: 31},
                        {label: '文字转语音', value: 32},
                        {label: '语音合成', value: 33},
                    ]}
                // ,
                // {label: '视频', value: 4, children: [
                //         {label: '视频分类', value: 41},
                //         {label: '视频切图', value: 42},
                //         {label: '视频识别', value: 43},
                //     ]}
            ],
            onChange:function (values, data) {
                if(values && values[0] == 2){
                    $('#preDealOper').show();
                }else {
                    $('#preDealOper').hide();
                    $('#preDealSel').hide();
                }
            }
        });
        if(receiveData){
            annotateTypeSelector.setValue(receiveData.annotateTypeFull);
        }
    }

    // 表单提交
    form.on('submit(validateBtn)', function (data) {
        saveSampleLibData();
    });

    // 下一步点击
    $('#sampleLibSaveBtn').click(function () {
        document.getElementById("validateBtn").click();
    });

    function saveSampleLibData(){
        var formData = {}
        var t = $('#sampleLib-form [name]').serializeArray();
        $.each(t, function() {
            formData[this.name] = this.value;
        });
        let url = config.ms_samplelib_api + 'sampleLib/save';
        // let formData = data.field;

        //获取标签的值
        let labelIds = [];
        let labelNames = [];
        let labels = labelSelect.getValue();
        for(let i in labels){
            labelIds.push(labels[i].value);
            labelNames.push(labels[i].name);
        }
        let anntypes = annotateTypeSelector.getValue().split(',')
        formData.annotateTypeFull = annotateTypeSelector.getValue();
        formData.annotateTypeCn = annotateTypeSelector.getLabel();
        formData.annotateType = anntypes[anntypes.length - 1].trim();
        formData.labelIds = labelIds.toString();
        formData.labelNames = labelNames.toString();

        var that = this;
        layer.load(2);
        admin.req(url, formData, function (response) {
            layer.closeAll('loading');
            if (response.code === 0) {
                layer.msg('保存成功');
                step.next('#stepForm');
                $('#id').val(response.data.id);
                stepUploader.testData = response.data;
                admin.putTempData("sampleLibCreate", response.data);
            } else {
                admin.error(response.msg);
            }
        }, 'POST');
    }

    // 初始化标签选择（基于xmSelect控件）
    function initLabels() {
        admin.req(config.ms_samplelib_api + 'tag/list', {}, function (response) {
            if (response.code === 0) {
                let data = response.data;
                let data4select = [];
                for (var i in data) {
                    data4select.push({value: data[i].id, name: data[i].labelName})
                }

                labelSelect = xmSelect.render({
                    el: '#selectLabels',
                    tips: '请选择标签（若不存在则输入后，勾选自动增加）',
                    filterable: true,
                    autoRow: true,
                    size: 'mini',
                    height: '360px',
                    data: data4select,
                    direction: 'down',
                    initValue: [],
                    paging: true,
                    pageSize: 10,
                    on: function(sArr){

                    },
                    create: function(val, arr){
                        if(null == arr || arr.length==0){
                            //返回一个创建成功的对象, val是搜索的数据, arr是搜索后的当前页面数据
                            return {
                                name: val,
                                value: 'new_'+val
                            }
                        }else {
                            var exist = false;
                            for(var i=0;i<arr.length;i++){
                                if(arr[i].name == val){
                                    exist = true;
                                }
                            }
                            if(!exist){
                                return {
                                    name: val,
                                    value: 'new_'+val
                                }
                            }
                        }

                    }

                })
            } else {
                admin.error(response.msg);
            }
        }, 'GET')
    }


});

