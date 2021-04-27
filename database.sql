drop table if exists Reviews;
drop table if exists CourseStudentRelationships;
drop table if exists Courses;
drop table if exists Posts;
drop table if exists TutorApplications;
drop table if exists Users;
drop table if exists Session;
drop function if exists findOrCreateGoogleUser;
drop index if exists IDX_session_expire;

create table Users (
	_id serial primary key,
	firstName varchar(50),
	lastName varchar(50),
	email varchar(320),
	password varchar(255),
	experiences json,
	educations json,
	rating DECIMAL(3,1),
	credits DECIMAL(10,2) DEFAULT 0.00,
	savedTutorIds integer[],
	isTutor BOOLEAN DEFAULT 'f',
    googleId varchar(255),
	isAdmin BOOLEAN DEFAULT 'f',
	signUpDate DATE,
	isVerified BOOLEAN DEFAULT 'f'
);

INSERT INTO users (firstname, lastname, email, password, isTutor, isAdmin, isVerified) values('Dennis', 'Willie', 'denniswillie2000@gmail.com', '$2b$05$GyEudUu/3wNxtq9vX6yUD.mQybpclvST2Bqe5GsYGF22TGdMBqv/6', 't', 't', 't');
INSERT INTO users (firstname, lastname, email, password, isTutor, isAdmin, isVerified) values('Mark', 'Jefferson', 'jeffersonhandojo@gmail.com', '$2b$05$GyEudUu/3wNxtq9vX6yUD.mQybpclvST2Bqe5GsYGF22TGdMBqv/6', 't', 't', 't');
INSERT INTO users (firstname, lastname, email, password, isTutor, isAdmin, isVerified) values('Felix', 'Xavier', 'xavier.felix222@gmail.com', '$2b$05$GyEudUu/3wNxtq9vX6yUD.mQybpclvST2Bqe5GsYGF22TGdMBqv/6', 't', 't', 't');

create table TutorApplications (
	userId int NOT NULL PRIMARY KEY,
	timeOfCreation TIME,
	subjects varchar(20)[],
	FOREIGN KEY(userId) REFERENCES Users(_id)
);

create table Posts (
	_id serial PRIMARY KEY,
	timeOfCreation TIME NOT NULL,
	creatorId int NOT NULL,
	text TEXT NOT NULL
);

create table Courses (
	_id serial PRIMARY KEY,
	tutorId int NOT NULL,
	date DATE NOT NULL,
	startTime TIME NOT NULL,
	endTime TIME NOT NULL,
	title varchar(255) NOT NULL,
	description TEXT NOT NULL,
	note json,
	fee DECIMAL(10,2) DEFAULT 0.00,
	FOREIGN KEY (tutorId) REFERENCES Users(_id)
);

create table CourseStudentRelationships (
	courseId int NOT NULL,
	studentId int NOT NULL,
	PRIMARY KEY(courseId, studentId),
	FOREIGN KEY(courseId) REFERENCES Courses(_id),
	FOREIGN KEY(studentId) REFERENCES Users(_id)
);

create table Reviews (
	_id serial PRIMARY KEY,
	tutorId int NOT NULL,
	studentId int NOT NULL,
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
returns table(found_id int, found_firstname varchar(50), found_lastname varchar(50))
language plpgsql
as $$
declare 
	data record; 
	curr_password varchar(255);
begin
	SELECT users.password into curr_password FROM users WHERE email = created_email LIMIT 1;
	if not found then
		INSERT INTO users (email, firstname, lastname, isverified) SELECT created_email, created_firstname, created_lastname, 't';
	elsif curr_password IS NOT NULL then
  		raise exception 'Must login with password';
	end if;
	for data in (SELECT _id, firstname, lastname FROM users WHERE email = created_email LIMIT 1)
	loop found_id := data._id; found_firstname := data.firstname; found_lastname := data.lastname; return next; end loop;
end; $$