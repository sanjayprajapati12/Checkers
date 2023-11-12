import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
// import { SocketProvider } from './Components/Helper/SocketContex';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <SocketProvider>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  //  </SocketProvider>
);

