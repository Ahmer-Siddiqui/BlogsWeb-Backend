const mongoose = require('mongoose')

const alertSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  recipients: {
    type: [String],
    validate(value) {
      const allowedRecipients = ['merchant', 'user'];
      const isValid = value.every(recipient => allowedRecipients.includes(recipient));

      if (!isValid || value.length === 0) {
        throw new Error("Recipients should include at least one of 'merchant' or 'user'");
      }
    },
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['inactive', 'active'],
    default: 'active'
  },
  msgStatus: {
    type: String,
    required: true
  },
  publisher: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'publisher_type',
    required: true,
  },
  publisher_type: {
    type: String,
    required: true,
    enum: ['Admin', 'Merchant'],
  },
}, { timestamps: true });

const Alert = mongoose.model("Alert", alertSchema);
module.exports = Alert;