const multer = require('multer')

const allowedImageTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
]

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    if (!allowedImageTypes.includes(file.mimetype)) {
      return callback(new Error('A imagem deve ser JPG, PNG ou WebP.'))
    }

    return callback(null, true)
  },
})

module.exports = upload
