const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true}));

app.use('/', express.static("./public"));

const MongoClient = require('mongodb').MongoClient;

var db;

MongoClient.connect('mongodb+srv://boyon:8tmyesjgT98IamIx@draw.vle7edh.mongodb.net/?retryWrites=true&w=majority',  { useUnifiedTopology: true }, function (에러, client) {
	if (에러) return console.log(에러)
	db = client.db('todoapp');

        db.collection('post').insertOne( {이름 : 'John', _id : 100} , function(에러, 결과){
	    console.log('저장완료'); 
	});

	app.listen(8080, function () {
		console.log('listening on 8080')
	});
});


/* 그리다_개인사이트 페이지 */
app.get('/page', function(req,res){
    res.sendFile(__dirname+'/public/html/private_site_manager.html');
});



app.get('/write', function(요청, 응답) { 
    응답.sendFile(__dirname +'/write.html')
  });

/* /add 경로로 post 요청 시 res */
// app.post('/add', function(req,res){
//     res.send('전송완료');
//     console.log(req.body);
//     db.collection('example').insertOne({title : req.body.title, date : req.body.date}, function(){
//         console.log('저장완료');
//     })
// });