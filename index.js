/**
 * @Author Angus <angusyoung@mrxcool.com>
 * @Description Multer storage for Aliyun OSS
 * @Since 2018/8/17
 */
const OSS = require('ali-oss');
const crypto = require('crypto');

const getFilename = (req, file, cb) => {
	crypto.pseudoRandomBytes(16, (err, raw) => {
		cb(err, err ? undefined :
			(raw.toString('hex') + file.originalname.substr(file.originalname.lastIndexOf('.')))
		);
	});
};

class AliYunOssStorage {
	constructor(opts) {
		this.client = new OSS(opts.config);
		this.getFilename = opts.filename || getFilename;
	}

	_handleFile(req, file, cb) {
		if (!this.client) {
			console.error('oss client undefined');
			return cb({message: 'oss client undefined'});
		}
		this.getFilename(req, file, (err, filename) => {
			if (err) return cb(err);
			this.client.putStream(filename, file.stream).then(
				result => {
					return cb(null, {
						filename: result.name,
						url     : result.url
					});
				}
			).catch(err => {
				return cb(err);
			});
		});
	}

	_removeFile(req, file, cb) {
		if (!this.client) {
			console.error('oss client undefined');
			return cb({message: 'oss client undefined'});
		}
		this.client.delete(file.filename).then(
			result => {
				return cb(null, result);
			}
		).catch(err => {
			return cb(err);
		});
	}
}

module.exports = function (opts) {
	return new AliYunOssStorage(opts);
};
