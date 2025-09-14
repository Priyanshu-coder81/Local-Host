import { useEffect, useState } from "react";
import "./PatientProfile.css";

function PatientProfile({ appointment, onClose }) {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [confirming, setConfirming] = useState(false);
  const [appointmentStatus, setAppointmentStatus] = useState(appointment?.status || '');

  useEffect(() => {
    if (appointment?.patient) {
      setPatient(appointment.patient);
      setLoading(false);
      setError(null);
    } else {
      setPatient(null);
      setLoading(false);
      setError("Patient data not available");
    }
  }, [appointment]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden'; // Prevent background scroll
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, []);

  const formatAge = (age) => {
    if (!age) return 'Not specified';
    return `${age} years old`;
  };

  const formatGender = (gender) => {
    if (!gender) return 'Not specified';
    return gender.charAt(0).toUpperCase() + gender.slice(1);
  };

  const formatPhone = (phone) => {
    if (!phone) return 'Not provided';
    // Basic phone number formatting (adjust based on your needs)
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };

  const getInitials = (name) => {
    if (!name) return 'P';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleConfirmAppointment = async () => {
    if (!appointment || appointmentStatus !== 'pending') return;

    setConfirming(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`http://localhost:8000/api/appointments/${appointment._id}/confirm`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        setAppointmentStatus('confirmed');
        alert('Appointment confirmed successfully!');
      } else {
        alert('Failed to confirm appointment');
      }
    } catch (err) {
      console.error('Error confirming appointment:', err);
      alert('Error confirming appointment');
    } finally {
      setConfirming(false);
    }
  };

  if (!appointment) return null;

  return (
    <div 
      className="patient-profile-overlay"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="patient-profile-title"
    >
      <div className="patient-profile-modal">
        {/* Header */}
        <div className="patient-profile-header">
          <div className="header-content">
            <div className="patient-avatar-section">
              <div className="patient-avatar-large">
                {patient ? getInitials(patient.name) : 'P'}
              </div>
              <div className="patient-basic-info">
                <h2 id="patient-profile-title" className="patient-name">
                  {loading ? 'Loading...' : patient?.name || 'Unknown Patient'}
                </h2>
                <p className="patient-id">ID: {appointment.patient._id}</p>
                <div className="appointment-info">
                  <p className="appointment-date">
                    📅 {new Date(appointment.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })} at {appointment.time}
                  </p>
                  <span className={`appointment-status status-${appointmentStatus}`}>
                    {appointmentStatus}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="close-button"
              aria-label="Close patient profile"
            >
              <svg className="close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span className="tab-icon">👤</span>
            Overview
          </button>
          <button
            className={`tab-button ${activeTab === 'medical' ? 'active' : ''}`}
            onClick={() => setActiveTab('medical')}
          >
            <span className="tab-icon">🏥</span>
            Medical History
          </button>
          <button
            className={`tab-button ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            <span className="tab-icon">📞</span>
            Contact Info
          </button>
        </div>

        {/* Content */}
        <div className="patient-profile-content">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner-large"></div>
              <p className="loading-text">Loading patient details...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <div className="error-icon">⚠️</div>
              <h3>Failed to Load Profile</h3>
              <p className="error-message">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="retry-button"
              >
                Try Again
              </button>
            </div>
          ) : patient ? (
            <div className="tab-content">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="tab-panel overview-panel">
                  <div className="info-grid">
                    <div className="info-card">
                      <div className="info-header">
                        <span className="info-icon">👤</span>
                        <h4>Personal Information</h4>
                      </div>
                      <div className="info-content">
                        <div className="info-row">
                          <span className="info-label">Full Name</span>
                          <span className="info-value">{patient.name || 'Not provided'}</span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">Age</span>
                          <span className="info-value">{formatAge(patient.age)}</span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">Gender</span>
                          <span className="info-value">{formatGender(patient.gender)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="info-card">
                      <div className="info-header">
                        <span className="info-icon">📊</span>
                        <h4>Quick Stats</h4>
                      </div>
                      <div className="info-content">
                        <div className="stat-item">
                          <div className="stat-number">
                            {patient.history?.length || 0}
                          </div>
                          <div className="stat-label">Medical Records</div>
                        </div>
                        <div className="stat-item">
                          <div className="stat-number">
                            {patient.appointments?.length || 0}
                          </div>
                          <div className="stat-label">Total Visits</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Medical History Tab */}
              {activeTab === 'medical' && (
                <div className="tab-panel medical-panel">
                  <div className="medical-section">
                    <div className="section-header">
                      <h4>Medical History</h4>
                      <span className="record-count">
                        {patient.history?.length || 0} records
                      </span>
                    </div>
                    
                  {patient.history && patient.history.length > 0 ? (
                    <div className="medical-records">
                      {patient.history.map((record, idx) => (
                        <div key={idx} className="medical-record-item">
                          <div className="record-indicator"></div>
                          <div className="record-content">
                            <p className="record-text">{record}</p>
                            <span className="record-date">
                              {/* You can add date if available in your data */}
                              Record #{idx + 1}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-medical-history">
                      <div className="empty-icon">📋</div>
                      <h4>No Medical History</h4>
                      <p>This patient has no recorded medical history yet.</p>
                    </div>
                  )}

                  {/* Appointment-specific Medical Records */}
                  <div className="appointment-medical-records-section">
                    <h4>Appointment Medical Records</h4>
                    <div className="appointment-upload-form">
                      <h5>Upload Medical Record for this Appointment</h5>
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          if (!e.target.appointmentRecord.files[0]) {
                            alert("Please select a PDF file to upload.");
                            return;
                          }
                          const formData = new FormData();
                          formData.append("medicalRecord", e.target.appointmentRecord.files[0]);
                          try {
                            const token = localStorage.getItem("token");
                            const response = await fetch(
                              `http://localhost:8000/api/appointments/${appointment._id}/medical-records`,
                              {
                                method: "POST",
                                headers: {
                                  Authorization: token ? `Bearer ${token}` : "",
                                },
                                body: formData,
                              }
                            );
                            if (response.ok) {
                              alert("Medical record uploaded successfully for this appointment.");
                              // Refresh appointment data to show new record
                              window.location.reload();
                            } else {
                              alert("Failed to upload medical record.");
                            }
                          } catch (error) {
                            console.error("Upload error:", error);
                            alert("Error uploading medical record.");
                          }
                        }}
                      >
                        <input
                          type="file"
                          name="appointmentRecord"
                          accept="application/pdf"
                          className="file-input"
                        />
                        <button type="submit" className="upload-button">
                          Upload to Appointment
                        </button>
                      </form>
                    </div>

                    {/* Display appointment medical records */}
                    {appointment.medicalRecords && appointment.medicalRecords.length > 0 ? (
                      <div className="appointment-records-list">
                        <h5>Records for this Appointment:</h5>
                        <ul className="uploaded-pdf-list">
                          {appointment.medicalRecords.map((record, idx) => (
                            <li key={idx} className="pdf-list-item">
                              <a
                                href={record.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="pdf-link"
                              >
                                {record.filename}
                              </a>
                              <a
                                href={record.url}
                                download={record.filename}
                                className="pdf-download-link"
                              >
                                Download
                              </a>
                              <span className="upload-date">
                                Uploaded: {new Date(record.uploadedAt).toLocaleDateString()}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="no-appointment-records">No medical records uploaded for this appointment yet.</p>
                    )}
                  </div>


                  </div>
                </div>
              )}

              {/* Contact Info Tab */}
              {activeTab === 'contact' && (
                <div className="tab-panel contact-panel">
                  <div className="contact-section">
                    <div className="contact-card">
                      <div className="contact-header">
                        <span className="contact-icon">📧</span>
                        <h4>Email</h4>
                      </div>
                      <div className="contact-content">
                        <p className="contact-value">{patient.email || 'Not provided'}</p>
                        {patient.email && (
                          <a href={`mailto:${patient.email}`} className="contact-action">
                            Send Email
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="contact-card">
                      <div className="contact-header">
                        <span className="contact-icon">📞</span>
                        <h4>Phone</h4>
                      </div>
                      <div className="contact-content">
                        <p className="contact-value">{formatPhone(patient.phone)}</p>
                        {patient.phone && (
                          <a href={`tel:${patient.phone}`} className="contact-action">
                            Call Now
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="contact-card full-width">
                      <div className="contact-header">
                        <span className="contact-icon">📍</span>
                        <h4>Address</h4>
                      </div>
                      <div className="contact-content">
                        <p className="contact-value">
                          {patient.address || 'Address not provided'}
                        </p>
                        {patient.address && (
                          <a 
                            href={`https://maps.google.com/?q=${encodeURIComponent(patient.address)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="contact-action"
                          >
                            View on Map
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="error-state">
              <div className="error-icon">❌</div>
              <h3>Patient Not Found</h3>
              <p>The requested patient profile could not be found.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="patient-profile-footer">
          <button onClick={onClose} className="footer-button secondary">
            Close
          </button>
          {patient && (
            <button 
              onClick={() => {
                // Add functionality for editing patient info
                console.log('Edit patient:', patient);
              }} 
              className="footer-button primary"
            >
              Edit Patient
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default PatientProfile;
