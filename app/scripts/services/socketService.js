app.factory('socket', function (socketFactory) {
	return socketFactory({
		prefix: 'foo~',
		ioSocket: io.connect('http://172.24.1.1:4444')
	});
});
