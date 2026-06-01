import React, { useState } from 'react';
import './ProjectDashboard.css';

// Mock Data for Renewal Requests
const initialRenewalRequests = [
  {
  id:101,
  refNo:'CRG/2026/001',
  title:'Advanced Material Science',

  fundingAgency:'SERB',

  pi:{
    name:'Dr A Kumar',
    department:'Mechanical Engineering',
    campus:'CEG Campus'
  },

  currentInstallment:2,

  installments:[
    {
      installmentNo:'1st Installment',
      amount:'20,00,000',
      approved:true,

      heads:[
        { head:'Equipment', amount:'8,00,000' },
        { head:'Manpower', amount:'4,00,000' },
        { head:'Consumables', amount:'3,00,000' },
        { head:'Travel', amount:'2,00,000' },
        { head:'Contingency', amount:'1,00,000' },
        { head:'Overhead', amount:'2,00,000' }
      ]
    },

    {
      installmentNo:'2nd Installment',
      amount:'15,00,000',
      approved:false,

      heads:[
        { head:'Equipment', amount:'5,00,000' },
        { head:'Manpower', amount:'3,00,000' },
        { head:'Consumables', amount:'2,00,000' },
        { head:'Travel', amount:'1,00,000' },
        { head:'Contingency', amount:'1,00,000' },
        { head:'Overhead', amount:'3,00,000' }
      ]
    }
  ]
}
];

export default function RenewalSanction() {
  const [activeTab, setActiveTab] = useState('pending');
  const [requests, setRequests] = useState(initialRenewalRequests);
  const [history, setHistory] = useState([]);

  const [page, setPage] = useState('list');
const [selectedProject, setSelectedProject] = useState(null);
const [editProject, setEditProject] = useState(null);
const [expandedInstallment, setExpandedInstallment] = useState(null);

  const handleApprove = (id) => {
    const item = requests.find(r => r.id === id);
    setHistory([...history, { ...item, approvedDate: new Date().toLocaleDateString() }]);
    setRequests(requests.filter(r => r.id !== id));
  };
if (page === 'edit' && editProject) {

  const current =
    editProject.installments[
      editProject.currentInstallment - 1
    ];

  return (
    <div className="detail-page">

      <button
        className="back-btn"
        onClick={() => {
          setPage('list');
          setEditProject(null);
        }}
      >
        ← Back
      </button>

      <div className="detail-card">

        <h2>Edit Renewal Installment</h2>

        <div className="detail-grid">

          <div>
            <label>Funding Agency</label>

            <select
              className="edit-input"
              value={editProject.fundingAgency}
              onChange={(e) =>
                setEditProject({
                  ...editProject,
                  fundingAgency: e.target.value
                })
              }
            >
              <option>SERB</option>
              <option>DST</option>
              <option>DRDO</option>
              <option>ICMR</option>
            </select>

          </div>

        </div>

        <h3>
          Current Installment Heads
        </h3>

        {current.heads.map((head, index) => (

          <div
            key={index}
            className="detail-grid"
          >

            <div>
              <label>{head.head}</label>

              <input
                className="edit-input"
                value={head.amount}
                onChange={(e) => {

                  const updated =
                    [...editProject.installments];

                  updated[
                    editProject.currentInstallment - 1
                  ].heads[index].amount =
                    e.target.value;

                  setEditProject({
                    ...editProject,
                    installments: updated
                  });

                }}
              />

            </div>

          </div>

        ))}

        <button
          className="btn-approve"
          onClick={() => {

            setRequests(
              requests.map(r =>
                r.id === editProject.id
                  ? editProject
                  : r
              )
            );

            setPage('list');
          }}
        >
          Save Changes
        </button>

      </div>

    </div>
  );
}   

  if (page === 'view' && selectedProject) {

  const current =
    selectedProject.installments[
      selectedProject.currentInstallment - 1
    ];

  return (
    <div className="detail-page">

      <button
        className="back-btn"
        onClick={() => {
          setPage('list');
          setSelectedProject(null);
        }}
      >
        ← Back
      </button>

      <div className="detail-card">

        <h2>{selectedProject.title}</h2>

        <div className="detail-grid">

          <div>
            <span>Reference No</span>
            <strong>{selectedProject.refNo}</strong>
          </div>

          <div>
            <span>Funding Agency</span>
            <strong>{selectedProject.fundingAgency}</strong>
          </div>

          <div>
            <span>PI Name</span>
            <strong>{selectedProject.pi.name}</strong>
          </div>

          <div>
            <span>Department</span>
            <strong>{selectedProject.pi.department}</strong>
          </div>

        </div>

        <h3>Previous Installments</h3>

        {selectedProject.installments
          .filter((_, idx) =>
            idx < selectedProject.currentInstallment - 1
          )
          .map((inst, idx) => (

            <div
              key={idx}
              className="sanctioned-inst-card"
            >

              <button
                className="btn-view"
                onClick={() =>
                  setExpandedInstallment(
                    expandedInstallment === idx
                      ? null
                      : idx
                  )
                }
              >
                {inst.installmentNo}
              </button>

              {expandedInstallment === idx && (

                <table className="sanctioned-table">

                  <thead>
                    <tr>
                      <th>Head</th>
                      <th>Amount</th>
                    </tr>
                  </thead>

                  <tbody>

                    {inst.heads.map((head, i) => (

                      <tr key={i}>
                        <td>{head.head}</td>
                        <td>{head.amount}</td>
                      </tr>

                    ))}

                  </tbody>

                </table>

              )}

            </div>

          ))}

        <h3>
          Current Installment For Approval
        </h3>

        <table className="sanctioned-table">

          <thead>
            <tr>
              <th>Head</th>
              <th>Amount</th>
            </tr>
          </thead>

          <tbody>

            {current.heads.map((head, i) => (

              <tr key={i}>
                <td>{head.head}</td>
                <td>{head.amount}</td>
              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

  return (
    <div className="project-dashboard">
      <div className="tab-switcher">
        <button className={activeTab === 'pending' ? 'active' : ''} onClick={() => setActiveTab('pending')}>Renewal Pending</button>
        <button className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>Renewal History</button>
      </div>

      <div className="table-container">
        <table className="sanctioned-table">
          <thead>
            <tr>
              <th>Sl.No</th>
              <th>Ref No</th>
              <th>Project Title</th>
              <th>Installment</th>
              <th>Amount (₹)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {(activeTab === 'pending' ? requests : history).map((item, idx) => (
              <tr key={item.id}>
                <td>{idx + 1}</td>
                <td>{item.refNo}</td>
                <td>{item.title}</td>
                <td>
  {item.installments[item.currentInstallment - 1].installmentNo}
</td>

<td>
  {item.installments[item.currentInstallment - 1].amount}
</td>
                <td>
                  <button
  className="btn-view"
  onClick={()=>{
    setSelectedProject(item);
    setPage('view');
  }}
>
  View Details
</button>
<button
  className="btn-edit"
  onClick={()=>{
    setEditProject(
      JSON.parse(JSON.stringify(item))
    );
    setPage('edit');
  }}
>
  Edit
</button>
                  {activeTab === 'pending' && (
                    <button className="btn-approve" onClick={() => handleApprove(item.id)}>Approve</button>
                  )}
                  {activeTab === 'history' && <span>Approved: {item.approvedDate}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}