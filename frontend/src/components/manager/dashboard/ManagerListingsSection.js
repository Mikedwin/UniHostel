import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Building2, Plus } from "lucide-react";
const ManagerListingsSection = ({ hostels = [], onDeleteHostel }) => (
  <section className="manager-listings-panel">
    <div className="workspace-panel-heading">
      <div>
        <span>Your portfolio</span>
        <h2>Homes you manage</h2>
      </div>
      <Link to="/add-hostel">
        <Plus /> Add
      </Link>
    </div>
    {hostels.length ? (
      <div className="manager-listings-list">
        {hostels.slice(0, 5).map((hostel) => (
          <article key={hostel._id}>
            <div className="manager-listing-image">
              {hostel.hostelViewImage ? (
                <img src={hostel.hostelViewImage} alt="" />
              ) : (
                <Building2 />
              )}
            </div>
            <div>
              <strong>{hostel.name}</strong>
              <p>{hostel.location || "Ghana"}</p>
            </div>
            <div className="manager-listing-actions">
              <Link
                to={`/edit-hostel/${hostel._id}`}
                aria-label={`Edit ${hostel.name}`}
              >
                <ArrowUpRight />
              </Link>
              <button onClick={() => onDeleteHostel(hostel._id, hostel.name)}>
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>
    ) : (
      <div className="workspace-empty">
        <Building2 />
        <p>No hostel listed yet.</p>
        <Link to="/add-hostel">Create your first listing</Link>
      </div>
    )}
  </section>
);
export default ManagerListingsSection;
