import React, { useState } from "react";

const SignUpPage = () => {
  const [userType, setUserType] = useState("company"); // "company" or "client"
  const [form, setForm] = useState({
    companyName: "",
    email: "",
    password: "",
    clientName: "",
    mobile: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUserTypeChange = (type) => {
    setUserType(type);
    setForm({
      companyName: "",
      email: "",
      password: "",
      clientName: "",
      mobile: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userType === "company") {
      // Handle company signup logic here
      console.log("Company Signup:", {
        companyName: form.companyName,
        email: form.email,
        password: form.password,
      });
    } else {
      // Handle client signup logic here
      console.log("Client Signup:", {
        clientName: form.clientName,
        mobile: form.mobile,
        password: form.password,
      });
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", padding: 24 }}>
      <h2>Sign Up</h2>
      <div style={{ marginBottom: 16 }}>
        <button
          onClick={() => handleUserTypeChange("company")}
          style={{
            background: userType === "company" ? "#0070f3" : "#eee",
            color: userType === "company" ? "#fff" : "#000",
            marginRight: 8,
            padding: "8px 16px",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Company
        </button>
        <button
          onClick={() => handleUserTypeChange("client")}
          style={{
            background: userType === "client" ? "#0070f3" : "#eee",
            color: userType === "client" ? "#fff" : "#000",
            padding: "8px 16px",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Client
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        {userType === "company" ? (
          <>
            <div style={{ marginBottom: 12 }}>
              <label>
                Company Name:
                <input
                  type="text"
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: 8, marginTop: 4 }}
                />
              </label>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>
                Email:
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: 8, marginTop: 4 }}
                />
              </label>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>
                Password:
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: 8, marginTop: 4 }}
                />
              </label>
            </div>
          </>
        ) : (
          <>
            <div style={{ marginBottom: 12 }}>
              <label>
                Name:
                <input
                  type="text"
                  name="clientName"
                  value={form.clientName}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: 8, marginTop: 4 }}
                />
              </label>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>
                Mobile:
                <input
                  type="tel"
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: 8, marginTop: 4 }}
                />
              </label>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>
                Password:
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: 8, marginTop: 4 }}
                />
              </label>
            </div>
          </>
        )}
        <button
          type="submit"
          style={{
            background: "#0070f3",
            color: "#fff",
            padding: "10px 20px",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            width: "100%",
          }}
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default SignUpPage;
