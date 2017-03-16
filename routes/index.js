var express = require('express');
var crypto  = require('crypto');
var router = express.Router();


/* 页面权限控制. */
function checkLogin(req, res, next) {
	if (!req.session.user) {
		req.flash('error', '未登陆！');
		res.redirect('/login');
	}
	next();
}

function checkNotLogin(req, res, next) {
	if (req.session.user) {
		req.flash('error', '已登陆！');
		res.redirect('back');
	}
	next();
}


/* GET home page. */
router.get('/', function(req, res) {
	var post = global.dbHandel.getModel('post');
//	post.find({}, function(err, posts) {
//		if (err) {
//			posts = [];
//		}
//		res.render('index', { 
//			title: '主页',
//			user: req.session.user,
//			posts: posts,
//			success: req.flash('success').toString(),
//			error: req.flash('error').toString()
//		});
//	});
	post.find({}).exec().then((posts) => {
		res.render('index', {
			title: '主页',
			user: req.session.user,
			posts: posts,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	}).catch((err) => {
		posts = [];
	});
});


/*route  resgister page. */
router.route('/reg').all(checkNotLogin).get(function(req, res) {
	res.render('reg', { 
		title: '注册',
		user: req.session.user,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	});
}).post(function(req, res) {
	var name        = req.body.name,
		password    = req.body.password,
		email       = req.body.email,
		password_re = req.body['password-repeat'];
	//生成密码的md5值
	var md5	= crypto.createHash('md5');
	var newUser = global.dbHandel.getModel('user');
	
	//检验用户两次输入密码是否一致
	if (password_re !== password) {
		req.flash('error', '两次输入的密码不一致！');
		return res.redirect('/reg'); //返回注册页
	}
	
	password = md5.update(password).digest('hex');
	//newUser.findOne({name: name}, function(err, doc) {
	//	if (err) {
	//		req.flash('error', err);
	//		return res.redirect('/');
	//	} else if (doc) {
	//		req.flash('error', '用户已存在！');
	//		return res.redirect('/reg');
	//	} else {
	//		newUser.create({
	//			name: name,
	//			password: password,
	//			email: email
	//		}, function (err1, doc1) {
	//			if (err1) {
	//				req.flash('error', err1);
	//				return res.redirect('/');
	//			} else {
	//				req.session.user = doc1;
	//				req.flash('success', '注册成功！');
	//				res.redirect('/');
	//			}
	//		});
	//	}
	//});
	newUser.findOne({name: name}).exec().then((doc) => {
		if (doc) {
			req.flash('error', '用户已存在！');
			return res.redirect('/reg');
		} else {
			return new newUser({
				name: name,
				password: password,
				email: email
			}).save();
		}
	}).then((doc1) => {
		req.session.user = doc1;
		req.flash('success', '注册成功！');
		res.redirect('/');
	}).catch((err) => {
			req.flash('error', err);
			return res.redirect('/');
	});
	
});


/*route login page. */
router.route('/login').all(checkNotLogin).get(function(req, res) {
	res.render('login', { 
		title: '登陆',
		user: req.session.user,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	});
}).post(function(req, res) {
	var md5      = crypto.createHash('md5'),
		name     = req.body.name,
		password = md5.update(req.body.password).digest('hex'),
	    user     = global.dbHandel.getModel('user');
	
	//检查用户是否存在
	user.findOne({name: name}, function(err, doc) {
		if (err) {
			req.flash('error', err);
			return res.redirect('/');
		} else if (!doc) {
			req.flash('error', '用户不存在！');
			return res.redirect('/login');
		} else {
			if (doc.password !== password) {
				req.flash('error', '密码错误！');
				return res.redirect('/login');
			}
			req.session.user = doc;
			req.flash('success', '登陆成功！');
			res.redirect('/');
		}
	});	
});


/*route post page. */
router.route('/post').all(checkLogin).get(function(req, res) {
	res.render('post', { 
		title: '发表',
		user: req.session.user,
		success:req.flash('success').toString(),
		error: req.flash('error').toString()
	});
}).post(function(req, res) {
	var newPost        = global.dbHandel.getModel('post');
	var currentUser = req.session.user;
	newPost.findOne({name: currentUser.name, title: req.body.title}, function(err, doc) {
		if (err) {
			req.flash('error', err);
			return res.redirect('/');
		}
		if (doc) {
			req.flash('error', '文章已存在！');
			return res.redirect('/post');
		}
		newPost.create({
			name: currentUser.name,
			title: req.body.title,
			post: req.body.post
		}, function(err1, doc1) {
			if (err1) {
				req.flash('error', err1);
				return res.redirect('/');
			} else {
			req.flash('success', '发布成功！');
			res.redirect('/');
			}
		});
	});
});


/*GET logout page. */
router.get('/logout', checkLogin,function(req, res) {
	req.session.user = null,
		req.flash('success', '登出成功！');
	res.redirect('/');
});


module.exports = router;
