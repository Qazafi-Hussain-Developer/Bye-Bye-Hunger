import React from 'react';
import { Link } from 'react-router-dom';
import './Team.css';

const Team = () => {
  const team = [
    { id: 1, name: 'Full Name', designation: 'Designation', image: '/images/team-1.jpg' },
    { id: 2, name: 'Full Name', designation: 'Designation', image: '/images/team-2.jpg' },
    { id: 3, name: 'Full Name', designation: 'Designation', image: '/images/team-3.jpg' },
    { id: 4, name: 'Full Name', designation: 'Designation', image: '/images/team-4.jpg' },
    { id: 5, name: 'Full Name', designation: 'Designation', image: '/images/team-1.jpg' },
    { id: 6, name: 'Full Name', designation: 'Designation', image: '/images/team-2.jpg' },
    { id: 7, name: 'Full Name', designation: 'Designation', image: '/images/team-3.jpg' },
    { id: 8, name: 'Full Name', designation: 'Designation', image: '/images/team-4.jpg' }
  ];

  return (
    <>
      {/* Hero Header */}
      <div className="team-hero-header">
        <div className="container">
          <div className="team-hero-content">
            <h1 className="team-hero-title">Our Team</h1>
            <nav className="team-breadcrumb">
              <ol className="team-breadcrumb-list">
                <li className="team-breadcrumb-item">
                  <Link to="/">Home</Link>
                </li>
                <li className="team-breadcrumb-item">
                  <Link to="/pages">Pages</Link>
                </li>
                <li className="team-breadcrumb-item active" aria-current="page">
                  Team
                </li>
              </ol>
            </nav>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="container-xxl pt-5 pb-5" style={{ marginBottom: '3rem' }}>
        <div className="container">
          <div className="text-center wow fadeInUp">
            <h5 className="section-title ff-secondary text-center text-primary fw-normal">Team Members</h5>
            <h1 className="mb-5">Our Master Chefs</h1>
          </div>
          <div className="row g-4" style={{ rowGap: '2rem' }}>
            {team.map((member, index) => (
              <div className="col-lg-3 col-md-6 wow fadeInUp" key={member.id}>
                <div className="team-item text-center rounded overflow-hidden">
                  <div className="rounded-circle overflow-hidden m-4">
                    <img className="img-fluid" src={member.image} alt={member.name} />
                  </div>
                  <h5 className="mb-0">{member.name}</h5>
                  <small>{member.designation}</small>
                  <div className="d-flex justify-content-center mt-3" >
                    <a className="btn btn-square btn-primary mx-1" href="#"><i className="fab fa-facebook-f"></i></a>
                    <a className="btn btn-square btn-primary mx-1" href="#"><i className="fab fa-twitter"></i></a>
                    <a className="btn btn-square btn-primary mx-1" href="#"><i className="fab fa-instagram"></i></a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Team;