import {useEffect, useState} from 'react';
import axios from 'axios';
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

const useRowStyles = makeStyles({
    root: {
        '& > *': {
            borderBottom: 'unset',
        },
    },
});

function Row(props) {
    const { row, submitTutorSubjects } = props;
    const [open, setOpen] = React.useState(false);
    const classes = useRowStyles();
    const temp = {};
    for (var i = 0; i < row.subjects.length; i++) {
        temp[row.subjects[i]] = true;
    };
    const [subjectsApproval, setSubjectsApproval] = useState(temp);

    return (
        <React.Fragment>
            <TableRow className={classes.root}>
                <TableCell>
                    <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                    {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">
                    {row.email}
                </TableCell>
                <TableCell align="right">{row.first_name}</TableCell>
                <TableCell align="right">{row.last_name}</TableCell>
                <TableCell align="right">
                    {row.educations.map(education => {
                        return <div style={{
                            textAlign: "left",
                            maxWidth: "200px",
                            overflowWrap: "break-word"
                        }}>
                            <b>School</b>: {education.school} <br />
                            <b>From</b>: {education.fromYear} <br />
                            <b>To</b>: {education.toYear} <br />
                            <b>Degree</b>: {education.degree} <br />
                            <b>Field of study</b>: {education.fieldOfStudy} <br />
                            <b>Description</b>: {education.description}<br />
                        </div>
                    })}
                </TableCell>
                <TableCell align="right">
                    {row.experiences.map(experience => {
                        return <div style={{
                            textAlign: "left",
                            maxWidth: "200px",
                            overflowWrap: "break-word"
                        }}>
                            <b>Company</b>: {experience.company} <br />
                            <b>Job title</b>: {experience.jobTitle} <br />
                            <b>From</b>: {experience.fromYear} <br />
                            <b>To</b>: {experience.toYear} <br />
                            <b>Description</b>: {experience.description} <br />
                        </div>
                    })}
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                    <Box margin={1}>
                        <Typography variant="h6" gutterBottom component="div">
                            Proposed tutoring subjects
                        </Typography>
                        <Table size="small" aria-label="purchases">
                        <TableHead>
                            <TableRow>
                            <TableCell>Subject</TableCell>
                            <TableCell>Approve</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {row.subjects.map((subject, index) => (
                                <TableRow key={index}>
                                    <TableCell component="th" scope="row">
                                        {subject}
                                    </TableCell>
                                    <TableCell><select 
                                        name="subject_approval" 
                                        id="subject_approval" 
                                        value={subjectsApproval[subject] ? "approve" : "reject"}
                                        onChange={(event) => {
                                            setSubjectsApproval(prevData => {
                                                const temp = {...prevData};
                                                temp[subject] = event.target.value === "approve" ? true : false;
                                                return temp;
                                            });
                                        }}>
                                        <option value="approve">approve</option>
                                        <option value="reject">reject</option>
                                    </select></TableCell>
                                </TableRow>
                            ))}
                            <TableRow key="specialKey">
                                <TableCell component="th" scope="row">
                                    <b>ACTION</b>
                                </TableCell>
                                <TableCell><button style={{cursor: "pointer"}} onClick={() => {
                                    submitTutorSubjects(row.applicant_id, subjectsApproval)
                                }}>submit</button></TableCell>
                            </TableRow>
                        </TableBody>
                        </Table>
                    </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}

export default function AdminDashboard(props) {
    const [tutorsApplications, setTutorsApplications] = useState([]);
    const {setDisplayNavbar, setUser} = props;
    const [addAdminEmail, setAddAdminEmail] = useState("");
    const [deleteUserEmail, setDeleteUserEmail] = useState("");
    const [removeTutorEmail, setRemoveTutorEmail] = useState("");
    setDisplayNavbar(true);
    useEffect(() => {
        const ac = new AbortController();
        axios.get('/auth/isLoggedIn')
            .then(res => res.data)
            .catch(err => console.log(err))
            .then(res => {
                if (res.isLoggedIn) {
                    const user = res.user;
                    if (!user.is_admin) {
                        window.open('/home', '_self');
                    }
                    setUser(user);
                    axios.get('/admin/tutorsApplications')
                        .then(res => res.data)
                        .catch(err => console.log(err))
                        .then(res => {
                            if (res.success) {
                                setTutorsApplications(res.result);
                            } else {
                                alert("Failed to get tutors applications");
                            }
                        })
                } else {
                    window.open('/', '_self');
                }
            })
        return () => {
            ac.abort();
        }
    }, [setUser]);

    function addAdmin() {
        const formData = new FormData();
        formData.set('email', addAdminEmail);
        setAddAdminEmail("");
        axios({
            method: 'post',
            url: '/admin/addAdmin',
            data: formData,
            headers: {'Content-Type': 'multipart/form-data'}
        })
        .then(res => res.data)
        .catch(err => console.log(err))
        .then(res => {
            if (res.success) {
                alert("Successfully added admin.");
            } else {
                alert("Failed to add admin");
            }
        })
        .catch(err => console.log(err));
    }

    function deleteUser() {
        const formData = new FormData();
        formData.set('email', deleteUserEmail);
        setDeleteUserEmail("");
        axios({
            method: 'post',
            url: '/admin/deleteUser',
            data: formData,
            headers: {'Content-Type': 'multipart/form-data'}
        })
        .then(res => res.data)
        .catch(err => console.log(err))
        .then(res => {
            if (res.success) {
                alert("Successfully deleted user.");
            } else {
                alert("Failed to delete user");
            }
        })
        .catch(err => console.log(err));
    }

    function removeTutor() {
        const formData = new FormData();
        formData.set('email', removeTutorEmail);
        setRemoveTutorEmail("");
        axios({
            method: 'post',
            url: '/admin/removeTutor',
            data: formData,
            headers: {'Content-Type': 'multipart/form-data'}
        })
        .then(res => res.data)
        .catch(err => console.log(err))
        .then(res => {
            if (res.success) {
                alert("Successfully removed tutor.");
            } else {
                alert("Failed to remove tutor.");
            }
        })
        .catch(err => console.log(err));
    }

    function submitTutorSubjects(applicant_id, subjectsApproval) {
        const formData = new FormData();
        formData.set('applicant_id', applicant_id);
        for (const key in subjectsApproval) {
            if (subjectsApproval[key]) {
                formData.append('approved_subjects[]', key);
            }
        }
        axios({
            method: 'post',
            url: '/admin/submitTutorSubjects',
            data: formData,
            headers: {'Content-Type': 'multipart/form-data'}
        })
        .then(res => res.data)
        .catch(err => console.log(err))
        .then(res => {
            if (res.success) {
                setTutorsApplications(prevData => {
                    return prevData.filter(application => {
                        return application.applicant_id !== applicant_id;
                    })
                })
            } else {
                alert("Failed to submit data");
            }
        })
    }

    return <div className="wrapper">
        <div className="sidebar">
            <h2>Admin</h2>
            <ul>
                <li onClick={() => {
                    window.location.href = "#tutorsApplications";
                }}><a href="#tutorsApplications">Tutors applications</a></li>
                <li onClick={() => {
                    window.location.href = "#addAdmin";
                }}><a href="#addAdmin">Add new admin</a></li>
                <li onClick={() => {
                    window.location.href = "#deleteUser";
                }}><a href="#deleteUser">Delete user account</a></li>
                <li onClick={() => {
                    window.location.href = "#removeTutor";
                }}><a href="#removeTutor">Remove from tutor</a></li>
            </ul>
        </div>
        <div className="content">
            <div className="box">
                <a name="tutorsApplications"></a>
                <div className="box_top">
                    <h2>Tutors Applications</h2>
                </div>
                <div className="box_bottom">
                    <TableContainer component={Paper}>
                        <Table aria-label="collapsible table">
                            <TableHead>
                                <TableRow>
                                    <TableCell />
                                    <TableCell>Email</TableCell>
                                    <TableCell align="right">First name</TableCell>
                                    <TableCell align="right">Last name</TableCell>
                                    <TableCell align="left">Educations</TableCell>
                                    <TableCell align="left">Experiences</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tutorsApplications.map((application) => (
                                    <Row 
                                        key={application.applicant_id} 
                                        row={application} 
                                        submitTutorSubjects={submitTutorSubjects}/>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            </div>
            <div className="box">
                <a name="addAdmin"></a>
                <div className="box_top">
                    <h2>Add new admin</h2>
                </div>
                <div className="box_bottom">
                    <TextField 
                        id="outlined-basic" 
                        label="Enter user's email" 
                        variant="outlined"
                        value={addAdminEmail}
                        onChange={(event) => {
                            setAddAdminEmail(event.target.value);
                        }} />
                    <Button style={{
                        height: "56px",
                        marginLeft: "1em",
                    }} onClick={addAdmin} variant="outlined" color="secondary">
                        Add
                    </Button>
                </div>
            </div>
            <div className="box">
                <a name="deleteUser"></a>
                <div className="box_top">
                    <h2>Delete user account</h2>
                </div>
                <div className="box_bottom">
                    <TextField 
                        id="outlined-basic" 
                        label="Enter user's email" 
                        variant="outlined"
                        value={deleteUserEmail}
                        onChange={(event) => {
                            setDeleteUserEmail(event.target.value);
                        }} />
                    <Button style={{
                        height: "56px",
                        marginLeft: "1em",
                    }} onClick={deleteUser} variant="outlined" color="secondary">
                        Delete
                    </Button>
                </div>
            </div>
            <div className="box">
                <a name="removeTutor"></a>
                <div className="box_top">
                    <h2>Remove from tutor</h2>
                </div>
                <div className="box_bottom">
                    <TextField 
                        id="outlined-basic" 
                        label="Enter user's email" 
                        variant="outlined"
                        value={removeTutorEmail}
                        onChange={(event) => {
                            setRemoveTutorEmail(event.target.value);
                        }} />
                    <Button style={{
                        height: "56px",
                        marginLeft: "1em",
                    }} onClick={removeTutor} variant="outlined" color="secondary">
                        Remove
                    </Button>
                </div>
            </div>
        </div>
    </div>
}