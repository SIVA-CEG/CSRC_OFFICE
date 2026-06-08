import React, { useState, useMemo } from "react";
import "./Faculties.css";

export default function Faculties() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [error, setError] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;

  // Sample data - Replace with your full faculties JSON
  const [faculties, setFaculties] = useState([
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Arun Prakash R.",
    "designation": "Asst. Prof. (Sl.Gr.)",
    "department": "CSE",
    "campus": "BITS",
    "status": "Service"
  },
  {
    "staffId": "65852",
    "name": "Indra Gandhi K",
    "designation": "Asso. Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Kannan  R.",
    "designation": "Asst. Prof.",
    "department": "Physics",
    "campus": "UCE Dindigul",
    "status": "Service"
  },
  {
    "staffId": "931119",
    "name": "Marshal Anthoni S.",
    "designation": "Asso. Prof.",
    "department": "Maths",
    "campus": "RC Coimbatore",
    "status": "Service"
  },
  {
    "staffId": "26041",
    "name": "Aarthi  A.",
    "designation": "Res. Sch.",
    "department": "ECE",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "26033",
    "name": "Abarna P.",
    "designation": "Res. Sch.",
    "department": "IRS",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "24069",
    "name": "ABHISHEK DHEEVEN T.",
    "designation": "Studentship",
    "department": "Nano Tech",
    "campus": "ACT Campus",
    "status": "Service"
  },
  {
    "staffId": "0",
    "name": "Abirami R.",
    "designation": "Res. Sch.",
    "department": "Physics",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "65751",
    "name": "Abirami Murugappan",
    "designation": "Prof.",
    "department": "DIST",
    "campus": "CEG Campus",
    "status": "Service"
  },
  {
    "staffId": "68451",
    "name": "Adaikkalam V.",
    "designation": "Prof.",
    "department": "CBT",
    "campus": "ACT Campus",
    "status": "Service"
  }
]);

const [currentFaculty, setCurrentFaculty] = useState({
  staffId: "",
  name: "",
  designation: "",
  department: "",
  campus: "",
  status: "Active",
});

const openAddModal = () => {
  setEditIndex(null);
  setError("");
  setCurrentFaculty({
    staffId: "",
    name: "",
    designation: "",
    department: "",
    campus: "",
    status: "Active",
  });
  setShowModal(true);
};

  const openEditModal = (item, actualIndex) => {
    setEditIndex(actualIndex);
    setError("");
    setCurrentFaculty(item);
    setShowModal(true);
  };

  const saveFaculty = () => {
    setError("");

    if (
  !currentFaculty.staffId.trim() ||
  !currentFaculty.name.trim() ||
  !currentFaculty.designation.trim() ||
  !currentFaculty.department.trim() ||
  !currentFaculty.campus.trim()
) {
      setError("Please fill in all required fields.");
      return;
    }

    if (editIndex !== null) {
      const updated = [...faculties];
      updated[editIndex] = currentFaculty;
      setFaculties(updated);
    } else {
      setFaculties([
  ...faculties,
  {
    staffId: currentFaculty.staffId.trim(),
    name: currentFaculty.name.trim(),
    designation: currentFaculty.designation.trim(),
    department: currentFaculty.department.trim(),
    campus: currentFaculty.campus.trim(),
    status: currentFaculty.status,
  },
]);
    }
    setShowModal(false);
  };

  const deleteFaculty = (actualIndex) => {
    if (!window.confirm("Are you sure you want to remove this faculty member?")) return;
    setFaculties(faculties.filter((_, idx) => idx !== actualIndex));
  };

  // 1. Filter the data based on search
  const filteredFaculties = useMemo(() => {
    const searchLower = search.toLowerCase();
    return faculties.filter((item) => {
      if (!item) return false;
      return (
        (item.staffId ?? "").toLowerCase().includes(searchLower) ||
  (item.name ?? "").toLowerCase().includes(searchLower) ||
        (item.designation ?? "").toLowerCase().includes(searchLower) ||
        (item.department ?? "").toLowerCase().includes(searchLower) ||
        (item.campus ?? "").toLowerCase().includes(searchLower)
      );
    });
  }, [faculties, search]);

  // Reset to page 1 if search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // 2. Calculate Pagination data
  const totalPages = Math.ceil(filteredFaculties.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredFaculties.slice(indexOfFirstRow, indexOfLastRow);

  return (
    <div className="fac-page">
      <div className="fac-header">
        <div>
          <h1>👨‍🏫 Faculty Management</h1>
          <p>Manage teaching staff, designations, and department affiliations</p>
        </div>
        <button className="add-fac-btn" onClick={openAddModal}>+ Add Faculty</button>
      </div>

      <div className="fac-stats">
        <div className="stat-card">
          <h2>{faculties.length}</h2>
          <span>Total Faculty Members</span>
        </div>
        <div className="stat-card">
          <h2>{filteredFaculties.length}</h2>
          <span>Displayed Results</span>
        </div>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="🔍 Search by Name, Designation, Department, or Campus..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table className="fac-table">
          <thead>
            <tr>
              <th>Staff ID</th>
              <th>Name</th>
              <th>Designation</th>
              <th>Department</th>
              <th>Campus</th>
              <th>Status</th>
              <th style={{ width: "160px", textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.length > 0 ? (
              currentRows.map((item, index) => {
                // Find actual index for editing/deleting based on object reference
                const actualIndex = faculties.indexOf(item);
                
                return (
                  <tr key={index}>
                    <td>{item.staffId}</td>
                    <td style={{ fontWeight: "600", color: "#166534" }}>{item.name}</td>
                    <td>{item.designation}</td>
                    <td>{item.department}</td>
                    <td>{item.campus}</td>
                    <td>
                      <span className={`status-badge ${item.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="save-btn" onClick={() => openEditModal(item, actualIndex)}>
                          ✏️ Edit
                        </button>
                        <button className="cancel-btn" onClick={() => deleteFaculty(actualIndex)}>
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="empty-state">No faculty members found</td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pagination-controls">
            <span className="pagination-text">
              Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, filteredFaculties.length)} of {filteredFaculties.length}
            </span>
            <div className="pagination-buttons">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                disabled={currentPage === 1}
                className="cancel-btn page-btn"
              >
                Previous
              </button>
              <div className="page-indicator">
                Page {currentPage} of {totalPages}
              </div>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                disabled={currentPage === totalPages}
                className="cancel-btn page-btn"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>{editIndex !== null ? "Edit Faculty" : "Add Faculty"}</h2>
            <div className="modal-grid">
  <input
    type="text"
    placeholder="Staff ID *"
    value={currentFaculty.staffId}
    onChange={(e) =>
      setCurrentFaculty({
        ...currentFaculty,
        staffId: e.target.value,
      })
    }
  />

  <input
    type="text"
    placeholder="Full Name *"
    value={currentFaculty.name}
    onChange={(e) =>
      setCurrentFaculty({
        ...currentFaculty,
        name: e.target.value,
      })
    }
  />
              <input type="text" placeholder="Designation *" value={currentFaculty.designation} onChange={(e) => setCurrentFaculty({ ...currentFaculty, designation: e.target.value })} />
              <input type="text" placeholder="Department *" value={currentFaculty.department} onChange={(e) => setCurrentFaculty({ ...currentFaculty, department: e.target.value })} />
              <input type="text" placeholder="Campus *" value={currentFaculty.campus} onChange={(e) => setCurrentFaculty({ ...currentFaculty, campus: e.target.value })} />
              
              <div className="status-toggle" style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: "14px", fontWeight: "600", color: "#334155", marginRight: "12px" }}>Status:</label>
                <select 
                  className="fac-select" 
                  value={currentFaculty.status} 
                  onChange={(e) => setCurrentFaculty({ ...currentFaculty, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            {error && <div className="fac-error">⚠ {error}</div>}
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => { setShowModal(false); setError(""); }}>Cancel</button>
              <button className="save-btn" onClick={saveFaculty}>{editIndex !== null ? "Update Faculty" : "Save Faculty"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}