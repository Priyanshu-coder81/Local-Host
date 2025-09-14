import { useState, useEffect } from "react";
import "./PatientDashboard.css";

function PatientDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [activeTab, setActiveTab] = useState("appointments");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch appointments
        const appointmentsRes = await fetch("http://localhost:8000/api/appointments/mine", {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        // Fetch patient profile for medical records
        const profileRes = await fetch("http://localhost:8000/api/profile", {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (appointmentsRes.ok && profileRes.ok) {
          const appointmentsData = await appointmentsRes.json();
          const profileData = await profileRes.json();
          setAppointments(appointmentsData);
          setMedicalRecords(profileData.medicalRecords || []);
          setLoading(false);
        } else {
          setError("Failed to fetch data");
          setLoading(false);
        }
      } catch (err) {
        setError("Error fetching data");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="patient-dashboard">
      <nav className="dashboard-nav">
        <button
          className={activeTab === "appointments" ? "active" : ""}
          onClick={() => setActiveTab("appointments")}
        >
          Appointments
        </button>
        <button
          className={activeTab === "medicalRecords" ? "active" : ""}
          onClick={() => setActiveTab("medicalRecords")}
        >
          Medical Records
        </button>
      </nav>

      {activeTab === "appointments" && (
        <>
          <h2>My Appointments</h2>
          {loading && <p>Loading appointments...</p>}
          {error && <p>{error}</p>}
          {!loading && !error && appointments.length === 0 && (
            <p>No appointments found.</p>
          )}
          {!loading && !error && appointments.length > 0 && (
            <div className="appointments-list">
              {appointments.map((appt) => (
                <div key={appt._id} className="appointment-card">
                  <h3>Dr. {appt.doctor.name || appt.doctor.email}</h3>
                  <p>Date: {new Date(appt.date).toLocaleDateString()}</p>
                  <p>Time: {appt.time}</p>
                  <p>Status: <span className={`status-${appt.status}`}>{appt.status}</span></p>

                  {/* Medical Records for this appointment */}
                  {appt.medicalRecords && appt.medicalRecords.length > 0 && (
                    <div className="appointment-medical-records">
                      <h4>Medical Records:</h4>
                      <ul className="medical-records-list">
                        {appt.medicalRecords.map((record, idx) => (
                          <li key={idx} className="medical-record-item">
                            <a href={record.url} target="_blank" rel="noopener noreferrer">
                              {record.filename}
                            </a>
                            <a href={record.url} download={record.filename} className="download-link">
                              Download
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(!appt.medicalRecords || appt.medicalRecords.length === 0) && (
                    <p className="no-records">No medical records uploaded yet.</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {selectedAppointment && (
            <div className="medical-records-modal">
              <h3>
                Medical Records for Dr.{" "}
                {selectedAppointment.doctor.name || selectedAppointment.doctor.email}
              </h3>
              <button onClick={() => setSelectedAppointment(null)}>Close</button>
              <ul>
                {selectedAppointment.medicalRecords && selectedAppointment.medicalRecords.length > 0 ? (
                  selectedAppointment.medicalRecords.map((record, idx) => (
                    <li key={idx}>
                      <a href={record.url} target="_blank" rel="noopener noreferrer">
                        {record.filename}
                      </a>
                      <a href={record.url} download={record.filename}>
                        Download
                      </a>
                    </li>
                  ))
                ) : (
                  <p>No medical records uploaded yet.</p>
                )}
              </ul>
            </div>
          )}
        </>
      )}

      {activeTab === "medicalRecords" && (
        <div className="medical-records-section">
          <h2>My Medical Records</h2>
          {medicalRecords.length === 0 ? (
            <p>No medical records uploaded yet.</p>
          ) : (
            <ul className="medical-records-list">
              {medicalRecords.map((record, idx) => (
                <li key={idx} className="medical-record-item">
                  <a href={record.url} target="_blank" rel="noopener noreferrer">
                    {record.filename}
                  </a>
                  <a href={record.url} download={record.filename} className="download-link">
                    Download
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default PatientDashboard;
