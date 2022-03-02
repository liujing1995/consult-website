new Vue({
    el: '#step2'
})
layui.use(['element', 'table', 'index', 'admin', 'config', 'laytpl', 'laypage', 'form', 'util', 'rate', 'colorpicker','step'], function () {
    var $ = layui.jquery;
    var index = layui.index;
    var table = layui.table;
    var admin = layui.admin;
    var config = layui.config;
    var laytpl = layui.laytpl;
    var element = layui.element;
    var laypage = layui.laypage;
    var form = layui.form;
    var util = layui.util;
    var rate = layui.rate;
    var colorpicker = layui.colorpicker;
    var step = layui.step;

    var selectLabelGroupId = "";


    init();

    function init() {
        initLabelGroup();
        renderLabelTable([]);
    }

    $('#getCheckedData').click(function () {
        var dataList = getDataList("grid");//table的id
        var newDataList = dataList.concat({
            id: '',
            categoryType: 0,
            color: '#1efffc',
            labelName: '',
            borderColor: '#1efffc',
            text:'',
            sort:'99',
            edit: true
        });
        renderLabelTable(newDataList);
    });

    $('#labelGroupAdd').click(function () {
        showForm();
    })

    $('#labelGroupEdit').click(function () {
        var labelGroupSelected = $('.cate-this')
        if(labelGroupSelected && labelGroupSelected.length > 0){
            var id = $(labelGroupSelected).attr('id');
            var url = config.ms_samplelib_api + 'labelGroup/' + id;
            admin.req(url, {}, function(response){
                if(response.code === 0){
                    var data = response.data;
                    showForm(data);
                }else{
                    admin.error(response.msg);
                }
            }, 'GET');
            // layer.alert(id);
            // showForm(data);
        }else{
            layer.alert('请选择模板')
        }
    })
    $('#labelGroupDelete').click(function () {
        var labelGroupSelected = $('.cate-this')
        if(labelGroupSelected && labelGroupSelected.length > 0){
            var id = $(labelGroupSelected).attr('id')
            layer.confirm('确定要删除吗？', function (i) {
                layer.close(i);
                layer.load(2);
                var url = config.ms_samplelib_api + 'labelGroup/deleteByGroupId';
                admin.req(url, {"id":id}, function(response){
                    layer.closeAll('loading');
                    if(response.code === 0){
                        admin.success(response.msg);
                        initLabelGroup();
                        renderLabelTable([]);
                    }else{
                        admin.error(response.msg);
                    }
                }, 'GET');
            });
        }
    })

    // 初始化分类
    function initLabelGroup() {
        var url = config.ms_samplelib_api + 'labelGroup/findAll'
        admin.req(url, {}, function (response) {
            if (response.code === 0) {
                laytpl(dataSetListSideNavTpl.innerHTML).render(response, function (html) {
                    $('#dataSetListSideNav').html(html);
                });
                $('.step2-left-tree li').hover(function(){
                    $(this).addClass("on");
                },function(){
                    $(this).removeClass("on");
                });

                $('.step2-left-tree li').click(function () {
                    $('.cate-this').removeClass('cate-this');
                    $(this).find('a').addClass('cate-this');
                    selectLabelGroupId = $('.cate-this').attr('id');
                    findLabelListByGroupId(selectLabelGroupId);

                });
            } else {
                admin.error(response.msg);
            }
        }, 'GET');
    }

    // 弹出表单Form
    function showForm(data) {
        var action = data ? '修改' : '新增';
        if(typeof(data) != "undefined") {
            var id = data.id;
        }
        admin.popupCenter({
            title: action + '标签模板',
            area: ['1000px', '700px'],
            data: data,
            url: 'components/labelGroup/form.html',
            end: function(d){
                initLabelGroup();
                findLabelListByGroupId(id);
            }
        });
    }

    function findLabelListByGroupId(id){
        admin.req(config.ms_samplelib_api + 'label/findListByGroupId', {groupId:id}, function(res){
            if(res.code == 0){
                var labelData = [];
                var data = res.data;
                for(var i in data){
                    var row = data[i];
                    labelData.push({
                        id: '',
                        categoryType: row.categoryType,
                        color: row.color,
                        labelName: row.labelName,
                        borderColor: row.borderColor,
                        text:row.text,
                        sort:row.sort,
                        edit: true
                    });
                }
                renderLabelTable(labelData);
            }else {
                admin.error('加载标签失败');
            }
        });
    }

    // 监听修改update到表格中
    form.on('select(testSelect)', function (data) {
        var elem = $(data.elem);
        var trElem = elem.parents('tr');
        var tableData = table.cache['grid'];
        // 更新到表格的缓存数据中，才能在获得选中行等等其他的方法中得到更新之后的值
        tableData[trElem.data('index')][elem.attr('name')] = data.value;
        // 其他的操作看需求 TODO
    });

    function renderLabelTable(jsonData) {
        var cardBodyHeight = $('.layui-card-body').height();
        var tableIns = table.render({
            elem: '#grid',
            height: cardBodyHeight - 200,
            page: false,
            limit: 9999,
            data: jsonData?jsonData:[],
            done: function (res, curr, count) {
                $(".labelName-input").on("change",function(e){
                    //获取input输入的值
                    console.log(e.delegateTarget.value);
                    var value = e.delegateTarget.value;
                    var index = $(this).attr('row-idx')
                    var tableData = table.cache['grid'];
                    // 更新到表格的缓存数据中，才能在获得选中行等等其他的方法中得到更新之后的值
                    tableData[index]['labelName'] = value
                });
                $(".text-input").on("change",function(e){
                    //获取input输入的值
                    console.log(e.delegateTarget.value);
                    var value = e.delegateTarget.value;
                    var index = $(this).attr('row-idx')
                    var tableData = table.cache['grid'];
                    // 更新到表格的缓存数据中，才能在获得选中行等等其他的方法中得到更新之后的值
                    tableData[index]['text'] = value
                });
                $(".sort-input").on("change",function(e){
                    //获取input输入的值
                    console.log(e.delegateTarget.value);
                    var value = e.delegateTarget.value;
                    var index = $(this).attr('row-idx')
                    var tableData = table.cache['grid'];
                    // 更新到表格的缓存数据中，才能在获得选中行等等其他的方法中得到更新之后的值
                    tableData[index]['sort'] = value
                });
                for(var i=0;i<count;i++){
                    var index = i;
                    colorpicker.render({
                        elem: '#colorSelect-' + index
                        ,color: res.data[index].color
                        ,predefine: true // 开启预定义颜色
                        ,colorSelectIndex: index
                        ,done: function(color){
                            console.log(color)
                            var tableData = table.cache['grid'];
                            // 更新到表格的缓存数据中，才能在获得选中行等等其他的方法中得到更新之后的值
                            tableData[this.colorSelectIndex]['color'] = color
                            $('#colorSelectText-' + this.colorSelectIndex).text(color)
                        }
                    });
                    colorpicker.render({
                        elem: '#borderColorSelect-' + index
                        ,color: res.data[index].borderColor
                        ,predefine: true // 开启预定义颜色
                        ,borderColorSelectIndex: index
                        ,done: function(color){
                            console.log(color)
                            var tableData = table.cache['grid'];
                            // 更新到表格的缓存数据中，才能在获得选中行等等其他的方法中得到更新之后的值
                            tableData[this.borderColorSelectIndex]['borderColor'] = color
                            $('#borderColorSelectText-' + this.borderColorSelectIndex).text(color)
                        }
                    });
                }


                var tableElem = this.elem.next('.layui-table-view');
                count || tableElem.find('.layui-table-header').css('overflow', 'auto');
                layui.each(tableElem.find('select'), function (index, item) {
                    var elem = $(item);
                    elem.val(elem.data('value')).parents('div.layui-table-cell').css('overflow', 'visible');
                });
                form.render();
            },
            // size: 'lg',
            cols: [[ //表头
                // {type: 'checkbox'},
                {field: 'color', title: '背景颜色', width: 120,
                    templet: function (d, i) {
                        // 模板的实现方式也是多种多样，这里简单返回固定的
                        return '<div class="colorSelect" id="colorSelect-'+d.LAY_TABLE_INDEX+'"></div>&nbsp;<span id="colorSelectText-'+d.LAY_TABLE_INDEX+'">'+(d.color?d.color:'')+'</span>';
                    }
                },
                {field: 'borderColor', title: '边框颜色', width: 120,
                    templet: function (d, i) {
                        // 模板的实现方式也是多种多样，这里简单返回固定的
                        return '<div class="colorSelect" id="borderColorSelect-'+d.LAY_TABLE_INDEX+'"></div>&nbsp;<span id="borderColorSelectText-'+d.LAY_TABLE_INDEX+'">'+(d.borderColor?d.borderColor:'')+'</span>';
                    }
                },
                {field: 'labelName', title: '英文名', width: 120,
                    templet: function (d, i) {
                        // 模板的实现方式也是多种多样，这里简单返回固定的
                        return '<input row-idx="'+d.LAY_TABLE_INDEX+'" id="labelName-'+d.LAY_TABLE_INDEX+'" class="labelName-input layui-input" type="text" value="'+(d.labelName?d.labelName:'')+'"/>';
                    }
                },
                {field: 'text', title: '标签名', width: 150,
                    templet: function (d, i) {
                        // 模板的实现方式也是多种多样，这里简单返回固定的
                        return '<input row-idx="'+d.LAY_TABLE_INDEX+'" id="text-'+d.LAY_TABLE_INDEX+'" class="text-input layui-input" type="text" value="'+(d.text?d.text:'')+'"/>';
                    }
                },
                {
                    field: 'categoryType',
                    title: '类型',
                    align: 'center',
                    minWidth:120,
                    templet: function (d) {
                        // 模板的实现方式也是多种多样，这里简单返回固定的
                        return '<select name="categoryType" lay-filter="testSelect" '+(d.edit?"":'disabled="disabled"')+' lay-verify="required" data-value="' + d.categoryType + '" >\n' +
                            '        <option value=""></option>\n' +
                            '        <option value="0">普通标签</option>\n' +
                            '        <option value="1">关系标签</option>\n' +
                            '      </select>';
                    }
                },
                {field: 'sort', title: '排序',
                    templet: function (d, i) {
                        // 模板的实现方式也是多种多样，这里简单返回固定的
                        return '<input row-idx="'+d.LAY_TABLE_INDEX+'" id="sort-'+d.LAY_TABLE_INDEX+'" class="sort-input layui-input" type="text" value="'+(d.sort?d.sort:'')+'"/>';
                    }
                },
                {align: 'center', toolbar: '#grid-tablebar', title: '操作', width: 80, fixed: 'right'}
            ]]
        });
    }

    // 列表操作列按钮事件
    table.on('tool(grid)', function (row) {
        var data = row.data;
        var layEvent = row.event;
        if (layEvent === 'del') {
            row.del(); //删除对应行（tr）的DOM结构，并更新缓存
        }
    });

    // 下一步点击
    $('#formStep2').click(function () {
        //获取标签
        var labelList = getDataList("grid");//table的id
        if(labelList.length > 0){
            var labelArr = []
            for(var i = 0; i < labelList.length; i++){
                if(labelList[i].length != 0){
                    labelArr.push(labelList[i]);
                }
            }
            // step.next('#stepForm');
            admin.req(config.ms_samplelib_api + 'label/saveLabelList', {labelGroupId: selectLabelGroupId, labelJson: JSON.stringify(labelArr), sampleLibId: $("#id").val()}, function(res){
                if(res.code == 0){
                    step.next('#stepForm');
                } else {
                    admin.error("保存失败");
                }
            },'POST');
        } else {
            admin.error('请为样本集添加标签');
        }
    });

    /**
     * 获取列表数据
     */
    function getDataList(tableId) {
        if (table.cache[tableId]) {
            return table.cache[tableId];
        }
        return [];
    }
});
