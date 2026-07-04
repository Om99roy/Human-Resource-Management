import React, { useState } from "react";
import orBIS from "../assets/orBIS.png";

const Signup = () => {
  const [companyName, setCompanyName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    console.log({
      companyName,
      name,
      email,
      phone,
      password,
      confirmPassword,
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* LOGO */}
        <img src={orBIS} alt="Logo" style={styles.logo} />

        <h1 style={styles.title}>Sign Up</h1>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="Company Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            style={styles.input}
            required
          />

          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />

          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={styles.input}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={styles.input}
            required
          />

          <button type="submit" style={styles.button}>
            Create Account
          </button>
        </form>

        <p style={styles.text}>
          Already have an account?{" "}
          <a href="/login" style={styles.link}>
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#09090b",
    fontFamily: "Inter, sans-serif",
  },

  card: {
    width: "380px",
    padding: "28px",
    borderRadius: "14px",
    background: "#18181b",
    border: "1px solid #3f3f46",
    boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
  },

  logo: {
    width: "70px",
    height: "70px",
    objectFit: "contain",
    margin: "0 auto 10px auto",
    display: "block",
  },

  title: {
    color: "#fafafa",
    textAlign: "center",
    marginBottom: "20px",
    fontSize: "24px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  input: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #3f3f46",
    backgroundColor: "#27272a",
    color: "#fafafa",
    outline: "none",
  },

  button: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(90deg, #e91e63, #f44336, #5b21b6)",
    color: "#fafafa",
    cursor: "pointer",
    fontWeight: "600",
    marginTop: "6px",
  },

  text: {
    marginTop: "14px",
    textAlign: "center",
    color: "#a1a1aa",
    fontSize: "14px",
  },

  link: {
    color: "#e91e63",
    textDecoration: "none",
    fontWeight: 500,
  },
};

export default Signup;