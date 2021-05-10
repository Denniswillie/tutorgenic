require('dotenv').config({
    path: __dirname + '/../../.env'
})
const multer = require('multer');
const upload = multer();
const router = require('express').Router();
const db = require('../db');
const inProduction = process.env.NODE_ENV === "production";

router.post('/register', upload.none(), async (req, res) => {
    const course_id = req.body.course_id;
    try {
        await db.query('insert into coursestudentrelationships (course_id, student_id) values($1, $2);', [course_id, req.user._id]);
        res.send({
            success: true
        })
    } catch (err) {
        console.log(err);
        res.send({
            success: false
        })
    }
})

router.post('/search', upload.none(), async (req, res) => {
    const search_value = req.body.search_value;
    try {
        const result = await db.query("select * from users where (lower($1) = ANY(lower(tutoring_subjects::varchar(50))::varchar(50)[])) or lower(first_name) like lower($2) or lower(last_name) like lower($3);", [
            search_value,
            search_value + "%",
            search_value + "%"
        ]);
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

router.get('/getSchedulesDetails', upload.none(), async (req, res) => {
    try {
        await db.query('select * from courses ')
    } catch (err) {
        console.log(err);
        res.send({
            success: false
        })
    }
})

router.post('/getSchedule', upload.none(), async (req, res) => {
    try {
        const dates = req.body.dates;
        var dates_params = "";
        for (var i = 0; i < dates.length; i++) {
            if (i === 0) {
                dates_params += (" date = $" + (i + 1));
            } else {
                dates_params += (" or date = $" + (i + 1));
            }
        }
        const scheduler_id = req.body.tutor_id ? req.body.tutor_id : req.user._id;
        const query = 'select * from courses where (' + dates_params + ') and tutor_id = $' + (dates.length + 1) + ';';
        const result = await db.query(query, [...dates, scheduler_id]);
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

router.post('/addNewSchedule', upload.none(), async (req, res) => {
    try {
        const title = req.body.title;
        const description = req.body.description;
        const startTime = req.body.startTime.split("T");
        const endTime = req.body.endTime.split("T");
        await db.query('insert into courses (tutor_id, date, start_time, end_time, title, description) values($1, $2, $3, $4, $5, $6)', [
            req.user._id,
            startTime[0],
            startTime[1],
            endTime[1],
            title,
            description
        ])
        res.send({
            success: true
        })
    } catch (err) {
        console.log(err);
        res.send({
            success: false
        })
    }
})

router.post('/isApplyingTutor', upload.none(), async (req, res) => {
    try {
        const result = await db.query('select * from tutorsapplications where applicant_id = $1 limit 1;', [req.user._id]);
        if (result.rows.length > 0) {
            res.send({
                success: true,
                is_applying: true
            })
        } else {
            res.send({
                success: true,
                is_applying: false
            })
        }
    } catch (err) {
        console.log(err);
        res.send({
            success: false
        })
    }
})

module.exports = router;