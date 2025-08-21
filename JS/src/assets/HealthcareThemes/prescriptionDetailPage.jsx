import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Spinner from "react-bootstrap/Spinner";

const Prescription_Detail_Page = () => {
  const { id } = useParams(); // id is the UUID from PrescriptionDetail
  const navigate = useNavigate();
  const [prescription_data, set_prescription_data] = useState(null);
  const [loading, set_loading] = useState(true);
  const [error, set_error] = useState(null);

  useEffect(() => {
    const fetch_prescription = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found. Please log in.");
        }

        // Fetch prescription details by UUID
        const response = await fetch("http://localhost:8081/prescriptions/fetch", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            errorData?.error || "Failed to fetch prescription details"
          );
        }

        const result = await response.json();
        const prescription = result.data;

        // Map data to the expected structure
        const prescriptionData = {
          e_rx_no: prescription.id, // Use UUID as e_rx_no
          e_rx_date: prescription.fillDate,
          name: prescription.name,
          member_id: prescription.memberId,
          payer: prescription.payerTpa,
          created_on: new Date(prescription.createdAt).toLocaleString(),
          diagnoses: prescription.diagnoses.map((diag) => ({
            icd_code: diag.icd_code,
            is_primary: false, // Not in model; adjust if added
          })),
          drug_list: prescription.drugs.map((drug) => ({
            ndc_drug_code: drug.ndc_drug_code,
            dispensed_quantity: drug.dispensed_quantity,
            days_of_supply: drug.days_of_supply,
            instructions: drug.instructions || "None",
          })),
        };

        set_prescription_data(prescriptionData);
      } catch (error) {
        console.error("Error fetching prescription:", error);
        set_error(error.message);
      } finally {
        set_loading(false);
      }
    };

    if (!id) {
      set_error("No prescription ID provided. Please select a valid prescription.");
      set_loading(false);
      return;
    }

    fetch_prescription();
  }, [id]);

  const handleBackToDashboard = () => {
    navigate("/theme/prescription-table");
  };

  if (loading) {
    return (
      <section className="prescription_detail">
        <div className="container">
          <div className="prescription_detail_inner">
            <div className="prescription_detail_loading">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p>Loading prescription details...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="prescription_detail">
        <div className="container">
          <div className="prescription_detail_inner">
            <div className="prescription_detail_error alert alert-danger" role="alert">
              <strong>Error:</strong> {error}
              <button
                className="btn btn-primary ms-3"
                onClick={handleBackToDashboard}
              >
                Back to Prescription Table
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!prescription_data) {
    return (
      <section className="prescription_detail">
        <div className="container">
          <div className="prescription_detail_inner">
            <div className="prescription_detail_warning alert alert-warning" role="alert">
              No prescription data available.
              <button
                className="btn btn-primary ms-3"
                onClick={handleBackToDashboard}
              >
                Back to Prescription Table
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="prescription_detail">
      <div className="container">
        <div className="prescription_detail_inner">
          <h2 className="prescription_detail_title">Prescription Details</h2>
          <div className="prescription_detail_card">
            <div className="prescription_detail_section">
              <h5 className="prescription_detail_subtitle">eRx Details</h5>
              <p><strong>eRx Number:</strong> {prescription_data.e_rx_no}</p>
              <p><strong>eRx Date:</strong> {prescription_data.e_rx_date}</p>
              <p><strong>Created On:</strong> {prescription_data.created_on}</p>
            </div>

            <div className="prescription_detail_section">
              <h5 className="prescription_detail_subtitle">Member Details</h5>
              <p><strong>Name:</strong> {prescription_data.name}</p>
              <p><strong>Member ID:</strong> {prescription_data.member_id}</p>
              <p><strong>Payer:</strong> {prescription_data.payer}</p>
            </div>

            <div className="prescription_detail_section">
              <h5 className="prescription_detail_subtitle">Diagnoses</h5>
              <ul className="prescription_detail_list">
                {prescription_data.diagnoses?.length > 0 ? (
                  prescription_data.diagnoses.map((diagnosis, index) => (
                    <li key={index}>
                      {diagnosis.icd_code} {diagnosis.is_primary ? "(Primary)" : ""}
                    </li>
                  ))
                ) : (
                  <li>No Diagnoses Available</li>
                )}
              </ul>
            </div>

            <div className="prescription_detail_section">
              <h5 className="prescription_detail_subtitle">Drugs</h5>
              <ul className="prescription_detail_list">
                {prescription_data.drug_list?.length > 0 ? (
                  prescription_data.drug_list.map((drug, index) => (
                    <li key={index}>
                      NDC Code: {drug.ndc_drug_code} - Quantity: {drug.dispensed_quantity}, 
                      Days of Supply: {drug.days_of_supply}, Instructions: {drug.instructions}
                    </li>
                  ))
                ) : (
                  <li>No Drugs Available</li>
                )}
              </ul>
            </div>
          </div>
          <div className="text-end mt-3">
            <button
              className="btn btn-primary"
              onClick={handleBackToDashboard}
            >
              Back to Prescription Table
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Prescription_Detail_Page;