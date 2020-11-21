/**
 * @Author Angus <angusyoung@mrxcool.com>
 * @Description Multer storage for Aliyun OSS
 * @Since 2018/8/17
 */
const OSS = require('ali-oss');
const crypto = require('crypto');


const ERROR_MESSAGE = 'oss client undefined'

const getFilename = ({ req, file, ossPath }) => {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, raw) => {
            err && reject(err)
            let ext = '';
            if (file.originalname.indexOf(".") > -1) {
                ext = file.originalname.substr(file.originalname.lastIndexOf('.'));
            }
            let name = raw.toString('hex') + ext;
            resolve(name)
        });
    })
};

const getPath = (path) => {
    return function() {
        return Promise.resolve(path)
    }
}

class AliYunOssStorage {

    constructor(opts) {
        if (opts.config.path && typeof opts.config.path === 'string') {
            this.getPath = getPath(opts.config.path)
        } else if(opts.config.path && typeof opts.config.path === 'function') {
            this.getPath = opts.config.path
        } else {
            this.getPath = getPath('')
        }

        this.client = new OSS(opts.config);
        this.getFilename = opts.filename || getFilename;
    }

    _handleFile(req, file, cb) {
        if (!this.client) {
            console.error(ERROR_MESSAGE);
            return cb({ message: ERROR_MESSAGE });
        }
        let ossPath, filename, url, size;
        this.getPath({ req, file })
            .then(_ossPath => {
                ossPath = _ossPath
                return this.getFilename({ req, file })
            })
            .then(_filename => {
                filename = _filename
                return this.client.putStream(ossPath + '/' + filename, file.stream)
            })
            .then(({ url: _url, name }) => {
                url = _url
                return this.client.getObjectMeta(name)
            })
            .then(meta => {
                size = (meta && meta.status && meta.res && meta.res.headers) ? meta.res.headers["content-length"] : null
                return cb(null, {
                    destination: url.substr(0, url.lastIndexOf('/')),
                    filename,
                    path: url,
                    size
                })
            })
            .catch(err => {
                return cb(err)
            })
    }

    _removeFile(req, file, cb) {
        if (!this.client) {
            console.error(ERROR_MESSAGE);
            return cb({ message: ERROR_MESSAGE });
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
    if (typeof opts === 'object' && opts !== null) {
        return new AliYunOssStorage(opts);
    }
    throw new TypeError('Expected object for argument options');
};
