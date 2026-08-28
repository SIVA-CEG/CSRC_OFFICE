import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfilePage.css";

const DESIGNATIONS = [
  "Junior Assistant",
  "Assistant",
  "Senior Assistant",
  "Section Officer",
  "Office Superintendent",
  "Assistant Registrar",
  "Deputy Registrar",
  "Joint Registrar",
  "Registrar",
  "Professor & Director",
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState(null);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [signatureFile, setSignatureFile] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [employeeNo, setEmployeeNo] = useState("");
  const user = JSON.parse(
    sessionStorage.getItem("proceedings_user") ||
      sessionStorage.getItem("proceedings_user") ||
      sessionStorage.getItem("tapal_user") ||
      sessionStorage.getItem("tapal_user") ||
      "{}",
  );
  const userId = user.id;

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(
          `http://localhost:5100/api/auth/profile/${userId}`,
        );
        const data = await res.json();
        setProfile(data);
        setPhone(data.phone || "");
        setEmail(data.email || "");
        setEmployeeNo(data.employee_no || "");
        if (data.signature_path) {
          setSignaturePreview(`http://localhost:5100/${data.signature_path}`);
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    }
    if (userId) fetchProfile();
  }, [userId]);

  const handleSignatureFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSignatureFile(file);
    setSignaturePreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("phone", phone);
      formData.append("email", email);
      formData.append("employee_no", employeeNo);
      if (signatureFile) formData.append("signature", signatureFile);

      const res = await fetch(
        `http://localhost:5100/api/auth/profile/${userId}`,
        {
          method: "PUT",
          body: formData,
        },
      );
      const data = await res.json();
      setProfile(data.user);
      setSaved(true);
      setIsEditing(false);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save profile", err);
    }
  };

  if (!profile)
    return <div style={{ padding: 40, color: "#fff" }}>Loading...</div>;

  return (
    <div className="pf-page">
      <div className="pf-top-nav">
        <button className="pf-btn-back" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <span className="pf-role-chip">{profile.role}</span>
      </div>

      <div className="pf-header">
        <h1 className="pf-header-title">My Profile</h1>
        <p className="pf-header-sub">
          Manage your personal details and signature
        </p>
      </div>

      <div className="pf-card">
        <div className="pf-grid">
          <div className="pf-field">
            <label className="pf-label">Name</label>
            <input className="pf-input" value={profile.name} readOnly />
          </div>

          <div className="pf-field">
            <label className="pf-label">Username</label>
            <input className="pf-input" value={profile.username} readOnly />
          </div>

          <div className="pf-field">
            <label className="pf-label">Role</label>
            <input className="pf-input" value={profile.role} readOnly />
          </div>

          <div className="pf-field">
            <label className="pf-label">Phone</label>
            <input
              className="pf-input"
              type="tel"
              value={phone}
              readOnly={!isEditing}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit mobile number"
            />
          </div>

          <div className="pf-field">
            <label className="pf-label">Email</label>
            <input
              className="pf-input"
              type="email"
              value={email}
              readOnly={!isEditing}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          <div className="pf-field">
            <label className="pf-label">Employee Number</label>
            <input
              className="pf-input"
              value={employeeNo}
              readOnly={!isEditing}
              onChange={(e) => setEmployeeNo(e.target.value)}
              placeholder="e.g. AU-EMP-1234"
            />
          </div>
          <div className="pf-field pf-field-full">
            <label className="pf-label">Signature</label>
            <input
              type="file"
              ref={fileRef}
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleSignatureFile}
            />
            <div className="pf-sig-box">
              {signaturePreview ? (
                <>
                  <img
                    src={signaturePreview}
                    alt="Signature"
                    className="pf-sig-preview"
                  />
                  {isEditing && (
                    <button
                      className="pf-sig-change-btn"
                      onClick={() => fileRef.current?.click()}
                    >
                      Change Signature
                    </button>
                  )}
                </>
              ) : (
                <>
                  <span>No signature uploaded</span>
                  {isEditing && (
                    <button
                      className="pf-sig-upload-btn"
                      onClick={() => fileRef.current?.click()}
                    >
                      📤 Upload Signature
                    </button>
                  )}
                </>
              )}
            </div>
            <p className="pf-sig-hint">
              This signature is applied automatically when you use "Approve
              &amp; Transfer" on a proposal.
            </p>
          </div>
        </div>

        <div className="pf-actions">
          {!isEditing ? (
            <button className="pf-edit-btn" onClick={() => setIsEditing(true)}>
              ✏️ Update Profile
            </button>
          ) : (
            <>
              <button className="pf-save-btn" onClick={handleSave}>
                💾 Save Changes
              </button>
              <button
                className="pf-cancel-btn"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </>
          )}
          {saved && <span className="pf-saved-msg">✔ Profile saved</span>}
        </div>
      </div>
    </div>
  );
}
