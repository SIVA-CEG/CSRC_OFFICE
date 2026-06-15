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
  const navigate  = useNavigate();
  const userRole  = localStorage.getItem("userRole") || "assistant";
  const storageKey = `csrc_profile_${userRole}`;
  const fileRef   = useRef(null);
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    designation: DESIGNATIONS[0],
    employeeNo: "",
    phone: "",
    email: "",
    signature: null,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (stored) setProfile(prev => ({ ...prev, ...stored }));
    } catch {}
  }, [storageKey]);

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSignatureFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setProfile(prev => ({ ...prev, signature: ev.target.result }));
      setSaved(false);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSave = () => {
    localStorage.setItem(storageKey, JSON.stringify(profile));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const roleLabel = userRole.charAt(0).toUpperCase() + userRole.slice(1);

  return (
    <div className="pf-page">
      <div className="pf-top-nav">
        <button className="pf-btn-back" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <span className="pf-role-chip">{roleLabel} Login</span>
      </div>

      <div className="pf-header">
        <h1 className="pf-header-title">My Profile</h1>
        <p className="pf-header-sub">
          Manage your personal details and the signature used for approvals
        </p>
      </div>

      <div className="pf-card">
        <div className="pf-grid">
          <div className="pf-field">
            <label className="pf-label">Name</label>
            <input
  className="pf-input"
  value={profile.name}
  readOnly={!isEditing}
  onChange={e => handleChange("name", e.target.value)}
  placeholder="Enter your full name"
/>
          </div>

          <div className="pf-field">
            <label className="pf-label">Designation</label>
            <select
  className="pf-input"
  value={profile.designation}
  disabled={!isEditing}
  onChange={e => handleChange("designation", e.target.value)}
>
  {DESIGNATIONS.map(d => (
    <option key={d} value={d}>{d}</option>
  ))}
</select>
          </div>

          <div className="pf-field">
            <label className="pf-label">Employee Number</label>
            <input
  className="pf-input"
  value={profile.employeeNo}
  readOnly={!isEditing}
  onChange={e => handleChange("employeeNo", e.target.value)}
  placeholder="e.g. AU-EMP-1234"
/>
          </div>

          <div className="pf-field">
            <label className="pf-label">Phone</label>
            <input
  className="pf-input"
  type="tel"
  value={profile.phone}
  readOnly={!isEditing}
  onChange={e => handleChange("phone", e.target.value)}
  placeholder="10-digit mobile number"
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
    {profile.signature ? (
      <>
        <img
          src={profile.signature}
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
    This signature is applied automatically when you use
    "Approve &amp; Transfer" on a proposal.
  </p>
</div>
        </div>

        <div className="pf-actions">
  {!isEditing ? (
    <button
      className="pf-edit-btn"
      onClick={() => setIsEditing(true)}
    >
      ✏️ Update Profile
    </button>
  ) : (
    <>
      <button
        className="pf-save-btn"
        onClick={() => {
          handleSave();
          setIsEditing(false);
        }}
      >
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