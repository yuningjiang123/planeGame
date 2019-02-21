var express = require('express');
var app = express();
var http = require('http').Server(app);   
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(__dirname));

function mongoConnect(){    //返回连接Mongo的promise对象
	return new Promise((resolve, reject) => {
	    MongoClient.connect("mongodb://127.0.0.1:27017/planeChess",
	                        {useNewUrlParser: true,
						     connectTimeoutMS: 5000},  //设置5s没有回应就超时，默认是30s
						    (err, db) => {
		    if(err) reject(`MongoDB Timeout!`);
		    resolve(db)
	    })
    })
}

function playerOff(socket){   //此函数作用为将数据库中已离线用户的online设置为false
    return new Promise((resolve, reject) => {
	    mongoConnect().then(db => {
			var dbo = db.db("planeChess");
			for(let i = 0; i < playerArr.length; i++){
			    //console.log(playerArr[i].socketId, socket.id);
			    if(playerArr[i].socketId == socket.id){
				    dbo.collection('user').updateOne({
					    uid:playerArr[i].name
				    }, {
					    $set:{"online":false}
				    }, (err, result) => {
					    if(err) throw err
					    if(result.modifiedCount){
						    resolve(i)
					    }
				    });
				    return
			    }
		    }	
	    }) 
	})
}

function updateUser(userId, onlineStatus){    //更新数据库中的user表的对应用户的online状态
	mongoConnect().then(db => {
		var dbo = db.db("planeChess");
			
		dbo.collection('user').updateOne({    //数据库user表及后端的userArr都要更新！
			uid: userId
		}, {
			$set:{"online":onlineStatus}
		}, (err, result) => {
			if(err) throw err
			db.close();
			userArr.forEach((value, index) => {
				if(value.uid == userId){
					userArr[index].online = onlineStatus;
				}
			});
			//console.log(userArr)
		})
	}).catch(err => {
		console.log(`重连更新数据库online状态失败，可能是数据库连接问题！`);
	})
}

function modify(collection, value){    //修改数据库中的player表
	mongoConnect().then(db => {
		var dbo = db.db("planeChess");

		dbo.collection(collection).deleteMany({}, (err, result) => {
			if(err) throw err
			if(value.length){    //防止发送空数组
				dbo.collection(collection).insertMany(value, (err, result) => {
					if(err) throw err
					db.close();
				})
			}else{
				db.close();
			}
		})
	}).catch(err => {
		console.log(`更新数据库中的${collection}表失败，可能是数据库连接问题！`);
	})
}

function updateGameStatus(){    //更新游戏状态及当前操作玩家
	mongoConnect().then(db => {
		var dbo = db.db("planeChess");
			
		dbo.collection('gameStatus').updateOne({}, {  //数据库gameStatus表更新！
			$set:{"status":status, "currPlayer":currPlayer}
		}, (err, result) => {
			if(err) throw err
			db.close();
		})
	}).catch(err => {
		console.log(`更新数据库中的gameStatus表失败，可能是数据库连接问题！`);
	})
}

var status = false;   //表征游戏进行与否的变量，true为进行中

var step = 0;         //表征游戏步骤

var currPlayer = '';    //表征游戏当前操作角色

var userArr = [];       //用户数组

var playerArr = [];  //玩家数组

var planeArr = [];   //飞机数组

mongoConnect().then(db => {    //每当重新启动服务端时，先去数据库将用户数据同步过来，同步时将所有用户的
                               //online更新为false(否则用户将无法登录回到游戏中)
	var dbo = db.db("planeChess");
	var p1 = new Promise((resolve, reject) => {
		dbo.collection('user').updateMany({}, {
			$set:{"online":false}
		}, (err, res) => {
			if(err) throw err
			dbo.collection('user').find({}).toArray((err, result) => {
				if(err) throw err
				result.forEach(value => userArr.push(value))
				resolve(userArr)
			})
		});
	})
	
	var p2 = new Promise((resolve, reject) => {
		dbo.collection('player').find({}).toArray((err, result) => {
			if(err) throw err
			result.forEach(value => {delete value["_id"]});   //删除从数据库中读上来的_id属性
			playerArr = result;
			resolve(playerArr);
		})
	})
	
	var p3 = new Promise((resolve, reject) => {
		dbo.collection('plane').find({}).toArray((err, result) => {
			if(err) throw err
			result.forEach(value => {delete value["_id"]});   //删除从数据库中读上来的_id属性
			planeArr = result;
			resolve(planeArr);
		})
	})
	
	var p4 = new Promise((resolve, reject) => {
		dbo.collection('gameStatus').find({}).toArray((err, result) => {
			if(err) throw err
			status = result[0].status;
			currPlayer = result[0].currPlayer;
			resolve([status, currPlayer]);
		})
	})
	
	
	
	Promise.all([p1, p2, p3, p4]).then(result => {
	    //console.log(result);
		db.close();     //所有数据同步成功过来服务器后，关闭数据库的连接
	})
}).catch(err => {
	console.log(`数据库连接失败或其它错误，用户可能无法执行用户登录操作！`);
})

app.post('/addUser', (req, res) => {   //增加用户
	res.setHeader("Access-Control-Allow-Origin", "*");
	var uid = req.body.uid;
	var pwd = req.body.pwd;
	
	var result = userArr.filter(value => value.uid == uid);   
	if(!result.length){  //查询到数据库没有同名用户时，添加此用户
	    mongoConnect().then(db => {
		    var dbo = db.db("planeChess");
			
			var user = {uid:uid, pwd:pwd, online:false};
			dbo.collection('user').insertOne(user, (err, result) => {
				if(err) throw err
				//console.log(result.insertedCount);
				db.close();
				userArr.push(user);
				//console.log(userArr)
				res.send("添加用户成功！");
				res.end()
			});
		}).catch(err => {
			console.log(err);
			res.send("数据库连接失败或其它错误！");
			res.end();
		})
	}else{    //如果查询到数据库有同名用户时，返回前端告知已存在同名用户
		//console.log("有同名用户")
		res.send(`已存在名为“${uid}”的用户！`);
		res.end()
	}
});

app.post('/logOn', (req, res) => {   //用户登录
	res.setHeader("Access-Control-Allow-Origin", "*");
	var uid = req.body.uid;
	var pwd = req.body.pwd;
	
	var result = userArr.filter(value => value.uid == uid);
	if(!result.length){    //如果查询到数据库没有该用户
		res.send(`不存在名为${uid}的用户！`);
		res.end();
		return
	}
	if(result[0].pwd != pwd){    //如果该用户密码校验不通过
		res.send("密码错误！");
		res.end();
		return
	}
	if(result[0].online){    //如果该用户已登录(后面修改逻辑为重连)
		res.send(`用户${uid}已经登录，禁止重复登录！`);
		res.end();
		return
	}
	if(!(playerArr.filter(value => value.name == uid).length)){  //如果玩家不在游戏中
		if(playerArr.length >= 4 || status){    //如果已经满员，或未满员但游戏已经开始，则不允许再加入(暂时设置成不允许观战)
			res.send("游戏人数已满或游戏已开始，游戏暂时不支持观战！");
			res.end();
			return
		}
	}
	mongoConnect().then(db => {
		var dbo = db.db("planeChess");
			
		//如果以上几项验证通过，则修改数据库该用户的online为已登录状态，完成之后才通知前端登录成功
		dbo.collection('user').updateOne({
			uid:uid
		}, {
			$set:{"online":true}
		}, (err, result) => {
			if(err) throw err
			db.close();
			userArr.forEach((value, index) => {
				if(value.uid == uid){
					userArr[index].online = true
				}
			});
			//console.log(userArr)
			res.send("用户登录成功！");
			res.end()
		})
	}).catch(err => {
		console.log(err);
		res.send("数据库连接失败或其它错误！");
		res.end();
	})
});

io.on('connection', socket => {	
	console.log(socket.id);
	
	socket.on('playerEnter', arg1 => {  //有玩家加入，根据玩家是否已在游戏中决定
	    console.log(`step值为${step}`);
	    var num;
		var newP = true;    //是否不在游戏中的新玩家
		var repeat;
			
		for(let i = 0; i < playerArr.length; i++){
			if(playerArr[i].name == arg1){    //如果玩家已在游戏中(离线后重新登录的)
				playerArr[i].socketId = socket.id;
			    playerArr[i].online = true;
			    newP = false;
				break
			}
		}
		
		if(newP){    //如果玩家还不在游戏中
			if(playerArr.length < 4 && !status){   //如果游戏未开始且玩家人数小于4
				do{
					num = Math.round(Math.random()*4+0.5);  //生成一个1到4的随机整数
					repeat = false;
					for(let i = 0; i < playerArr.length; i++){
						if(playerArr[i].planeId == num){
							repeat = true;
							break
						}
					}
				}while(repeat)    //如果没有重复则退出循环
				
				playerArr.push({planeId:num, name:arg1, socketId:socket.id, online:true});
			}
		}
		
		updateUser(arg1, true);  //改变userArr中及数据库user表中该用户的状态
        modify("player", playerArr);  //改变数据库player表

		
		//console.log(userArr);
		//console.log(playerArr);
		io.emit("ready", playerArr, planeArr, status, currPlayer);   //返回玩家数组、飞机数组、游戏状态、当前操作玩家
	});
	
    socket.on('gameStart', arg1 => {  //游戏开始
	    if(!status){
	    	step = 0;
			status = true;
			
			playerArr = arg1;   //玩家数组
			planeArr = [];      //游戏开始时先清空飞机数组
			var chessId = 1;    //planeId是飞机种类的id，chessId是棋子个体的id，同一玩家不同棋子
								//的chessId不一样
			
			//初始化飞机数组（目前只是举例，后面需要增加根据加入玩家数添加飞机的判断）
			for(let i = 0; i < 4; i++){
				for(let j = 0; j < playerArr.length; j++){  //id为机型，1绿机2红机3黄机4蓝机
					with(playerArr[j]){
						planeId == 1 && planeArr.push({planeId:1, location: 52 + i, chessId: chessId++, ctrlPermit: false, victory: false});
						planeId == 2 && planeArr.push({planeId:2, location: 57 + i, chessId: chessId++, ctrlPermit: false, victory: false});
						planeId == 3 && planeArr.push({planeId:3, location: 62 + i, chessId: chessId++, ctrlPermit: false, victory: false});
						planeId == 4 && planeArr.push({planeId:4, location: 67 + i, chessId: chessId++, ctrlPermit: false, victory: false});	
					}
				}
			}
			modify("plane", planeArr);  //改变数据库plane表

			currPlayer = playerArr.sort(() => 0.5 - Math.random())[0].name;   //随机选取首次移动的玩家
			playerArr.sort((a, b) => a.planeId - b.planeId);                  

			updateGameStatus();   //更新数据库中的status、currPlayer值
		}
        io.emit("ready", playerArr, planeArr, status, currPlayer, true);   //返回玩家数组、飞机数组、游戏状态、当前操作玩家，最后一个表示当前刚开始进行游戏
		//console.log(planeArr,status);io.to(socket.id).emit('planeReady', planeArr);
    });
	
	socket.on('getPoint', arg1 => {  //玩家置了骰子，后端随机生成骰子点数广播给前端。这里接收到的arg1为当前玩家的planeId
	    if(step == 0){
			var point = Math.round(Math.random()*6+0.5);
			point = point > 6 ? 6 : point;   //限制不能超过6
			//point = 6;
			   
			var currPlane = planeArr.filter(value => value.planeId == arg1);  //获取当前玩家plane数组
			
			if(point == 6){  //如果点数为6，所有未获得胜利的飞机都是可控的
				for(let i = 0; i < currPlane.length; i++){
					if(!currPlane[i].victory){
					    currPlane[i].ctrlPermit = true;
					}else{
						currPlane[i].ctrlPermit = false;
					}
				}
			}else{   //如果置得点数不为6，则分是否在飞机场
				currPlane.forEach(value => {
					if(value.location >= (52 + (arg1 - 1) * 5) &&
                       value.location < (56 + (arg1 - 1) * 5)){
				        value.ctrlPermit = false;
					}else{
						value.ctrlPermit = true;
					}   
				})
			}
			io.emit("getPointOK", point, planeArr, arg1);   //返回掷骰子得的点数、飞机数组和当前玩家的planeId
			step += 1;
		}
    });
	
	socket.on('getPlaneLoc', (arg1, arg2, arg3) => {  //接收到要移动的棋子及色子点数，arg3为飞机数组
	    if(step == 1){
			planeArr = arg3;     //飞机数组传到后端
			var plane = planeArr.filter(value => value.chessId == arg1);  //定位要移动的棋子对象

			var oldLoc = plane[0].location;    //当前棋子位置
			var planeId = plane[0].planeId;      //飞机型号
			
			var tmpLoc = 0;            //中途棋子位置
			
			var newLoc = 0;            //改变后棋子位置  32 45 58(6) 71(19)
			
			var isFlied = false;       //在本函数内表示该移动的棋子是否已发生了飞跃，用于后面判断飞跃是否吃掉了对方棋子
			
			var win = false;           //在本函数内表示本次移动是否有棋子胜利 
			
			var needGoHome = false;     //在本函数内是否有因被吃或胜利而存在回归飞机场的行为
			
			var locArr = [oldLoc];      //棋子位置变化顺序，初始为原位 12 25 38 51 
			
			var goHome = [];            //回归飞机场的棋子飞机的数组
			
			var locArrGoHome = [];           //回归飞机场棋子的位置变化顺序，如果没发生回归飞机场行为则为空 
		    
			if(oldLoc >= (52 + (planeId - 1) * 5) && 
			   oldLoc < (56 + (planeId - 1) * 5)){   //当在停机场位置时
				if(arg2 == 6){   //当掷得色子点数为6时，才允许起飞
					switch(planeId){
						case 1:
							newLoc = 56;    //绿色机起飞位置
							break;
						case 2:
							newLoc = 61;    //红色机起飞位置
							break;
						case 3:
							newLoc = 66;    //黄色机起飞位置
							break;
						case 4:
							newLoc = 71;    //蓝色机起飞位置
							break;
					}
					locArr.push(newLoc);
				}
			}else{
				if(oldLoc == (56 + (planeId - 1) * 5)){  //如果当前在起飞位置，转到等价位置
					switch(planeId){
						case 1:
							oldLoc = 14;    //绿色机起飞位置的等价位置
							break;
						case 2:
							oldLoc = 27;    //红色机起飞位置的等价位置
							break;
						case 3:
							oldLoc = 40;    //黄色机起飞位置的等价位置
							break;
						case 4:
							oldLoc = 1;     //蓝色机起飞位置的等价位置
							break;
					}
				}
				
				var turn = 12 + 13 * (planeId - 1);     //进入跑道入口的拐点，每个颜色的飞机拐点不同
				
				//第一步，先按色子点数走相应步数
				for(let i = 0; i < arg2; i++){
					newLoc = oldLoc + i + 1;
					if(oldLoc <= turn && newLoc > turn){
						newLoc = newLoc - turn + 71 + 6 * (planeId - 1);
					}
					newLoc = (newLoc < 72) ? (newLoc % 52) : newLoc;    //超过52的位置
					if(newLoc > 71 + 6 * planeId){   //如果已越过终点
					    newLoc = (71 + 6 * planeId) - (newLoc - (71 + 6 * planeId))     
					}
					locArr.push(newLoc);
				}
				
				//第二步，观察当前位置是否满足跳跃条件
				tmpLoc = locArr[locArr.length - 1];   //取出第一步移动的最终位置
				if(tmpLoc < 52 && (tmpLoc % 4 == planeId - 1)
							   && (tmpLoc != turn)){
					console.log(`${planeId}满足跳跃`);
					if(tmpLoc != (32 + 13 * (planeId - 1)) % 52){//如果当前位置不满足飞跃条件
						console.log(`${planeId}满足跳跃`);
						newLoc = (tmpLoc + 4) % 52;
						locArr.push(newLoc);
						
						//再判断此时位置是否满足飞跃条件？
						if(newLoc == (32 + 13 * (planeId - 1)) % 52){
							isFlied = true;      //表征此棋子在移动过程中发生过飞跃
							newLoc = (newLoc + 12) % 52;
							locArr.push(newLoc);
						}
					}else{ //如果当前位置满足飞跃条件
					    isFlied = true;      //表征此棋子在移动过程中发生过飞跃
						newLoc = (newLoc + 12) % 52;   //则先飞跃
						locArr.push(newLoc);
						newLoc += 4;                   //，再跳跃
						locArr.push(newLoc);
					}
				}
				
				//第三步，观察当前位置是否可以吃掉对方棋子，或者当前位置是否胜利
				tmpLoc = locArr[locArr.length - 1];   //取出第二步移动的最终位置
				goHome = planeArr.filter(value => {
					return value.location == tmpLoc && value.planeId != planeId
					//如果planeArr中，假设有棋子A的目前位置与本次棋子移动的最终位置相同
					//，且A与本次移动的棋子不属于同一阵营，则判断A棋子属于“被吃”的棋子
				});
				
				//console.log(`goHome为${JSON.stringify(goHome)}`);
				if(isFlied){   //如果发生了飞跃，则按照对应位置将飞跃经过的跑道位置处的棋子也添加进“回家”数组里
					var coursePlane = [];    //存放跑道上被打掉的飞机
					switch(planeId){
						case 1:
						    coursePlane = planeArr.filter(value => value.location == 86);
							break
						case 2:
						    coursePlane = planeArr.filter(value => value.location == 92);
							break
						case 3:
						    coursePlane = planeArr.filter(value => value.location == 74);
							break
						case 4:
						    coursePlane = planeArr.filter(value => value.location == 80);
							break
					}
					//console.log(`coursePlane为${JSON.stringify(coursePlane)}`);
					if(coursePlane.length){
						goHome.push(...coursePlane);
					}
				}
				
				if(tmpLoc == 71 + 6 * planeId){
					win = true;
					goHome.push(plane[0]);
				}
				
				console.log(`goHome为${JSON.stringify(goHome)}`);
				if(goHome.length){   //如果存在被吃掉的棋子，则计算每个棋子应该回归的原位
					needGoHome = true;    //value.chessId   value.location
					console.log("进入了goHome");
					goHome.forEach(value => {
						//首先获取当前回家棋子所属阵营的plane数组
						console.log(`value为${value}`);
						var goHomePlane = planeArr.filter(v => v.planeId == value.planeId);
						
						var airportLoc = [];     //用于放置当前被吃棋子所属阵营飞机场位置
						for(let i = 0; i < 4; i++){
							airportLoc.push(52 + (value.planeId - 1) * 5 + i);
						}
						
						var inAirport = [];     //用于存放当前被吃棋子所属阵营飞机场已被占据的位置
                        goHomePlane.forEach(v => {   
							if(v.location >= (52 + (value.planeId - 1) * 5) &&
							       v.location < (56 + (value.planeId - 1) * 5)){
								inAirport.push(v.location);
							}
						});

                        var targetLoc = airportLoc.filter(v => {   //获取两者的差集，即没有被占据的飞机场位置
						    return inAirport.indexOf(v) == -1
						});
                        
						for(let i = 0; i < planeArr.length; i++){
							if(planeArr[i].chessId == value.chessId){
								//将回家棋子id，回家棋子原来的位置，回家棋子回归的位置返回前端
								if(win){
									console.log("进入了win");
									locArrGoHome.push([i, 71 + 6 * planeId, targetLoc[0]]);
									value.victory = true;         //修改胜利标记
								}else{
									locArrGoHome.push([i, value.location, targetLoc[0]]);
								}
								value.location = targetLoc[0];    //修改被吃棋子的位置
								break
							}
						}				
					})
				}
			}
			console.log(`点数为${arg2}`);
			console.log(`locArr为${locArr}`);
			console.log(`planeId为${planeId}`);
			console.log(`needGoHome为${needGoHome}`);
			
			console.log(`locArrGoHome为${locArrGoHome}`);
			io.emit("getPlaneLocOK", locArr, arg1, arg2, planeArr, needGoHome, locArrGoHome, isFlied, win);  //将计算完成的棋子移动后的位置、移动棋子id以及色子点数返回给前端		
            step += 1;
		} 
	});
	
	socket.on('moveOK', (arg1, arg2, arg3) => {  //棋子移动完成，开始下一个轮回(下次修改时记得添加到数据库)
	    step = arg3 || step;
	    if(step == 2){    //用step来控制步骤，防止多余的socket
			planeArr = arg1;    //飞机数组
			
			var len = playerArr.length;
			if(arg2 != 6){    //如果一个玩家投到6，则可以再投一轮
				for(let i = 0; i < len; i++){
					if(playerArr[i].name == currPlayer){
						currPlayer = playerArr[(i+1)%len].name;     //按顺序改变当前操作玩家
						break
					}
				}
			}
			
			planeArr.forEach(value => {
				value.ctrlPermit = false;    //所有飞机恢复为不可控制状态
			})
			
			modify("plane", planeArr);  //改变数据库plane表
			console.log(`当前玩家为${currPlayer}`);

			//以下为判断是否有玩家获胜
			for(let i = 0; i < playerArr.length; i++){
				var plane = planeArr.filter(value => value.victory == true && value.planeId == playerArr[i].planeId);
				if(plane.length == 4){
					status = false;      //游戏状态修改为false
					updateGameStatus();         //更新数据库中的游戏状态、当前玩家等值
                    io.emit("gameover", playerArr, planeArr, status, playerArr[i].name);  //触发游戏结束事件
                    return
				}	
			}
			
			updateGameStatus();         //更新数据库中的游戏状态、当前玩家等值
            io.emit("ready", playerArr, planeArr, status, currPlayer);   //返回玩家数组、飞机数组、游戏状态、当前操作玩家

			//console.log(planeArr,status);io.to(socket.id).emit('planeReady', planeArr);
			step = 0;
		}
    });
	
	socket.on('escape', () => {     //有玩家强制退出执行的逻辑
	    step = 0;
		
		playerOff(socket).then(index => {
            //数据库user表该角色的状态更新后，把后端userArr该角色的online状态更新			
			userArr.forEach((value, i) => {
				if(value.uid == playerArr[index].name){
					userArr[i].online = false
				}
			});
			
			//然后，把飞机数组中该玩家的飞机全部清除
			planeArr = planeArr.filter(value => value.planeId != playerArr[index].planeId);
			modify("plane", planeArr);  //改变数据库player表
			
			//接着，当前操作玩家移向下一位玩家
			var len = playerArr.length;
			for(let i = 0; i < len; i++){
				if(playerArr[i].name == currPlayer && i == index){
					currPlayer = playerArr[(i+1)%len].name;     //按顺序改变当前操作玩家
					break
				}
			}
			
			//最后，将该玩家从playerArr里删除
            playerArr.splice(index, 1);
            modify("player", playerArr);  //改变数据库player表

            			
			console.log(playerArr);
			console.log(userArr);
			if(playerArr.length == 1){  //假如只有一位玩家，则该玩家获胜
				status = false;      //游戏状态修改为false
                io.emit("gameover", playerArr, planeArr, status, playerArr[0].name);  //触发游戏结束事件
			}else{
				io.emit("ready", playerArr, planeArr, status, currPlayer);   //返回玩家数组、飞机数组、游戏状态、当前玩家
			}
		    
		    updateGameStatus();         //更新数据库中的游戏状态、当前玩家等值
	    }).catch(err => {
		    console.log(err);
		    console.log("数据库连接失败或其它错误！");
	    })
    });
	
	socket.on('disconnect', () => {     //用户关掉浏览器窗口后触发此事件(视为用户离线)
	    step = 0;
		
		playerOff(socket).then(index => {    //如果游戏未开始，删除playerArr中的已离线玩家，并且更新userArr数组
		                      //，此时玩家重新登录时会重新分配飞机；
							  //如果游戏已开始，则只更新userArr数组中玩家的离线标志，玩家重新登录时会根据
			userArr.forEach((value, i) => {
				if(value.uid == playerArr[index].name){
					userArr[i].online = false
				}
			});
			if(!status){
				playerArr.splice(index, 1);
			}else{
				playerArr[index].online = false;
			}

            if(playerArr.filter(value => !value.online).length === playerArr.length){   //如果所有玩家都处于离线状态
                planeArr = [];     //清空飞机数组
                playerArr = [];    //清空玩家数组
                status = false;    //游戏标为未开始状态
                modify("plane", planeArr);  //改变数据库plane表
                updateGameStatus();
            }

            modify("player", playerArr);  //改变数据库player表			
			console.log(playerArr);
			console.log(userArr);
		    io.emit("ready", playerArr, planeArr, status, currPlayer);   //返回玩家数组、飞机数组、游戏状态、当前玩家
	    }).catch(err => {
		    console.log(err);
		    console.log("数据库连接失败或其它错误！");
	    })
    });
});

app.set('port', process.env.PORT || 7200);

var server = http.listen(app.get('port'), function() {
  console.log('start at port:' + server.address().port);
});