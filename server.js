/*********************************************************************************
* WEB700 – Assignment 05
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: PRABHJOT SINGH Student ID: 129183224 Date: JULY 26, 2023
*
* Online (Cyclic) Link: ________________________________________________________
*
********************************************************************************/ 
const express = require("express");
const path = require("path");
const collegeData = require("./modules/collegeData");
const app = express();
const exphbs = require('express-handlebars');
console.log(path.join(__dirname, 'public'));
app.set('views', __dirname + '/views');
app.use(function(req,res,next){
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  next();
 });
 app.engine('hbs', exphbs.engine({ extname: '.hbs', defaultLayout: 'main', helpers: {
  navLink: function (url, options) {
      return (
          '<li' +
          ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') +
          '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>'
      );
  },
  // Handlebars helper for equality check
  equal: function (lvalue, rvalue, options) {
      if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
      if (lvalue != rvalue) {
          return options.inverse(this);
      } else {
          return options.fn(this);
      }
  }
}, }));
app.set('view engine', '.hbs');
app.use("/public",express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }))
const HTTP_PORT = process.env.PORT || 8080;
// Middleware to parse JSON data
app.use(express.json());

// Route to get all students or students by course
app.get('/students', (req, res) => {
  const { course } = req.query;
  if (course) {
    console.log(course)
    collegeData.getStudentsByCourse(course)
      .then(students => {
        if (students.length === 0) {
          res.render({ message: 'no results' });
        } else {
          res.render("students", {students: students});
        }
      })
      .catch(error => {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' });
      });
  } else {
    collegeData.getAllStudents()
      .then(students => {
        if (students.length === 0) {
          res.render({ message: 'no results' });
        } else {
          res.render("students", {students: students});
        }
      })
      .catch(() => {
        res.render("students", { message: 'no results' });
      });
  }
});

// Route to get all TAs
app.get('/tas', (req, res) => {
  collegeData.getTAs()
    .then(tas => {
      if (tas.length === 0) {
        res.json({ message: 'no results' });
      } else {
        res.json(tas);
      }
    })
    .catch(error => {
      res.status(500).json({ message: 'Internal server error' });
    });
});

// Route to get all courses
app.get("/courses", function(req, res) {
  collegeData.getCourses()
    .then(function(data) {
      res.render("courses", { courses: data });
    })
    .catch(function(err) {
      res.render("courses", { message: "no results" });
    });
});

app.get("/course/:id", (req, res) => {
  const courseId = parseInt(req.params.id);
  collegeData
      .getCourseById(courseId)
      .then((data) => {
          res.render("course", { course: data });
      })
      .catch((err) => {
          res.render("course", { message: err.message });
      });
});

// Route to get a student by student number
app.get('/student/:num', (req, res) => {
  const { num } = req.params;
  collegeData.getStudentByNum(num)
    .then((student) => {
      res.render("student", { student: student });
    })
    .catch(() => {
      res.render("student", { message: "Student not found" });
    });
});

// GET /home
app.get('/', (req, res) => {
  res.render("home");
});

// GET /about
app.get('/about', (req, res) => {
  res.render("about")
});

// GET /htmlDemo
app.get('/htmlDemo', (req, res) => {
  res.render("htmlDemo")
});

app.get("/students/add", (req, res) => {
  res.render("addStudent")
});

// Route to handle the form submission and add a new student
app.post("/students/add", (req, res) => {
  const studentData = req.body;
  collegeData.addStudent(studentData)
    .then(() => {
      res.redirect("/students");
    })
    .catch(() => {
      res.status(500).json({ message: "Failed to add student" });
    });
});

app.post("/student/update", (req, res) => {
  const updatedStudent = {
      studentNum: parseInt(req.body.studentNum),
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      addressStreet: req.body.addressStreet,
      addressCity: req.body.addressCity,
      addressProvince: req.body.addressProvince,
      TA: req.body.TA === "on", // Convert checkbox value to boolean
      status: req.body.status,
      course: req.body.course,
  };

  collegeData
      .updateStudent(updatedStudent)
      .then(() => {
          res.redirect("/students");
      })
      .catch((err) => {
          console.error("Error updating student:", err.message);
          res.redirect("/students");
      });
});

// 404 error message
app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

// Initializing the collegeData module
collegeData.initialize()
  .then(() => {
    // Start the server
    app.listen(HTTP_PORT, () => {
      console.log("Server listening on port: " + HTTP_PORT);
    });
  })
  .catch((err) => {
    console.error("Error initializing collegeData:", err);
  });
