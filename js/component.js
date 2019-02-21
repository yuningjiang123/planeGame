;(function(){
	var unit = 5.882;   //单位长度"1px 1px 10px 2px black"
	var body = 3.5;     //棋子半长Darkorange
	var gap = 0.2;      //间隙
	
	Vue.component('plane',{     //飞机组件  l.n
		props:['c','x','y','a','n','control','clickpermit','showhl','win'],    //c棋子颜色,l为位置信息包括x,y和a(旋转角度)、个数(重叠情况)
		                              //control为飞机是否允许被点击，win表示是否胜利
		template:`<div :style='{
					position:"absolute",
					width:"7%",
					height:"7%",
					left:x + "%",
					top:y + "%",
					borderRadius:"50%",
					cursor:(control && clickpermit) ? "pointer" : "default",
					pointerEvents:(control && clickpermit) ? "auto" : "none",
					backgroundColor:c,
					boxShadow:win?"1px 1px 10px 5px MediumVioletRed":"1px 1px 10px 2px black",
				  }' @click='planeclick'>
				    <div :style='{
					  position:"absolute",
					  width:"100%",
					  height:"100%",
					  borderRadius:"50%",
					  backgroundColor:(control && clickpermit) ? "orange":"white",
					  animation:win?"":"highLight2 1.5s ease infinite",
					  pointerEvents:"none",
					  zIndex:"-1"
					}' v-show='showhl'></div>
				    <p :style='{
					  position:"absolute", 
					  top:"-30%",
					  left:"60%",
					  font:"italic bold 12px/30px Georgia,serif",
					  cursor:control ? "pointer" : "default",
					  zIndex:"1"
					}' v-show='n>1'>{{n}}</p>
					<div :style='{
					  width:"75%",
					  height:"75%",
					  borderRadius:"50%",
					  backgroundColor:win?"pink":"white",
					  position:"absolute", 
					  top:"50%",
					  left:"50%",
					  cursor:control ? "pointer" : "default",
					  transform:"translate(-50%, -50%) rotate(" + a + "deg)",
					  boxShadow:"0 0 6px 1px black",
					}'>
					  <div :style='{
						width:"0",
						height:"0",
						borderBottom: "4px solid " + c,
						borderRight: "3px solid transparent",
						borderLeft: "3px solid transparent",
						position:"absolute", 
						top:"50%",
						left:"50%",
						cursor:control ? "pointer" : "default",
						transform:"translate(-50%, -220%)",
					  }'>
					  </div>
					  <div :style='{
						width:"0",
						height:"0",
						borderTop: "15px solid " + c,
						borderRight: "3px solid transparent",
						borderLeft: "3px solid transparent",
						position:"absolute", 
						top:"50%",
						left:"50%",
						cursor:control ? "pointer" : "default",
						transform:"translate(-50%, -30%)",
					  }'>
					  </div>
					  <div :style='{
						width:"0",
						height:"0",
						borderBottom: "4px solid " + c,
						borderRight: "10px solid transparent",
						borderLeft: "10px solid transparent",
						position:"absolute", 
						top:"50%",
						left:"50%",
						cursor:control ? "pointer" : "default",
						transform:"translate(-50%, -50%)",
					  }'>
					  </div>
					  <div :style='{
						width:"0",
						height:"0",
						borderBottom: "5px solid " + c,
						borderRight: "7px solid transparent",
						borderLeft: "7px solid transparent",
						position:"absolute", 
						top:"50%",
						left:"50%",
						cursor:control ? "pointer" : "default",
						transform:"translate(-50%, 100%)",
					  }'>
					  </div>
					</div>
				  </div>`,
		methods:{
			planeclick(){
				console.log("被点击了");
				this.$emit("chooseplane");  //触发父组件的选择飞机事件(事件名全部小写)
			}
		}
	});
	
	Vue.component('button-diy',{     //按钮组件(组件名尽量全小写，否则容易出问题)
	    props:['content','control'],   //组件传值的名称也尽量全小写
		template:`<div :style='{
			        color:control?"white":"Gainsboro",
			        boxSizing:"border-box",
			        border:"2px solid black",
	                borderRadius:"8px",
					textAlign:"center",
					padding:"1px",
			        width:"70px",
					height:"28px",
					cursor:"pointer",
					pointerEvents:control?"auto":"none",
					background:control?"linear-gradient(LightSlateGray 0%, LightGrey 20%, LightSlateGray 70%)":"DimGray",
		          }'>{{content}}</div>`
	});
	
	Vue.component('player',{     //玩家头像组件
	    props:['item','name','ol','stat','curr','client','showbtn'],    //头像相关属性及玩家昵称，以及ol，即游戏进行中的玩家是否已离线的标记
		                                      //stat为游戏进行中与否的标记，curr为当前操作玩家，client为本客户端的玩家名
		data(){
			return {
				clientW:window.innerWidth,
	            clientH:window.innerHeight
			}
		},
		template:`<div :style='{
					position:"absolute",
			        width:"${unit * 4}%",
					height:"${unit * 4 + 3}%",
					left: item.x + (clientW > clientH ? item.offset.x : 0) + "%",
					top: item.y + (clientH > clientW ? item.offset.y : 0) + "%",
					textAlign:"center"
		          }'>
				    <div :style='{
					  position:"absolute",
					  width:"100%",
					  height:"88.691%",
					  backgroundColor:"white",
					  animation:"highLight1 1.5s ease infinite",
					  zIndex:"-1"
					}' v-show='stat && (curr == name)'></div>
				    <div :style='{
					  width:"100%",
					  height:"88.691%",
					  backgroundColor:item.color,
					}'>
					  <div :style='{
						position:"absolute",
					    width:"60px",
						height:"30px",
						backgroundColor:"rgba(255,255,255,0.5)",
						paddingTop:"5px"
					  }' v-show='!ol'>离线</div>
					  <button-diy :style='{
						position:"absolute",
						left:"50%",
						top:"50%",
						transform:"translate(-50%, -100%)"
					  }' v-show='stat && (name == client) && (curr == name) && showbtn'
					    :control='true'
						content='掷骰子' @click.native="trigger"></button-diy>
					</div>
					{{name + (client == name ? '(你)' : '')}}
				  </div>`,
		methods:{
			trigger(){
				this.$emit("throwdice");    //触发父组件的掷骰子事件(事件名全部小写)
			}
		}
	});
	
	Vue.component('dice',{     //色子组件  position:"absolute",
		props:['num'],    //c棋子颜色,l为位置信息包括x,y和a(旋转角度)、个数(重叠情况)
		template:`<div :style='{
			        position:"absolute",
					width:"15%",
					height:"15%",
					left:"50%",
					top:"50%",
					border:"3px solid black",
					borderRadius:"30%",
					transform:"translate(-50%, -50%)",
					backgroundColor:"Beige",
				  }'>
				    <div v-if='num == 1'>
					  <point x='-50' y='-50' :s='true' c='red'></point>
					</div>
					<div v-if='num == 2'>
					  <point x='-50' y='30' :s='false' c='blue'></point>
					  <point x='-50' y='-130' :s='false' c='blue'></point>
					</div>
					<div v-if='num == 3'>
					  <point x='-150' y='50' :s='false' c='blue'></point>
					  <point x='-50' y='-50' :s='false' c='blue'></point>
					  <point x='50' y='-150' :s='false' c='blue'></point>
					</div>
					<div v-if='num == 4'>
					  <point x='-140' y='40' :s='false' c='red'></point>
					  <point x='-140' y='-140' :s='false' c='red'></point>
					  <point x='40' y='-140' :s='false' c='red'></point>
					  <point x='40' y='40' :s='false' c='red'></point>
					</div>
					<div v-if='num == 5'>
					  <point x='-150' y='50' :s='false' c='blue'></point>
					  <point x='-150' y='-150' :s='false' c='blue'></point>
					  <point x='-50' y='-50' :s='false' c='blue'></point>
					  <point x='50' y='50' :s='false' c='blue'></point>
					  <point x='50' y='-150' :s='false' c='blue'></point>
					</div>
					<div v-if='num == 6'>
					  <point x='-130' y='-170' :s='false' c='blue'></point>
					  <point x='-130' y='-50' :s='false' c='blue'></point>
					  <point x='-130' y='70' :s='false' c='blue'></point>
					  <point x='30' y='-170' :s='false' c='blue'></point>
					  <point x='30' y='-50' :s='false' c='blue'></point>
					  <point x='30' y='70' :s='false' c='blue'></point>
					</div>
				  </div>`,
		components:{
			'point':{   //红点，色子的子组件  
				props:['x','y','s','c'],    //横、纵坐标以及是否放大，c是颜色
				template:`<div :style='{
							position:"absolute",        
							width:"25%",
							height:"25%",
							left:"50%",
							top:"50%",
							borderRadius:"50%",
							transform:"translate(" + x + "%, " + y + "%) scale(" + (s ? "1.5,1.5" : "1,1") + ")",
							backgroundColor:c
						  }'>
						 </div>`
			}
		}
	});
    
	window.planeVal = [
		{planeId:1, color:'ForestGreen'},
		{planeId:2, color:'red'},
		{planeId:3, color:'GoldenRod'},
		{planeId:4, color:'Indigo'}
	];   //飞机属性映射关系数组(后续可扩展)
	
	//玩家头像位置数组textAlign:"center",
						//paddingTop:"5px"
	window.playerLoc = [
	    {x:0,       y:0,         offset:{x:-(unit*4+7), y:-(unit*4+7)}, color:planeVal[0].color},
		{x:unit*13, y:0,         offset:{x:(unit*4+7), y:-(unit*4+7)}, color:planeVal[1].color},
		{x:unit*13, y:unit*13-3, offset:{x:(unit*4+7), y:(unit*4+7)}, color:planeVal[2].color},
		{x:0,       y:unit*13-3, offset:{x:-(unit*4+7), y:(unit*4+7)}, color:planeVal[3].color}
	];
	
	/**位置数组，0-51为基本位置，第0个位置为蓝色跑道左边的绿色位置
	*52-56为绿色战机停机场及起始位置
	*57-61为红色战机停机场及起始位置
	*62-66为黄色战机停机场及起始位置
	*67-71为蓝色战机停机场及起始位置
	*72-77为绿色跑道位置
	*78-83为红色跑道位置
	*84-89为黄色跑道位置
	*90-95为蓝色跑道位置
	*/
	var locData = [
	    //0-51为基本位置，x、y分别代表left和top的百分比
	    [ 7.5, 16.0, -90],
		[ 6.5, 16.0, -90],
		[ 5.5, 15.5,   0],
		[ 5.0, 14.5,   0],
		[ 5.0, 13.5,   0],
		[ 5.5, 12.5,   0],
		[ 4.5, 11.5, -90],
		[ 3.5, 12.0, -90],
		[ 2.5, 12.0, -90],
		[ 1.5, 11.5, -45],
		[ 1.0, 10.5,   0],
		[ 1.0,  9.5,   0],
		[ 1.0,  8.5,   0],
		[ 1.0,  7.5,   0],
		[ 1.0,  6.5,   0],
		[ 1.5,  5.5,  90],
		[ 2.5,  5.0,  90],
		[ 3.5,  5.0,  90],
		[ 4.5,  5.5,  90],
		[ 5.5,  4.5,   0],
		[ 5.0,  3.5,   0],
		[ 5.0,  2.5,   0],
		[ 5.5,  1.5,  45],
		[ 6.5,  1.0,  90],
		[ 7.5,  1.0,  90],
		[ 8.5,  1.0,  90],
		[ 9.5,  1.0,  90],
		[10.5,  1.0,  90],
		[11.5,  1.5, 180],
		[12.0,  2.5, 180],
		[12.0,  3.5, 180],
		[11.5,  4.5, 180],
		[12.5,  5.5,  90],
		[13.5,  5.0,  90],
		[14.5,  5.0,  90],
		[15.5,  5.5, 135],
		[16.0,  6.5, 180],
		[16.0,  7.5, 180],
		[16.0,  8.5, 180],
		[16.0,  9.5, 180],
		[16.0, 10.5, 180],
		[15.5, 11.5, -90],
		[14.5, 12.0, -90],
		[13.5, 12.0, -90],
		[12.5, 11.5, -90],
		[11.5, 12.5, 180],
		[12.0, 13.5, 180],
		[12.0, 14.5, 180],
		[11.5, 15.5, 225],
		[10.5, 16.0, -90],
		[ 9.5, 16.0, -90],
		[ 8.5, 16.0, -90],
		
		//绿色战机停机场及起始位置
		[  3.8/3-gap,   3.8/3-gap, 90],
		[3.8*2/3+gap,   3.8/3-gap, 90],
		[  3.8/3-gap, 3.8*2/3+gap, 90],
		[3.8*2/3+gap, 3.8*2/3+gap, 90],
		[        0.5,         4.5, 90],
		//红色战机停机场及起始位置
		[  3.8/3-gap+13.2,   3.8/3-gap, 180],
		[3.8*2/3+gap+13.2,   3.8/3-gap, 180],
		[  3.8/3-gap+13.2, 3.8*2/3+gap, 180],
		[3.8*2/3+gap+13.2, 3.8*2/3+gap, 180],
		[            12.5,         0.5, 180],
		//黄色战机停机场及起始位置
		[  3.8/3-gap+13.2,   3.8/3-gap+13.2, -90],
		[3.8*2/3+gap+13.2,   3.8/3-gap+13.2, -90],
		[  3.8/3-gap+13.2, 3.8*2/3+gap+13.2, -90],
		[3.8*2/3+gap+13.2, 3.8*2/3+gap+13.2, -90],
		[            16.5,             12.5, -90],
		//蓝色战机停机场及起始位置
		[  3.8/3-gap,   3.8/3-gap+13.2, 0],
		[3.8*2/3+gap,   3.8/3-gap+13.2, 0],
		[  3.8/3-gap, 3.8*2/3+gap+13.2, 0],
		[3.8*2/3+gap, 3.8*2/3+gap+13.2, 0],
		[        4.5,             16.5, 0],
		
		//绿色跑道
		[2.5, 8.5, 90],
		[3.5, 8.5, 90],
		[4.5, 8.5, 90],
		[5.5, 8.5, 90],
		[6.5, 8.5, 90],
		[7.5, 8.5, 90],
        //红色跑道
		[8.5, 2.5, 180],
		[8.5, 3.5, 180],
		[8.5, 4.5, 180],
		[8.5, 5.5, 180],
		[8.5, 6.5, 180],
		[8.5, 7.5, 180],
		//黄色跑道
		[14.5, 8.5, -90],
		[13.5, 8.5, -90],
		[12.5, 8.5, -90],
		[11.5, 8.5, -90],
		[10.5, 8.5, -90],
		[ 9.5, 8.5, -90],
		//蓝色跑道
		[8.5, 14.5, 0],
		[8.5, 13.5, 0],
		[8.5, 12.5, 0],
		[8.5, 11.5, 0],
		[8.5, 10.5, 0],
		[8.5,  9.5, 0],
	];
	
	//位置的构造函数
	function Place(x, y, a){
		this.x = -body + unit * x;
		this.y = -body + unit * y;
		this.a = a;
		this.n = 1;   //n为重叠的飞机数，为1时绑定了其不显示
	}
	
	window.planeLoc = [];
	window.loc = [];
	//形成位置数组
	for(let i = 0; i < locData.length; i++){
		window.loc.push(new Place(...locData[i]))
	}
	//console.log(loc.length);
    window.timer = null;   //定时器对象
    window.socket = io.connect('http://120.79.160.213:7200');   //连接socket
}());
