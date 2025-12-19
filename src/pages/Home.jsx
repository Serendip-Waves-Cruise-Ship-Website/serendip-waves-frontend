import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-page">
      <div className="hero bg-gradient-purple text-white text-center py-5">
        <div className="container py-5">
          <h1 className="display-3 fw-bold mb-4">Welcome to Serendip Waves</h1>
          <p className="lead mb-4">Embark on the journey of a lifetime with our luxury cruise experiences</p>
          <Link to="/booking" className="btn btn-light btn-lg px-5">
            Book Your Cruise Now
          </Link>
        </div>
      </div>

      <div className="container my-5">
        <div className="row">
          <div className="col-md-4 mb-4">
            <div className="card h-100 card-purple dashboard-card">
              <div className="card-body text-center">
                <div className="display-1 text-purple mb-3">🌊</div>
                <h5 className="card-title text-purple">Exotic Destinations</h5>
                <p className="card-text">Explore the world's most beautiful locations with our carefully curated cruise routes.</p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="card h-100 card-purple dashboard-card">
              <div className="card-body text-center">
                <div className="display-1 text-purple mb-3">🍽️</div>
                <h5 className="card-title text-purple">Fine Dining</h5>
                <p className="card-text">Indulge in world-class cuisine prepared by our expert chefs using the finest ingredients.</p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="card h-100 card-purple dashboard-card">
              <div className="card-body text-center">
                <div className="display-1 text-purple mb-3">⭐</div>
                <h5 className="card-title text-purple">Premium Service</h5>
                <p className="card-text">Experience unparalleled luxury with our dedicated staff ensuring your comfort at all times.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-5">
          <div className="col-lg-12">
            <div className="card card-purple">
              <div className="card-body p-5">
                <h2 className="text-purple text-center mb-4">Why Choose Serendip Waves?</h2>
                <div className="row">
                  <div className="col-md-6">
                    <ul className="list-unstyled">
                      <li className="mb-2">✓ Award-winning cruise experiences</li>
                      <li className="mb-2">✓ State-of-the-art facilities</li>
                      <li className="mb-2">✓ Multiple cabin options to suit every budget</li>
                      <li className="mb-2">✓ 24/7 customer support</li>
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <ul className="list-unstyled">
                      <li className="mb-2">✓ World-renowned entertainment</li>
                      <li className="mb-2">✓ Exclusive shore excursions</li>
                      <li className="mb-2">✓ Family-friendly activities</li>
                      <li className="mb-2">✓ Transparent USD pricing</li>
                    </ul>
                  </div>
                </div>
                <div className="text-center mt-4">
                  <Link to="/booking" className="btn btn-gradient-purple btn-lg">
                    Start Your Adventure
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
