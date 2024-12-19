const mongoose = require("mongoose");

const warningSchema = new mongoose.Schema(
  {
    publisher: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "publisher_type",
      required: true,
    },
    publisher_type: {
      type: String,
      required: true,
      enum: {
        values: ["Admin", "Merchant", "MerchantEmployee"],
        message:
          "publisher should include at least one of 'merchant', 'merchant-employee' or 'admin'",
      },
    },
    recipient: {
      type: String,
      enum: {
        values: ["merchant", "merchant-employee", "user"],
        message:
          "Recipients should include at least one of 'merchant', 'merchant-employee' or 'user'",
      },
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    warningStatus: {
      type: String,
      default: "warning",
      enum: ["warning", "danger"],
    },
    startDate: {
      type: Date,
      required: true,
      get: (date) => date.toISOString().split("T")[0],
    },
    endDate: {
      type: Date,
      required: true,
      get: (date) => date.toISOString().split("T")[0],
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true }, // Apply getters to JSON output
    toObject: { getters: true }, // Apply getters to object output
  }
);

// Create a unique index on message and recipient
warningSchema.index({ recipient: 1, message: 1 }, { unique: true });

const Warning = mongoose.model("Warning", warningSchema);
module.exports = Warning;
