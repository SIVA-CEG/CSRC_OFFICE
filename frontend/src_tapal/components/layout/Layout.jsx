import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import "../../App.css";
import "./tapal-scope.css";

export default function Layout({ counts }) {
  return (
    <div className="tapal-scope app-shell">
      <Sidebar counts={counts} />
      <main className="main-content">
        <Header counts={counts} />
        <section className="page-body">
          <Outlet />
        </section>
      </main>
    </div>
  );
}