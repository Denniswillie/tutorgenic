import axios from 'axios';
import {useEffect, useState} from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import ReactAvatarEdit from 'react-avatar-edit';
import { makeStyles } from '@material-ui/core/styles';
import ReactAvatar from '@material-ui/core/Avatar';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Checkbox from '@material-ui/core/Checkbox';

const useStyles = makeStyles((theme) => ({
    large: {
        width: theme.spacing(14),
        height: theme.spacing(14),
    },
    formControl: {
        marginTop: "1em",
        minWidth: 120,
    },
    formControl2: {
        marginTop: "1em",
        marginLeft: "1em",
        minWidth: 120,
    },
    formControl3: {
        marginLeft: "1em",
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
}));

export default function ApplyTutor(props) {
    const {setDisplayNavbar, setUser} = props;
    const [localUser, setLocalUser] = useState();
    const classes = useStyles();
    const [isApplying, setIsApplying] = useState(false);
    
    setDisplayNavbar(true);
    useEffect(() => {
        const ac = new AbortController();
        axios.get('/auth/isLoggedIn')
            .then(res => res.data)
            .catch(err => console.log(err))
            .then(res => {
                if (res.isLoggedIn) {
                    const user = res.user;
                    setUser(user);
                    setLocalUser(user);
                    axios.post('/tutor/isApplyingTutor')
                        .then(res => res.data)
                        .catch(err => console.log(err))
                        .then(res => {
                            console.log(res);
                            if (res.success) {
                                if (res.is_applying) {
                                    setIsApplying(true);
                                }
                            } else {
                                alert("Failed to get request");
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

    const [avatarData, setAvatarData] = useState({
        preview: null,
        src: null,
        file: null,
        currentExtension: null,
        originalFile: null
    });

    const [uploadingNewFile, setUploadingNewFile] = useState(false);

    function onClose() {
        setUploadingNewFile(false);
        setAvatarData({preview: null, src: null, file: null, originalFile: null});
    }
    
    async function onCrop(preview) {
        setAvatarData(prevData => {
            return {...prevData, preview};
        })
        const currentExtension = avatarData.currentExtension;
        const file = await urltoFile(preview, 'userImage.' + currentExtension, 'image/' + currentExtension)
        setAvatarData(prevData => {
            return {...prevData, file: file};
        })
    }
    
    function onBeforeFileLoad(event) {
        const re = /\.(gif|jpe?g|tiff?|png|webp|bmp)$/i;
        const file = event.target.files[0];
        if (file.size > 1000000000000000) {
            event.target.value = "";
            alert("File size is too big.")
        } else if (!re.test(file.name)) {
            alert("File extension is not allowed.")
        } else {
            setUploadingNewFile(true);
            const separator = /(?:\.([^.]+))?$/;
            setAvatarData(prevData => {
                return {...prevData, currentExtension: separator.exec(file.name)[1], originalFile: file};
            })
        }
    }
    
    function urltoFile(url, filename, mimeType){
        return (fetch(url)
            .then(function(res){return res.arrayBuffer();})
            .then(function(buf){return new File([buf], filename,{type:mimeType});})
        );
    }

    const [gender, setGender] = useState(1);
    const [country, setCountry] = useState("Indonesia");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [headline, setHeadline] = useState("");
    const [selfDescription, setSelfDescription] = useState("");
    const [chosenSubjects, setChosenSubjects] = useState([]);
    const [educations, setEducations] = useState([]);

    const [experiences, setExperiences] = useState([]);

    const years = [];
    for (var i = 1980; i < 2051; i++) {
        years.push(i);
    }

    const [checked, setChecked] = useState(false);

    const availableSubjects = [
        "Mathematics",
        "Physics",
        "Computer science",
        "Biology",
        "Chemistry",
        "Music",
        "Guitar",
        "Piano",
        "Drum",
        "Saxophone",
        "Vocal",
        "Robotics",
        "Dance",
        "Culinary",
        "Politics",
        "Photography",
        "Machine Learning",
        "Entrepreneurship",
        "Aerodynamics",
        "React",
        "Redux",
        "MongoDB",
        "SQL",
        "PostGreSql",
        "Astronomy",
        "Korean",
        "English",
        "Mandarin",
        "Statistical Mechanics",
        "Data Science",
        "Linear Algebra",
        "iOS Development",
        "Android Development",
        "HTML",
        "Web Development",
        "Calculus",
        "Organic Chemistry",
        "Irish",
        "Chemical Engineering",
        "Agricultural Economics",
        "Civil Engineering",
        "Software Testing",
        "Data Visualization",
        "Economics",
        "Business",
        "User Experience",
        "Zoology",
        "Marine Biology",
        "Aerospace Engineering",
        "Mechanical Engineering",
        "Fashion",
        "Unix",
        "JavaScript",
        "Python",
        "Java",
        "C++",
        "Ruby",
        "Go",
        "Health and Science",
        "Music Theory",
        "Martial Arts",
        "Game Development",
        "Microsoft Word",
        "Microsoft Excel",
        "REST API",
        "Photoshop",
        "Yoga",
        "Pole Dance",
        "Philosophy",
        "LaTeX",
        "German",
        "Arabic",
        "Criminal Justice",
        "Parenting",
        "Indonesian History",
        "Electrical Engineering",
        "MatLab",
        "Epidemiology",
        "Microbiology",
        "Discrete Math",
        "Creative Writing",
        "Stand up comedy",
        "Industrial Engineering",
        "Autism",
        "Tourism",
        "Physiology",
        "LinkedIn",
        "Neuroscience",
        "Animation",
        "Interior design",
        "Blockchain",
        "Electronics Engineering",
        "TensorFlow",
        "Journalism",
        "Psychology"
    ]

    return <div className="wrapper">
        <div className="sidebar">
            <h2>Apply</h2>
            <ul>
                <li onClick={() => {
                    window.location.href = "#personalInformation";
                }}><a href="#personalInformation">Personal information</a></li>
                <li onClick={() => {
                    window.location.href = "#subjects";
                }}><a href="#subjects">Subjects</a></li>
                <li onClick={() => {
                    window.location.href = "#education";
                }}><a href="#education">Education</a></li>
                <li onClick={() => {
                    window.location.href = "#experience";
                }}><a href="#experience">Experience</a></li>
                <li onClick={() => {
                    window.location.href = "#policyAgreement";
                }}><a href="#policyAgreement">Policy Agreement</a></li>
                <li onClick={() => {
                    window.location.href = "#submitApplication";
                }}><a href="#submitApplication">Submit Application</a></li>
            </ul>
        </div>
        {!isApplying ? <div className="content">
            <div className="box">
                <a name="personalInformation"></a>
                <div className="box_top">
                    <h2>Personal information</h2>
                </div>
                <div className="box_bottom">
                    <form>
                        <TextField 
                            id="outlined-basic" 
                            label="Phone number" 
                            variant="outlined"
                            value={phoneNumber}
                            onChange={(event) => {
                                setPhoneNumber(event.target.value);
                            }} />
                        <TextField 
                            style={{marginLeft: "1em"}} 
                            id="outlined-basic" 
                            label="Headline" 
                            variant="outlined"
                            value={headline}
                            onChange={(event) => {
                                setHeadline(event.target.value);
                            }} />
                        <br />
                        <FormControl variant="outlined" className={classes.formControl}>
                            <InputLabel id="demo-simple-select-outlined-label">Gender</InputLabel>
                            <Select
                                labelId="demo-simple-select-outlined-label"
                                id="demo-simple-select-outlined"
                                value={gender}
                                onChange={(event) => {
                                    setGender(event.target.value);
                                }}
                                label="Gender"
                            >
                                <MenuItem value={1}>Male</MenuItem>
                                <MenuItem value={0}>Female</MenuItem>
                                <MenuItem value={-1}>Prefer not to say</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl variant="outlined" className={classes.formControl2}>
                            <InputLabel id="demo-simple-select-outlined-label">Country</InputLabel>
                            <Select
                                labelId="demo-simple-select-outlined-label"
                                id="demo-simple-select-outlined"
                                value={country}
                                onChange={(event) => {
                                    setCountry(event.target.value);
                                }}
                                label="Country"
                            >   
                                <MenuItem value={"Australia"}>Australia</MenuItem>
                                <MenuItem value={"Canada"}>Canada</MenuItem>
                                <MenuItem value={"Indonesia"}>Indonesia</MenuItem>
                                <MenuItem value={"Ireland"}>Ireland</MenuItem>
                                <MenuItem value={"Malaysia"}>Malaysia</MenuItem>
                                <MenuItem value={"Singapore"}>Singapore</MenuItem>
                                <MenuItem value={"United Kingdom"}>United Kingdom</MenuItem>
                                <MenuItem value={"United States of America"}>United States of America</MenuItem>
                                <MenuItem value={"Others"}>Others</MenuItem>
                            </Select>
                        </FormControl>
                        <br />
                        <TextField
                            placeholder="Description about yourself"
                            multiline
                            rows={4}
                            rowsMax={4}
                            variant="outlined"
                            value={selfDescription}
                            onChange={(event) => {
                                setSelfDescription(event.target.value);
                            }}
                            style={{marginTop: "1em", width: "61.6%"}}
                        />
                    </form>
                </div>
            </div>
            <div className="box">
                <a name="subjects"></a>
                <div className="box_top">
                    <h2>Subjects</h2>
                </div>
                <div className="box_bottom">
                <Autocomplete
                    onChange={(event, value) => {
                        setChosenSubjects(value);
                    }}
                    multiple
                    limitTags={2}
                    id="multiple-limit-tags"
                    options={availableSubjects}
                    getOptionLabel={(option) => option}
                    renderInput={(params) => (
                        <TextField {...params} variant="outlined" label="Available subjects" placeholder="Favorites" />
                    )}
                />
                </div>
            </div>
            <div className="box">
                <a name="education"></a>
                <div className="box_top">
                    <h2>Education</h2>
                </div>
                <div className="box_bottom">
                    <Button 
                        variant="outlined" 
                        color="secondary"
                        id="specialAddMoreEducation"
                        onClick={() => {
                            setEducations(prevData => {
                                document.getElementById("specialAddMoreEducation").style.display = "none";
                                return [...prevData, {
                                    school: "",
                                    fromYear: 2021,
                                    toYear: 2021,
                                    degree: "",
                                    fieldOfStudy: "",
                                    description: ""
                                }]
                            })
                        }}>
                        add more education
                    </Button>
                    {educations.map((education, index) =>{
                        return <div><TextField 
                            id="outlined-basic" 
                            label="School" 
                            variant="outlined"
                            value={education.school}
                            onChange={(event) => {
                                setEducations(prevData => {
                                    const temp = [];
                                    for (var i = 0; i < prevData.length; i++) {
                                        if (i === index) {
                                            temp.push({
                                                ...prevData[index],
                                                school: event.target.value
                                            })
                                        } else {
                                            temp.push(prevData[i]);
                                        }
                                    }
                                    return temp;
                                })
                            }} />
                        <FormControl variant="outlined" className={classes.formControl3}>
                            <InputLabel id="demo-simple-select-outlined-label">From year</InputLabel>
                            <Select
                                labelId="demo-simple-select-outlined-label"
                                id="demo-simple-select-outlined"
                                value={education.fromYear}
                                onChange={(event) => {
                                    setEducations(prevData => {
                                        const temp = [];
                                        for (var i = 0; i < prevData.length; i++) {
                                            if (i === index) {
                                                temp.push({
                                                    ...prevData[index],
                                                    fromYear: event.target.value
                                                })
                                            } else {
                                                temp.push(prevData[i]);
                                            }
                                        }
                                        return temp;
                                    })
                                }}
                                label="From Year"
                            >   
                                {years.map(year => {
                                   return <MenuItem value={year}>{year}</MenuItem> 
                                })}
                            </Select>
                        </FormControl>
                        <FormControl variant="outlined" className={classes.formControl3}>
                            <InputLabel id="demo-simple-select-outlined-label">To year</InputLabel>
                            <Select
                                labelId="demo-simple-select-outlined-label"
                                id="demo-simple-select-outlined"
                                value={education.toYear}
                                onChange={(event) => {
                                    setEducations(prevData => {
                                        const temp = [];
                                        for (var i = 0; i < prevData.length; i++) {
                                            if (i === index) {
                                                temp.push({
                                                    ...prevData[index],
                                                    toYear: event.target.value
                                                })
                                            } else {
                                                temp.push(prevData[i]);
                                            }
                                        }
                                        return temp;
                                    })
                                }}
                                label="To Year"
                            >   
                                {years.map(year => {
                                   return <MenuItem value={year}>{year}</MenuItem> 
                                })}
                            </Select>
                        </FormControl><br />
                        <TextField 
                            style={{marginTop: "1em"}} 
                            id="outlined-basic" 
                            label="Degree" 
                            variant="outlined"
                            value={education.degree}
                            onChange={(event) => {
                                setEducations(prevData => {
                                    const temp = [];
                                    for (var i = 0; i < prevData.length; i++) {
                                        if (i === index) {
                                            temp.push({
                                                ...prevData[index],
                                                degree: event.target.value
                                            })
                                        } else {
                                            temp.push(prevData[i]);
                                        }
                                    }
                                    return temp;
                                })
                            }} />
                        <TextField
                            style={{marginTop: "1em", marginLeft: "1em"}}  
                            id="outlined-basic" 
                            label="Field of study" 
                            variant="outlined"
                            value={education.fieldOfStudy}
                            onChange={(event) => {
                                setEducations(prevData => {
                                    const temp = [];
                                    for (var i = 0; i < prevData.length; i++) {
                                        if (i === index) {
                                            temp.push({
                                                ...prevData[index],
                                                fieldOfStudy: event.target.value
                                            })
                                        } else {
                                            temp.push(prevData[i]);
                                        }
                                    }
                                    return temp;
                                })
                            }} /><br />
                        <TextField
                            placeholder="Description"
                            multiline
                            rows={4}
                            rowsMax={4}
                            variant="outlined"
                            value={education.description}
                            onChange={(event) => {
                                setEducations(prevData => {
                                    const temp = [];
                                    for (var i = 0; i < prevData.length; i++) {
                                        if (i === index) {
                                            temp.push({
                                                ...prevData[index],
                                                description: event.target.value
                                            })
                                        } else {
                                            temp.push(prevData[i]);
                                        }
                                    }
                                    return temp;
                                })
                            }}
                            style={{marginTop: "1em", width: "50%"}}
                        /><br /><br />
                        <Button 
                            variant="outlined" 
                            color="secondary"
                            id={index.toString()}
                            onClick={() => {
                                setEducations(prevData => {
                                    document.getElementById(index.toString()).style.visibility = "hidden";
                                    return [...prevData, {
                                        school: "",
                                        fromYear: 2021,
                                        toYear: 2021,
                                        degree: "",
                                        fieldOfStudy: "",
                                        description: ""
                                    }]
                                })
                            }}>
                            add more education
                        </Button></div>
                    })}
                </div>
            </div>
            <div className="box">
                <a name="experience"></a>
                <div className="box_top">
                    <h2>Experience</h2>
                </div>
                <div className="box_bottom">
                    <Button 
                        variant="outlined" 
                        color="secondary"
                        id="specialAddMoreExperiences"
                        onClick={() => {
                            setExperiences(prevData => {
                                document.getElementById("specialAddMoreExperiences").style.display = "none";
                                return [...prevData, {
                                    company: "",
                                    jobTitle: "",
                                    fromYear: 2021,
                                    toYear: 2021,
                                    description: "",
                                    jobDescription: ""
                                }]
                            })
                        }}>
                        add more experience
                    </Button>
                    {experiences.map((experience, index) => {
                        return <div>
                            <TextField 
                                id="outlined-basic" 
                                label="Company" 
                                variant="outlined"
                                value={experience.company}
                                onChange={(event) => {
                                    setExperiences(prevData => {
                                        const temp = [];
                                        for (var i = 0; i < prevData.length; i++) {
                                            if (i === index) {
                                                temp.push({
                                                    ...prevData[index],
                                                    company: event.target.value
                                                })
                                            } else {
                                                temp.push(prevData[i]);
                                            }
                                        }
                                        return temp;
                                    })
                                }} />
                            <FormControl variant="outlined" className={classes.formControl3}>
                                <InputLabel id="demo-simple-select-outlined-label">From year</InputLabel>
                                <Select
                                    labelId="demo-simple-select-outlined-label"
                                    id="demo-simple-select-outlined"
                                    value={experiences.fromYear}
                                    onChange={(event) => {
                                        setExperiences(prevData => {
                                            const temp = [];
                                            for (var i = 0; i < prevData.length; i++) {
                                                if (i === index) {
                                                    temp.push({
                                                        ...prevData[index],
                                                        fromYear: event.target.value
                                                    })
                                                } else {
                                                    temp.push(prevData[i]);
                                                }
                                            }
                                            return temp;
                                        })
                                    }}
                                    label="From Year"
                                >   
                                    {years.map(year => {
                                    return <MenuItem value={year}>{year}</MenuItem> 
                                    })}
                                </Select>
                            </FormControl>
                            <FormControl variant="outlined" className={classes.formControl3}>
                                <InputLabel id="demo-simple-select-outlined-label">To year</InputLabel>
                                <Select
                                    labelId="demo-simple-select-outlined-label"
                                    id="demo-simple-select-outlined"
                                    value={experiences.toYear}
                                    onChange={(event) => {
                                        setExperiences(prevData => {
                                            const temp = [];
                                            for (var i = 0; i < prevData.length; i++) {
                                                if (i === index) {
                                                    temp.push({
                                                        ...prevData[index],
                                                        toYear: event.target.value
                                                    })
                                                } else {
                                                    temp.push(prevData[i]);
                                                }
                                            }
                                            return temp;
                                        })
                                    }}
                                    label="To Year"
                                >   
                                    {years.map(year => {
                                        return <MenuItem value={year}>{year}</MenuItem> 
                                    })}
                                </Select>
                            </FormControl><br /><br />
                            <TextField 
                                id="outlined-basic" 
                                label="Job title" 
                                variant="outlined"
                                value={experience.jobTitle}
                                onChange={(event) => {
                                    setExperiences(prevData => {
                                        const temp = [];
                                        for (var i = 0; i < prevData.length; i++) {
                                            if (i === index) {
                                                temp.push({
                                                    ...prevData[index],
                                                    jobTitle: event.target.value
                                                })
                                            } else {
                                                temp.push(prevData[i]);
                                            }
                                        }
                                        return temp;
                                    })
                                }} />
                            <TextField 
                                id="outlined-basic" 
                                label="Job description" 
                                variant="outlined"
                                style={{marginLeft: "1em"}}
                                value={experience.jobDescription}
                                onChange={(event) => {
                                    setExperiences(prevData => {
                                        const temp = [];
                                        for (var i = 0; i < prevData.length; i++) {
                                            if (i === index) {
                                                temp.push({
                                                    ...prevData[index],
                                                    jobDescription: event.target.value
                                                })
                                            } else {
                                                temp.push(prevData[i]);
                                            }
                                        }
                                        return temp;
                                    })
                                }} /><br />
                            <TextField
                                placeholder="Description"
                                multiline
                                rows={4}
                                rowsMax={4}
                                variant="outlined"
                                value={experiences.description}
                                onChange={(event) => {
                                    setExperiences(prevData => {
                                        const temp = [];
                                        for (var i = 0; i < prevData.length; i++) {
                                            if (i === index) {
                                                temp.push({
                                                    ...prevData[index],
                                                    description: event.target.value
                                                })
                                            } else {
                                                temp.push(prevData[i]);
                                            }
                                        }
                                        return temp;
                                    })
                                }}
                                style={{marginTop: "1em", width: "50%"}}
                            /><br /><br />
                            <Button 
                                variant="outlined" 
                                color="secondary"
                                id={"experience" + index.toString()}
                                onClick={() => {
                                    setExperiences(prevData => {
                                        document.getElementById("experience" + index.toString()).style.visibility = "hidden";
                                        return [...prevData, {
                                            company: "",
                                            jobTitle: "",
                                            fromYear: 2021,
                                            toYear: 2021,
                                            description: ""
                                        }]
                                    })
                                }}>
                                add more experience
                            </Button>
                        </div>
                    })}
                </div>
            </div>
            <div className="box">
                <a name="policyAgreement"></a>
                <div className="box_top">
                    <h2>Policy Agreement</h2>
                </div>
                <div className="box_bottom">
                    <Checkbox
                        checked={checked}
                        onChange={(event) => {
                            setChecked(event.target.checked);
                        }}
                        inputProps={{ 'aria-label': 'primary checkbox' }}
                    />
                    By checking the box, you agree to:
                    <ul style={{marginLeft: "2em"}}>
                        <li>All TutorGenic Terms & Conditions.</li>
                        <li>Adhere to all TutorGenic Policies.</li>
                        <li>Not communicate with our students outside the TutorGenic platform.</li>
                        <li>Not accept payment directly from our students outside the TutorGenic platform.</li>
                    </ul><br />
                    <p style={{marginLeft: "1em"}}>Noncompliance will result in your account being terminated.</p>
                </div>
            </div>
            <div className="box">
                <a name="submitApplication"></a>
                <div className="box_top">
                    <h2>Submit Application</h2>
                </div>
                <div className="box_bottom">
                    <Button 
                        variant="outlined" 
                        color="secondary"
                        onClick={() => {
                            if (!checked) {
                                alert("You must check the policy agreement before submitting.");
                            } else {
                                axios.post('/admin/submitTutorApplication', {
                                    personal_information: {
                                        gender: gender,
                                        country: country,
                                        phoneNumber: phoneNumber,
                                        headline: headline,
                                        selfDescription: selfDescription
                                    },
                                    chosen_subjects: chosenSubjects,
                                    educations: educations,
                                    experiences: experiences
                                })
                                .then(res => res.data)
                                .catch(err => console.log(err))
                                .then(res => {
                                    if (res.success) {
                                        alert("Successful");
                                        window.open('/apply', '_self');
                                    } else {
                                        alert("Failed to submit your application.");
                                    }
                                })
                                .catch(err => console.log(err));
                            }
                        }}>
                        submit
                    </Button>
                </div>
            </div>
        </div> : <div className="content">
            <div className="box">
                <div className="box_top">
                    <h2>You have already applied for a tutoring position. Please wait for the result.</h2>
                </div>
                <div className="box_bottom">

                </div>
            </div>
        </div>}
        
    </div>
}