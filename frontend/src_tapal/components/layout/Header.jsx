import annaLogo from "../../assets/anna_univ_logo.png";
import csrcLogo from "../../assets/csrc_logo.png";

export default function Header({ counts }) {
  return (
    <header className="top-header clean-header">
      <div className="header-left">
        <img src={annaLogo} alt="Anna University" className="header-logo" />

        <div>
          <h1>Centre for Sponsored Research and Consultancy</h1>
          <p>Anna University, Chennai · Tapal Management System</p>
        </div>
      </div>

      <div className="header-right">
        <div className="mini-stat">
          <span>New</span>
          <strong>{counts?.new || 0}</strong>
        </div>

        <div className="mini-stat">
          <span>Assigned</span>
          <strong>{counts?.assigned || 0}</strong>
        </div>

        <img src={csrcLogo} alt="CSRC" className="header-logo" />
      </div>
    </header>
  );
}