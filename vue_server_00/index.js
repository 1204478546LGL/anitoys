const express = require("express");
const session = require("express-session");
const mysql = require("mysql");
const cors = require("cors");
const captcha = require('svg-captcha');

var pool = mysql.createPool({
   host:"127.0.0.1",
   user:"root",
   password:"",
   port:3306,
   connectionLimit:15,
   database:"gk",
    // host     : process.env.MYSQL_HOST,
    // port     : process.env.MYSQL_PORT,
    // user     : process.env.ACCESSKEY,
    // password : process.env.SECRETKEY,
    // database : 'app_' + process.env.APPNAME,

    connectionLimit: 5
})
//4:创建web服务器
var server = express();
//5:配置跨域
//允许跨域程序端口
server.use(cors({
    //允许哪个程序列表 脚手架
    origin:["http://127.0.0.1:8080","http://127.0.0.1:4000",
    "http://localhost:8080"],
    //每次请求验证
    credentials:true
}));
//6:配置session对象
server.use(session({
   secret:"128位安全字符串",//加密条件
   resave:true,            //请求更新数据
   saveUninitialized:true  //保存初始化数据
}))
//7:指定静态目录  public
server.use(express.static("public")); 
//8:启动监听端口  4000
server.listen(4000);

server.get('/register',(req,res,next)=>{
  let options={
    size:4,
    ignoreChars: '0oO1lI',
    noise:1,
    color:true,
    background:'#fff',
    width: 150,
    height: 50,
    fontSize: 50,
  }
  let c= captcha.create(options)
  req.session.captcha = c.text.toLowerCase()
  req.session.save()
  res.type('svg')
  res.send(c.data)
})


//注册
server.get("/reg",(req,res)=>{
  let output ={};
  var captcha = req.query.captcha
	if(!captcha){  //客户端未提交验证码
		output.code = 409
		output.msg = 'captcha required'
		res.send(output)
		return
	}
	if(captcha.toLowerCase() !== req.session.captcha){	//客户端提交的验证码有误
		output.code = 410
		res.send(output);
		return
	}

  var uname = req.query.uname;
  var upwd = req.query.upwd;
  var sql = "SELECT uid FROM gk_user WHERE uname = ?";
  pool.query(sql,[uname],(err,result)=>{
    if(result.length==0){
      var sql = `INSERT INTO gk_user VALUES(null,'${uname}','${upwd}')`;
    }else{
      res.send({code:-2,msg:"已存在"});
      return;
    }
    pool.query(sql,(err,result)=>{
      if(err)throw err;
      res.send({code:2,msg:"注册成功"})
    })
  })
})

//登录验证
server.get("/login",(req,res)=>{
  let output ={};
  var captcha = req.query.captcha
	if(!captcha){  //客户端未提交验证码
		output.code = 409
		output.msg = 'captcha required'
		res.send(output)
		return
	}
	if(captcha.toLowerCase() !== req.session.captcha){	//客户端提交的验证码有误
		output.code = 410
		res.send(output);
		return
	}

  var n = req.query.uname;
  var p = req.query.upwd;
  var sql =" SELECT uid FROM gk_user WHERE uname = ? AND upwd = ?";
  pool.query(sql,[n,p],(err,result)=>{
     if(err)throw err;
     if(result.length==0){
       res.send({code:-1,msg:"用户名或密码有误"})
     }else{
       req.session.uid=result[0].uid;
       res.send({code:1,msg:"登录成功"});
     }
  })
})

//退出登录
server.get("/loginout",(req,res)=>{
  if(req.session.uid!==""){
    req.session.uid="";
    res.send({code:1,msg:"退出成功"});
  }
})






server.get("/coupons",(req,res)=>{
  var sql = " SELECT lid,title,price,storename,pic FROM coupons";
  pool.query(sql,(err,result)=>{
    if(err)throw err;
    res.send({code:1,msg:"查询成功",data:result})
  })
  //x:json
})

// ghost层
server.get("/ghost",(req,res)=>{
  var sql = "SELECT lid,title,pic,price FROM ghost";
  pool.query(sql,(err,result)=>{
    if(err)throw err;
    res.send({code:1,msg:"查询成功",data:result})
  })
})

// fate层
server.get("/fate",(req,res)=>{
  var sql = "SELECT lid,title,pic,price FROM fate";
  pool.query(sql,(err,result)=>{
    if(err)throw err;
    res.send({code:1,msg:"查询成功",data:result})
  })
})

// sega层
server.get("/sega",(req,res)=>{
  var sql = "SELECT lid,title,pic,price FROM sega";
  pool.query(sql,(err,result)=>{
    if(err)throw err;
    res.send({code:1,msg:"查询成功",data:result})
  })
})

//商品列表
server.get("/product",(req,res)=>{
  var pno = req.query.pno;
  var ps = req.query.pageSize;
  if(!pno){pno=1}
  if(!ps){ps=24}
  var offset = (pno-1)*ps;
  ps = parseInt(ps);
  var sql = "SELECT lid,title,pic,price FROM products LIMIT ?,?";
  pool.query(sql,[offset,ps],(err,result)=>{
    if(err)throw err;
    res.send({code:1,msg:"查询成功",data:result})
  })
})


//详情
server.get("/look",(req,res)=>{
  var lid = req.query.lid;
  console.log("app详情:"+lid);
  var sql = "SELECT title,subtitle,price,brand,shelf_time,sold_time,role_name,works_name,make,make_group,color,descr,produ,dealer,copyright,lid,pic FROM products WHERE lid=?";
  pool.query(sql,[lid],(err,result)=>{
    if(err)throw err;
    res.send({code:1,msg:"查询成功",data:result})
  })
})

//确认页
server.get("/lookconfirm",(req,res)=>{
  var lid = req.query.lid;
  console.log("confirm:"+lid);
  var sql = "SELECT title,subtitle,price,brand,shelf_time,sold_time,role_name,works_name,make,make_group,color,descr,produ,dealer,copyright,lid,pic FROM products WHERE lid=?";
  pool.query(sql,[lid],(err,result)=>{
    if(err)throw err;
    res.send({code:1,msg:"查询成功",data:result})
  })
})

//详情页图片
server.get("/lookpic",(req,res)=>{
  var lid = req.query.lid;
  var sql = "SELECT pic FROM product_pic WHERE lid=?";
  console.log("app图片:"+lid);
  pool.query(sql,[lid],(err,result)=>{
    if(err)throw err;
    res.send({code:1,msg:"查询成功",data:result})
  })
})

//加入购物车
server.get("/addcart",(req,res)=>{
  var uid = req.session.uid;
  if(!uid){
    res.send({code:-2,msg:"请登录"});
    return;
  }
  var lid = req.query.lid;
  var pic = req.query.pic;
  var title = req.query.title;
  var price = req.query.price;
  var sql = "SELECT id FROM gk_cart WHERE uid = ? AND lid = ?";
  pool.query(sql,[uid,lid],(err,result)=>{
    if(err)throw err;
    if(result.length==0){
      var sql = `INSERT INTO gk_cart VALUES(null,${lid},'${pic}','${title}','${price}',1,${uid})`;
    }else{
      var sql = `UPDATE gk_cart SET count=count+1 WHERE uid=${uid} AND lid=${lid}`;
    }
    pool.query(sql,(err,result)=>{
      if(err)throw err;
      res.send({code:1,msg:"添加成功"})
    })
  })
})

//订单


// 购物车数量减少
server.get("/reducecart",(req,res)=>{
  var uid = req.session.uid;
  if(!uid){
    res.send({code:-2,msg:"请登录"});
    return;
  }
  var lid = req.query.lid;
  var sql = "SELECT count FROM gk_cart WHERE uid = ? AND lid = ?";
  pool.query(sql,[uid,lid],(err,result)=>{
    if(err)throw err;
    if(result.length==0){
      var sql = `DELETE FROM gk_cart WHERE uid=${uid} AND lid=${lid}`;
    }else{
      var sql = `UPDATE gk_cart SET count=count-1 WHERE uid=${uid} AND lid=${lid}`;
    }
    pool.query(sql,(err,result)=>{
      if(err)throw err;
      res.send({code:1,msg:"添加成功"})
    })
  })
})

//查看购物车
server.get("/findcart",(req,res)=>{
  var uid = req.session.uid;
  if(!uid){
    res.send({code:-2,msg:"请登录",data:[]});
    return;
  }
  var sql = "SELECT id,lid,pic,title,price,count FROM gk_cart WHERE uid=?";
  pool.query(sql,[uid],(err,result)=>{
    if(err) throw err;
    res.send({code:1,msg:"查询成功",data:result})
  })
})

//查看订单
server.get("/findorder",(req,res)=>{
  var uid = req.session.uid;
  if(!uid){
    res.send({code:-2,msg:"请登录",data:[]});
    return;
  }
  var sql = "SELECT id,lid,pic,title,price,count FROM gk_order WHERE uid=?";
  pool.query(sql,[uid],(err,result)=>{
    if(err) throw err;
    res.send({code:1,msg:"查询成功",data:result})
  })
})

//删除一条记录
server.get("/del",(req,res)=>{
  var uid = req.session.uid;
  if(!uid){
    res.send({code:-2,msg:"请登录"});
    return;
  }
  var lid = req.query.lid;
  console.log(lid);
  var sql = "DELETE FROM gk_cart WHERE lid=?";
  //delete 条件 affectedRows 影响行数
  pool.query(sql,[lid],(err,result)=>{
    if(err) throw err;
    if(result.affectedRows>0){
      res.send({code:1,msg:"删除成功"});
    }else{
      res.send({code:-1,msg:"删除失败"});
    }
  })
})

//删除多条记录
server.get("/delm",(req,res)=>{
  //1.获取uid判断用户是否登录成功
  var uid = req.session.uid;
  if(!uid){
    res.send({code:1,msg:"请登录"})
  }
  // console.log(uid);
  //2.如果登录成功,获取参数ids,删除id列表
  var lids = req.query.lids;
  var sql = `DELETE FROM gk_cart WHERE lid IN (${lids})`
  //3.删除
  pool.query(sql,(err,result)=>{
    if(err) throw err;
    if(result.affectedRows>0){
      res.send({code:1,msg:"删除成功"})
    }else{
      res.send({code:-1,msg:"删除失败"})
    }
  })
})

//清空购物车
server.get("/delall",(req,res)=>{
  //1.获取uid判断用户是否登录成功
  var uid = req.session.uid;
  if(!uid){
    res.send({code:1,msg:"请登录"})
  }
  var lids = req.query.lids;
  var sql = `DELETE FROM gk_cart WHERE lid IN (${lids})`
  pool.query(sql,(err,result)=>{
    if(err) throw err;
    if(result.affectedRows>0){
      res.send({code:1,msg:"已清空"})
    }else{
      res.send({code:-1,msg:"清空失败"})
    }
  })
})
