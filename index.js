/**
 * @Author Angus <angusyoung@mrxcool.com>
 * @Description Multer storage for Aliyun OSS
 * @Since 2018/8/17
 */
const { promisify } = require('util');
const Path = require('path');
const crypto = require('crypto');
const OSS = require('ali-oss');

const ERROR_NO_CLIENT = new Error('oss client undefined');

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
            return cb(ERROR_NO_CLIENT);
        }

        const getDestination = promisify(this.getDestination);
        const getFilename = promisify(this.getFilename);

        let size = 0;

        Promise.all([
            getDestination(req, file),
            getFilename(req, file)
        ])
            .then(([destination, filename]) => {
                // add listener here because if put in upper scope,
                // the uploaded file will be 0 byte (very weird!).
                file.stream.on('data', chunk => {
                    size += Buffer.byteLength(chunk);
                });
                return this.client.putStream(`${destination}/${filename}`, file.stream);
            })
            .then(result => {
                const { url, name } = result;
                const lastSlashIndex = name.lastIndexOf('/');
                const path = name.substr(0, lastSlashIndex);
                cb(null, {
                    destination: path,
                    filename: name.substr(lastSlashIndex + 1),
                    path,
                    size,
                    url
                });
            })
            .catch(cb);

    }

    _removeFile(req, file, cb) {
        if (!this.client) {
            return cb(ERROR_NO_CLIENT);
        }
        this.client
            .delete(file.filename)
            .then(result => cb(null, result))
            .catch(cb);
    }
}

module.exports = function (opts) {
    // error first
    if (typeof opts !== 'object' || opts === null) {
        throw new TypeError('Expected object for argument options');
    }
    return new AliYunOssStorage(opts);
};
