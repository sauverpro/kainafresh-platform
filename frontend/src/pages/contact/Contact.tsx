import React from 'react';
import Navbar from '../../components/Navbar/Navbar';

/**
 * Contact Us Page
 * Contact info fetched from: GET /api/content/contact
 * Contact form submits to: POST /api/contact
 * See API_CONTRACT.md for the expected shapes.
 *
 * TODO: Implement contact form and display contact details.
 */
function Contact() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '80px', padding: '6rem 5%', textAlign: 'center', color: '#6B7280' }}>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#076935' }}>Contact Us</h1>
        <p>This page is a placeholder. Contact info and form coming soon.</p>
      </main>
    </>
  );
}

export default Contact;
