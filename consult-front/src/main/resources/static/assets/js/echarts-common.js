//加载饼状图
function initPieChart(id,title,data){
	var chartData = [];
	var otherCount = 0;
	var totalCount = 0;
	if(data!=undefined){
		for(var i=0;i<data.length;i++){
			if(i<10){
				chartData.push({
					value: data[i].count,
					name: data[i].title
				});
			}else {
				otherCount += data[i].count;
			}
			totalCount += data[i].count;
		}
		if(otherCount>0){
			chartData.push({
				value: otherCount,
				name: '其他'
			});
		}
	}
	var pieChart = echarts.init(document.getElementById(id));
	var pieOption = { //给每个饼图模块添加颜色
		title: {
			text: title,
			textStyle: {
				fontWeight: "bolder",
			},
			left: 'center',
            y: '15',
		},
		tooltip: {
			trigger: 'item',
			formatter: '<!--{a} <br/>-->{b} : {c} ({d}%)'
		},
		series: [ //添加一个模型
			{
				//name: '访问来源',
				type: 'pie', //模型的类型（饼图，柱状图等）
				radius: '55%',//半径
				clockwise: false,//饼图是否顺时针排列
				center: ['50%', '50%'],//圆心的位置
				data: chartData,
				itemStyle: {//鼠标移到图标上的效果
					emphasis: {
						shadowBlur: 10,
						shadowOffsetX: 0,
						shadowColor: '#000000'
					}
				}
			},
			{
				type: 'pie',
				radius: ['57%', '58%'],//异性的饼图的内半径与外半径
				data: [{
					value: totalCount,
					name: '总计'
				}

				]
			}
		]
	};
	pieChart.setOption(pieOption);
}

//纵向柱状图
function initZhuChart(id, title, data){
	var xData = [];
	var yData = [];
    if(data!=undefined){
        for(var i=0;i<data.length;i++){
        	xData.push(data[i].count);
        	yData.push(data[i].title);
        }
    }

    var zhuChart = echarts.init(document.getElementById(id));
    var option = {
        title: {
            text: title,
            textStyle: {
                fontWeight: "bolder",
            },
            x:'10',
            y: '15',
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            left: '0%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            splitLine : {//去掉网格线
                 show : false
            },
     		position: 'top',//X轴位置
            axisLabel : {//坐标轴刻度标签的相关设置
                show: false,
                textStyle: {
                    align: 'right',
                    fontSize: 15
                }
            }
        },
        yAxis: {
            type: 'category',
            data: yData,
            axisLabel:{
                formatter:function(value){
					var tail = "";
					if(value.length>4){
						value = value.substr(0,4);
						tail = "...";
					}
					return value+tail;
                }
            }
        },
        series: [
            {
                name: '访问量',
                type: 'bar',
                data: xData
                ,itemStyle: {
                    normal: {
                        color:'#57A3F2',//柱状的颜色
                        label: {
                            show: true, //开启显示
                            position: 'inside', //在上方显示
                            textStyle: { //数值样式
                                color: 'black',
                                fontSize: 16
                            }
                        }
                    }
                }
            }
        ]
    };
    zhuChart.setOption(option);

}
//环形图
function initPieDoughnut(id, title, data){
	var chartDom = document.getElementById(id);
	var myChart = echarts.init(chartDom);

	var option = {
		// backgroundColor: '#2c343c',
		title: {
			text: title,
			left: '1%',
			top: '2%',
			textStyle: {
				color: 'black'          // 文字颜色
			}
		},
		// color: ['red','blue'],
		color: ['#55d8fe','#f93402'],
		// color: ['rgb(90,177,239)','rgb(25,212,174)'],
		tooltip: {
			trigger: 'item'
		},
		series: [
			{
				name: '标注信息',
				type: 'pie',
				radius: ['40%', '70%'],
				// center: ['-2%', '-20%'],
				// avoidLabelOverlap: false,
				label: {
					show: true,
					position: 'outside'
				},
				emphasis: {
					label: {
						show: true,
						fontSize: '20'
						// fontWeight: 'bold'
					}
				},
				// labelLine: {
				// 	show: false
				// },
				data: data
			}
		]
	};
	myChart.setOption(option);
	return myChart;
}

//折线图
function init_linechart(id, data, title, yscope){
	var chartDom = document.getElementById(id);
	var myChart = echarts.init(chartDom);

	var series_arr = []
	for(var item in data.data){
		console.log(item);
		var dict = {}
		dict['data'] = data.data[item]
		dict['type'] = 'line'
		dict['name'] = item
		series_arr.push(dict)
	}
	console.log(series_arr);

	var option = {
		color: ['#ff8c00','#a3a0fb'],
		title: {
			text: title,
			padding: [8,20,0,10],
		},
		tooltip: {
			trigger: 'axis'
		},
		legend: {
			data: data.title
		},
		grid: {
			left: '3%',
			right: '4%',
			bottom: '3%',
			containLabel: true
		},
		toolbox: {
			feature: {
				saveAsImage: {}
			}
		},
		xAxis: {
			type: 'category',
			boundaryGap: false,
			data: data.date_data
		},
		yAxis: {
			type: 'value',

			// axisLabel: {
			// 	formatter: function(v){
			// 		return  tranNumber(v);
			// 	}
			// }
		},
		dataZoom: [{
			type: 'inside',
			start: 0,
			end: 100
		},{
			start: 0,
			end: 100
		}],
		series: series_arr
	};

	option && myChart.setOption(option);
}

//横向柱状图
function horizontal_histogram(id, keyStr,valueStr, labelsCountStr){
	var chartDom = document.getElementById(id);
	var myChart = echarts.init(chartDom);
	var option = {
		color: ['#55d8fe','#ff8c00'],
		title: {
			text: '标签分布',
			padding: [8,20,0,10],
		},
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: 'shadow'
			}
		},
		legend: {
			data: ['包含标签文档数量', '标签数量'],
			// y: 'center',    //延Y轴居中
			x: 'right', //居右显示
			padding: [25, 15, 0, 0]
		},
		grid: {
			left: '3%',
			right: '4%',
			bottom: '3%',
			containLabel: true
		},
		xAxis: {
			type: 'value',
			// boundaryGap: [0, 0.01],
			minInterval: 1
		},
		yAxis: {
			type: 'category',
			data: keyStr.split(',')
		},
		series: [
			{
				name: '包含标签文档数量',
				type: 'bar',
				data: valueStr.split(',')
			},
			{
				name: '标签数量',
				type: 'bar',
				data: labelsCountStr.split(',')
			}
		]
	};

	option && myChart.setOption(option);
}
