const bcrypt = require('bcrypt');
const OTP = require('../model/otpSchema');
const nodemailer = require('nodemailer');


const sendOtpEmail = async ({ _id, email }, res) => {

    const otp = `${Math.floor(1000 + Math.random() * 9000)}`

    console.log('otp', otp);

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: process.env.USER_AUTH_FROM_EMAIL,
            pass: process.env.USER_AUTH_SMTP_PASS
        }
    });




    const mailOptions = {

        from: 'sejibaby54@gmail.com',
        to: email,
        subject: 'For email verification from Male Fashion',
        html: `<P> Your OTP for verification is ${otp} . Don't share your otp !</p> <p> The otp is only valid for 5 minutes</p> `
    };

    const hashedOtp = await bcrypt.hash(otp, 10);

    const existingOtpData = await OTP.findOne({ userId: _id });

    if (existingOtpData) {

        const deletedOldOtpData = await OTP.deleteOne({ userId: _id });


        // redirect if deletion failed

    }

    const otpdata = new OTP({

        userId: _id,
        otp: hashedOtp,
        createdAt: Date.now(),
        expiresAt: Date.now() + 300000,

    })

    await otpdata.save();




    await transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            return false;

        } else {
            console.log('email has send ', info.response);

            return true;
        }
    })


}

module.exports = { sendOtpEmail }