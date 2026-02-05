// This MUST be a client component
'use client';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// You can customize options here
const toastOptions = {
  position: "top-right" as const,
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export default function ToastProvider() {
  return <ToastContainer {...toastOptions} />;
}