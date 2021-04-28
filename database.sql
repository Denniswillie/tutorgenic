drop table if exists Reviews;
drop table if exists CourseStudentRelationships;
drop table if exists Courses;
drop table if exists Posts;
drop table if exists TutorSubjectRelationships;
drop table if exists StudentSavesTutorRelationships;
drop table if exists Users;
drop table if exists Subjects;
drop table if exists Session;
drop function if exists findOrCreateGoogleUser;
drop index if exists IDX_session_expire;

create table Users (
	_id serial primary key,
	first_name varchar(50),
	last_name varchar(50),
	email varchar(320),
	password varchar(255),
	experiences json,
	educations json,
	rating DECIMAL(3,1),
	credits DECIMAL(10,2) DEFAULT 0.00,
	is_tutor BOOLEAN DEFAULT 'f',
	is_admin BOOLEAN DEFAULT 'f',
	sign_up_date DATE,
	is_verified BOOLEAN DEFAULT 'f'
);

INSERT INTO users (first_name, last_name, email, password, is_tutor, is_admin, is_verified) values('Dennis', 'Willie', 'denniswillie2000@gmail.com', '$2b$05$GyEudUu/3wNxtq9vX6yUD.mQybpclvST2Bqe5GsYGF22TGdMBqv/6', 't', 't', 't');
INSERT INTO users (first_name, last_name, email, password, is_tutor, is_admin, is_verified) values('Mark', 'Jefferson', 'jeffersonhandojo@gmail.com', '$2b$05$GyEudUu/3wNxtq9vX6yUD.mQybpclvST2Bqe5GsYGF22TGdMBqv/6', 't', 't', 't');
INSERT INTO users (first_name, last_name, email, password, is_tutor, is_admin, is_verified) values('Felix', 'Xavier', 'xavier.felix222@gmail.com', '$2b$05$GyEudUu/3wNxtq9vX6yUD.mQybpclvST2Bqe5GsYGF22TGdMBqv/6', 't', 't', 't');

create table Subjects (
	_id serial primary key,
	title varchar(100)
);

create table TutorSubjectRelationships (
	tutor_id int NOT NULL,
	subject_id int NOT NULL,
	is_approved BOOLEAN DEFAULT 'f',
	PRIMARY KEY(tutor_id, subject_id),
	FOREIGN KEY(tutor_id) REFERENCES Users(_id),
	FOREIGN KEY(subject_id) REFERENCES Subjects(_id)
);

create table StudentSavesTutorRelationships (
	student_id int NOT NULL,
	tutor_id int NOT NULL,
	PRIMARY KEY(student_id, tutor_id),
	FOREIGN KEY(student_id) REFERENCES Users(_id),
	FOREIGN KEY(tutor_id) REFERENCES Users(_id)
);

create table Posts (
	_id serial PRIMARY KEY,
	time_of_creation TIME NOT NULL,
	creator_id int NOT NULL,
	text TEXT NOT NULL
);

create table Courses (
	_id serial PRIMARY KEY,
	tutor_id int NOT NULL,
	date DATE NOT NULL,
	start_time TIME NOT NULL,
	end_time TIME NOT NULL,
	title varchar(255) NOT NULL,
	description TEXT NOT NULL,
	note json,
	fee DECIMAL(10,2) DEFAULT 0.00,
	FOREIGN KEY (tutor_id) REFERENCES Users(_id)
);

create table CourseStudentRelationships (
	course_id int NOT NULL,
	student_id int NOT NULL,
	PRIMARY KEY(course_id, student_id),
	FOREIGN KEY(course_id) REFERENCES Courses(_id),
	FOREIGN KEY(student_id) REFERENCES Users(_id)
);

create table Reviews (
	_id serial PRIMARY KEY,
	tutor_id int NOT NULL,
	student_id int NOT NULL,
	rating DECIMAL(3, 1),
	message TEXT
);

CREATE TABLE session (
  "sid" varchar NOT NULL COLLATE "default",
	"sess" json NOT NULL,
	"expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_session_expire" ON "session" ("expire");

create or replace function findOrCreateGoogleUser(
	created_email varchar(320),
	created_firstname varchar(50),
	created_lastname varchar(50)
)
returns table(
	found_id int, 
	found_firstname varchar(50), 
	found_lastname varchar(50),
	found_isadmin BOOLEAN,
	found_istutor BOOLEAN,
	found_isverified BOOLEAN
)
language plpgsql
as $$
declare 
	data record; 
	curr_password varchar(255);
begin
	SELECT users.password into curr_password FROM users WHERE email = created_email LIMIT 1;
	if not found then
		INSERT INTO users (email, first_name, last_name, is_verified) SELECT created_email, created_firstname, created_lastname, 't';
	elsif curr_password IS NOT NULL then
  		raise exception 'Must login with password';
	end if;
	for data in (SELECT _id, first_name, last_name, is_admin, is_tutor, is_verified FROM users WHERE email = created_email LIMIT 1)
		loop 
			found_id := data._id; 
			found_firstname := data.first_name; 
			found_lastname := data.last_name; 
			found_isadmin := data.is_admin;
			found_istutor := data.is_tutor;
			found_isverified := data.is_verified;
			return next; 
		end loop;
end; $$