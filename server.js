const express = require('express');
const app = express();
app.use('/', express.static("./public"));
app.use('/', express.static("./views"));

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true}));

let multer = require('multer');
var storage = multer.diskStorage({

  destination : function(req, file, cb){
    cb(null, './public/images/backup/')
  },
  filename : function(req, file, cb){
    cb(null, file.originalname )
  }

});
var upload = multer({storage : storage});


const MongoClient = require('mongodb').MongoClient;
var db, db2;

app.set('view engine', 'ejs');

/* 데이터 베이스 연결 */
MongoClient.connect('mongodb+srv://boyon:8tmyesjgT98IamIx@draw.vle7edh.mongodb.net/?retryWrites=true&w=majority',  { useUnifiedTopology: true }, function (에러, client) {
	if (에러) return console.log(에러)
	db = client.db('todoapp');
    db2 = client.db('draw');

	app.listen(8080, function () {
		console.log('listening on 8080')
	});
});


/* (연결) 개인사이트 페이지 */
app.get('/', function(req,res){
    res.sendFile(__dirname+'/public/index.html');
});

/* (연결) 마이홈 페이지 - 데이터 전달 */
app.get('/myhome', function(req, res){
    db2.collection('commentAccess').find().toArray(function(err, result){
        console.log(result);
        res.render('myhome.ejs', {posts : result});
    });
});

/* (저장) 마이홈 페이지 - 댓글작성 기능 : post 요청 시 DB에 댓글 저장 */
app.post('/comment', function(req, res){
    db2.collection('counter').findOne({name : '게시물갯수'}, function(err, result){
        console.log(result.totalPost);
        var 총게시물갯수 = result.totalPost;

        db2.collection('comment').insertOne({_id : 총게시물갯수 + 1, name : req.body.name, date : req.body.starttime, comment : req.body.comment}, function(){
            console.log('저장완료');
            console.log(req.body);
            /* updateOne ({어떤 데이터를 수정할지}, {수정값}, function(){}) 
            이때 {수정값} 항목에 연산자 사용시 { $연산자 : {수정값}}으로 작성하게 된다 */
            db2.collection('counter').updateOne({name : '게시물갯수'},{ $inc : {totalPost :1}},function(err, result){
                if(err){return console.log(err)};
                res.redirect('/myhome');
            });
        });    
    });
});


/* (연결) 요청 페이지 - 작성한 댓글 불러오기 : /request로 get 요청 시 저장된 데이터 보여줌 */
app.get('/request', function(req, res){
    db2.collection('comment').find().toArray(function(err, result){
        console.log(result);
        res.render('private_call.ejs', {posts : result});
    });
});

/* (삭제) 요청 페이지 - 댓글 삭제 : /detele2로 요청시 저장된 데이터 삭제 */
app.delete('/delete2', function(req, res){
    console.log(req.body);
    req.body._id = parseInt(req.body._id);

    /* deleteOne ({어떤 항목을 삭제할지}, function(){}) */
    db2.collection('comment').deleteOne(req.body, function(err, result){
        console.log('삭제완료');
        res.status(200).send({massage : 'success'});
    });
});

/* (삭제) 요청 페이지 - 댓글 승인 : /detele2로 요청시 저장된 데이터 복사 및 삭제 */
app.delete('/access2', function(req, res){
    console.log(req.body);
    req.body._id = parseInt(req.body._id);
    /* db에서 _id에 해당되는 값 찾기 */
    db2.collection('comment').find({_id : req.body._id}).toArray(function(err, result){

        console.log(result);
        var result = result;
        /* 배열안에 배열이 저장된 것으로 인식됨, 따라서 배열에서 배열을 꺼냄 */
        var results = result.pop();

        /* 다른 collection에 데이터 넣기 */
        db2.collection('commentAccess').insertOne({_id : results._id, name : results.name, date : results.date, comment : results.comment},function(){
            console.log('저장완료');
            /* 기존 collection에 있는 데이터 삭제하기 */
            db2.collection('comment').deleteOne(req.body, function(err, result){
                console.log('삭제완료');
                res.status(200).send({massage : 'success'});
            }); 
        });
    
    });
});

/* (연결) 타임라인 페이지 */
app.get('/timeline', function(req, res){
    res.render('timeline.ejs');
});

/* (연결) 갤러리 페이지 */
app.get('/gallery', function(req, res){
    db2.collection('gallery').find().toArray(function(err, result){
        console.log(result);
        res.render('gallery.ejs', {posts : result});
    });
});

/* (저장) 갤러리 페이지 - 이미지 업로드 */
app.post('/upload', upload.single('inputFile'), function(req, res){
    db2.collection('counter').findOne({name : '게시물갯수'}, function(err, result){
        console.log(result.totalPost);
        var 총게시물갯수 = result.totalPost;
        console.log(req.file.originalname);

        db2.collection('gallery').insertOne({_id : 총게시물갯수 + 1, name : req.file.originalname}, function(){
            console.log('저장완료');
            /* updateOne ({어떤 데이터를 수정할지}, {수정값}, function(){}) 
            이때 {수정값} 항목에 연산자 사용시 { $연산자 : {수정값}}으로 작성하게 된다 */
            db2.collection('counter').updateOne({name : '게시물갯수'},{ $inc : {totalPost :1}},function(err, result){
                if(err){return console.log(err)};
                res.redirect('/gallery');
            });
        });    
    });
  }); 




