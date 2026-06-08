import { useEffect, useMemo, useRef, useState } from "react";

export default function SearchableDropdown({
  options,
  value,
  onChange,
  placeholder = "Select option",
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef(null);

  const filteredOptions = useMemo(() => {
    return options.filter((option) =>
      option.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  useEffect(() => {
    const closeDropdown = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", closeDropdown);
    return () => document.removeEventListener("mousedown", closeDropdown);
  }, []);

  return (
    <div className="sd-wrapper" ref={wrapperRef}>
      <button
        type="button"
        className={`sd-input-row ${open ? "open" : ""}`}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className={value ? "sd-value" : "sd-placeholder"}>
          {value || placeholder}
        </span>
        <span className="sd-arrow">⌄</span>
      </button>

      {open && (
        <div className="sd-dropdown">
          <div className="sd-search">
            <input
              autoFocus
              placeholder="Search staff..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <button
            type="button"
            className={`sd-option ${!value ? "selected" : ""}`}
            onClick={() => {
              onChange("");
              setOpen(false);
              setSearch("");
            }}
          >
            Select option
          </button>

          {filteredOptions.map((option) => (
            <button
              type="button"
              key={option}
              className={`sd-option ${value === option ? "selected" : ""}`}
              onClick={() => {
                onChange(option);
                setOpen(false);
                setSearch("");
              }}
            >
              {option}
            </button>
          ))}

          {filteredOptions.length === 0 && (
            <div className="sd-no-result">No matching results</div>
          )}
        </div>
      )}
    </div>
  );
}