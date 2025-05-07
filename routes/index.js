var express = require('express');
const crypto = require('crypto');
var router = express.Router();
const db = require('../db/db_config')
const bcrypt = require('bcrypt')
const { generateToken } = require('./utils')
/* GET home page. */
router.get('/', async (req, res, next) => {
  const sql = "SELECT * from blog"
  await db.query(sql, async (err, result) => {
    if (err) throw err;

    res.render('blog', { result });
    //   crypto.randomBytes(24, async (err, buffer) => {
    //     let token = await generateToken('1234566')
    //     console.log(token);
    // res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    //     res.cookie('house_user', token, { maxAge: 9000000000, httpOnly: true, secure: true });
    // res.append('Set-Cookie', 'house_user=' + token + ';');
    // res.send('blog', { result, token });
    // });
    // }
  })
});

router.get('/about', async (req, res, next) => {
  const sql = "SELECT * from blog"
  res.render('about')

})
router.get('/login', async (req, res, next) => {
  res.render('login')
})

router.post('/signin', async (req, res, next) => {
  const user = req.body.user

  const sql = `SELECT * FROM user WHERE username = '${user}'`
  await db.query(sql, async (err, result) => {
    if (err) throw err;
    const pass = req.body.pass
    // if (result.length !== 0 && bcrypt.compareSync(pass, result[0].password)) {
    // let user_token = req.cookies['house_user']; // always empty    
    // crypto.randomBytes(24, async (err, buffer) => {
    let token = await generateToken(result)
    // console.log(token);
    // res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    // res.cookie('house_user', token, { maxAge: 9000000000, httpOnly: true, secure: true });
    // res.append('Set-Cookie', 'house_user=' + token + ';');
    // res.send('blog', { result, token });
    // res.redirect('/');
    // });
    res.send({
      token,
      _id: result[0].id,
      user: result[0].username
    })
    // return
    // } else {
    //   res.send('username atau password salah')
    // }

  })
})

router.get('/signout', async (req, res, next) => {
  res.clearCookie("auth_sign");
  res.send('lg')
})

router.post('/register', async (req, res) => {
  const username = 'user3'
  const password = bcrypt.hashSync('user3', 8)
  const name = 'user3'
  const sql = `INSERT INTO user (username, password,nama) VALUES ('${username}','${password}', '${name}')`
  await db.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result)
  })
})
router.get('/contact', async (req, res, next) => {
  const sql = "SELECT CASE WHEN @prevA=kategori THEN '' ELSE kategori END kategori , judul, @prevA:=kategori FROM blog , (SELECT @prevA:=null) vars ORDER BY blog.kategori;"
  res.render('contact')

})
router.get('/categories', async (req, res, next) => {

  const sql = "SELECT * FROM (SELECT P.id,judul, P.kategori, kategori.kategori as kat, ROW_NUMBER() OVER(PARTITION BY P.kategori ORDER BY P.id ASC) rn FROM blog P INNER JOIN kategori ON P.kategori = kategori.id) t1 WHERE rn <= 2"

  // const sql = " SELECT id, judul, kategori FROM (SELECT id, judul, kategori, ROW_NUMBER() OVER(PARTITION BY kategori ORDER BY id ASC) rn FROM blog) t1 WHERE rn <= 2"

  // 

  await db.query(sql, (err, result) => {
    if (err) throw err;
    res.render('categories', { result })
  })

})
router.get('/categories/:id', async (req, res, next) => {
  const id = req.params.id
  const sql = `SELECT * FROM blog WHERE kategori = ${id}`

  await db.query(sql, (err, result) => {
    if (err) throw err;
    // res.send({ result })
    res.render('categoryDetail', { result })
  })

})
router.get('/categories1', async (req, res, next) => {

  const sql = " SELECT id, judul, kategori FROM (SELECT id, judul, kategori, ROW_NUMBER() OVER(PARTITION BY kategori ORDER BY judul ASC) rn FROM blog) t1 WHERE rn <= 2"

  await db.query(sql, (err, result) => {
    if (err) throw err;
    res.render('categoriesbackup', { result })
  })

})

router.get('/admin', async (req, res, next) => {
  // req.flash("success", "Delete Successed")
  // const params = new URLSearchParams(window.location.search)
  console.log('test');

  const sql = "SELECT * from blog"
  await db.query(sql, (err, result) => {
    if (err) throw err;
    res.render('admin', { result })
    // res.send(result)
  })
  // console.log(req.flash('success'));

})
router.get('/getDataAdmin', async (req, res, next) => {
  const sql = 'SELECT * FROM blog'
  await db.query(sql, (err, result) => {
    if (err) throw err;
    const sql = "SELECT * from blog"
    res.send(result)
  })
})

router.get('/inputForm', async (req, res, next) => {
  const sql = " SELECT id, judul, kategori FROM (SELECT id, judul, kategori, ROW_NUMBER() OVER(PARTITION BY kategori ORDER BY judul ASC) rn FROM blog) t1 WHERE rn <= 2"
  // const sql = "SELECT * from blog ORDER BY kategori"
  await db.query(sql, (err, result) => {
    if (err) throw err;
    const sql = "SELECT * from blog"
    // res.send(result.length)
    // console.log(result.length);
    res.render('home', { result })
  })
})

router.get('/getData', async (req, res, next) => {
  const sql = "SELECT * from blog"
  await db.query(sql, (err, result) => {
    if (err) throw err;
    // res.send(result)
    res.send(result)
  })
})


router.post('/input', async (req, res, next) => {
  const judul = req.body.judul
  const description = req.body.description

  const sql = `INSERT INTO blog (judul, description) VALUES ('${judul}', '${description}')`
  await db.query(sql, async (err, result) => {
    if (err) throw err;
    const sql = `SELECT * FROM blog WHERE id = LAST_INSERT_ID()`
    await db.query(sql, (err, result) => {
      if (err) throw err;
      res.send(result[0])
    })
  })
});

router.put('/updateData', async (req, res, next) => {
  const idBlog = req.body.idBlog
  const judul = req.body.judul
  const description = req.body.description
  const sql = `UPDATE blog SET judul = '${judul}', description = '${description}' WHERE id = '${idBlog}'`
  console.log(sql);
  await db.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result)
  })
})

router.get('/getData/:id', async (req, res, next) => {
  const id = req.params.id
  const sql = `SELECT * from blog WHERE id = '${id}'`
  await db.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result)
  })
})

router.delete('/deleteData/:id', async (req, res, next) => {
  const id = req.params.id
  const sql = `DELETE from blog WHERE id = '${id}'`
  await db.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result)
  })
})





module.exports = router;
