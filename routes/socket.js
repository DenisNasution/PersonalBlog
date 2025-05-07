const db = require('../db/db_config')

const socket = (io) => {
    io.on('connection', (socket) => {
        const loadNotes = async () => {
            const sql = "SELECT * from blog"
            await db.query(sql, (err, result) => {
                if (err) throw err;
                io.emit('message', result)
            })
        }
        loadNotes()

        socket.on('dataInput', async (dataInput) => {
            const sql = `INSERT INTO blog (judul, description) VALUES ('${dataInput.judul}', '${dataInput.description}')`
            await db.query(sql, async (err, result) => {
                if (err) throw err;
                const sql = `SELECT * FROM blog WHERE id = LAST_INSERT_ID()`
                await db.query(sql, (err, result) => {
                    if (err) throw err;
                    socket.emit('addmessage', result[0])
                })
            })
        })

        socket.on('tombolPesan', (message) => {

            // const sql = `INSERT INTO blog (judul, description) VALUES ('${judul}', '${description}')`
            // await db.query(sql, (err, result) => {
            //     if (err) throw err;
            //     res.send("Data inserted successfully")
            // })

            socket.emit('message', message)
            // console.log("connect successfull");
        })

    })
}

module.exports = socket