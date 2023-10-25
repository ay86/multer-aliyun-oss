# Multer Storage for AliYun OSS

Dependencies [@ali-oss](https://github.com/ali-sdk/ali-oss)

## Install

```npm
npm install --save multer-aliyun-oss
```

## Usage

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
        },
        // to set path prefix for files, could be string or function
        // learn more to see multer document.
        destination: '',
        filename: ''
    })
});

const singleFileUpload = upload.single('yourformdataname');
singleFileUpload(req, res, function (err) {
    if (err) {
      // error handler
     console.error(err);
   }
   else {
      // success handler
      // req.file.filename
      // req.file.originalname
      res.send('ok');
   }
});
```

## File information

Each file contains the following information:

| Key            | Description                                   | Note            |
|----------------|-----------------------------------------------|-----------------|
| `fieldname`    | Field name specified in the form              |                 |
| `originalname` | Name of the file on the user's computer       |                 |
| `encoding`     | Encoding type of the file                     |                 |
| `mimetype`     | Mime type of the file                         |                 |
| `size`         | Size of the file in bytes                     |                 |
| `destination`  | The folder to which the file has been saved   | `DiskStorage`   |
| `filename`     | The name of the file within the `destination` | `DiskStorage`   |
| `path`         | The full path to the uploaded file            | `DiskStorage`   |
| `buffer`       | A `Buffer` of the entire file                 | `MemoryStorage` |

## Option

### destination

`String` or `Function`

```
// same signature as multer native
destination (req, file, callback) {
    callback(null, 'images')
}
```

## Contact

<angusyoung@mrxcool.com>
