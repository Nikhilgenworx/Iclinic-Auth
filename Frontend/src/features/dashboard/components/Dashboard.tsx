import { useAuth } from "../../auth/context/AuthContext";

export function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <button className="btn-logout" onClick={logout}>
          Sign Out
        </button>
      </header>

      <div className="dashboard-content">
        <div className="profile-card">
          <h2>Welcome back!</h2>
          <div className="profile-details">
            <div className="detail-row">
              <span className="detail-label">Email</span>
              <span className="detail-value">{user?.email}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Role</span>
              <span className="detail-value badge">{user?.role}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Status</span>
              <span className="detail-value">
                {user?.is_active ? "✓ Active" : "Inactive"}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Profile</span>
              <span className="detail-value">
                {user?.profile_completed ? "Complete" : "Incomplete"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
