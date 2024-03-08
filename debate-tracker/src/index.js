import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
// import reportWebVitals from './reportWebVitals';
// import {  } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";

// import "bootstrap/dist/css/bootstrap.min.css";
import { Router, Routes, Route } from "react-router"
import Landing from './Landing';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>
{/* //   <React.StrictMode> */}
        <Routes>
            <Route path="/:argID" element={<App />} />
            <Route path="/" element={<Landing/>}/>
        </Routes>
{/* //   </React.StrictMode> */}
    </BrowserRouter>
);
// ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
//     <BrowserRouter>
//       <App />
//     </BrowserRouter>
//   );

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
