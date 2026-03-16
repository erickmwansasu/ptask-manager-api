A REST API for managing tasks with user authentication

Features
1. User regisrtation & login (JWT auth) y
2. Create, read, update, delete tasks 
3. Each user only sees their own tasks 
4. Mark tasks as complete or incomplete 
5. Filter tasks (completed, pending, all) 


Bonus Features
1. Task categories/tags
2. Due dates (admin can extend due date/time)

3. Priority levels
4. Search functionality

Mine - features
1. Input validation and sanitization
2. Permission-based access
3. Two factor auth

Dependencies
 express, cookie-parser, jsonwebtoken, dotenv, bcrypt, pg 

1. npm init-y
2. npm i express bcrypt cookie-parser dotenv jsonwebtoken pg 