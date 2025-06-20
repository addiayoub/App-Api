// import "./loader.css";

// const Loader = () => {
//   return (
//     <div className="loader-container">
//       <span className="loader"></span>
//     </div>
//   )
// }

// export default Loader
import "./loader.css";

const Loader = () => {
  return (
    <div className="loader-container">
      <div className="api-loader">
        <div className="circuit-line"></div>
        <div className="circuit-dots">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="dot" style={{ '--delay': i * 0.1 }}></div>
          ))}
        </div>
        <div className="api-text"> InsightOne API</div>
      </div>
    </div>
  );
};

export default Loader;