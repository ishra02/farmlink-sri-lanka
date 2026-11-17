
import { Link } from 'react-router';

function About() {
  return (
    <main className="content-page">
      <section className="page-banner">
        <span className="section-kicker">OUR STORY</span>
        <h1>Growing Together, Naturally</h1>
        <p>Connecting Sri Lankan farmers with the communities they feed.</p>
      </section>

      <section className="farm-about">
        <div className="about-photo">
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=85"
            alt="Green fields and agricultural land"
          />
        </div>

        <div className="about-content">
          <span className="section-kicker">ABOUT FARMLINK</span>
          <h2>Closer Connections. Fresher Food.</h2>

          <p>
            FarmLink is an agricultural marketplace concept designed
            to help Sri Lankan farmers showcase their produce to customers.
          </p>

          <p>
            Our goal is to make local produce easier to discover and
            help customers learn more about the farmers and districts
            behind their food.
          </p>

          <h3>Our Mission</h3>
          <p>
            Build a convenient connection between farming communities
            and people looking for fresh produce.
          </p>

          <Link className="about-button" to="/products">
            Explore Our Products →
          </Link>
        </div>
      </section>

      <section className="mission-cards">
        <article>
          <span>🌱</span>
          <h2>Freshness</h2>
          <p>Make local fruits and vegetables easier to discover.</p>
        </article>

        <article>
          <span>🤝</span>
          <h2>Community</h2>
          <p>Help customers discover local farming communities.</p>
        </article>

        <article>
          <span>🌾</span>
          <h2>Opportunity</h2>
          <p>Create a platform where farmers can showcase their products.</p>
        </article>
      </section>
    </main>
  );
}

export default About;
