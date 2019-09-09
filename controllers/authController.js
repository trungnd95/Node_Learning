const passport = require("passport");
const crypto = require("crypto");
const mongoose = require("mongoose");
const User = mongoose.model("User");
const promisify = require('es6-promisify');

exports.login = passport.authenticate("local", {
  failureRedirect: "/login",
  failureFlash: "Failed Login!",
  successRedirect: "/",
  successFlash: "You are now logged in"
});

exports.logout = (req, res) => {
  req.logout();
  req.flash("success", "You are logged out. !!!");
  res.redirect("/");
}

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
    return;
  }
  req.flash("error", "Opps. You must logged in first");
  res.redirect("/login");
}

exports.forgot = async (req, res) => {
  // 1. See if a user with that email exists or not 
  const user = await User.findOne({
    email: req.body.email
  });
  if (!user) {
    req.flash("error", "No account found with this email");
    return res.redirect("/login");
  }

  // 2. Set reset tokens and expiry on their account 
  user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordExpires = Date.now() + 3600000;
  await user.save();

  // 3. Send them an email with the token 
  const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
  req.flash("success", `You have been emailed a password reset link. ${resetURL}`);

  // 4. Redirect to login page
  res.redirect("/login");
}

exports.reset = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: {
      $gt: Date.now()
    }
  })
  if (!user) {
    req.flash('error', 'password reset is invalid or has expired');
    return res.redirect('/login');
  }
  // If there is user, show the reset password form
  res.render("reset", {
    title: "Reset password"
  });
}

exports.confirmedPasswords = (req, res, next) => {
  if (req.body.password === req.body['password-confirm']) {
    next();
    return;
  }
  req.flash('error', 'Password does not match!');
  res.redirect('back');
}

exports.update = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: {
      $gt: Date.now()
    }
  })
  if (!user) {
    req.flash('error', 'password reset is invalid or has expired');
    return res.redirect('/login');
  }


  const setPassword = promisify(user.setPassword, user);
  setPassword(req.body.passport);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  const updatedUser = await user.save();
  await req.login(updatedUser);
  req.flash("success", "Nice. Your password has been reset. !");
  res.redirect('/');
}