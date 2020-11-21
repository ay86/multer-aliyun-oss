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
            bucket: '<bucket>',
            path: ''
        }
    })
});
```

### File information

Each file contains the following information:

Key | Description | Note
--- | --- | ---
`fieldname` | Field name specified in the form |
`originalname` | Name of the file on the user's computer |
`encoding` | Encoding type of the file |
`mimetype` | Mime type of the file |
`size` | Size of the file in bytes |
`destination` | The folder to which the file has been saved | `DiskStorage`
`filename` | The name of the file within the `destination` | `DiskStorage`
`path` | The full path to the uploaded file | `DiskStorage`
`buffer` | A `Buffer` of the entire file | `MemoryStorage`

### Option
#### config.path

`String` or `Function`

```
// Function ES6 Promise
path ({ req, file }) {
    return new Promise((resolve, reject) => {
        resolve('images')
    })
}

// Function ES7 async/await
async path ({ req, file }) {
    return 'images'
}
```

### Author
&copy; AngusYoung

<angusyoung@mrxcool.com>