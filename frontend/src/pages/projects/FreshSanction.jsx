import React, { useState } from 'react';
import './FreshSanction.css'; // Assuming you use the same styles

const initialRequests = [
  {
    id: 1,
    refNo: 'CRG/2026/001',
    title: 'Advanced Material Science',
    cost: '50,00,000',

    fundingAgency: 'SERB',

    pi: {
      name: 'Dr. A. Kumar',
      department: 'Mechanical Engineering',
      campus: 'CEG Campus'
    },

    period: '01-01-2026 to 31-12-2028',

    installments: [
      {
        installmentNo: '1st Installment',
        amount: '20,00,000'
      }
    ]
  },

  {
    id: 2,
    refNo: 'DST/2026/005',
    title: 'AI in Healthcare',
    cost: '25,00,000',

    fundingAgency: 'DST',

    pi: {
      name: 'Dr. B. Singh',
      department: 'Information Technology',
      campus: 'MIT Campus'
    },

    period: '01-02-2026 to 31-01-2029',

    installments: [
      {
        installmentNo: '1st Installment',
        amount: '10,00,000'
      }
    ]
  }
];

export default function FreshSanction() {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'history'
  const [requests, setRequests] = useState(initialRequests);
  const [history, setHistory] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [selectedProject, setSelectedProject] = useState(null);
  const [page, setPage] = useState('list');
  const [editProject, setEditProject] = useState(null);
  const [assignmentCodes, setAssignmentCodes] = useState({});

  const openView = (item) => {
    setSelectedProject(item);
    setPage('view');
  };


  const handleEdit = (item) => {
  setEditProject(JSON.parse(JSON.stringify(item)));
  setPage('edit');
};
  const handleApprove = (id) => {
  const item = requests.find(r => r.id === id);

  setHistory([
    ...history,
    {
      ...item,
      assignedTo: assignments[id] || 'N/A',
      assignmentCode: assignmentCodes[id] || '',
      approvedDate: new Date().toLocaleDateString()
    }
  ]);

  setRequests(requests.filter(r => r.id !== id));
};

  const renderActions = (item) => (
    <>
      <button className="btn-view" onClick={() => openView(item)}>View</button>
      {activeTab === 'pending' && (
        <>
          <button
  className="btn-edit"
  onClick={() => handleEdit(item)}
>
  Edit
</button>
          <button className="btn-approve" onClick={() => handleApprove(item.id)}>Approve</button>
        </>
      )}
    </>
  );

  if (page === 'edit' && editProject) {
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

        <h2>Edit Fresh Sanction Project</h2>

        <div className="detail-grid">

          <div>
            <label>Reference No</label>
            <input
              className="edit-input"
              value={editProject.refNo}
              onChange={(e) =>
                setEditProject({
                  ...editProject,
                  refNo: e.target.value
                })
              }
            />
          </div>

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
  <option value="SERB">SERB</option>
  <option value="DST">DST</option>
  <option value="DRDO">DRDO</option>
  <option value="ISRO">ISRO</option>
  <option value="ICMR">ICMR</option>
  <option value="CSIR">CSIR</option>
</select>
          </div>

          <div>
            <label>Project Title</label>
            <input
              className="edit-input"
              value={editProject.title}
              onChange={(e) =>
                setEditProject({
                  ...editProject,
                  title: e.target.value
                })
              }
            />
          </div>

          <div>
            <label>Total Cost</label>
            <input
              className="edit-input"
              value={editProject.cost}
              onChange={(e) =>
                setEditProject({
                  ...editProject,
                  cost: e.target.value
                })
              }
            />
          </div>

  <div>
  <label>From Date</label>

  <input
    type="date"
    className="edit-input"
    value={editProject.fromDate || ""}
    onChange={(e) =>
      setEditProject({
        ...editProject,
        fromDate: e.target.value
      })
    }
  />
</div>

<div>
  <label>To Date</label>

  <input
    type="date"
    className="edit-input"
    value={editProject.toDate || ""}
    onChange={(e) =>
      setEditProject({
        ...editProject,
        toDate: e.target.value
      })
    }
  />
</div>

        </div>

        <h3>Principal Investigator</h3>

        <div className="detail-grid">

          <div>
            <label>Name</label>
            <input
              className="edit-input"
              value={editProject.pi.name}
              onChange={(e) =>
                setEditProject({
                  ...editProject,
                  pi: {
                    ...editProject.pi,
                    name: e.target.value
                  }
                })
              }
            />
          </div>

          <div>
            <label>Department</label>
            <select
  className="edit-input"
  value={editProject.pi.department}
  onChange={(e) =>
    setEditProject({
      ...editProject,
      pi: {
        ...editProject.pi,
        department: e.target.value
      }
    })
  }
>
  <option>Information Technology</option>
  <option>Computer Science Engineering</option>
  <option>Mechanical Engineering</option>
  <option>Civil Engineering</option>
  <option>ECE</option>
  <option>EEE</option>
  <option>Biomedical Engineering</option>
</select>
          </div>

          <div>
            <label>Campus</label>
            <select
  className="edit-input"
  value={editProject.pi.campus}
  onChange={(e) =>
    setEditProject({
      ...editProject,
      pi: {
        ...editProject.pi,
        campus: e.target.value
      }
    })
  }
>
  <option>CEG Campus</option>
  <option>MIT Campus</option>
  <option>ACT Campus</option>
  <option>SAP Campus</option>
</select>
          </div>

        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "25px"
          }}
        >

          <button
            className="btn-approve"
            onClick={() => {

              setRequests(
                requests.map((req) =>
                  req.id === editProject.id
                    ? editProject
                    : req
                )
              );

              setPage("list");
              setEditProject(null);
            }}
          >
            Save Changes
          </button>

          <button
            className="btn-edit"
            onClick={() => {
              setPage("list");
              setEditProject(null);
            }}
          >
            Cancel
          </button>

        </div>

      </div>

    </div>
  );
}

if (page === 'view' && selectedProject) {
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
            <span>Total Cost</span>
            <strong>₹ {selectedProject.cost}</strong>
          </div>

          <div>
            <span>Project Period</span>
            <strong>{selectedProject.period}</strong>
          </div>

        </div>

        <h3>Principal Investigator</h3>

        <div className="detail-grid">

          <div>
            <span>Name</span>
            <strong>{selectedProject.pi.name}</strong>
          </div>

          <div>
            <span>Department</span>
            <strong>{selectedProject.pi.department}</strong>
          </div>

          <div>
            <span>Campus</span>
            <strong>{selectedProject.pi.campus}</strong>
          </div>

        </div>

        {/* HEADWISE SPLIT */}

<div className="sanctioned-inst-card">

  <div className="sanctioned-inst-header">
    <h3>Head Wise Budget Split</h3>
  </div>

  <div className="table-scroll-wrap">

    <table className="sanctioned-table sanctioned-detail-table">

      <thead>
        <tr>
          <th>Sl.No</th>
          <th>Head</th>
          <th>Amount (₹)</th>
        </tr>
      </thead>

      <tbody>

        <tr className="detail-group-row">
          <td>A</td>
          <td>Non Recurring Heads</td>
          <td></td>
        </tr>

        <tr>
          <td>1</td>
          <td>Equipment</td>
          <td>20,00,000</td>
        </tr>

        <tr className="detail-group-row">
          <td>B</td>
          <td>Recurring Heads</td>
          <td></td>
        </tr>

        <tr>
          <td>1</td>
          <td>Manpower</td>
          <td>10,00,000</td>
        </tr>

        <tr>
          <td>2</td>
          <td>Consumables & Accessories</td>
          <td>4,00,000</td>
        </tr>

        <tr>
          <td>3</td>
          <td>Travel</td>
          <td>2,00,000</td>
        </tr>

        <tr>
          <td>4</td>
          <td>Contingency</td>
          <td>1,00,000</td>
        </tr>

        <tr className="detail-group-row">
          <td>C</td>
          <td>Overhead</td>
          <td>10,00,000</td>
        </tr>

        <tr>
          <td>5</td>
          <td>Registrar A/C (5%)</td>
          <td>3,33,333</td>
        </tr>

        <tr>
          <td>6</td>
          <td>Dean Campus A/C (4%)</td>
          <td>2,66,667</td>
        </tr>

        <tr>
          <td>7</td>
          <td>CSRC Revenue (4%)</td>
          <td>2,66,667</td>
        </tr>

        <tr>
          <td>8</td>
          <td>PI PDF (2%)</td>
          <td>1,33,333</td>
        </tr>

        <tr className="detail-group-row">
          <td>D</td>
          <td>SSR Budget</td>
          <td>3,00,000</td>
        </tr>

        <tr className="detail-total-row">
          <td colSpan="2">
            Total Project Cost
          </td>
          <td>
            {selectedProject.cost}
          </td>
        </tr>

      </tbody>

    </table>

  </div>

</div>

<div className="sanctioned-inst-card">

  <div className="sanctioned-inst-header">
    <h3>Installment Wise Sanction</h3>
  </div>

  <table className="sanctioned-table sanctioned-detail-table">

    <thead>
      <tr>
        <th>Installment</th>
        <th>Amount (₹)</th>
        <th>Status</th>
      </tr>
    </thead>

    <tbody>

      {selectedProject.installments.map((inst,index)=>(
        <tr key={index}>
          <td>{inst.installmentNo}</td>
          <td>{inst.amount}</td>
          <td>
            <span className="pending-badge">
              Pending Release
            </span>
          </td>
        </tr>
      ))}

    </tbody>

  </table>

</div>

      </div>

    </div>
  );
}

  return (
    <div className="project-dashboard">
      <div className="tab-switcher">
        <button className={activeTab === 'pending' ? 'active' : ''} onClick={() => setActiveTab('pending')}>Pending Requests</button>
        <button className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>History</button>
      </div>

      <table className="sanctioned-table">
        <thead>
          <tr>
            <th>Sl.No</th>
            <th>Ref No</th>
            <th>Project Title</th>
            <th>Total Cost (₹)</th>
            <th>Assignment</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {(activeTab === 'pending' ? requests : history).map((item, idx) => (
            <tr key={item.id}>
              <td>{idx + 1}</td>
              <td>{item.refNo}</td>
              <td>{item.title}</td>
              <td>{item.cost}</td>
              <td>
                {activeTab === 'pending' ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
  <select
    onChange={(e) =>
      setAssignments({
        ...assignments,
        [item.id]: e.target.value
      })
    }
    value={assignments[item.id] || ""}
  >
    <option value="">Select</option>
    <option value="ZBA">ZBA</option>
    <option value="TSA(H)">TSA(H)</option>
    <option value="CMRG">CMRG</option>
  </select>

  {(assignments[item.id] === "ZBA" ||
    assignments[item.id] === "TSA(H)" ||
    assignments[item.id] === "CMRG") && (
    <input
      type="text"
      placeholder={`Enter ${assignments[item.id]} Code`}
      value={assignmentCodes[item.id] || ""}
      onChange={(e) =>
        setAssignmentCodes({
          ...assignmentCodes,
          [item.id]: e.target.value
        })
      }
      className="edit-input"
    />
  )}
</div>
                ) : (
                  <div>
  <strong>{item.assignedTo}</strong>
  {item.assignmentCode && (
    <div style={{ fontSize: "12px", color: "#666" }}>
      Code: {item.assignmentCode}
    </div>
  )}
</div>
                )}
              </td>
              <td>
                {activeTab === 'pending' ? (
                  <>
                    <button
  className="btn-view"
  onClick={() => {
    setSelectedProject(item);
    setPage('view');
  }}
>
  View
</button>
                    <button
  className="btn-edit"
  onClick={() => handleEdit(item)}
>
  Edit
</button>
                    <button className="btn-approve" onClick={() => handleApprove(item.id)}>Approve</button>
                  </>
                ) : (
                  <span>Approved on {item.approvedDate}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}