const express = require('express');
const app = express();
app.use('/', express.static("./public"));

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

let multer = require('multer');
var storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, './public/images/backup/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }

});
var upload = multer({ storage: storage });

var http = require('http');
var fs = require('fs');
var url = require('url');

const MongoClient = require('mongodb').MongoClient;
var db, db2;

app.set('view engine', 'ejs');

/* 로그인 */
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

app.use(session({ secret: '비밀코드', resave: true, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

/* 데이터 베이스 연결 */
MongoClient.connect('mongodb+srv://boyon:8tmyesjgT98IamIx@draw.vle7edh.mongodb.net/?retryWrites=true&w=majority', { useUnifiedTopology: true }, function (에러, client) {
    if (에러) return console.log(에러)
    db = client.db('todoapp');
    db2 = client.db('draw');

    app.listen(8080, function () {
        console.log('listening on 8080')
    });
});





/* */
/* (연결) 개인사이트 페이지 */
app.get('/', function (req, res) {
    db2.collection('profile').find({ f_update : "Y" }).toArray(function (err, result) {
        res.render('main.ejs', {profile: result });
    });
});
app.get('/home',homelogin, function (req, res) {
    db2.collection('profile').find({ f_update : "Y" }).toArray(function (err, result) {
        res.render('main_login.ejs', {profile: result, login: req.user });
    });

});

/* 로그인 확인 */
function homelogin(req, res, next) {

    if (req.user) {
        next()
    }
    else {
        res.redirect('/');
        /* 방문자 페이지 보여주기 */
    }
}


/* (연결) 검색 페이지 
app.get('/search', function (req, res) {
    console.log(req.query.value);
        
    db2.collection('profile').find({f_update : "Y"}).toArray(function (err, result) {
        db2.collection('profile').find({$or : [{f_tribe : req.query.value}, {f_name : req.query.value}, {f_gender : req.query.value}, {f_birthday: req.query.value}, {f_intro : req.query.value}]}).toArray(function (err, result) {
            res.render('main_search.ejs', {value:req.query.value, profile : result});
        });
    });
});
*/

app.get('/search', function (req, res) {
    console.log(req.query.value);
        
    db2.collection('profile').find({f_update : "Y"}).toArray(function (err, result) {
        var search = [
            {
                $search: {
                  index: 'ProfileSearch',
                  text: {
                    query: req.query.value,
                    path: ['f_name', 'f_tribe', 'f_gender', 'f_intro', 'f_birthday', 'f_update']  // 제목날짜 둘다 찾고 싶으면 ['제목', '날짜']
                  }
                }
              }
        ]
        db2.collection('profile').aggregate(search).toArray(function (err, result) {
            res.render('main_search.ejs', {value:req.query.value, profile : result});
        });
    });
});


/* */
/* (연결) 로그인 페이지 */
app.get('/login', function (req, res) {
    res.render('login.ejs');
});

/* (저장) 로그인 페이지 */
app.post('/login', passport.authenticate('local', { failureRedirect: '/fail' }), function (req, res) {
    res.redirect('/home');
});

/* 아이디 값 비교 */
passport.use(new LocalStrategy({
    usernameField: 'id', /* input값의 name 속성 확인 */
    passwordField: 'pw', /* 비번 값 확인 */
    session: true, /* 세션을 만들 것인지 확인 */
    passReqToCallback: false, /* 아이디, 비번 이외에 다른 검사가 필요한지 */
}, function (입력한아이디, 입력한비번, done) {
    db2.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
        if (에러) return done(에러)

        if (!결과) return done(null, false, { message: '존재하지않는 아이디입니다' })
        if (입력한비번 == 결과.pw) {
            return done(null, 결과)
        } else {
            return done(null, false, { message: '잘못된 비밀번호입니다' })
        }
    })
}));

/* 세션 제작 - 유저의 id를 세션데이터 만들고 쿠키로 만들어서 전송 */
passport.serializeUser(function (user, done) {
    done(null, user.id)
});

/* 세션아이디를 바탕으로 이 유저의 정보를 DB에서 찾기 */
passport.deserializeUser(function (아이디, done) {
    db2.collection('login').findOne({ id: 아이디 }, function (에러, 결과) {
        done(null, 결과)
    })
});

/* (연결) 회원가입 페이지 */
app.get('/signup', function (req, res) {
    res.render('signup.ejs');
});

/* (저장) 회원가입 페이지 */
app.post('/signup', function (req, res) {

    db2.collection('login').insertOne({ id: req.body.id, pw: req.body.pw }, function () {
        db2.collection('profile').insertOne({ loginid: req.body.id, f_image: "user.png", f_name: "이름", f_tribe: "종", f_gender: "성별", f_birthday: "탄생일", f_intro: "프로필을 입력해주세요" }, function (err, result) {
            res.redirect('/login');
        });
    });
});






/* */
/* (연결) 게시판 페이지 */
app.get('/info', function (req, res) {

    db2.collection('notice').find().toArray(function (err, result) {
            res.render('information.ejs', { notice: result, id:req.user, login: req.user});
        });
});

app.get('/info/write', function (req, res) {
    res.render('information_write.ejs',{login: req.user});
});

app.post('/infowrite', function (req, res) {
    let today = new Date();
    let time = today.toLocaleDateString();

    db2.collection('notice').insertOne({ title: req.body.title, time: time, content: req.body.content, loginid: req.user.id }, function () {
            console.log('저장완료');
            res.redirect('/info');
    });
});

app.get('/info/read', function (req, res) {
    db2.collection('notice').find({ loginid: req.query.value }).toArray(function (err, result) {
            res.render('information_reading.ejs', { notice: result, login: req.user });
        });
});





/* */
/* (연결) 마이홈 페이지 - 데이터 전달 */
app.get('/myhome:id', myhomelogin, function (req, res) {
    db2.collection('commentAccess').find({ id: req.user.id }).toArray(function (err, result) {
        _id: parseInt(req.user.id);
        /* 회원가입 시 프로필 데이터에 아이디 값만 있는 빈 공간 만들기 */
        /* 프로필 데이터 전송 */
        db2.collection('profile').find({ loginid: req.user.id }).toArray(function (err, result2) {
            console.log(result2);
            res.render('myhome.ejs', { posts: result, profile: result2, login: req.user });
        });
    });
});

/* (연결) 프로필 페이지 - 프로필 편집 기능 */
app.get('/myhome/edit', function (req, res) {
    db2.collection('profile').find().toArray(function (err, result) {

        /* 프로필 데이터 전송 */
        db2.collection('profile').find({ loginid: req.user.id }).toArray(function (err, result2) {
            console.log(result2);
            res.render('myhome_edit.ejs', { posts: result, profile: result2, login: req.user });
        });
    });
});

/* (저장) 프로필 페이지 - 프로필 내역 업데이트 */
app.post('/profile', upload.single('inputFile3'), function (req, res) {

    console.log(req.body);
    console.log(req.file);
    db2.collection('profile').update({ loginid : req.user.id }, { $set: { f_image : req.file.originalname, f_name : req.body.name, f_tribe : req.body.tribe, f_gender : req.body.gender, f_birthday : req.body.birthday, f_intro : req.body.intro, f_update : "Y" } }, function (err, result) {
        if (err) { return console.log(err) };
        res.redirect('/myhome:id');
    });
});

/* (저장) 마이홈 페이지 - 댓글작성 기능 : post 요청 시 DB에 댓글 저장 */
app.post('/comment', function (req, res) {
    db2.collection('counter').findOne({ name: '게시물갯수' }, function (err, result) {
        var 총게시물갯수 = result.totalPost;

        db2.collection('comment').insertOne({ _id: 총게시물갯수 + 1, name: req.body.name, date: req.body.starttime, comment: req.body.comment, id: req.body.linkId }, function () {
            console.log('저장완료');
            console.log(req.body);
            /* updateOne ({어떤 데이터를 수정할지}, {수정값}, function(){}) 
            이때 {수정값} 항목에 연산자 사용시 { $연산자 : {수정값}}으로 작성하게 된다 */
            db2.collection('counter').updateOne({ name: '게시물갯수' }, { $inc: { totalPost: 1 } }, function (err, result) {
                if (err) { return console.log(err) };
                res.redirect('' + req.body.link);
            });
        });
    });
});

/* 로그인 확인 */
function myhomelogin(req, res, next) {

    if (req.user) {
        next()
    }
    else {
        res.redirect('/');
        /* 방문자 페이지 보여주기 */
    }
}






/* */
/* (연결) 요청 페이지 - 작성한 댓글 불러오기 : /request로 get 요청 시 저장된 데이터 보여줌 */
app.get('/request:id', function (req, res) {
    db2.collection('comment').find({ id: req.user.id }).toArray(function (err, result) {
        _id: parseInt(req.user.id);
        /* 프로필 데이터 전송 */
        
        db2.collection('profile').find({ loginid: req.user.id }).toArray(function (err, result2) {
            res.render('private_call.ejs', { posts: result, profile: result2, login: req.user });
        });
    });
});

app.get('/setting:id', function (req, res) {
    /* 프로필 데이터 전송 */
    _id: parseInt(req.user.id);
    db2.collection('profile').find({ loginid: req.user.id }).toArray(function (err, result2) {
        res.render('private_set.ejs', { profile: result2, login: req.user });
    });
});

/* (삭제) 요청 페이지 - 댓글 삭제 : /detele2로 요청시 저장된 데이터 삭제 */
app.delete('/delete2', function (req, res) {
    console.log(req.body);
    req.body._id = parseInt(req.body._id);

    /* deleteOne ({어떤 항목을 삭제할지}, function(){}) */
    db2.collection('comment').deleteOne(req.body, function (err, result) {
        console.log('삭제완료');
        res.status(200).send({ massage: 'success' });
    });
});

/* (삭제) 요청 페이지 - 댓글 승인 : /detele2로 요청시 저장된 데이터 복사 및 삭제 */
app.delete('/access2', function (req, res) {
    console.log(req.body);
    console.log(req.user);
    req.body._id = parseInt(req.body._id);
    /* db에서 _id에 해당되는 값 찾기 */
    db2.collection('comment').find({ _id: req.body._id }).toArray(function (err, result) {

        console.log(result);
        var result = result;
        /* 배열안에 배열이 저장된 것으로 인식됨, 따라서 배열에서 배열을 꺼냄 */
        var results = result.pop();

        /* 다른 collection에 데이터 넣기 */
        db2.collection('commentAccess').insertOne({ _id: results._id, name: results.name, date: results.date, comment: results.comment, id: req.user.id }, function () {
            console.log('저장완료');
            /* 기존 collection에 있는 데이터 삭제하기 */
            db2.collection('comment').deleteOne(req.body, function (err, result) {
                console.log('삭제완료');
                res.status(200).send({ massage: 'success' });
            });
        });

    });
});



/* */
/* (연결) 갤러리 페이지 */
app.get('/gallery:id', function (req, res) {
    db2.collection('gallery').find({ id: req.user.id }).toArray(function (err, result) {
        _id: parseInt(req.user.id);
        /* 프로필 데이터 전송 */
        db2.collection('profile').find({ loginid: req.user.id }).toArray(function (err, result2) {
            res.render('gallery.ejs', { posts: result, profile: result2, login: req.user });
        });
    });
});

/* (저장) 갤러리 페이지 - 이미지 업로드 */
app.post('/upload', upload.single('inputFile'), function (req, res) {
    db2.collection('counter').findOne({ name: '게시물갯수' }, function (err, result) {
        console.log(result.totalPost);
        var 총게시물갯수 = result.totalPost;

        db2.collection('gallery').insertOne({ _id: 총게시물갯수 + 1, name: req.file.originalname, id: req.user.id }, function () {
            console.log('저장완료');
            /* updateOne ({어떤 데이터를 수정할지}, {수정값}, function(){}) 
            이때 {수정값} 항목에 연산자 사용시 { $연산자 : {수정값}}으로 작성하게 된다 */
            db2.collection('counter').updateOne({ name: '게시물갯수' }, { $inc: { totalPost: 1 } }, function (err, result) {
                if (err) { return console.log(err) };
                res.redirect('' + req.body.id);
            });
        });
    });
});



/* */
/* (연결) 타임라인 페이지 */
app.get('/timeline:id', function (req, res) {
    db2.collection('timeline').find({ id: req.user.id }).toArray(function (err, result) {
        //console.log(result);
        /* 프로필 데이터 전송 */
        _id: parseInt(req.user.id);
        db2.collection('profile').find({ loginid: req.user.id }).toArray(function (err, result2) {
            res.render('timeline.ejs', { posts: result, profile: result2, login: req.user });
        });
    });
});

/* (저장) 타임라인 페이지 - 이미지 및 게시글 업로드 & 갤러리 페이지 - 이미지 업로드 */
app.post('/posts', upload.single('inputFile2'), function (req, res) {
    var time = req.body.starttime;
    var times = time.split('-');
    console.log(times[0]);
    console.log(times[1]);
    console.log(times[2]);
    /* 만일 사진이미지가 있으면 if()문 실행 */
    if (req.file) {
        db2.collection('counter').findOne({ name: '게시물갯수' }, function (err, result) {
            // console.log(result.totalPost);
            var 총게시물갯수 = result.totalPost;

            db2.collection('timeline').insertOne({ _id: 총게시물갯수 + 1, year: times[0], month: times[1], day: times[2], comment: req.body.comment, imagename: req.file.originalname, id: req.user.id }, function (err, result) {
                console.log('저장완료');

                db2.collection('gallery').insertOne({ _id: 총게시물갯수 + 1, name: req.file.originalname, id: req.user.id }, function () {
                    console.log('저장완료');
                    db2.collection('counter').updateOne({ name: '게시물갯수' }, { $inc: { totalPost: 1 } }, function (err, result) {
                        if (err) { return console.log(err) };
                        res.redirect('' + req.body.id);
                    });
                });
            });
        });
    }
    else {
        /* 사진이미지가 없는 경우 실행 */
        db2.collection('counter').findOne({ name: '게시물갯수' }, function (err, result) {
            // console.log(result.totalPost);
            var 총게시물갯수 = result.totalPost;

            db2.collection('timeline').insertOne({ _id: 총게시물갯수 + 1, year: times[0], month: times[1], day: times[2], comment: req.body.comment, id: req.user.id }, function (err, result) {
                console.log('저장완료');
                db2.collection('counter').updateOne({ name: '게시물갯수' }, { $inc: { totalPost: 1 } }, function (err, result) {
                    if (err) { return console.log(err) };
                    res.redirect('' + req.body.id);
                });
            });
        });
    }
});




/* 게스트 */
/* (연결) 마이홈 게스트 페이지 - 데이터 전달 */
app.get('/guest/myhome', function (req, res) {
    var _url = req.url;
    var queryData = url.parse(_url, true).query;
    console.log(queryData.id);


    db2.collection('commentAccess').find({ id: queryData.id }).toArray(function (err, result) {
        /* 프로필 데이터 전송 */
        db2.collection('profile').find({ loginid: queryData.id }).toArray(function (err, result2) {
            res.render('guest/myhome2.ejs', { posts: result, profile: result2, login: queryData });
        });
    });
});


/* (연결) 갤러리 게스트 페이지 */
app.get('/guest/gallery', function (req, res) {
    var _url = req.url;
    var queryData = url.parse(_url, true).query;
    console.log(queryData.id);

    db2.collection('gallery').find({ id: queryData.id }).toArray(function (err, result) {
        console.log(result);
        /* 프로필 데이터 전송 */
        db2.collection('profile').find({ loginid: queryData.id }).toArray(function (err, result2) {
            console.log(result2);
            res.render('guest/gallery2.ejs', { posts: result, profile: result2, login: queryData });
        });
    });
});

/* (연결) 타임라인 페이지 */
app.get('/guest/timeline', function (req, res) {
    var _url = req.url;
    var queryData = url.parse(_url, true).query;
    console.log(queryData.id);

    db2.collection('timeline').find({ id: queryData.id }).toArray(function (err, result) {
        db2.collection('profile').find({ loginid: queryData.id }).toArray(function (err, result2) {
            console.log(result2);
            res.render('guest/timeline2.ejs', { posts: result, profile: result2, login: queryData });
        });
    });
});
