require('dotenv').config({
    path: __dirname + '/../../.env'
})
const multer = require('multer');
const upload = multer();
const router = require('express').Router();
const db = require('../db');
const inProduction = process.env.NODE_ENV === "production";

router.post('/submitTutorApplication', upload.none(), async (req, res) => {
    try {
        const personal_information = req.body.personal_information;
        var index = 6;
        var educations_params = "";
        const educations_jsons = [];
        for (var i = 0; i < req.body.educations.length; i++) {
            if (i === 0) {
                educations_params += ("$" + index);
            } else {
                educations_params += (", $" + index);
            }
            educations_jsons.push(JSON.stringify(req.body.educations[i]))
            index++;
        }

        var experiences_params = "";
        const experiences_jsons = [];
        for (var i = 0; i < req.body.experiences.length; i++) {
            if (i === 0) {
                experiences_params += ("$" + index);
            } else {
                experiences_params += (", $" + index);
            }
            experiences_jsons.push(JSON.stringify(req.body.experiences[i]))
            index++;
        }

        const add_user_data_query = "update users set gender = $1, phone_number = $2, " + 
            "headline = $3, description = $4, country = $5, " + 
            "educations = array[" + educations_params + "]::json[], experiences " +
            "= array[" + experiences_params + "]::json[] where _id = $" + index;
        await db.query(add_user_data_query, [
            personal_information.gender, 
            personal_information.phoneNumber, 
            personal_information.headline, 
            personal_information.selfDescription, 
            personal_information.country,
            ...educations_jsons,
            ...experiences_jsons,
            req.user._id
        ]);

        index = 2;
        var chosen_subjects_params = "";
        for (var i = 0; i < req.body.chosen_subjects.length; i++) {
            if (i === 0) {
                chosen_subjects_params += ("$" + index);
            } else {
                chosen_subjects_params += (", $" + index);
            }
            index++;
        }
        const apply_tutor_query = "insert into tutorsapplications values($1, array[" + chosen_subjects_params + "]::varchar(50)[], now());";
        await db.query(apply_tutor_query, [req.user._id, ...req.body.chosen_subjects]);
        res.send({
            success: true
        })
    } catch (err) {
        console.log(err);
        res.send({
            success: false
        })
    }
});

router.post('/submitTutorSubjects', upload.none(), async (req, res) => {
    const applicant_id = req.body.applicant_id;
    const approved_subjects = req.body.approved_subjects;
    const delete_query = 'delete from tutorsapplications where applicant_id = $1';
    var array_params = "";
    for (var i = 0; i < approved_subjects.length; i++) {
        if (i === 0) {
            array_params += ("$" + (i + 1));
        } else {
            array_params += (", $" + (i + 1));
        }
    };
    const update_tutoring_subjects_query = "update users set is_tutor = 't', tutoring_subjects = " +
        "array_cat(tutoring_subjects, array[" + array_params + "]::varchar(50)[]) where _id = $" +
        (approved_subjects.length + 1);
    try {
        if (approved_subjects.length > 0) {
            await db.query(delete_query, [applicant_id]);
            await db.query(update_tutoring_subjects_query, [...approved_subjects, applicant_id]);
        } else {
            await db.query(delete_query, [...applicant_id]);
        }
        res.send({
            success: true
        })
    } catch (err) {
        console.log(err);
        res.send({
            success: false
        })
    }
});

router.post('/addAdmin', upload.none(), async (req, res) => {
    const email = req.body.email;
    try {
        await db.query("UPDATE users set is_admin = 'f' where email = $1;", [email]);
        res.send({
            success: true
        })
    } catch (err) {
        console.log(err);
        res.send({
            success: false
        })
    }
});

router.post('/deleteUser', upload.none(), async (req, res) => {
    const email = req.body.email;
    try {
        await db.query("DELETE FROM users WHERE email = $1 AND is_admin = 'f'", [email]);
        res.send({
            success: true
        })
    } catch (err) {
        console.log(err);
        res.send({
            success: false
        })
    }
});

router.post('/removeTutor', upload.none(), async (req, res) => {
    const email = req.body.email;
    try {
        await db.query("update users set is_tutor = 'f' WHERE email = $1 AND is_admin = 'f'", [email]);
        res.send({
            success: true
        })
    } catch (err) {
        console.log(err);
        res.send({
            success: false
        })
    }
});

router.get('/tutorsApplications', upload.none(), async (req, res) => {
    try {
        const limit = 20;
        const numOfSkip = req.body.numOfSkip;
        const db_response = await db.query(
            'SELECT tutorsapplications.applicant_id as applicant_id, users.email ' +
            'as email, users.educations as educations, users.experiences as experiences, ' +
            'tutorsapplications.subjects as subjects, users.first_name as ' +
            'first_name, users.last_name as last_name FROM tutorsapplications ' +
            'JOIN users on tutorsapplications.applicant_id = users._id ORDER BY ' +
            'time_of_creation ASC LIMIT $1 OFFSET $2', [limit, 0]);
        const applications = [];
        const raw_applications = db_response.rows;
        for (var i = 0; i < raw_applications.length; i++) {
            const curr_application = raw_applications[i];
            applications.push({
                first_name: curr_application.first_name,
                last_name: curr_application.last_name,
                applicant_id: curr_application.applicant_id,
                subjects: curr_application.subjects,
                educations: curr_application.educations,
                experiences: curr_application.experiences,
                email: curr_application.email
            })
        }
        res.send({
            success: true,
            result: applications
        })
    } catch (err) {
        console.log(err);
        res.send({
            success: false
        })
    }
});

module.exports = router;