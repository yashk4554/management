import React from 'react';


const About = () => {
  return (
    <div className="form-container" style={{maxWidth:'600px',marginTop:'48px'}}>
      <h2>About</h2>
      <p style={{fontSize:'1.1rem',color:'#444'}}>This Complaint Management System allows users to register, submit complaints, and track their status. Admins can view, manage, and resolve complaints efficiently.<br/><br/>Built with React, Node.js, Express, and MongoDB.</p>
    </div>
  );
};

export default About;
