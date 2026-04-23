import "./Spinner.css";

const Spinner = ({ size = "md", label = "" }) => {
  return (
    <div className="spinner-wrapper">
      <div className={`spinner-ring spinner-${size}`} />
      {label && <span className="spinner-label">{label}</span>}
    </div>
  );
};

export default Spinner;