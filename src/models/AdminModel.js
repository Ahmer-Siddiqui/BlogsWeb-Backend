const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { HOST_NAME: BASE_URL, JWT_SECRET: SECRET_KEY } = process.env;

const adminSchema = new mongoose.Schema({
  profileImage: {
    type: String,
    default: null
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  }
}, { timestamps: true });


// Methods
adminSchema.pre("save", async function (next) {
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

adminSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

adminSchema.methods.getJWTToken = function () {
  const credentials = {
    id: this._id,
    email: this.email,
    userType: "admin",
  };

  return jwt.sign(credentials, SECRET_KEY, { expiresIn: "5h" });
};


adminSchema.methods.generateResetPasswordLink = function () {
  const payload = {
    id: this._id,
    email: this.email
  }
  const secret = SECRET_KEY + this.password;
  const token = jwt.sign(payload, secret, {
    expiresIn: '15m'
  });
  
  return `${BASE_URL}/reset-password?id=${payload?.id}&token=${token}`;
};


adminSchema.methods.verifyResetPasswordToken = function (token) {
  const secret = SECRET_KEY + this.password;
  jwt.verify(token, secret, (err) => {
    if (err) {
      console.error("Error:", err)
      return false;
    }
  });
  return true;
};

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
