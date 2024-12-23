import React, { useState, useEffect } from "react";
import axios from "axios";
import ReceptionNavbar from "./ReceptionNavbar";
import {
  FaUser,
  FaCalendarAlt,
  FaClock,
  FaTooth,
  FaVenusMars,
  FaBirthdayCake,
} from "react-icons/fa";
const Report = () => {
  const [aptID, setAptID] = useState("");
  const [searchAptID, setSearchAptID] = useState("");
  const [appointments, setAppointments] = useState([]); // Store fetched appointment data
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [reportDetails, setReportDetails] = useState({
    primaryDiagnosis: "",
    prescription: "",
    procedures: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");

  // Fetch all appointments on component mount
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/appointments/getAllAppointments"
        );
        setAppointments(response.data.appointment || []); // Store appointments in state
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
        alert("Unable to fetch appointments. Please try again.");
      }
    };

    fetchAppointments();
  }, []);

  // Fetch appointment details
  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      if (!searchAptID) return;

      try {
        const response = await axios.get(
          `http://localhost:3000/api/appointments/details/${searchAptID}`
        );
        setAppointmentDetails(response.data.details);
      } catch (error) {
        console.error("Failed to fetch appointment details:", error);
        alert("Unable to fetch appointment details. Please try again.");
      }
    };

    fetchAppointmentDetails();
  }, [searchAptID]);

  // Fetch report details
  const fetchReport = async () => {
    if (!searchAptID) return;

    try {
      const response = await axios.get(`http://localhost:3000/api/report/get`, {
        params: { aptID: searchAptID },
      });
      const { report, message } = response.data;

      if (report) {
        setReportDetails(report);
        setIsEditing(true); // If report exists, set editing to true
      } else {
        alert(message || "No report found. Please create one.");
        setReportDetails({
          primaryDiagnosis: "",
          prescription: "",
          procedures: "",
        });
        setIsEditing(false); // If no report exists, it's create mode
      }
    } catch (error) {
      console.error("Failed to fetch report:", error);
      alert("Unable to fetch report. Please try again.");
    }
  };

  useEffect(() => {
    fetchReport(); // Call fetchReport when searchAptID changes
  }, [searchAptID]);

  const handleReportSubmit = async (e) => {
    e.preventDefault();

    // Validate that all fields are filled
    if (
      !reportDetails.primaryDiagnosis ||
      !reportDetails.prescription ||
      !reportDetails.procedures
    ) {
      setError("All fields are required.");
      return;
    }

    try {
      const endpoint = isEditing
        ? "http://localhost:3000/api/report/update"
        : "http://localhost:3000/api/report/create"; // Set the correct endpoint for creating or updating
      const method = isEditing ? "put" : "post"; // Use PUT if updating, POST if creating
      const response = await axios[method](endpoint, {
        aptID: searchAptID,
        primaryDiagnosis: reportDetails.primaryDiagnosis,
        prescription: reportDetails.prescription,
        procedures: reportDetails.procedures,
      });

      alert(response.data.message || "Report saved successfully!");

      // After successful creation or update, fetch the latest report to display
      fetchReport(); // This will reload the report details from the server

      setIsEditing(true); // Set editing mode after creation
      setError(""); // Clear any errors
    } catch (error) {
      console.error("Failed to save report:", error);
      alert("Failed to save report. Please try again.");
    }
  };

  const handlePrint = () => {
    if (!reportDetails || !appointmentDetails) {
      alert("No complete details available to print.");
      return;
    }
  
    const { appointment, patient, dentist } = appointmentDetails;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Report - Appointment ID: ${searchAptID}</title>
          <style>
            /* You can adjust the style as needed */
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #333;
              background-color: #f9f9f9;
            }
            .container {
              width: 80%;
              margin: 0 auto;
              padding: 20px;
              border: 1px solid #ddd;
              border-radius: 10px;
              background-color: #fff;
            }
            h1, h2 {
              text-align: center;
              color: #007bff;
            }
            .section {
              margin-bottom: 20px;
            }
            .section ul {
              list-style-type: none;
              padding: 0;
            }
            .section li {
              margin-bottom: 10px;
            }
            .section li span {
              font-weight: bold;
            }
            .table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            .table th, .table td {
              padding: 8px;
              border: 1px solid #ddd;
              text-align: left;
            }
            .total {
              font-size: 18px;
              font-weight: bold;
              text-align: right;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Report - Appointment ID: ${searchAptID}</h1>
            
            <!-- Appointment Details -->
            <div class="section">
              <h2>Appointment Details</h2>
              <ul>
                <li><span>Appointment ID:</span> ${appointment.aptID}</li>
                <li><span>Date:</span> ${new Date(appointment.date).toLocaleDateString()}</li>
                <li><span>Time:</span> ${appointment.time}</li>
              </ul>
            </div>
  
            <!-- Patient Details -->
            <div class="section">
              <h2>Patient Details</h2>
              <ul>
                <li><span>Name:</span> ${patient.name}</li>
                <li><span>Age:</span> ${patient.age}</li>
                <li><span>Gender:</span> ${patient.gender}</li>
              </ul>
            </div>
  
            <!-- Dentist Details -->
            <div class="section">
              <h2>Dentist Details</h2>
              <ul>
                <li><span>Name:</span> ${dentist.name}</li>
                <li><span>Specialization:</span> ${dentist.specialization}</li>
              </ul>
            </div>
  
            <!-- Report Details -->
            <div class="section">
              <h2>Report Details</h2>
              <ul>
                <li><span>Primary Diagnosis:</span> ${reportDetails.primaryDiagnosis}</li>
                <li><span>Prescription:</span> ${reportDetails.prescription}</li>
                <li><span>Procedures:</span> ${reportDetails.procedures}</li>
              </ul>
            </div>
  
            <!-- Footer -->
            <div class="text-center mt-12">
              <p>Generated on: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const validateForm = () => {
    return (
      reportDetails.primaryDiagnosis &&
      reportDetails.prescription &&
      reportDetails.procedures
    );
  };

  return (
    <div>
      <ReceptionNavbar />
      <div className="flex justify-center items-center min-h-screen bg-white-100 px-5">
        <div class="w-full p-4 px-[30px] mb-6 border border-gray-300 rounded-md shadow-md hover:shadow-xl transition-shadow duration-300 mx-5 my-1.5">
          <h1 className="text-3xl font-semibold text-teal-600 mb-6">
            Patient Report
          </h1>
          <div className="mb-6">
            <label
              htmlFor="appointment"
              className="block text-teal-700 text-lg"
            >
              Appointment ID
            </label>
            <select
              id="appointment"
              className="w-full mt-2 p-2 border border-gray-300 rounded-lg"
              value={aptID}
              onChange={(e) => {
                setAptID(e.target.value);
                setSearchAptID(e.target.value); // Set the searchAptID when an aptID is selected
              }}
            >
              <option value="">Select Appointment ID</option>
              {appointments.map((apt) => (
                <option key={apt.aptID} value={apt.aptID}>
                  {apt.aptID}
                </option>
              ))}
            </select>
          </div>

          {appointmentDetails && (
            <div className="mb-6">
              <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
                <div className="p-6">
                  <h2 className="text-3xl font-semibold text-teal-700 mb-4">
                    Appointment Details
                  </h2>
                  <ul className="space-y-4 text-lg text-gray-700">
                    <li className="flex justify-between items-center">
                      <span className="flex items-center">
                        <FaUser className="text-teal-500 mr-2" />
                        <span className="font-medium text-teal-500">
                          Patient Name:
                        </span>
                      </span>
                      <span>{appointmentDetails.patient.name}</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="flex items-center">
                        <FaBirthdayCake className="text-teal-500 mr-2" />
                        <span className="font-medium text-teal-500">Age:</span>
                      </span>
                      <span>{appointmentDetails.patient.age}</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="flex items-center">
                        <FaVenusMars className="text-teal-500 mr-2" />
                        <span className="font-medium text-teal-500">
                          Gender:
                        </span>
                      </span>
                      <span>{appointmentDetails.patient.gender}</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="flex items-center">
                        <FaTooth className="text-teal-500 mr-2" />
                        <span className="font-medium text-teal-500">
                          Consulted Dentist:
                        </span>
                      </span>
                      <span>{appointmentDetails.dentist.name}</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="flex items-center">
                        <FaCalendarAlt className="text-teal-500 mr-2" />
                        <span className="font-medium text-teal-500">Date:</span>
                      </span>
                      <span>
                        {new Date(
                          appointmentDetails.appointment.date
                        ).toLocaleDateString()}
                      </span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="flex items-center">
                        <FaClock className="text-teal-500 mr-2" />
                        <span className="font-medium text-teal-500">Time:</span>
                      </span>
                      <span>{appointmentDetails.appointment.time}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {reportDetails ? (
            <form onSubmit={handleReportSubmit} className="space-y-6">
              <div>
                <label className="block text-teal-700 text-lg">
                  Primary Diagnosis
                </label>
                <textarea
                  name="primaryDiagnosis"
                  value={reportDetails.primaryDiagnosis}
                  onChange={(e) =>
                    setReportDetails({
                      ...reportDetails,
                      primaryDiagnosis: e.target.value,
                    })
                  }
                  className="w-full p-3 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-teal-700 text-lg">
                  Prescription
                </label>
                <textarea
                  name="prescription"
                  value={reportDetails.prescription}
                  onChange={(e) =>
                    setReportDetails({
                      ...reportDetails,
                      prescription: e.target.value,
                    })
                  }
                  className="w-full p-3 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-teal-700 text-lg">
                  Procedures
                </label>
                <textarea
                  name="procedures"
                  value={reportDetails.procedures}
                  onChange={(e) =>
                    setReportDetails({
                      ...reportDetails,
                      procedures: e.target.value,
                    })
                  }
                  className="w-full p-3 border rounded-lg"
                  required
                />
              </div>
              {error && <p className="text-red-600">{error}</p>}
              <div className="flex justify-between mt-6">
                <button
                  type="submit"
                  disabled={!validateForm()}
                  className="bg-teal-600 text-white py-2 px-5 rounded-lg disabled:opacity-50"
                >
                  {isEditing ? "Update Report" : "Create Report"}
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="bg-teal-600 text-white py-2 px-5 rounded-lg mx-1.5"
                >
                  Print Report
                </button>
              </div>
            </form>
          ) : (
            <p className="text-teal-700">No report available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Report;
