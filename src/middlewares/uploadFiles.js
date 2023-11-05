const multer = require('multer')

const store = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "src/uploads")
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname.replace(/\s/g,""))
    }
})

const upload = multer({
    storage: store
})

module.exports = upload;