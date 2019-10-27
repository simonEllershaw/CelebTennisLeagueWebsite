const app = require('./app');
var server = app.listen(process.env.PORT || '8090', function(){
	console.log("server is running on port %s", server.address().port)
})
