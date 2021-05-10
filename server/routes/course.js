require('dotenv').config({
    path: __dirname + '/../../.env'
})
const multer = require('multer');
const upload = multer();
const router = require('express').Router();
const db = require('../db');
const inProduction = process.env.NODE_ENV === "production";

router.get('/getScheduledCourses', upload.none(), async (req, res) => {
    try {
        const result = await db.query('select * from courses where tutor_id = $1', [req.user._id]);
        res.send({
            success: true,
            result: result.rows
        })
    } catch (err) {
        console.log(err);
        res.send({
            success: false
        })
    }
})

router.get('/getRegisteredCourses', upload.none(), async (req, res) => {
    try {
        // const query = 'select * from coursestudentrelationships as csr join courses on csr.course_id = courses._id where student_id = $1';
        const query = 'select _id, title from courses where tutor_id = 1 union select crs._id, crs.title from coursestudentrelationships as csr join courses as crs on csr.course_id = crs._id where student_id = $1;'
        const result = await db.query(query, [
            req.user._id
        ])
        res.send({
            success: true,
            result: result.rows
        })
    } catch (err) {
        console.log(err);
        res.send({
            success: false
        })
    }
})

module.exports = router;