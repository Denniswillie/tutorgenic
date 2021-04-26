drop table if exists Reviews;
drop table if exists CourseStudentRelationships;
drop table if exists Courses;
drop table if exists Follows;
drop table if exists Users;
drop table if exists Session;

create table Users (
	_id serial primary key,
	username varchar(255) NOT NULL,
	password varchar(255) NOT NULL,
	fullName varchar(255) NOT NULL,
	experiences json,
	rating DECIMAL(3,1),
	credits DECIMAL(10,2) DEFAULT 0.00,
	isTutor BOOLEAN DEFAULT 'f'
);

create table Follows (
	followerId int NOT NULL,
	followedId int NOT NULL,
	PRIMARY KEY(followerId, followedId),
	FOREIGN KEY (followerId) REFERENCES Users(_id),
	FOREIGN KEY (followedId) REFERENCES Users(_id)
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