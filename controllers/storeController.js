const mongoose = require("mongoose");
const Store = mongoose.model("Store");
const multer = require("multer");
const jimp = require("jimp");
const uuid = require("uuid");

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith("image/");
    if (isPhoto) {
      next(null, true);
    } else {
      next({
        message: "That filetype isn't allowed!"
      }, false);
    }
  }
};

exports.homePage = (req, res) => {
  res.render("index");
};

exports.addStore = (req, res) => {
  res.render("addStore", {
    title: "Add Store"
  });
};

//----- Files upload middleware
exports.upload = multer(multerOptions).single("photo");
exports.resize = async (req, res, next) => {
  //check if there is no new file to resize
  if (!req.file) {
    next(); // skip to next middleware
    return;
  }
  const extension = req.file.mimetype.split("/")[1];
  req.body.photo = `${uuid.v4()}.${extension}`;
  // resize
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  // once we have written the photo to our filesystem, keep going
  next();
};

exports.createStore = async (req, res) => {
  const store = await new Store(req.body).save();
  req.flash(
    "success",
    `Successully created ${store.name}. Care to leave a review?`
  );
  res.redirect(`/stores/${store.slug}`);
};

exports.getStores = async (req, res) => {
  const stores = await Store.find();
  res.render("stores", {
    title: "Stores",
    stores
  });
};

exports.editStore = async (req, res) => {
  const store = await Store.findById(req.params.id);
  res.render("editStore", {
    title: `Edit ${store.name}`,
    store
  });
};

exports.updateStore = async (req, res) => {
  req.body.location.type = "Point";
  const store = await Store.findOneAndUpdate({
    _id: req.params.id
  }, req.body, {
    new: true,
    runValidators: true
  }).exec();
  req.flash(
    "success",
    `Successfully updated ${store.name}. <a href='/stores/${
      store.slug
    }'>View Store</a> `
  );
  res.redirect(`/stores/${store._id}/edit`);
};

exports.showStore = async (req, res, next) => {
  const store = await Store.findOne({
    slug: req.params.slug
  });
  if (!store) return next();
  res.render("showStore", {
    store,
    title: store.name
  });
};

exports.getStoreByTag = async (req, res) => {
  const tag = req.params.tag;
  const tagQuery = tag || {
    $exists: true
  };
  const tagsPromise = Store.getTagsList();
  const storesPromise = Store.find({
    tags: tagQuery
  });

  const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);

  res.render("tags", {
    tags,
    tag,
    stores,
    title: "Tags"
  });
};