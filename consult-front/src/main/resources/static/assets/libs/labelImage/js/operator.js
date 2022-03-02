layui.config({
	version: true,   // 更新组件缓存，设为true不缓存，也可以设一个固定值
	base: '/assets/module/'
}).use(['config', 'layer', 'admin','laytpl','element'], function () {
	var admin = layui.admin;
	var config = layui.config;
	var laytpl = layui.laytpl;
	var element = layui.element;

	// 设置画布初始属性
	const canvasMain = document.querySelector('.canvasMain');
	const canvas = document.getElementById('canvas');
	const resultGroup = document.querySelector('.resultGroup');

	// 设置画布宽高背景色
	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;
	canvas.style.background = "#8c919c";

	const annotate = new LabelImage({
		canvas: canvas,
		scaleCanvas: document.querySelector('.scaleCanvas'),
		scalePanel: document.querySelector('.scalePanel'),
		annotateState: document.querySelector('.annotateState'),
		canvasMain: canvasMain,
		resultGroup: resultGroup,
		crossLine: document.querySelector('.crossLine'),
		labelShower: document.querySelector('.labelShower'),
		screenShot: document.querySelector('.screenShot'),
		screenFull: document.querySelector('.screenFull'),
		colorHex: document.querySelector('#colorHex'),
		toolTagsManager: document.querySelector('.toolTagsManager'),
		// historyGroup: document.querySelector('.historyGroup')
	});

	// 初始化交互操作节点
	const prevBtn = document.querySelector('.pagePrev');                    // 上一张
	const nextBtn = document.querySelector('.pageNext');                    // 下一张
	const taskName = document.querySelector('.fileName');                   // 标注任务名称
	const processIndex = document.querySelector('.processIndex');           // 当前标注进度
	const processSum = document.querySelector('.processSum');               // 当前标注任务总数
	const tipsBtn = document.querySelector('.tips');               			// 提示按钮
	const tipsCloseBtn = document.querySelector('.closeTipsManage');        // 提示关闭按钮
	const optTips = document.querySelector('.optTips');        				// 提示框

	let imgFiles = [];      //选择上传的文件数据集
	let currentData = {};   //当前数据
	let imgIndex = 1;       //标定图片默认下标;
	let imgSum = 0;         // 选择图片总数;

	var params = admin.getLayerData();
	var sampleLibId = params.sampleLibId;   //样本集id
	var sampleDataId = params.sampleDataId;
	let annotateTaskSpec = admin.getLayerData().annotateTaskSpec;//标注或者校核任务
	var editMode = typeof(params.editMode)=='boolean'?params.editMode:true;  //是否为编辑模式
	var approveMode = typeof(params.approveMode)=='boolean'?params.approveMode:false;  //是否为审核模式
	var teamEdit = typeof(params.teamEdit)=='boolean'?params.teamEdit:false;  //是否为团队编辑模式
	var qualityCtrl = typeof(params.qualityCtrl)=='boolean'?params.qualityCtrl:false;  //是否为质检模式
	var checkCtrl = typeof(params.checkCtrl)=='boolean'?params.checkCtrl:false;  //是否为验收模式
	var teamParam = params.teamParam;  //是否为团队编辑请求参数
	var approveStatus = '';//审批状态
	var annotated = false;//是否标注
	var activeName = "";//质检tab名称
	var dataURL = 'sampleLib/poplarData';
	var saveURL = 'sampleData/poplarSave';
	var tabList = [{name:'未标注',type:'unAnnotated'},{name:'已标注',type:'annotated'},{name: '未通过', type: 'qcUnPass'}];
	var changeFlag = false;


	// 初始化
	function init() {
		console.log("2222222222222222222222222")
		tipsBtn.onclick();
		qualityCtrl = config.getTempData('indexgo-poplar-qc');
		if(qualityCtrl){
			setUnEditMode();
			$('.historyContent').removeClass('layui-hide');
			tabList = [{name:'质检列表',type:'qcList'},{name:'质检通过',type:'qcPass'},{name:'质检不通过',type:'qcUnPass'}];
			initApproveBtn();
			config.putTempData('indexgo-poplar-qc', null);
		}
		if(teamEdit||approveMode){
			dataURL = 'labelTask/getPoplarTaskData';
			saveURL = 'labelTask/poplarSave';
			if(teamEdit){
				tabList = [{name:'未标注',type:'unAnnotated'},{name:'已标注',type:'annotated'},{name:'已审核',type:'approved'},{name:'已退回',type:'noPass'}]
			}else{
				setUnEditMode();
				$('.historyContent').removeClass('layui-hide');
				tabList = [{name:'未审核',type:'unApprove'},{name:'已审核',type:'approved'}];
				initApproveBtn();
			}
		}
		if(!editMode){
			setUnEditMode();
		}else{
			try {annotate.Nodes.crossLine.click();} catch (e) {}
		}
		$('#pSwitch').bind('keypress',function(event){
			if(event.keyCode == "13"){
				let pi = $('#pSwitch').val();
				if(parseInt(pi) > parseInt(processSum.innerText)){
					admin.error('跳转页数不能超过总页数!');
				}else {
					imgIndex = parseInt(pi);
					selectImage(imgIndex - 1);
				}
			}
		});

		initCheckBtn();
		initTab();

		$('.toolRect').click();
		console.log(123)
		annotate.SetFeatures('rectOn', true);

		selectImage(0);
	}

	function initCheckBtn(){
		//console.log("3333333333333333333333333")
		if(checkCtrl){
			$('#checkCtlPass').show();
			$('#checkCtlNoPass').show();
			$('#checkCtlPass').click(function(){
				alert('checkCtlPass')
			})
			$('#checkCtlNoPass').click(function(){
				alert('checkCtlNoPass')
			})
		}else{
			$('#checkCtlPass').hide();
			$('#checkCtlNoPass').hide();
		}
	}

	//初始化选项卡
	function initTab(){
		//console.log("444444444444444444444")
		laytpl(tabTpl.innerHTML).render(tabList, function (html) {
			$('#divTabWrap').html(html);
			setTabReqParam(tabList[0].type);
			element.on('tab(tabBrief)', function(data){
				if('qcUnPass' == tabList[data.index].type && !qualityCtrl){
					$('.historyContent').removeClass('layui-hide');
					$('#appBtn').hide()
				}else if('unAnnotated' == tabList[data.index].type || 'annotated' == tabList[data.index].type){
					$('.historyContent').addClass('layui-hide');
				}
				imgIndex = 1;
				var sType = $(this).attr('sType');
				setTabReqParam(sType);
				selectImage(0);
			});
		})
	}

	//设置选项卡请求参数
	function setTabReqParam(sType){
		activeName = sType;
		annotated = sType != 'unAnnotated';
		if(teamEdit||approveMode) approveStatus = sType == 'unApprove'?0:(sType == 'approved'?1:(sType == 'noPass'?2:''))
	}

	//初始化审批按钮
	function initApproveBtn(){
		$('#divCheckWrap .layui-btn').click(function(){
			var qualityUrl = 'sampleData/qualityOper';
			var data = {};
			var approveStatus = $(this).attr('approveStatus');
			data.qualityNopassMsg = $(this).parent().prev().children('.layui-textarea').val();
			data.sampleDataId = currentData.id;
			data.sampleLibId = sampleLibId;
			if(approveStatus == '1'){
				data.operType = 'pass';
			} else if(approveStatus == '2'){
				data.operType = 'unpass';
			} else if(approveStatus == '3'){
				data.operType = 'allpass';
			}
			if(approveStatus == '2' && !data.qualityNopassMsg){
				admin.error('请输入不通过意见');
				return false;
			}
			admin.req(config.ms_samplelib_api + qualityUrl, data, function (res) {
				if(res.code == 0){
					admin.success('操作成功');
					selectImage(0);
				} else {
					admin.error('操作失败');
				}

			}, 'POST')
		})
	}


	function setUnEditMode(){
		annotate.SetFeatures('editOn', false);
		$('.assistFeatures').hide();
		$('.separator').hide();
		$('.toolRect').hide();
		$('.toolPolygon').hide();

		$('.headEdit').hide();
		$('.headDelete').hide();
	}

	//切换操作选项卡
	let tool = document.getElementById('tools');
	tool.addEventListener('click', function(e) {
		for (let i=0; i<tool.children.length; i++) {
			tool.children[i].classList.remove('focus');
		}
		e.target.classList.add('focus');
		switch(true) {
			case e.target.className.indexOf('toolDrag') > -1:  // 拖拽
				annotate.SetFeatures('dragOn', true);
				break;
			case e.target.className.indexOf('toolSelect') > -1:  // 选择
				annotate.SetFeatures('selectOn', true);
				break;
			case e.target.className.indexOf('toolRect') > -1:  // 矩形
				annotate.SetFeatures('rectOn', true);
				break;
			case e.target.className.indexOf('toolPolygon') > -1:  // 多边形
				annotate.SetFeatures('polygonOn', true);
				break;
			case e.target.className.indexOf('toolTagsManager') > -1:  // 标签管理工具
				annotate.SetFeatures('tagsOn', true);
				break;
			default:
				break;
		}
	});

	tipsBtn.onclick =function(){
		optTips.classList.add('focus');
	}

	tipsCloseBtn.onclick =function(){
		optTips.classList.remove('focus');
	}

	// 获取下一张图片
	nextBtn.onclick = function() {
		if(annotate.Features.editOn&&annotate.Arrays.imageAnnotateMemory&&annotate.Arrays.imageAnnotateMemory.length)saveRecord(true);
		if(processSum.innerText == "0"){
			layui.layer.msg("已经没有需要标注的任务数",{icon:0});
			return;
		}

		if (imgIndex >= imgSum) {
			imgIndex = 1;
			selectImage(0);
		} else if(changeFlag){
			selectImage(imgIndex-1);
			changeFlag = false;
		} else {
			imgIndex++;
			selectImage(imgIndex - 1);
		}
	};

	// 获取上一张图片
	prevBtn.onclick = function() {
		if(annotate.Features.editOn&&annotate.Arrays.imageAnnotateMemory&&annotate.Arrays.imageAnnotateMemory.length)saveRecord(true);
		if (imgIndex === 1) {
			if(processSum.innerText == "0"){
				layui.layer.msg("已经没有需要标注的任务数",{icon:0});
				return;
			}
			imgIndex = imgSum;
			selectImage(imgSum - 1);
		} else if(changeFlag){
			selectImage(imgIndex-1);
			changeFlag = false;
		} else {
			imgIndex--;
			selectImage(imgIndex - 1);
		}
	};

	//快捷键定义
	$(document).keydown(function(event){
		if(event.keyCode==37){
			//左，上一页
			prevBtn.click();
		}else if(event.keyCode==39){
			//右，下一页
			nextBtn.click();
		}else if(event.keyCode==27){
			//esc
			//annotate.SetFeatures('dragOn', true);
			$('.toolDrag').click();
		}else if(event.keyCode==78){
			$('.toolRect').click();
		}else if(event.keyCode==77){
			$('.toolPolygon').click();
		}else if(event.keyCode==83){
			$('.save').click();
		}
	});

	//保存按钮
	$('.save').click(function() {
		saveRecord();
		$('.toolRect').click();
	});
	//智能标注按钮
	$('.aiLabel').click(function() {
		admin.popupCenter({
			title: '选择业务单元',
			type:2,
			area: ['600px','500px'],
			content: '/components/sampleLib/modelSelect.html',
			finish: function (res) {
				if(res&&res.length){
					var jo = {};
					jo.modelId = res[0].id;
					jo.sampleLibId = sampleLibId;
					jo.sampleDataId = currentData.id;
					admin.showLoading($('#LabelImage'),1,0.6);
					admin.req(layui.config.ms_bsd_api+'sampleLib/smartPoplar',jo,function(res){
						admin.removeLoading($('#LabelImage'));
						initImage(res.data);
					},"post")
				}
			}
		});
	});

	function selectImage(index) {
		console.log("6666")
		// openBox('#loading', true);
		var reqParam = {annotated:annotated,currentPage:index+1,pageSize:1,sampleLibId:sampleLibId,sampleDataId:sampleDataId,
			annotateTaskSpec:annotateTaskSpec, activeName:activeName,name:123};
		// if(teamEdit||approveMode){
		// 	reqParam.approveStatus = approveStatus;
		// 	if(teamEdit)$.extend(true,reqParam,teamParam);
		// }
		 console.log("==============>"+config.ms_samplelib_api)



		// admin.req(config.ms_samplelib_api+'sampleLib/poplarData', reqParam, function (res) {
		// 	if(res.code===0){
		// 		imgSum = res.count;
		// 		processSum.innerText = imgSum;
		// 		processIndex.innerText = imgIndex;
		// 		if(res.data.length){
		// 			$('.scaleBox').show();
		// 			taskName.innerText = res.data[0].name;
		// 			taskName.title = res.data[0].name;
		// 			initImage(res.data[0]);
		// 			$('#qualityNopassMsg').val(res.data[0].qualityNopassMsg);
		// 		}else{
		// 			taskName.innerText = '';
		// 			try {
		// 				$('#qualityNopassMsg').val('');
		// 				$('.scaleBox').hide();
		// 				$('.resultGroup').html('');
		// 				annotate.Nodes.bCanvas=null;
		// 				annotate.UpdateCanvas();
		// 			} catch (e) {}
		//
		// 			openBox('#loading', false);
		// 		}
		// 	}
		// })

		console.log("------->>>>"+config.base_server + config.ms_samplelib_api)
		admin.ajax({
			url: 'http://localhost:8000/sgai-gateway/sgai-samplelib/sampleLib/poplarData',
			data: reqParam,
			type: 'GET',
			dataType: 'json',
			contentType: typeof(contentType) === 'undefined'?"application/x-www-form-urlencoded":contentType,
			success: function (res) {
				if(res.code===0){
					imgSum = res.count;
					processSum.innerText = imgSum;
					processIndex.innerText = imgIndex;
					if(res.data.length){
						$('.scaleBox').show();
						taskName.innerText = res.data[0].name;
						taskName.title = res.data[0].name;
						initImage(res.data[0]);
						$('#qualityNopassMsg').val(res.data[0].qualityNopassMsg);
					}else{
						taskName.innerText = '';
						try {
							$('#qualityNopassMsg').val('');
							$('.scaleBox').hide();
							$('.resultGroup').html('');
							annotate.Nodes.bCanvas=null;
							annotate.UpdateCanvas();
						} catch (e) {}

						openBox('#loading', false);
					}
				}

			}
		});
	}


	function initImage(data){
		console.log("55555555")
		data.imgURL ='http://localhost:8000/sgai-gateway/sgai-samplelib/sampleData/downloadFile/'+data.attachmentId;
		currentData = data;
		let content = currentData.imageLabels;
		//格式化content
		var arr=[];
		$(content).each(function(i,d){
			for(var key in d){
				try {d[key]=JSON.parse(d[key])} catch (e) {}
			}
			d.id = guid();
		})
		let img = currentData.imgURL;
		content&&content.length ? annotate.SetImage(img, content) : annotate.SetImage(img);
	}

	//---生成唯一id
	function guid(){
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			var r = Math.random() * 16 | 0,
				v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}

	window.saveRecord  = function(noFeeling) {
		if(admin.util.isNullOrEmpty(currentData.imageDesc)){
			//设置图片的附属信息
			var jo = {};
			jo.path = currentData.name+'.'+currentData.suffix;
			jo.folder = 'JPEGImages';
			jo.filename = currentData.name+'.'+currentData.suffix;
			jo.size = {depth:3,width:annotate.iWidth,height:annotate.iHeight};
			jo.source = {database:'Unknown'};
			jo.segmented = '0';
			currentData.imageDesc = jo;
		}
		//设置标注的默认属性
		$(annotate.Arrays.imageAnnotateMemory).each(function(i,d){
			d.pose = d.pose || 'Unspecified';
			d.truncated = d.truncated || 0;
			d.difficult = d.difficult || 0;
		})
		currentData.imageLabels = annotate.Arrays.imageAnnotateMemory;
		// admin.req(config.ms_samplelib_api+'sampleData/poplarSave', {jsonData:JSON.stringify(currentData)}, function (response) {
		// 	if(!noFeeling){
		// 		if(response.code==0){
		// 			admin.success('保存成功');
		// 			if((currentData.imageLabels.length>0 && activeName == 'unAnnotated') || (currentData.imageLabels.length==0 && activeName == 'annotated')){
		// 				changeFlag = true;
		// 			}
		// 		}else{
		// 			admin.error(response.msg);
		// 		}
		// 	}
		// }, 'POST')
		admin.ajax({
			url: 'http://localhost:8000/sgai-gateway/sgai-samplelib/sampleData/poplarSave',
			data: {jsonData:JSON.stringify(currentData)},
			type: 'POST',
			dataType: 'json',
			contentType: typeof(contentType) === 'undefined'?"application/x-www-form-urlencoded":contentType,
			success: function (response) {
				if(!noFeeling){
					if(response.code==0){
						admin.success('保存成功');
						if((currentData.imageLabels.length>0 && activeName == 'unAnnotated') || (currentData.imageLabels.length==0 && activeName == 'annotated')){
							changeFlag = true;
						}
					}else{
						admin.error(response.msg);
					}
				}
			}
		});
	}

	window.colorRgb = function (value) {
		// 16进制颜色值的正则
		var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
		// 把颜色值变成小写
		var color = value.toLowerCase();
		if (reg.test(color)) {
			// 如果只有三位的值，需变成六位，如：#fff => #ffffff
			if (color.length === 4) {
				var colorNew = "#";
				for (var i = 1; i < 4; i += 1) {
					colorNew += color.slice(i, i + 1).concat(color.slice(i, i + 1));
				}
				color = colorNew;
			}
			// 处理六位的颜色值，转为RGB
			var colorChange = [];
			for (var i = 1; i < 7; i += 2) {
				colorChange.push(parseInt("0x" + color.slice(i, i + 2)));
			}
			return "RGB(" + colorChange.join(",") + ")";
		} else {
			return color;
		}
	};

	//弹出框
	window.openBox = function(e, isOpen) {
		let el = document.querySelector(e);
		let maskBox = document.querySelector('.mask_box');
		if (isOpen) {
			maskBox.style.display = "block";
			el.style.display = "block";
		}
		else {
			maskBox.style.display = "none";
			el.style.display = "none";
		}
	}

	//获取标签
	window.getLabels = function(){
		//适配格式{labelName: "a", labelColor: "#ff0000", labelColorR: "255", labelColorG: "0", labelColorB: "0"}
		var arr = [];
		$(currentData.labelCategories).each(function(i,d){
			var jo = {};
			jo.id = d.id;
			jo.labelName = d.text;
			jo.labelColor = d.color||'#ff0000';
			//jo.labelColor = '#ff0000';
			var rgb = ['255','0','0']
			if(d.color)rgb = colorRgb(d.color).substring(4,colorRgb(d.color).lastIndexOf(')')).split(',');
			jo.labelColorR = rgb[0];
			jo.labelColorG = rgb[1];
			jo.labelColorB = rgb[2];
			arr.push(jo);
		})
		return arr;
	}

	init();
})