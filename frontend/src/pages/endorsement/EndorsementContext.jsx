import React, { createContext, useContext, useState } from "react";

export const DUMMY_ENDORSEMENTS = [
  {
    id: 1895,
    appliedOn: "27-05-2026",
    tapalNo: "",
    piName: "Dr. Shubra Singh",
    piDesignation: "Assistant Professor",
    piDept: "Crystal Growth Centre",
    piCampus: "ACT Campus",
    piDob: "13-11-1979",
    piService: "19-01-2016",
    piSuperannuation: "18-01-2045",
    piRole: "PI",
    yearsService: "18",
    fundingAgency: "SERB",
    projectScheme: "Core Research Grant",
    fundingType: "Central Govt",
    projectType: "Academic",
    title:
      "Make in India Bio-Polymer Based Composite (BBC) Adhesive Technology: An Integrated Platform for Histopathology microscopic slides",
    refNo: "2526ET0937/CSRC-2",
    nonRecurring: "1200000",
    recurring: "2734000",
    overheadPct: 15,
    gst: "no",
    calculatedTotal: 4524100,
    dueDate: "10-06-2026",
    isPIRegular: "yes",
    endorsementRequired: "yes",
    endorsementFormat: "ANRF",
    coPIs: [
      {
        campus: "ACT Campus",
        department: "Crystal Growth Centre",
        name: "Dr. C. Anchana Devi",
        designation: "Assistant Professor",
        role: "COPI",
      },
    ],
    extInvs: [
      {
        name: "Dr. C. Anchana Devi",
        designation: "Assistant Professor",
        institute: "Women's Christian College, Chennai",
      },
    ],
    files: {
      proposal: "proposal_copy.pdf",
      writeup: "writeup_signed.pdf",
      budget: "budget_signed.pdf",
    },
    status: "PENDING",
    transferHistory: [],
    signatures: {},
  },
  {
    id: 1894,
    appliedOn: "27-05-2026",
    tapalNo: "",
    piName: "Dr. P. Geetha",
    piDesignation: "Associate Professor",
    piDept: "Department of Information Science And Technology",
    piCampus: "CEG Campus",
    piDob: "05-07-1975",
    piService: "12-08-2004",
    piSuperannuation: "05-07-2035",
    piRole: "PI",
    yearsService: "9",
    fundingAgency: "DST",
    projectScheme: "Core Research Grant {CRG}",
    fundingType: "Central Govt",
    projectType: "Academic",
    title: "AI-Assisted Real-Time Two-Wheeler Safety and Risk Monitoring System",
    refNo: "2526CEG0841/CSRC-1",
    nonRecurring: "800000",
    recurring: "1800000",
    overheadPct: 15,
    gst: "no",
    calculatedTotal: 2995650,
    dueDate: "15-06-2026",
    isPIRegular: "yes",
    endorsementRequired: "yes",
    endorsementFormat: "DST",
    coPIs: [],
    extInvs: [],
    files: {
      proposal: "proposal_dst.pdf",
      writeup: "writeup_dst.pdf",
      budget: "budget_dst.pdf",
    },
    status: "PENDING",
    transferHistory: [],
    signatures: {},
  },
  {
    id: 1886,
    appliedOn: "16-05-2026",
    tapalNo: "TL-2026-0042",
    piName: "Dr. V. Mugendiran",
    piDesignation: "Assistant Professor (Sr.Gr)",
    piDept: "Department of Production Technology",
    piCampus: "MIT Campus",
    piDob: "14-09-1978",
    piService: "01-06-2006",
    piSuperannuation: "14-09-2038",
    piRole: "PI",
    yearsService: "12",
    fundingAgency: "MeitY",
    projectScheme: "Science Technology Innovation Hub for SC & ST",
    fundingType: "Central Govt",
    projectType: "Collaborative",
    title:
      "Establishment of Science Technology and Innovation (STI) Hub for Manufacturing of High-Performance 3D Printing Filaments to Enhance Sustainable Livelihoods of SC Communities in Selected Blocks of Tamil Nadu",
    refNo: "2526MIT0712/CSRC-5",
    nonRecurring: "8000000",
    recurring: "14000000",
    overheadPct: 15,
    gst: "no",
    calculatedTotal: 29542419,
    dueDate: "30-06-2026",
    isPIRegular: "yes",
    endorsementRequired: "yes",
    endorsementFormat: "CSRC",
    coPIs: [
      {
        campus: "MIT Campus",
        department: "Department of Manufacturing Engineering",
        name: "Dr. K. Rajkumar",
        designation: "Professor",
        role: "COPI",
      },
    ],
    extInvs: [],
    files: {
      proposal: "proposal_meity.pdf",
      writeup: "writeup_meity.pdf",
      budget: "budget_meity.pdf",
    },
    status: "PENDING",
    transferHistory: [],
    signatures: {},
  },
];

const EndorsementContext = createContext();

export function EndorsementProvider({ children }) {
  const [activeRequests, setActiveRequests] = useState(DUMMY_ENDORSEMENTS);
  const [transferredItems, setTransferredItems] = useState([]);
  const [completedItems, setCompletedItems] = useState([]);

  const addTransferred = (item) => {
    setActiveRequests((prev) =>
      prev.filter((e) => e.id !== item.id)
    );

    setTransferredItems((prev) => {
      const exists = prev.find((e) => e.id === item.id);

      if (exists) {
        return prev.map((e) =>
          e.id === item.id ? item : e
        );
      }

      return [item, ...prev];
    });
  };

  const updateTransferred = (updated) => {
    setTransferredItems((prev) =>
      prev.map((e) =>
        e.id === updated.id ? updated : e
      )
    );
  };

  const addCompleted = (item) => {
    setTransferredItems((prev) =>
      prev.filter((e) => e.id !== item.id)
    );

    setCompletedItems((prev) => {
      const exists = prev.find((e) => e.id === item.id);

      if (exists) {
        return prev.map((e) =>
          e.id === item.id ? item : e
        );
      }

      return [item, ...prev];
    });
  };

  return (
    <EndorsementContext.Provider
      value={{
        activeRequests,
        setActiveRequests,

        transferredItems,
        setTransferredItems,
        addTransferred,
        updateTransferred,

        completedItems,
        setCompletedItems,
        addCompleted,
      }}
    >
      {children}
    </EndorsementContext.Provider>
  );
}

export function useEndorsementContext() {
  const context = useContext(EndorsementContext);

  if (!context) {
    throw new Error(
      "useEndorsementContext must be used within EndorsementProvider"
    );
  }

  return context;
}