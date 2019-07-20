const nodemailer = require("nodemailer");
const sortBy = require("lodash/sortBy");
const emailTemplate = houses => `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta name="viewport" content="width=device-width" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  </head>
  <body itemscope itemtype="http://schema.org/EmailMessage">
    ${sortBy(houses, ["distance"]).map(house => {
      return `
      <div class="card">
        <div class="container">
          <a href='${house.link}'><b>${house.address}</b></a>
          <img src='${house.image}' alt='${house.address}' />
          <p>${house.price}</p>
          <p>travelDuration: ${house.travelDuration}</p>
          <p>Distance: ${house.distance} km</p>
          </div>
      </div>
      `;
    })}
  </body>
</html>
`;
async function sendEmail(data) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.emailUsername,
      pass: process.env.emailPassword,
    },
  });
  const timeStamp = new Date().toISOString();
  const mailOptions = {
    from: process.env.emailUsername,
    to: process.env.emailReceiver,
    subject: `${timeStamp} ${process.env.emailSubject}`,
    html: emailTemplate(data),
  };
  await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;
