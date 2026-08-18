import React from 'react';

/**
 * Footer Component
 * TODO: Implement footer with brand links, social media, and contact info.
 * See BRAND_GUIDE.md for design rules.
 */
function Footer() {
  return (
    <footer style={{
      background: '#076935',
      color: 'white',
      padding: '2rem 5%',
      textAlign: 'center',
      fontFamily: 'Space Grotesk, sans-serif',
    }}>
      <p>© {new Date().getFullYear()} KainaFresh. All rights reserved.</p>
    </footer>
  );
}

export default Footer;
