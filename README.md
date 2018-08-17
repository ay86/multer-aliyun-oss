# Multer Storage for AliYun OSS
Dependencies [@ali-oss](https://github.com/ali-sdk/ali-oss)
### Install
```npm
npm install --save multer-aliyun-oss
```
### Usage
```js
const multer = require('multer');
const MAO = require('multer-aliyun-oss');

const upload = multer({
    storage: MAO({
        config: {
            region: '<region>',
            accessKeyId: '<accessKeyId>',
            accessKeySecret: '<accessKeySecret>',
            bucket: '<bucket>'
        }
    })
});
```
### Author
&copy; AngusYoung

<angusyoung@mrxcool.com>