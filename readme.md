#简介
node.js(socket.io + express) + vue.js + mongoDB开发的在线多人飞行棋游戏。   

#安装
1、下载源码，cmd进入源码路径，执行npm install安装依赖
2、打开app.js，修改第13行mongodb的连接ip及端口(默认为本机的27017端口)
3、打开js/component.js，修改402行node运行服务器的ip   
4、运行node app，开启node服务端   
5、打开同一网段的设备(pc、移动端)的浏览器，输入ip:7200访问，开始游戏，需要先注册用户       

#测试页面
http://120.79.160.213:7200/    #可能已经过期了
