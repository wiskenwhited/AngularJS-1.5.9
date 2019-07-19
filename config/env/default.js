var path = require('path');
var protocol = process.env.TELECOM_PROTOCOL || 'http';
var port = process.env.TELECOM_PORT || process.env.PORT || 4000;

module.exports = {
	protocol: protocol,
	port: port,
	host: protocol + '://' + (process.env.TELECOM_HOSTNAME || 'localhost' || ('158.69.82.249:' + port)),
	webConcurrency: process.env.WEB_CONCURRENCY || require('os').cpus().length,

	apiPrefix: process.env.SURFACE_OWL_API_PREFIX || '',
	apiVersion: process.env.SURFACE_OWL_API_VERSION || '',

	logLevel: process.env.TELECOM_LOG_LEVEL || 'debug', // winston logging level

	clientAppPath: process.env.TELECOM_CLIENT_PATH || path.resolve(__dirname, '../../client/index.html'),
	uploadPath: path.resolve(__dirname, '../../../../upload'),
	viewPath: path.resolve(__dirname, '../../views'),
	jwt: { 
		secret:  'Telecom',
		expiresIn: 24 * 60 * 60, // 24 hours in seconds
		cookieName: process.env.TELECOM_JWT_COOKIE_NAME || 'yc_sss'
	},
};
