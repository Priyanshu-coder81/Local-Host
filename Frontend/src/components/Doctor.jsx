import { useState, useEffect } from "react";
import "./doctor.css";
import PatientProfile from "./PatientProfile";
import { io } from 'socket.io-client';

function Doctor({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);
  const [doctorProfileData, setDoctorProfileData] = useState({
    registrationNumber: "",
    specialization: "",
    name: "",
    experience: 0,
    currentHospital: "",
    phone: "",
    qualifications: [],
    languages: []
  });
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && user.role === "doctor") {
      const token = localStorage.getItem("token");

      // Fetch doctor profile
      fetch("http://localhost:8000/api/profile", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setDoctorProfileData({
              registrationNumber: data.registrationNumber || "",
              specialization: data.specialization || "",
              name: data.name || "",
              experience: data.experience || 0,
              currentHospital: data.currentHospital || "",
              phone: data.phone || "",
              qualifications: data.qualifications || [],
              languages: data.languages || []
            });
          }
        })
        .catch((err) => {
          console.error("Failed to fetch profile:", err);
        });

      // Fetch appointments
      fetch("http://localhost:8000/api/appointments/upcoming", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          setAppointments(data);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch appointments:", err);
          setAppointments([]);
          setIsLoading(false);
        });
    }
  }, [user]);

  useEffect(() => {
    const socket = io("http://localhost:8000");

    socket.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    socket.on("newAppointment", (data) => {
      if (data.doctorId === user.id) {
        setAppointments((prev) => [...prev, data.appointment]);
      }
    });

    socket.on("appointmentConfirmed", (data) => {
      if (data.doctorId === user.id) {
        setAppointments((prev) =>
          prev.map((appt) =>
            appt._id === data.appointment._id ? data.appointment : appt
          )
        );
      }
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload();
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      confirmed: "status-confirmed",
      pending: "status-pending",
      completed: "status-completed",
      cancelled: "status-cancelled",
    };
    return statusClasses[status?.toLowerCase()] || "status-pending";
  };

  // Split into Pending & Confirmed & Completed
  const pendingAppointments = appointments.filter(
    (a) => a.status === "pending"
  );
  const confirmedAppointments = appointments.filter(
    (a) => a.status === "confirmed"
  );
  const completedAppointments = appointments.filter(
    (a) => a.status === "completed"
  );

  // Function to accept appointment
  const handleAcceptAppointment = async (appointmentId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:8000/api/appointments/${appointmentId}/confirm`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      if (response.ok) {
        const updatedAppointment = await response.json();
        setAppointments((prev) =>
          prev.map((appt) =>
            appt._id === updatedAppointment.appointment._id ? updatedAppointment.appointment : appt
          )
        );
      } else {
        console.error("Failed to accept appointment");
      }
    } catch (error) {
      console.error("Error accepting appointment:", error);
    }
  };

  // Function to complete appointment
  const handleCompleteAppointment = async (appointmentId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:8000/api/appointments/${appointmentId}/complete`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      if (response.ok) {
        const updatedAppointment = await response.json();
        // Update state: remove old appointment and add updated completed appointment
        setAppointments((prev) => [
          ...prev.filter((appt) => appt._id !== updatedAppointment._id),
          updatedAppointment,
        ]);
      } else {
        console.error("Failed to complete appointment");
      }
    } catch (error) {
      console.error("Error completing appointment:", error);
    }
  };

  // Dropdown toggle state
  const [dropdownOpen, setDropdownOpen] = useState({});

  const toggleDropdown = (appointmentId) => {
    setDropdownOpen((prev) => ({
      ...prev,
      [appointmentId]: !prev[appointmentId],
    }));
  };

  return (
    <div className="doctor-container">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="welcome-section">
            <h1>Welcome back, Dr. {user?.name || user?.email}</h1>
            <p className="header-subtitle">
              Manage your appointments and patient care
            </p>
          </div>
          <div className="header-stats">
          <div className="stat-card">
            <div className="stat-number">{pendingAppointments.length}</div>
            <div className="stat-label">Pending Appointments</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{confirmedAppointments.length}</div>
            <div className="stat-label">Confirmed</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{completedAppointments.length}</div>
            <div className="stat-label">Completed</div>
          </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Pending Appointments */}
        <div className="appointments">
          <div className="section-header">
            <h2>
              <span className="section-icon">🕒</span>
              Pending Appointments Queue
            </h2>
            <div className="appointment-count">
              {pendingAppointments.length}{" "}
              {pendingAppointments.length === 1 ? "appointment" : "appointments"}
            </div>
          </div>

          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading appointments...</p>
            </div>
          ) : pendingAppointments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✅</div>
              <h3>No pending appointments</h3>
              <p>You're all caught up for now!</p>
            </div>
          ) : (
            <div className="appointments-grid">
              {pendingAppointments.map((appt, index) => (
                <div
                  key={appt._id}
                  className={`appointment-card appointment-card-${index % 4}`}
                >
                  <div className="appointment-header">
                    <div className="patient-avatar">
                      {appt.patient.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="appointment-info">
                      <h4 className="patient-name">
                        {appt.patient.name || appt.patient.email}
                      </h4>
                      <span className={`status-badge ${getStatusBadge(appt.status)}`}>
                        {appt.status}
                      </span>
                    </div>
                  </div>

                  <div className="appointment-details">
                    <div className="detail-item">
                      <span className="detail-icon">📧</span>
                      <span className="detail-text">{appt.patient.email}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">📅</span>
                      <span className="detail-text">
                        {new Date(appt.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">⏰</span>
                      <span className="detail-text">{appt.time}</span>
                    </div>
                  </div>

                  <div className="appointment-actions">
                    <button
                      onClick={() => setSelectedAppointment(appt)}
                      className="btn-view-profile"
                    >
                      <span className="btn-icon">👤</span>
                      View Profile
                    </button>
                    <button
                      onClick={() => handleAcceptAppointment(appt._id)}
                      className="btn-accept-appointment"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ✅ Accepted Appointments Section */}
        <div className="appointments accepted-appointments">
          <div className="section-header">
            <h2>
              <span className="section-icon">📋</span>
              Accepted Appointments
            </h2>
            <div className="appointment-count">
              {confirmedAppointments.length}{" "}
              {confirmedAppointments.length === 1
                ? "appointment"
                : "appointments"}
            </div>
          </div>

          {confirmedAppointments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">😴</div>
              <h3>No accepted appointments yet</h3>
              <p>Confirm some appointments to see them here.</p>
            </div>
          ) : (
            <div className="appointments-grid">
              {confirmedAppointments.map((appt, index) => (
                <div
                  key={appt._id}
                  className={`appointment-card accepted-card appointment-card-${
                    index % 4
                  }`}
                >
                  <div className="appointment-header">
                    <div className="patient-avatar confirmed-avatar">
                      {appt.patient.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="appointment-info">
                    <h4 className="patient-name">
                      {appt.patient.name || appt.patient.email}
                    </h4>
                    <span className="status-badge status-confirmed">
                      Confirmed
                    </span>
                  </div>
                </div>
                <div className="appointment-details">
                  <div className="detail-item">
                    <span className="detail-icon">📧</span>
                    <span className="detail-text">{appt.patient.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">📅</span>
                    <span className="detail-text">
                      {new Date(appt.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">⏰</span>
                    <span className="detail-text">{appt.time}</span>
                  </div>
                </div>
                <div className="appointment-actions">
                  <button
                    onClick={() => setSelectedAppointment(appt)}
                    className="btn-view-profile"
                  >
                    <span className="btn-icon">👤</span>
                    View Profile
                  </button>
                  <button
                    onClick={() => handleCompleteAppointment(appt._id)}
                    className="btn-complete-appointment"
                  >
                    Complete
                  </button>
                </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Completed Appointments Section */}
      <div className="appointments completed-appointments">
        <div className="section-header">
          <h2>
            <span className="section-icon">✔️</span>
            Completed Appointments
          </h2>
          <div className="appointment-count">
            {completedAppointments.length}{" "}
            {completedAppointments.length === 1 ? "appointment" : "appointments"}
          </div>
        </div>

        {completedAppointments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">😌</div>
            <h3>No completed appointments yet</h3>
            <p>Complete some appointments to see them here.</p>
          </div>
        ) : (
          <div className="appointments-grid">
            {completedAppointments.map((appt, index) => (
              <div
                key={appt._id}
                className={`appointment-card completed-card appointment-card-${
                  index % 4
                }`}
              >
                <div className="appointment-header">
                  <div className="patient-avatar completed-avatar">
                    {appt.patient.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="appointment-info">
                    <h4 className="patient-name">
                      {appt.patient.name || appt.patient.email}
                    </h4>
                    <span className="status-badge status-completed">
                      Completed
                    </span>
                  </div>
                </div>
                <div className="appointment-details">
                  <div className="detail-item">
                    <span className="detail-icon">📧</span>
                    <span className="detail-text">{appt.patient.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">📅</span>
                    <span className="detail-text">
                      {new Date(appt.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">⏰</span>
                    <span className="detail-text">{appt.time}</span>
                  </div>
                </div>
                <div className="appointment-actions">
                  <button
                    onClick={() => setSelectedAppointment(appt)}
                    className="btn-view-profile"
                  >
                    <span className="btn-icon">👤</span>
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Profile Button */}
      <div className="floating-actions">
        <button
          onClick={() => setIsProfileSidebarOpen(true)}
          className="fab fab-profile"
          title="My Profile"
        >
          <svg
            className="fab-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </button>
      </div>

      {/* Sidebar Profile */}
      {isProfileSidebarOpen && (
        <>
          <div
            className="sidebar-overlay"
            onClick={() => setIsProfileSidebarOpen(false)}
          ></div>
          <div className="profile-sidebar">
            <div className="profile-header">
              <h2>My Profile</h2>
              <button
                className="close-sidebar"
                onClick={() => setIsProfileSidebarOpen(false)}
                aria-label="Close profile sidebar"
              >
                &times;
              </button>
            </div>
          <div className="profile-content">
            <div className="profile-section">
              <h3>Personal Information</h3>
              <div className="profile-field">
                <span className="profile-field-icon">👤</span>
                <span className="profile-field-label">Name:</span>
                <span className="profile-field-value">{doctorProfileData.name || "Not provided"}</span>
              </div>
              <div className="profile-field">
                <span className="profile-field-icon">📞</span>
                <span className="profile-field-label">Phone:</span>
                <span className="profile-field-value">{doctorProfileData.phone || "Not provided"}</span>
              </div>
            </div>

            <div className="profile-section">
              <h3>Professional Details</h3>
              <div className="profile-field">
                <span className="profile-field-icon">🏥</span>
                <span className="profile-field-label">Registration:</span>
                <span className="profile-field-value">{doctorProfileData.registrationNumber || "Not provided"}</span>
              </div>
              <div className="profile-field">
                <span className="profile-field-icon">⚕️</span>
                <span className="profile-field-label">Specialization:</span>
                <span className="profile-field-value">{doctorProfileData.specialization || "Not provided"}</span>
              </div>
              <div className="profile-field">
                <span className="profile-field-icon">🏢</span>
                <span className="profile-field-label">Current Hospital:</span>
                <span className="profile-field-value">{doctorProfileData.currentHospital || "Not provided"}</span>
              </div>
              <div className="profile-field">
                <span className="profile-field-icon">📅</span>
                <span className="profile-field-label">Experience:</span>
                <span className="profile-field-value">{doctorProfileData.experience ? `${doctorProfileData.experience} years` : "Not provided"}</span>
              </div>
            </div>

            <div className="profile-section">
              <h3>Qualifications & Languages</h3>
              <div className="profile-field">
                <span className="profile-field-icon">🎓</span>
                <span className="profile-field-label">Qualifications:</span>
                <span className="profile-field-value">{doctorProfileData.qualifications.length > 0 ? doctorProfileData.qualifications.join(", ") : "Not provided"}</span>
              </div>
              <div className="profile-field">
                <span className="profile-field-icon">🌐</span>
                <span className="profile-field-label">Languages:</span>
                <span className="profile-field-value">{doctorProfileData.languages.length > 0 ? doctorProfileData.languages.join(", ") : "Not provided"}</span>
              </div>
            </div>

            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
          </div>
        </>
      )}

      {/* Patient Profile Modal */}
      {selectedAppointment && (
        <PatientProfile
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
        />
      )}
    </div>
  );
}

export default Doctor;
