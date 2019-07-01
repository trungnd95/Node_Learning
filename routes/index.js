const express = require("express");
const router = express.Router();
const storeController = require("../controllers/storeController");

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

router.get("/", storeController.homePage);
router.get("/stores/add", storeController.addStore);
router.post("/stores", catchErrors(storeController.createStore));
router.get("/stores", catchErrors(storeController.getStores));
router.get("/stores/:id/edit", catchErrors(storeController.editStore));
router.patch('/stores/:id', catchErrors(storeController.updateStore));
module.exports = router;
