import { Router } from "express";
import multer from 'multer';
import path from 'path'
import { randomUUID } from "crypto";
import { error } from "console";

const router = Router()

const storage = multer.diskStorage(
    {
        destination: (req, file, cb) => {
            cb(null, 'uploads/')
        },
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname)
            cb(null, `${randomUUID()}${ext}`)
        },
    }
)

const upload = multer({
    storage,
    limits: {fileSize: 5*1024*1024},
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Solo se permiten imagenes'))
        }
        cb(null, true)
    }
})

router.post('/image', upload.single('image'), (req, res) => {
    if (!req.file){
        return res.status(400).json({error: 'No se recibio la imagen'})
    }
    const fileUrl = `${process.env.BACKEND_URL ?? 'http://localhost:3000'}/uploads/${req.file.filename}`
    res.json({ fileUrl })
})

export {router as UploadRouter}