const express = require("express");
const router = express.Router();
const storeController = require("../controllers/storeController");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

// Do work here
// router.get("/", (req, res) => {
//   // data = { name: "Trung", age: 23 };
//   // res.send("Hey! It works!");
//   // res.json(req.query)
//   // res.json(req.params);
//   res.render("hello", {
//     name: "Trung",
//     age: 23
//   });
// });

const { catchErrors } = require("../handlers/errorHandlers");
//------------- Homepage
router.get("/", storeController.homePage);

//------------- Store Group
router.get("/stores/add", storeController.addStore);
router.post(
  "/stores",
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.createStore)
);
router.get("/stores", catchErrors(storeController.getStores));
router.get("/stores/:id/edit", catchErrors(storeController.editStore));
router.patch(
  "/stores/:id",
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.updateStore)
);
router.get("/stores/:slug", catchErrors(storeController.showStore));
router.get("/tags/:tag*?", catchErrors(storeController.getStoreByTag));

//------------- User Authentication
router.get("/login", userController.loginForm);
router.get("/register", userController.registerForm);

//1. Validate the register data
//2. register the user
//3. Log them in
router.post(
  "/register",
  userController.validateRegister,
  userController.register,
  authController.login
);
module.exports = router;
