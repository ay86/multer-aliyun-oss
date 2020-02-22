/**
 * @Author Angus <angusyoung@mrxcool.com>
 * @Description Multer storage for Aliyun OSS
 * @Since 2018/8/17
 */
const OSS = require('ali-oss');
const crypto = require('crypto');

const getFilename = (req, ossPath, file, cb) => {
    crypto.pseudoRandomBytes(16, (err, raw) => {
        cb(err, err ? undefined :
            ossPath + '/' + (raw.toString('hex') + file.originalname.substr(file.originalname.lastIndexOf('.')))
        );
    });
};

class AliYunOssStorage {

    constructor(opts) {
        this.client = new OSS(opts.config);
        this.ossPath = opts.config.path || '';
        this.getFilename = opts.filename || getFilename;
    }

    _handleFile(req, file, cb) {
        if (!this.client) {
            console.error('oss client undefined');
            return cb({message: 'oss client undefined'});
        }
        this.getFilename(req, this.ossPath, file, (err, filename) => {
            if (err) return cb(err);
            this.client.putStream(filename, file.stream).then(
                result => {
                    this.client.getObjectMeta(`${result.name}`)
                        .then((meta) => {
                            return cb(null, {
                                filename: result.name,
                                url: result.url,
                                filesize: (meta && meta.status && meta.res && meta.res.headers) ? meta.res.headers["content-length"] : null
                            });
                        })
                        .catch(e => {
                            return cb(null, {
                                filename: result.name,
                                url: result.url,
                                filesize: null
                            });
                        })
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
