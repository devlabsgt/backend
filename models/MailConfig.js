const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mailConfigSchema = new Schema(
  {
    emailSender: { type: String, required: true },
    emailPassword: { type: String, required: true },
    smtpHost: { type: String },
    smtpPort: { type: Number },
    telefono: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MailConfig", mailConfigSchema);
