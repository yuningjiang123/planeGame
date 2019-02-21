(function(){
	var red = 'red';
	var yellow = 'GoldenRod';
	var blue = 'Indigo';
	var green = 'ForestGreen';

	var info = [
		{name:'rect',color:green,x:7,y:15,conf:[false,true,false,true,false]},
		{name:'rect',color:red,x:6,y:15,conf:[false,true,true,true,false]},
		{name:'tria',color:yellow,x:6,y:15,conf:['rt',false,true,true]},
		{name:'rect',color:blue,x:4,y:14,conf:[true,false,true,true,true]},
		{name:'rect',color:green,x:4,y:13,conf:[true,false,true,true,true]},
		{name:'tria',color:red,x:6,y:13,conf:['rb',true,false,true]},
		{name:'tria',color:yellow,x:4,y:11,conf:['lt',false,true,true]},
		{name:'rect',color:blue,x:3,y:11,conf:[false,true,true,true,false]},
		{name:'rect',color:green,x:2,y:11,conf:[false,true,true,true,false]},
		{name:'tria',color:red,x:2,y:11,conf:['rt',false,true,true]},
		{name:'rect',color:yellow,x:0,y:10,conf:[true,false,true,true,true]},
		{name:'rect',color:blue,x:0,y:9,conf:[true,false,true,true,true]},
		{name:'course',color:green,x:0,y:8,conf:['r']},//左端跑道
		{name:'rect',color:red,x:0,y:7,conf:[true,false,true,false,true]},
		{name:'rect',color:yellow,x:0,y:6,conf:[true,false,true,true,true]},
		{name:'tria',color:blue,x:2,y:6,conf:['rb',false,true,true]},
		{name:'rect',color:green,x:2,y:4,conf:[false,true,false,true,true]},
		{name:'rect',color:red,x:3,y:4,conf:[false,true,false,true,true]},
		{name:'tria',color:yellow,x:4,y:6,conf:['lb',true,false,true]},	
		{name:'tria',color:blue,x:6,y:4,conf:['rt',false,true,true]},
		{name:'rect',color:green,x:4,y:3,conf:[true,false,true,true,true]},
		{name:'rect',color:red,x:4,y:2,conf:[true,false,true,true,true]},
		{name:'tria',color:yellow,x:6,y:2,conf:['rb',false,true,true]},
		{name:'rect',color:blue,x:6,y:0,conf:[false,true,false,true,true]},
		{name:'rect',color:green,x:7,y:0,conf:[false,true,false,true,true]},
		{name:'course',color:red,x:9,y:0,conf:['b']},//顶端跑道
		{name:'rect',color:yellow,x:9,y:0,conf:[false,true,false,true,false]},
		{name:'rect',color:blue,x:10,y:0,conf:[false,true,false,true,true]},
		{name:'tria',color:green,x:11,y:2,conf:['lb',false,true,true]},
		{name:'rect',color:red,x:11,y:2,conf:[true,true,true,false,true]},
		{name:'rect',color:yellow,x:11,y:3,conf:[true,true,true,false,true]},
		{name:'tria',color:blue,x:11,y:4,conf:['lt',true,false,true]},
		{name:'tria',color:green,x:13,y:6,conf:['rb',false,true,true]},
		{name:'rect',color:red,x:13,y:4,conf:[false,true,false,true,true]},
		{name:'rect',color:yellow,x:14,y:4,conf:[false,true,false,true,true]},
		{name:'tria',color:blue,x:15,y:6,conf:['lb',false,true,true]},
		{name:'rect',color:green,x:15,y:6,conf:[true,true,true,false,true]},
		{name:'rect',color:red,x:15,y:7,conf:[true,true,true,false,true]},
		{name:'course',color:yellow,x:17,y:9,conf:['l']},//右端跑道
		{name:'rect',color:blue,x:15,y:9,conf:[true,false,true,false,true]},
		{name:'rect',color:green,x:15,y:10,conf:[true,true,true,false,true]},
		{name:'tria',color:red,x:15,y:11,conf:['lt',false,true,true]},
		{name:'rect',color:yellow,x:14,y:11,conf:[false,true,true,true,false]},
		{name:'rect',color:blue,x:13,y:11,conf:[false,true,true,true,false]},
		{name:'tria',color:green,x:13,y:11,conf:['rt',true,false,true]},
		{name:'tria',color:red,x:11,y:13,conf:['lb',false,true,true]},
		{name:'rect',color:yellow,x:11,y:13,conf:[true,true,true,false,true]},
		{name:'rect',color:blue,x:11,y:14,conf:[true,true,true,false,true]},
		{name:'tria',color:green,x:11,y:15,conf:['lt',false,true,true]},
		{name:'rect',color:red,x:10,y:15,conf:[false,true,true,true,false]},
		{name:'rect',color:yellow,x:9,y:15,conf:[false,true,true,true,false]},
		{name:'course',color:blue,x:8,y:17,conf:['t']},//底端跑道
		{name:'arrow',color:yellow,x:4,y:11,conf:['t']},
		{name:'arrow',color:blue,x:6,y:4,conf:['r']},
		{name:'arrow',color:green,x:13,y:6,conf:['b']},
		{name:'arrow',color:red,x:11,y:13,conf:['l']},
		{name:'base',color:green,x:0,y:0,conf:0},
		{name:'base',color:red,x:13.2,y:0,conf:0},
		{name:'base',color:blue,x:0,y:13.2,conf:0},
		{name:'base',color:yellow,x:13.2,y:13.2,conf:0}
	];
	
    var canvas = document.getElementById("myCanvas");
    var context = canvas.getContext("2d");
	var clientW = window.innerWidth;
	var clientH = window.innerHeight;
	canvas.width = clientW > clientH ? clientH : clientW;
    canvas.height = canvas.width;
	var w = canvas.width - 20;
	var h = canvas.height - 20;
	var unit = w / 17;
	
	function drawBox(name, color, startX, startY, conf){   
	    //conf[0]为系列，其余索引为边框是否显示，顺序：起点开始逆时针
		//矩形起点统一在左上角，三角形起点统一在直角顶点
		context.strokeStyle = 'black';
		context.lineWidth = 1;
	    startX = 10 + startX * unit;
		startY = 10 + startY * unit;
		if(name == 'rect'){   //绘制水平及垂直矩形
		    var rate1 = conf[0] ? 2 : 1;  //conf[0]为true使绘制水平矩形，为false时绘制垂直矩形
			var rate2 = conf[0] ? 1 : 2;
		
			context.beginPath();
			context.fillStyle = color;
			context.rect(startX, startY, unit*rate1, unit*rate2);
			context.fill();  //画矩形
			
			context.beginPath();
			context.fillStyle = 'white';
			context.arc(startX + unit / rate2, startY + unit / rate1, unit / 2 - 5, 0, 2*Math.PI);
			context.fill();  //画矩形内的圆
			context.stroke();  //画矩形内的圆边框
			
			context.beginPath();
			if(conf[1]){   //如果要求画上边框
				context.moveTo(startX, startY);
				context.lineTo(startX + unit * rate1, startY);
			}
			if(conf[2]){   //如果要求画右边框
				context.moveTo(startX + unit * rate1, startY);
				context.lineTo(startX + unit * rate1, startY + unit * rate2);
			}
			if(conf[3]){   //如果要求画下边框
				context.moveTo(startX + unit * rate1, startY + unit * rate2);
				context.lineTo(startX, startY + unit * rate2);
			}
			if(conf[4]){   //如果要求画左边框
				context.moveTo(startX, startY + unit * rate2);
				context.lineTo(startX, startY);
			}
			context.stroke();  //画矩形边框
		}
		
		if(name == 'tria'){   //绘制三角形
		    var points = [];
			switch(conf[0]){
				case 'lb':   //左下三角形
				    points.push([0,0],[2,0],[0,-2],[1,-1]);
					break;
				case 'rb':   //右下三角形
				    points.push([0,0],[0,-2],[-2,0],[-1,-1]);
					break;
				case 'rt':   //右上三角形
				    points.push([0,0],[-2,0],[0,2],[-1,1]);
					break;
				case 'lt':   //左上三角形
				    points.push([0,0],[0,2],[2,0],[1,1]);
					break;
			}
			
		    context.beginPath();
			context.moveTo(startX + unit * points[0][0], startY + unit * points[0][1]);
			context.lineTo(startX + unit * points[1][0], startY + unit * points[1][1]);
			context.lineTo(startX + unit * points[2][0], startY + unit * points[2][1]);
			context.closePath();
			context.fillStyle = color;
			context.fill();   //画三角形
			
			context.beginPath();
			context.fillStyle = 'white';
			context.arc(startX + unit * points[3][0] / 2, startY + unit * points[3][1] / 2, unit / 2 - 5, 0, 2*Math.PI);
			context.fill();  //画矩形内的圆
			context.stroke();  //画矩形内的圆边框
			
			context.beginPath();
			if(conf[1]){   //如果要求画斜边框
				context.moveTo(startX + unit * points[0][0], startY + unit * points[0][1]);
				context.lineTo(startX + unit * points[1][0], startY + unit * points[1][1]);
			}
			if(conf[2]){   //如果要求画下边框
				context.moveTo(startX + unit * points[1][0], startY + unit * points[1][1]);
				context.lineTo(startX + unit * points[2][0], startY + unit * points[2][1]);
			}
			if(conf[3]){   //如果要求画左边框
				context.moveTo(startX + unit * points[2][0], startY + unit * points[2][1]);
				context.lineTo(startX + unit * points[0][0], startY + unit * points[0][1]);
			}
			context.stroke();  //画三角形边框
		}
		
		if(name == 'course'){   //绘制跑道
			var points = [];
			switch(conf[0]){
				case 't':
				    points.push([0,-7],[-0.8,-7],[0.5,-8.3],[1.8,-7],[1,-7],[1,0],[1,0,0,-1]);
					break;
				case 'r':
				    points.push([7,0],[7,-0.8],[8.3,0.5],[7,1.8],[7,1],[0,1],[0,1,1,0]);
					break;
				case 'b':
				    points.push([0,7],[0.8,7],[-0.5,8.3],[-1.8,7],[-1,7],[-1,0],[-1,0,0,1]);
					break;
				case 'l':
				    points.push([-7,0],[-7,0.8],[-8.3,-0.5],[-7,-1.8],[-7,-1],[0,-1],[0,-1,-1,0]);
					break;
			}
			
			context.beginPath();
			context.moveTo(startX, startY);
			for(let i = 0; i < points.length; i++){
			    context.lineTo(startX + unit * points[i][0], startY + unit * points[i][1]);
			}
			context.closePath();
			context.fillStyle = color;
			context.fill();    //画大箭头
			context.stroke();  //画大箭头轮廓
			
			context.beginPath();
			context.fillStyle = 'white';
			context.arc(startX + (unit / 2) * points[6][0] + unit * points[6][1], 
			            startY + (unit / 2) * points[6][2] + unit * points[6][3], 
						unit / 2 - 5, 0, 2*Math.PI);
			context.fill();  //画矩形内的圆
			context.stroke();  //画矩形内的圆边框
			for(let i = 0; i < 6; i++){
				context.beginPath();
				context.fillStyle = 'white';
				context.arc(startX + (unit / 2) * points[6][0] + unit * (i + 2.5) * points[6][1], 
				            startY + (unit / 2) * points[6][2] + unit * (i + 2.5) * points[6][3], 
							unit / 2 - 5, 0, 2*Math.PI);
				context.fill();  //画矩形内的圆
				context.stroke();  //画矩形内的圆边框
			}
		}
		
		if(name == "arrow"){   //绘制箭头线
			context.beginPath();
			context.strokeStyle = color;
			context.lineWidth = 2;
			context.setLineDash([4,2]);
			
            switch(conf[0]){
				case 't':
					context.moveTo(startX + (unit / 2), startY);
					context.lineTo(startX + (unit / 2), startY - unit * 5);
					context.lineTo(startX + (unit / 2) - 7, startY - unit * 5 + 7);
					context.moveTo(startX + (unit / 2), startY - unit * 5);
					context.lineTo(startX + (unit / 2) + 7, startY - unit * 5 + 7);
					break;
				case 'r':
					context.moveTo(startX, startY + (unit / 2));
					context.lineTo(startX + unit * 5, startY + (unit / 2));
					context.lineTo(startX + unit * 5 - 7, startY + (unit / 2) - 7);
					context.moveTo(startX + unit * 5, startY + (unit / 2));
					context.lineTo(startX + unit * 5 - 7, startY + (unit / 2) + 7);
					break;
				case 'b':
					context.moveTo(startX - (unit / 2), startY);
					context.lineTo(startX - (unit / 2), startY + unit * 5);
					context.lineTo(startX - (unit / 2) + 7, startY + unit * 5 - 7);
					context.moveTo(startX - (unit / 2), startY + unit * 5);
					context.lineTo(startX - (unit / 2) - 7, startY + unit * 5 - 7);
					break;
				case 'l':
					context.moveTo(startX, startY - (unit / 2));
					context.lineTo(startX - unit * 5, startY - (unit / 2));
					context.lineTo(startX - unit * 5 + 7, startY - (unit / 2) + 7);
					context.moveTo(startX - unit * 5, startY - (unit / 2));
					context.lineTo(startX - unit * 5 + 7, startY - (unit / 2) - 7);
					break;
			}
			
			context.stroke();
			context.setLineDash([0,0]);					
		}
		
		if(name == "base"){   //绘制飞机场的矩形
		    var gap = 0.2;
		    context.beginPath();
		    context.rect(startX, startY, unit * 3.8, unit * 3.8);
			context.fillStyle = color;
			context.fill();
			context.stroke();
			
			context.fillStyle = 'white';
			context.beginPath();
			context.arc(startX + unit * (3.8 / 3 - gap), 
			            startY + unit * (3.8 / 3 - gap), 
						unit / 2, 0, 2*Math.PI);
			context.fill(); 
			context.stroke();  
			
			context.beginPath();
			context.arc(startX + unit * (7.6 / 3 + gap), 
			            startY + unit * (3.8 / 3 - gap), 
						unit / 2, 0, 2*Math.PI);
			context.fill(); 
			context.stroke();

            context.beginPath();
			context.arc(startX + unit * (3.8 / 3 - gap), 
			            startY + unit * (7.6 / 3 + gap), 
						unit / 2, 0, 2*Math.PI);
			context.fill(); 
			context.stroke(); 
             
            context.beginPath();
			context.arc(startX + unit * (7.6 / 3 + gap), 
			            startY + unit * (7.6 / 3 + gap), 
						unit / 2, 0, 2*Math.PI);
			context.fill(); 
			context.stroke(); 			 
		}
	}
	
	for(let i = 0; i < info.length; i++){
		with(info[i]){
			drawBox(name, color, x, y, conf);
		}
	}
}())
