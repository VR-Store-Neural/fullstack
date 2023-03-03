const { Router } = require("express");
const bcrypt = require("bcryptjs"); // дозволяє хеширувати паролі таперевіряти їх
const { check, validationResult } = require("express-validator");
const config = require("config");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = Router();

// /api/auth/register
router.post(
  "/register",
  [
    check("email", "Некоректний email").isEmail(),
    check("password", "Мінімальна довжина паролю 6 символів").isLength({
      min: 6,
    }),
  ],
  async (request, response) => {
    try {
      const errors = validationResult(request);
      if (!erreors.isEmpty()) {
        return respons.status(400).json({
          errors: errors.array(),
          message: "Некоректні дані при регістрації",
        });
      }

      const { email, password } = request.body;

      const candidate = await User.findOne({ email });
      if (candidate) {
        return response
          .status(400)
          .json({ message: "Такий користувач вже існує" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const user = new User({ email, password: hashedPassword });

      await user.save();
      response.status(201).json({ message: "Користувач створенний" });
    } catch (err) {
      response
        .status(500)
        .json({ message: "Щось пішло не по плану, спробуйте знову" });
    }
  }
);

// /api/auth/login
router.post(
  "/login",
  [
    check("email", "Введіть коректний email").normalizeEmail().isEmail,
    check("password", "Введіть пароль").exists(),
  ],
  async (request, response) => {
    try {
      const errors = validationResult(request);
      if (!erreors.isEmpty()) {
        return respons.status(400).json({
          errors: errors.array(),
          message: "Некоректні дані при вході у систему",
        });
      }

      const { email, password } = request.body;
      const user = await User.findOne({ email });
      if (!user) {
        return response.status(400).json({ message: "Користувач не знайден" });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return response.status(400).json({ message: "Спробуйте знову" });
      }
      const token = jwt.sign({ userId: user.id }, config.get("jwtSecret"), {
        expiresIn: "1h",
      });

      response.json({ token, userId: user.id });
    } catch (err) {
      response
        .status(500)
        .json({ message: "Щось пішло не по плану, спробуйте знову" });
    }
  }
);

module.exports = router;
