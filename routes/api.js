const express = require("express");
const router = express.Router();
const {
  catchErrors
} = require("../handlers/errorHandlers");

const storeController = require("../controllers/storeController");

router.get('/stores/search', catchErrors(storeController.searchStores));
router.get('/stores/near', catchErrors(storeController.mapStores));
router.post('/stores/:storeId/heart', catchErrors(storeController.heartStore));
module.exports = router;