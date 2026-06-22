import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { profileService } from "../services/profileService";
import type { AxiosError } from "axios";
import "./CompleteProfile.css";

export function CompleteProfile() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If profile is already completed, redirect to dashboard
  if (user?.profile_completed) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await profileService.completeProfile({
        first_name: firstName,
        last_name: lastName,
        phone,
        dob: dob || null,
        gender: gender || null,
      });

      // Refresh user data so profile_completed becomes true
      await refreshUser();

      // Redirect to dashboard
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const axiosErr = err as AxiosError<{ detail: string }>;
      setError(axiosErr.response?.data?.detail || "Failed to complete profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="complete-profile-page">
      <div className="complete-profile-container">
        <div className="complete-profile-header">
          <h1>Complete Your Profile</h1>
          <p>
            Welcome, <strong>{user?.email}</strong>! Please fill in your details
            to get started.
          </p>
        </div>

        {error && (
          <div className="profile-error" role="alert">
            {error}
          </div>
        )}

        <form className="profile-form" onSubmit={onSubmit} noValidate>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter your last name"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Mobile Number *</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 9876543210"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dob">Date of Birth</label>
              <input
                id="dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="profile-submit-btn"
            disabled={isSubmitting || !firstName || !lastName || !phone}
          >
            {isSubmitting ? "Saving..." : "Complete Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
