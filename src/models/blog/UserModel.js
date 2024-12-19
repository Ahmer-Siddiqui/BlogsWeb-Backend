const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { HOST_NAME: BASE_URL, JWT_SECRET: SECRET_KEY } = process.env;

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      default: "Male",
    },
    blogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Blog" }],
  },
  { timestamps: true }
);

// Methods
userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) {
      return next();
    }
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getJWTToken = function () {
  const credentials = {
    id: this._id,
    email: this.email,
    userType: "user",
  };

  return jwt.sign(credentials, SECRET_KEY, { expiresIn: "5h" });
};

userSchema.methods.generateResetPasswordLink = function () {
  const payload = {
    id: this._id,
    email: this.email,
  };
  const secret = SECRET_KEY + this.password;
  const token = jwt.sign(payload, secret, {
    expiresIn: "15m",
  });

  return `${BASE_URL}/reset-password?id=${payload?.id}&token=${token}`;
};

userSchema.methods.verifyResetPasswordToken = function (token) {
  const secret = SECRET_KEY + this.password;
  jwt.verify(token, secret, (err) => {
    if (err) {
      console.error("Error:", err);
      return false;
    }
  });
  return true;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
