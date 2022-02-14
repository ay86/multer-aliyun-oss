/**
 * @Author Angus <angusyoung@mrxcool.com>
 * @Description Multer storage for Aliyun OSS
 * @Since 2018/8/17
 */
const { promisify } = require('util');
const Path = require('path');
const crypto = require('crypto');
const OSS = require('ali-oss');

const ERROR_NO_CLIENT = 'oss client undefined';

// keep same signature as multer native
function getRandomFilename(req, file, cb) {
  crypto.pseudoRandomBytes(16, function (err, raw) {
    cb(err, err ? undefined : `${raw.toString('hex')}${Path.extname(file.originalname)}`);
  });
}

class AliYunOssStorage {
    constructor({ config, destination = '', filename = getRandomFilename }) {
        this.client = new OSS(config);
        this.getDestination = typeof destination === 'string' ? (req, file, cb) => cb(null, destination) : destination;
        this.getFilename = filename;
    }

    _handleFile(req, file, cb) {
        if (!this.client) {
            return cb(new Error(ERROR_NO_CLIENT));
        }

        const getDestination = promisify(this.getDestination);
        const getFilename = promisify(this.getFilename);

        let size = 0;

        file.stream.on('data', chunk => {
          size += Buffer.byteLength(chunk);
        });

        Promise.all([
            getDestination(req, file),
            getFilename(req, file)
        ])
            .then(([destination, filename]) => this.client.putStream(`${destination}/${filename}`, file.stream))
            .then(result => {
                const { url, name } = result;
                const path = name.substr(0, url.lastIndexOf('/'));
                cb(null, {
                    destination: path,
                    filename: name,
                    path,
                    size
                });
            })
            .catch(cb);

    }

    _removeFile(req, file, cb) {
        if (!this.client) {
            return cb(new Error(ERROR_NO_CLIENT));
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
