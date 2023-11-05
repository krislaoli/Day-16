const express = require("express");
const app = express();
const PORT = 5000;
const path = require("path");
const dateDuration = require("./src/helper/duration");
const moment = require("moment");
const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("express-flash");
const upload = require("./src/middlewares/uploadFiles");

const config = require("./src/config/config.json");
const { Sequelize, QueryTypes } = require("sequelize");
const { error } = require("console");
const sequelize = new Sequelize(config.development);

// set up call hbs untuk sub folder
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "src/views"));

// set serving static file berupa file yang akan di tampilin untuk image dan js yang diambil dari file assets
app.use(express.static(path.join(__dirname, "src/assets")));

// parsing data from client
app.use(express.urlencoded({ extended: false }));

// styling css
app.use(express.static("public"));

// set serving static file
app.use(express.static("src/assets"));
app.use(express.static("src/uploads"));

// parsing data from client
app.use(express.urlencoded({ extended: false }));

// setup flash
app.use(flash());

app.use(
  session({
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60 * 2,
    },
    store: new session.MemoryStore(),
    saveUninitialized: true,
    resave: false,
    secret: "secretValue",
  })
);

// routing
app.get("/", home);
app.get("/testimonial", testimonial);
app.get("/blog", blog);
app.post("/blog", upload.single("images"), addBlog);
app.get("/blog-detail/:id", blogDetail);
app.get("/contact", contact);
app.post("/update-blog/:id", upload.single("images"), updateBlog);
app.get("/edit-blog/:id", editBlog);
app.get("/delete-blog/:id", deleteBlog);
app.get("/register", formRegister);
app.get("/login", formLogin);
app.post("/register", newUser);
app.post("/login", userLogin);

// logout user
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

// local server
app.listen(PORT, () => {
  console.log("Auto Pilot Boy");
  // console.log("Server running on port ");
});

//  index-hbs
async function home(req, res) {
  try {
    let user = req.session.idUser;
    // user no login
    if (!user) {
      const query = `SELECT "Projects".*, "users".id AS author_id, "users".name AS author_name FROM "Projects" LEFT JOIN "users" ON "Projects".author = "users".id`;

      let obj = await sequelize.query(query, { type: QueryTypes.SELECT });
      let dataBlogRes = obj.map((item) => {
        return {
          ...item,
          startDate: moment(item.startDate).format("DD-MMM-YYYY"),
          endDate: moment(item.endDate).format("DD-MMM-YYYY"),
          duration: dateDuration(item.startDate, item.endDate),
          isLogin: req.session.isLogin,
          user: req.session.user,
        };
      });
      let isLogin = {
        isLogin: req.session.isLogin,
        user: req.session.user,
      };

      res.render("index", {
        dataBlog: dataBlogRes,
        isLogin: req.session.isLogin,
        user: req.session.user,
      });
      // user login
    } else {
      user = user;
      const query = `SELECT "Projects".*, "users".id AS author_id, "users".name AS author_name FROM "Projects" LEFT JOIN "users" ON "Projects".author = "users".id
      WHERE author = ${user}`;

      let obj = await sequelize.query(query, { type: QueryTypes.SELECT });
      // console.log(obj);

      let dataBlogRes = obj.map((item) => {
        return {
          ...item,
          startDate: moment(item.startDate).format("DD-MMM-YYYY"),
          endDate: moment(item.endDate).format("DD-MMM-YYYY"),
          duration: dateDuration(item.startDate, item.endDate),
          isLogin: req.session.isLogin,
          user: req.session.user,
          // idUser: req.session
        };
      });
      let isLogin = {
        isLogin: req.session.isLogin,
        user: req.session.user,
      };

      res.render("index", {
        dataBlog: dataBlogRes,
        isLogin: req.session.isLogin,
        user: req.session.user,
      });
    }
  } catch (error) {
    console.log(error);
  }
}

//  blog-hbs
async function addBlog(req, res) {
  try {
    const { title, content, startDate, endDate, nodejs, reactjs, js, vuejs } =
      req.body;
    const images = req.file.filename;
    const author = req.session.idUser;
    const nodejsCheck = nodejs ? true : false;
    const reactjsCheck = reactjs ? true : false;
    const jsCheck = js ? true : false;
    const vuejsCheck = vuejs ? true : false;
    // console.log("req.file", req.body.file, req.file.filename)

    await sequelize.query(`INSERT INTO "Projects"(title, content, images, author,  "startDate", "endDate", nodejs, reactjs, js, vuejs, "createdAt", "updatedAt")
	VALUES ('${title}', '${content}', '${images}', '${author}', '${startDate}', '${endDate}', '${nodejsCheck}', '${reactjsCheck}', '${jsCheck}', '${vuejsCheck}', NOW(), NOW());`);
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
}

// edit-blog-hbs
async function editBlog(req, res) {
  const { id } = req.params;
  try {
    const query = `SELECT * FROM "Projects" WHERE id=${id};`;
    let obj = await sequelize.query(query, { type: QueryTypes.SELECT });

    obj = obj.map((item) => {
      return {
        ...item,
        startDate: moment(item.startDate).format("YYYY-MM-DD"),
        endDate: moment(item.endDate).format("YYYY-MM-DD"),
      };
    });
    res.render("edit-blog", { blog: obj[0] });
  } catch (error) {
    console.log(error);
  }
}

// blog-detail-hbs
async function blogDetail(req, res) {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM "Projects" WHERE id=${id};`;
    let obj = await sequelize.query(query, { type: QueryTypes.SELECT });

    obj = obj.map((item) => {
      return {
        ...item,
        startDate: moment(item.startDate).format("DD-MMM-YYYY"),
        endDate: moment(item.endDate).format("DD-MMM-YYYY"),
        duration: dateDuration(item.startDate, item.endDate),
      };
    });
    console.log();
    res.render("blog-detail", { blog: obj[0] });
  } catch (error) {
    console.log(error);
  }
}

// update-blog
async function updateBlog(req, res) {
  try {
    const { id } = req.params;
    const { title, content, startDate, endDate, nodejs, reactjs, js, vuejs } =
      req.body;
    const images = req.file.filename;
    const nodejsCheck = nodejs ? true : false;
    const reactjsCheck = reactjs ? true : false;
    const jsCheck = js ? true : false;
    const vuejsCheck = vuejs ? true : false;
    await sequelize.query(`UPDATE "Projects" 
        SET 
            title = '${title}', 
            images = '${images}', 
            content = '${content}', 
            "startDate" = '${startDate}', 
            "endDate" = '${endDate}', 
            "nodejs" = ${nodejsCheck},
            "reactjs" = ${reactjsCheck},
            "js" = ${jsCheck},
            "vuejs" = ${vuejsCheck},
            "createdAt" = NOW(), 
            "updatedAt" = NOW() 
        WHERE 
            id = ${id}
            ;`);
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
}

// delete card photo blog
async function deleteBlog(req, res) {
  const { id } = req.params;
  try {
    await sequelize.query(`DELETE FROM "Projects" WHERE id=${id}`);
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
}

// contact-hbs
function contact(req, res) {
  res.render("contact");
}

function testimonial(req, res) {
  res.render("testimonial");
}

// form register
function formRegister(req, res) {
  res.render("register");
}

// form login
function formLogin(req, res) {
  res.render("login");
}

// blog-hbs
function blog(req, res) {
  res.render("blog");
}

// new user
async function newUser(req, res) {
  try {
    const { name, email, password } = req.body;
    const salt = 10;

    // const obj = await bcrypt.hash(password, salt)
    await bcrypt.hash(password, salt, (err, hashPassword) => {
      const query = `INSERT INTO users (name, email, password, "createdAt", 
      "updatedAt") VALUES ('${name}', '${email}', '${hashPassword}', NOW(), NOW())`;

      sequelize.query(query);
      res.redirect("login");
    });
  } catch (error) {
    console.log(error);
  }
}

// user login
async function userLogin(req, res) {
  try {
    const { email, password } = req.body;
    const query = `SELECT * FROM users WHERE email = '${email}'`;
    let obj = await sequelize.query(query, { type: QueryTypes.SELECT });

    console.log(obj);

    if (!obj.length) {
      req.flash("danger", "Silahkan Registrasi Terlebih Dahulu");
      return res.redirect("/login");
    }

    await bcrypt.compare(password, obj[0].password, (err, result) => {
      if (!result) {
        req.flash("danger", "Password Salah");
        return res.redirect("/login");
      } else {
        req.session.isLogin = true;
        req.session.user = obj[0].name;
        req.session.idUser = obj[0].id;
        req.flash("success", "Berhasil Masuk");
        res.redirect("/");
      }
    });
  } catch (error) {
    console.log(error);
  }
}
