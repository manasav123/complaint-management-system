import React, { useEffect, useState } from "react";
import api from "../services/api";

function StaffComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [message, setMessage] = useState("");

  const updateStatus = async (complaintId, newStatus) => {
    try {
      const response = await api.put(
        `/complaints/${complaintId}/status`,
        {
          status: newStatus,
        }
      );

      if (response.data.error) {
        setMessage(response.data.error);
        return;
      }

      setComplaints((currentComplaints) =>
        currentComplaints.map((complaint) =>
          complaint.id === complaintId
            ? { ...complaint, status: newStatus }
            : complaint
        )
      );

      setMessage("Complaint status updated successfully!");
    } catch (error) {
      setMessage("Failed to update complaint status.");
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchComplaints = async () => {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user) {
        setMessage("Please login first.");
        return;
      }

      try {
        const response = await api.get(`/staff/${user.id}/complaints`);

        if (response.data.error) {
          setMessage(response.data.error);
          return;
        }

        setComplaints(response.data.complaints);
      } catch (error) {
        setMessage("Failed to load assigned complaints.");
        console.error(error);
      }
    };

    fetchComplaints();
  }, []);

  return (
    <div>
      <h1>Staff Complaints</h1>

      {message && <p>{message}</p>}

      {complaints.length === 0 && !message ? (
        <p>No complaints assigned to you.</p>
      ) : (
        complaints.map((complaint) => (
          <div key={complaint.id}>
            <h2>{complaint.title}</h2>
            <p>User: {complaint.user_name}</p>
            <p>Email: {complaint.user_email}</p>
            <p>Description: {complaint.description}</p>
            <p>Category: {complaint.category}</p>

            <p>Status: {complaint.status}</p>

            <select
              value={complaint.status}
              onChange={(event) =>
                updateStatus(complaint.id, event.target.value)
              }
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>

            <p>Priority: {complaint.priority}</p>

            <hr />
          </div>
        ))
      )}
    </div>
  );
}

export default StaffComplaints;