"use client"
import React, { useState } from "react";

const AccountSettings = () => {
  const [profile, setProfile] = useState({
    fullName: "Steve Gaming",
    email: "steve@example.com",
    company: "Steve Tech Ltd.",
    phone: "9876543210",
    notifyByEmail: true,
    notifyBySMS: false,
    password: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile({
      ...profile,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updated Profile:", profile);
    alert("Profile settings saved!");
    // TODO: Send updated data to backend
  };

  return (
    <div className="settings-container">
      <h2>⚙️ Account & Profile Settings</h2>
      <form onSubmit={handleSubmit} className="settings-form">
        <label>Full Name</label>
        <input
          type="text"
          name="fullName"
          value={profile.fullName}
          onChange={handleChange}
        />

        <label>Email Address</label>
        <input
          type="email"
          name="email"
          value={profile.email}
          onChange={handleChange}
        />

        <label>Company Name</label>
        <input
          type="text"
          name="company"
          value={profile.company}
          onChange={handleChange}
        />

        <label>Phone Number</label>
        <input
          type="tel"
          name="phone"
          value={profile.phone}
          onChange={handleChange}
        />

        <label>Change Password</label>
        <input
          type="password"
          name="password"
          placeholder="New Password"
          value={profile.password}
          onChange={handleChange}
        />

        <label>Notifications</label>
        <div className="checkbox-group">
          <label>
            <input
              type="checkbox"
              name="notifyByEmail"
              checked={profile.notifyByEmail}
              onChange={handleChange}
            />
            Email Notifications
          </label>
          <label>
            <input
              type="checkbox"
              name="notifyBySMS"
              checked={profile.notifyBySMS}
              onChange={handleChange}
            />
            SMS Notifications
          </label>
        </div>

        <button type="submit">Save Changes</button>
      </form>

      <style jsx>{`
        .settings-container {
          max-width: 600px;
          margin: 30px auto;
          padding: 25px;
          border-radius: 10px;
          background-color: #fdfdfd;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
        }

        h2 {
          text-align: center;
          margin-bottom: 25px;
        }

        .settings-form label {
          display: block;
          margin-top: 15px;
          font-weight: 600;
        }

        .settings-form input[type="text"],
        .settings-form input[type="email"],
        .settings-form input[type="tel"],
        .settings-form input[type="password"] {
          width: 100%;
          padding: 10px;
          margin-top: 5px;
          border-radius: 6px;
          border: 1px solid #ccc;
        }

        .checkbox-group {
          display: flex;
          flex-direction: column;
          margin-top: 10px;
        }

        .checkbox-group label {
          font-weight: normal;
        }

        button {
          margin-top: 25px;
          padding: 12px 20px;
          background-color: #0070f3;
          border: none;
          color: white;
          border-radius: 6px;
          cursor: pointer;
        }

        button:hover {
          background-color: #005cc1;
        }
      `}</style>
    </div>
  );
};

export default AccountSettings;
