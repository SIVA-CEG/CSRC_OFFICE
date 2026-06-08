import React, { useMemo, useRef, useState } from "react";
import html2pdf from "html2pdf.js";
import "./SanctionOverallReportModalST.css";

export default function SanctionOverallReportModalST({
  requests = [],
  onClose,
}) {
  const reportRef = useRef();

  const [fromDate, setFromDate] =
    useState("");

  const [toDate, setToDate] =
    useState("");

  const filteredRequests =
    useMemo(() => {
      return requests.filter(
        (req) => {
          if (
            !fromDate &&
            !toDate
          )
            return true;

          const reqDate =
            req.submittedDate
              ?.split("-")
              ?.reverse()
              ?.join("-");

          if (
            fromDate &&
            reqDate <
              fromDate
          )
            return false;

          if (
            toDate &&
            reqDate > toDate
          )
            return false;

          return true;
        }
      );
    }, [
      requests,
      fromDate,
      toDate,
    ]);

  const stats =
    useMemo(() => {
      const totalAmount =
        filteredRequests.reduce(
          (sum, item) =>
            sum +
            (item.totalAmount ||
              0),
          0
        );

      return {
        total:
          filteredRequests.length,

        pending:
          filteredRequests.filter(
            (r) =>
              r.status ===
              "PENDING"
          ).length,

        assigned:
          filteredRequests.filter(
            (r) =>
              r.status ===
              "ASSIGNED"
          ).length,

        completed:
          filteredRequests.filter(
            (r) =>
              r.status ===
              "COMPLETED"
          ).length,

        totalAmount,
      };
    }, [
      filteredRequests,
    ]);

  const agencySummary =
    useMemo(() => {
      const map = {};

      filteredRequests.forEach(
        (item) => {
          map[
            item.agency
          ] =
            (map[
              item.agency
            ] || 0) +
            (item.totalAmount ||
              0);
        }
      );

      return Object.entries(
        map
      );
    }, [
      filteredRequests,
    ]);

  const piSummary =
    useMemo(() => {
      const map = {};

      filteredRequests.forEach(
        (item) => {
          map[
            item.piName
          ] =
            (map[
              item.piName
            ] || 0) +
            (item.totalAmount ||
              0);
        }
      );

      return Object.entries(
        map
      );
    }, [
      filteredRequests,
    ]);

  const downloadPdf =
    () => {
      html2pdf()
        .set({
          margin: 8,

          filename:
            "Sanction_Overall_Report.pdf",

          html2canvas:
            {
              scale: 2,
            },

          jsPDF: {
            unit: "mm",
            format: "a4",
            orientation:
              "landscape",
          },
        })
        .from(
          reportRef.current
        )
        .save();
    };

  return (
    <div
      className="sort-overlay"
      onClick={(e) =>
        e.target ===
          e.currentTarget &&
        onClose()
      }
    >
      <div className="sort-modal">

        <div className="sort-header">

          <h2>
            Overall Sanction Report
          </h2>

          <div
            style={{
              display:
                "flex",
              gap: 10,
            }}
          >
            <button
              className="btn btn-primary"
              onClick={
                downloadPdf
              }
            >
              Download PDF
            </button>

            <button
              className="sort-close"
              onClick={
                onClose
              }
            >
              ✕
            </button>
          </div>

        </div>

        <div className="sort-filters">

          <div>
            <label>
              From Date
            </label>

            <input
              type="date"
              value={
                fromDate
              }
              onChange={(
                e
              ) =>
                setFromDate(
                  e.target
                    .value
                )
              }
            />
          </div>

          <div>
            <label>
              To Date
            </label>

            <input
              type="date"
              value={toDate}
              onChange={(
                e
              ) =>
                setToDate(
                  e.target
                    .value
                )
              }
            />
          </div>

        </div>

        <div className="sort-preview">

          <div
            ref={reportRef}
            className="sort-report"
          >

            <div className="sort-title">

              <h1>
                CENTRE FOR
                SPONSORED
                RESEARCH &
                CONSULTANCY
              </h1>

              <h3>
                Anna University,
                Chennai
              </h3>

              <h2>
                OVERALL
                SANCTION
                REPORT
              </h2>

            </div>

            <div className="sort-stats">

              <div className="sort-stat">
                <h3>
                  {stats.total}
                </h3>
                <p>
                  Total
                  Requests
                </p>
              </div>

              <div className="sort-stat">
                <h3>
                  {
                    stats.pending
                  }
                </h3>
                <p>
                  Pending
                </p>
              </div>

              <div className="sort-stat">
                <h3>
                  {
                    stats.assigned
                  }
                </h3>
                <p>
                  Assigned
                </p>
              </div>

              <div className="sort-stat">
                <h3>
                  {
                    stats.completed
                  }
                </h3>
                <p>
                  Completed
                </p>
              </div>

            </div>

            <div className="sort-total">

              <h2>
                Total
                Sanctioned
                Amount
              </h2>

              <h1>
                ₹
                {stats.totalAmount.toLocaleString()}
              </h1>

            </div>

            <div className="sort-section">

              <h3>
                Agency Wise
                Summary
              </h3>

              <table className="sort-table">

                <thead>
                  <tr>
                    <th>
                      Agency
                    </th>

                    <th>
                      Amount
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {agencySummary.map(
                    (
                      row,
                      index
                    ) => (
                      <tr
                        key={
                          index
                        }
                      >
                        <td>
                          {
                            row[0]
                          }
                        </td>

                        <td>
                          ₹
                          {row[1].toLocaleString()}
                        </td>
                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

            <div className="sort-section">

              <h3>
                PI Wise
                Summary
              </h3>

              <table className="sort-table">

                <thead>
                  <tr>
                    <th>
                      PI Name
                    </th>

                    <th>
                      Amount
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {piSummary.map(
                    (
                      row,
                      index
                    ) => (
                      <tr
                        key={
                          index
                        }
                      >
                        <td>
                          {
                            row[0]
                          }
                        </td>

                        <td>
                          ₹
                          {row[1].toLocaleString()}
                        </td>
                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}