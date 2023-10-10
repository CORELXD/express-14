const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const connection = require("./config/db");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/image'); // Ganti dengan direktori penyimpanan gambar yang sesuai
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Mengecek jenis file yang diizinkan (contoh hanya gambar JPEG, PNG, atau PDF)
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'application/pdf') {
        cb(null, true); // Izinkan file
    } else {
        cb(new Error('Jenis File Tidak diizinkan'), false); // File ditolak
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

router.get('/', (req, res) => {
    connection.query('SELECT k.no_pol, k.nama_kendaraan, t.nama_transmisi ' +
    ' FROM kendaraan k JOIN transmisi t ' + 
    ' ON t.id_transmisi = k.id_transmisi ORDER BY k.no_pol DESC', function(err, rows) {
        if (err) {
            return res.status(500).json({
                status: false,
                message: "Server Gagal"
            });
        } else {
            return res.status(200).json({
                status: true,
                message: "Data Kendaraan",
                data: rows
            });
        }
    });
});

router.post('/store', upload.single("gambar_kendaraan"), [
    // Validasi
    body('no_pol').notEmpty(),
    body('nama_kendaraan').notEmpty(),
    body('id_transmisi').notEmpty()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    const data = {
        no_pol: req.body.no_pol,
        nama_kendaraan: req.body.nama_kendaraan,
        id_transmisi: req.body.id_transmisi,
        gambar_kendaraan: req.file ? req.file.filename : null
    };

    connection.query('INSERT INTO kendaraan SET ?', data, (err, result) => {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Coba Lagi Dude.....',
            });
        } else {
            return res.status(201).json({
                status: true,
                message: 'Berhasil Dude.....',
                data: {
                    insertedId: result.insertId,
                }
            });
        }
    });
});

router.get('/:no_pol', (req, res) => {
    const no_pol = req.params.no_pol;
    connection.query('SELECT * FROM kendaraan WHERE no_pol = ?', [no_pol], (error, rows) => {
        if (error) {
            return res.status(500).json({
                status: false,
                message: 'Server Eror Dude.....',
                error: error,
            });
        }
        if (rows.length <= 0) {
            return res.status(404).json({
                status: false,
                message: 'Coba Lagi Dude.....',
            });
        } else {
            return res.status(200).json({
                status: true,
                message: 'Data Kendaraan',
                data: rows[0],
            });
        }
    });
});

router.patch('/update/:no_pol', upload.single("gambar_kendaraan"), [
    // Validasi
    body('no_pol').notEmpty(),
    body('nama_kendaraan').notEmpty(),
    body('id_transmisi').notEmpty(),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    const no_pol = req.params.no_pol;
    const data = {
        no_pol: req.body.no_pol,
        nama_kendaraan: req.body.nama_kendaraan,
        id_transmisi: req.body.id_transmisi,
        gambar_kendaraan: req.file ? req.file.filename : null
    };

    connection.query('UPDATE kendaraan SET ? WHERE no_pol = ?', [data, no_pol], (error, result) => {
        if (error) {
            return res.status(500).json({
                status: false,
                message: 'Server Eror Dude.....',
                error: error,
            });
        } else {
            return res.status(200).json({
                status: true,
                message: 'Update Data Success Dude....',
            });
        }
    });
});

router.delete('/delete/:no_pol', (req, res) => {
    const no_pol = req.params.no_pol;

    connection.query('SELECT * FROM kendaraan WHERE no_pol = ?', [no_pol], (error, rows) => {
        if (error) {
            return res.status(500).json({
                status: false,
                message: 'Server Eror Dude.....',
                error: error,
            });
        }
        if (rows.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'Coba Lagi Dude.....',
            });
        }

        const namaFileLama = rows[0].gambar_kendaraan;

        // Hapus file lama jika ada
        if (namaFileLama) {
            const pathFileLama = path.join(__dirname, './public/image', namaFileLama);
            fs.unlinkSync(pathFileLama);
        }

        connection.query('DELETE FROM kendaraan WHERE no_pol = ?', [no_pol], (error, rows) => {
            if (error) {
                return res.status(500).json({
                    status: false,
                    message: 'Server Eror Dude.....',
                    error: error,
                });
            } else {
                return res.status(200).json({
                    status: true,
                    message: 'Data Sudah Sukses Dihapus Dude....',
                });
            }
        });
    });
});

module.exports = router;
