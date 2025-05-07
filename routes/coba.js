const express = require('express');
const cobaController = require('../coba/cobaController');
const router = express.Router();
const multer = require('multer')
const path = require('path')
const sharp = require('sharp')
const db = require('../db/db_config')
const { isAuth } = require('./utils')
// const url = require('url')

const fs = require('fs');

router.get('/', cobaController.viewCoba)

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'public/images')
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
    }
})
const upload = multer({
    storage,

})

// const upload = multer({
//     dest: 'public/images',
//     filename(req, file, cb) {
//         cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
//     }

// })

router.get('/edit/:id', function (req, res) {
    const id = req.params.id
    const cur = req.query.cur
    // console.log(cur);
    // const sql = 'SELECT * FROM blog WHERE id = 142'
    // await db.query(sql, async (err, result) => {
    //     if (err) throw err;
    //     // console.log(result);
    //     res.render('e', { result });

    // })
    // console.log(id);
    let user_token = req.cookies['auth_sign']; // always empty

    if (user_token) {
        res.render('edit', { id, cur });
    }
    else {
        res.redirect('/login')
    }
})
router.post('/getDataAdmin', async (req, res, next) => {
    const kategori = req.body.kategori
    // console.log(kategori);
    // console.log('test');
    // res.send('test')
    let sql = `SELECT * FROM blog `
    if (kategori) {
        sql = sql + `WHERE kategori = ${kategori}`
    }
    await db.query(sql, (err, result) => {
        if (err) throw err;
        // res.render('admin', { result, flash })
        res.send({ result })
        // console.log(result);
    })
})

router.post('/getDataAdminCoba', async (req, res, next) => {
    const kategori = req.body.kategori
    let sql = "SELECT * from blog"
    if (kategori) {
        sql = sql + ` WHERE kategori = ${kategori}`
    }

    await db.query(sql, (err, result) => {
        if (err) throw err;

        // res.render('adminCoba', { result });
        // const startingLimit = (page - 1) * resultsPerPage;
        // const sql = `SELECT * FROM blog LIMIT ${startingLimit},${resultsPerPage}`;
        // db.query(sql, (err, result) => {
        //     if (err) throw err;
        //     let iterator = (page - 5) < 1 ? 1 : page - 5;
        //     let endingLink = (iterator + 9) <= numberOfPages ? (iterator + 9) : page + (numberOfPages - page);
        //     if (endingLink < (page + 4)) {
        //         iterator -= (page + 4) - numberOfPages;
        //     }
        res.send({ result });
        // });
    })
})
router.get('/getDataAdminCategory', async (req, res, next) => {
    const sql = 'SELECT * FROM kategori'
    // console.log('test');
    // res.send('test')
    await db.query(sql, (err, result) => {
        if (err) throw err;
        res.send(result)
    })
})

router.get('/getData/:id', async (req, res) => {
    const id = req.params.id
    const sql = `SELECT * FROM blog WHERE id = ${id}`
    await db.query(sql, async (err, result) => {
        if (err) throw err;
        // console.log(result);
        res.send(result);
    })
    // res.render('edit');
})
router.get('/coba', async (req, res) => {
    res.render('test')
})
router.get('/viewAdmin/:id', async (req, res) => {
    const id = req.params.id
    const sql = `SELECT * FROM blog WHERE id = ${id}`
    // let user_token = req.cookies['auth_sign']; // always empty

    // if (user_token) {
    await db.query(sql, async (err, result) => {
        if (err) throw err;
        // console.log(result);
        res.render('viewDetailAdmin', { result });
    })
    // }
    // else {
    //     res.redirect('/login')
    // }
})

const resultsPerPage = 5;

router.get('/admin', async (req, res, next) => {

    const message = req.query.message
    let cur
    const bg = req.query.bg

    if (req.query.cur) {
        cur = req.query.cur
    }
    const flash = { message, bg, cur }
    const kategori = req.body.kategori
    let kat = []
    const sqlKat = 'SELECT * FROM kategori'

    let user_token = req.cookies['auth_sign']; // always empty
    // console.log(user_token);

    if (user_token) {
        await db.query(sqlKat, (err, result) => {
            if (err) throw err;
            result.forEach(element => {
                kat.push(element)
            });
        })
        let sql = `SELECT * FROM blog `
        if (kategori) {
            sql = sql + `WHERE kategori = ${kategori}`
        }
        await db.query(sql, (err, result) => {
            if (err) throw err;
            res.render('admin', { result, kat, flash })
        })
    }
    else {
        res.redirect('/login')
    }

})

router.get('/cobaAdmin', async (req, res, next) => {
    const message = req.query.message
    const bg = req.query.bg
    const flash = { message, bg }
    const kategori = req.body.kategori
    const query = req.query.kategori
    let kat = []
    const sqlKat = 'SELECT * FROM kategori'
    await db.query(sqlKat, (err, result) => {
        if (err) throw err;
        result.forEach(element => {
            kat.push(element)
        });
    })
    let sql = `SELECT * FROM blog `
    if (kategori) {
        sql = sql + `WHERE kategori = ${kategori}`
    }
    await db.query(sql, (err, result) => {
        if (err) throw err;
        res.render('admin', { result, kat, flash })
        // res.send(result)
    })
    // console.log(req.flash('success'));
})
router.get('/adminCategory', async (req, res, next) => {
    const message = req.query.message
    const bg = req.query.bg
    const flash = { message, bg }
    let user_token = req.cookies['auth_sign']; // always empty

    if (user_token) {
        res.render('adminCategory', { flash })
    }
    else {
        res.redirect('/login')
    }
})
router.post('/adminCategory', async (req, res, next) => {
    const kategori = req.body.kat
    const deskripsi = req.body.desk
    console.log(kategori, deskripsi);
    const sql = `INSERT INTO kategori (kategori, deskripsi) VALUES ('${kategori}', '${deskripsi}')`
    await db.query(sql, async (err, result) => {
        if (err) {
            res.send({ message: 'Upload Gagal', bg: 'bg-red-200' })
        }
        res.send({ message: 'Upload Berhasil', bg: 'bg-green-300' })
    })
})
router.put('/adminCategory/edit', async (req, res, next) => {
    const id = req.body.id
    const kategori = req.body.kat
    const deskripsi = req.body.desk
    const sql = `UPDATE kategori SET kategori = '${kategori}', deskripsi = '${deskripsi}' WHERE id = '${id}'`
    // console.log(sql);
    await db.query(sql, (err, result) => {
        if (err) throw res.send({ message: 'Updata Kategori Gagal', bg: 'bg-red-200' });
        res.send({ message: 'Update Kategori Berhasil', bg: 'bg-green-300' })
    })
})

router.delete('/adminCategory/delete/:id', async (req, res) => {
    const id = req.params.id
    const sql = `SELECT * FROM kategori WHERE id = ${id}`

    await db.query(sql, async (err, result) => {
        if (err) throw err;
        // const imagePath = "public" + result[0].image
        if (result.length == 0) {
            res.send('Data Tidak Ditemukan')
        } else {
            const sql = `DELETE FROM kategori WHERE id =  ${id}`
            await db.query(sql, (err, result) => {
                if (err) res.send('Data Tidak Ditemukan');
                if (result.affectedRows == 0) {
                    res.send({ message: 'Data Tidak Ditemukan', bg: 'bg-red-200' })
                } else {
                    res.send({ message: 'Data Berhasil Dihapus', bg: 'bg-green-300' })
                }
            })
        }
    })
})

router.get('/adminCategory/:id', async (req, res) => {
    const id = req.params.id
    const sql = `SELECT * FROM kategori WHERE id = ${id}`
    await db.query(sql, async (err, result) => {
        if (err) throw err;
        // console.log(result);
        res.send(result);
    })
    // res.render('edit');
})
router.delete('/delete/:id', async (req, res) => {
    const id = req.params.id
    const sql = `SELECT * FROM blog WHERE id = ${id}`

    await db.query(sql, async (err, result) => {
        if (err) throw err;
        if (result.length == 0) {
            res.send('Data Tidak Ditemukan')
        } else {
            if (result[0].image !== '/images/noImage.jpg') {
                const imagePath = "public" + result[0].image
                fs.unlinkSync(imagePath)
            }
            const sql = `DELETE FROM blog WHERE id =  ${id}`
            await db.query(sql, (err, result) => {
                if (err) res.send('Data Tidak Ditemukan');
                if (result.affectedRows == 0) {
                    res.send({ message: 'Data Tidak Ditemukan', bg: 'bg-red-200' })
                }
                res.send({ message: 'Data Berhasil Dihapus', bg: 'bg-green-300' })

            })
        }

        // res.render('viewDetailAdmin', { result });
    })
})

router.get('/files', function (req, res) {
    const images = fs.readdirSync('public/images/upload')
    var sorted = []
    for (let item of images) {
        if (item.split('.').pop() === 'png'
            || item.split('.').pop() === 'jpg'
            || item.split('.').pop() === 'jpeg'
            || item.split('.').pop() === 'svg') {
            var abc = {
                "image": "/images/upload/" + item,
                "folder": '/'
            }
            sorted.push(abc)
        }
    }
    res.send(sorted);
})

router.post('/upload', upload.single('upload'), async (req, res, next) => {
    // res.send("/images/" + req.file.filename)

    // console.log(imagePath);
    // res.send({ req })
    // const { filename: image } = req.file;

    await sharp(req.file.path).resize(1300, 875, {
        fit: sharp.fit.cover,
        withoutEnlargement: true
    }).toFile(path.resolve(req.file.destination, 'upload', req.file.filename))
        .then(response => {
            if (req.body.imagePath) {
                if (req.body.imagePath !== '/images/noImage.jpg') {
                    const imagePath = "public" + req.body.imagePath
                    fs.unlinkSync(imagePath)
                }
            }
            res.send("/images/upload/" + req.file.filename)

        })
    // fs.unlinkSync(req.file.path)
    // res.send(req.file)
});
router.post('/delete_file', function (req, res, next) {
    var url_del = 'public' + req.body.url_del
    console.log(url_del)
    if (fs.existsSync(url_del)) {
        fs.unlinkSync(url_del)
    }
    res.redirect('back')
});
router.post('/uploadBlog',
    async (req, res) => {
        const judul = req.body.judul
        const description = req.body.description
        let image
        if (req.body.image) {
            image = req.body.image
        } else {
            image = '/images/noImage.jpg'
        }
        // console.log(req.body.judul);
        // console.log(req.body.description);

        const sql = `INSERT INTO blog (judul, description, image) VALUES ('${judul}', '${description}', '${image}')`
        await db.query(sql, async (err, result) => {
            if (err) {
                res.send({ message: 'Upload Gagal', bg: 'bg-red-200' })
            }
            const sql = `SELECT * FROM blog WHERE id = LAST_INSERT_ID()`
            await db.query(sql, (err, result) => {
                if (err) throw err;
                res.send({ message: 'Upload Berhasil', bg: 'bg-green-300' })
                // res.send(result[0])
            })
        })
        // res.send("bershasil diupload")
    }
)
router.put('/updateBlog/:id',
    async (req, res) => {
        const id = req.params.id
        // console.log(id);

        const sql = `SELECT * FROM blog WHERE id = ${id}`
        await db.query(sql, async (err, result) => {
            if (err) {
                res.send({ message: 'Update Gagal', bg: 'bg-red-200' })
            }
            else {
                const judul = req.body.judul || result[0].judul
                const description = req.body.description || result[0].description
                const image = req.body.image || result[0].image
                // console.log(judul);
                // console.log(description);
                // console.log(image);
                const sql = `UPDATE blog SET judul = '${judul}', description = '${description}', image = '${image}' WHERE id = '${id}'`
                await db.query(sql, async (err, result) => {
                    if (err) {
                        res.send({ message: 'Update Gagal', bg: 'bg-red-200' })
                    } else {
                        res.send({ message: 'Update Berhasil', bg: 'bg-green-300' })
                    }
                })
            }
        })


        // res.send("bershasil diupload")
    }
)
module.exports = router;