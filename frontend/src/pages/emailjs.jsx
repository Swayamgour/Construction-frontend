import React, { useState } from "react";
import emailjs from "emailjs-com";

const EmailForm = () => {
  const [toEmail, setToEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs.send(
      "service_gj4np7q",      // from EmailJS dashboard
      "template_3lasqn6",     // from EmailJS dashboard
      {
        to_email: toEmail,
        subject: subject,
        message: message,
      },
      "rGLRZGrKYrRiGque1"       // from EmailJS dashboard
    )
    .then((res) => {
      console.log("Email sent successfully", res);
      alert("Email sent!");
    })
    .catch((err) => {
      console.error("Failed to send email", err);
      alert("Email failed!");
    });
  };

  return (
    <form onSubmit={sendEmail} className="space-y-3">
      <input type="email" placeholder="To Email" value={toEmail} onChange={e => setToEmail(e.target.value)} required />
      <input type="text" placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} required />
      <textarea placeholder="Message" value={message} onChange={e => setMessage(e.target.value)} required />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Send Email</button>
    </form>
  );
};

export default EmailForm;
