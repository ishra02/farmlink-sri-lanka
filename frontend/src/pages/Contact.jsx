
import { useState } from 'react';

function Contact() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
    event.currentTarget.reset();
  }

  return (
    <main className="content-page">
      <section className="page-banner">
        <span className="section-kicker">WE ARE HERE TO HELP</span>
        <h1>Contact FarmLink</h1>
        <p>Questions about products or interested in joining as a farmer?</p>
      </section>

      <section className="contact-section">
        <div className="contact-intro">
          <span className="section-kicker">LET'S CONNECT</span>
          <h2>Let's Grow Together</h2>
          <p>
            Send us a message using the form. Online message delivery
            will be connected when the backend is implemented.
          </p>

          <div className="contact-detail">
            <span>📍</span>
            <div>
              <strong>Across Sri Lanka</strong>
              <p>Connecting farmers and communities.</p>
            </div>
          </div>

          <div className="contact-detail">
            <span>🌱</span>
            <div>
              <strong>Farmer Partnerships</strong>
              <p>Interested in listing farm products?</p>
            </div>
          </div>

          <div className="contact-detail">
            <span>🛒</span>
            <div>
              <strong>Customer Enquiries</strong>
              <p>Questions about shopping and produce.</p>
            </div>
          </div>
        </div>

        <div className="contact-form-card">
          <h3>Send Us a Message</h3>
          <p className="contact-form-description">
            Complete the details below.
          </p>

          {submitted && (
            <p className="form-success" role="status">
              Thank you! Your form passed validation.
              Message delivery is not connected yet.
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <label>
              Your Name
              <input name="name" required placeholder="Enter your name" />
            </label>

            <label>
              Email Address
              <input
                name="email"
                type="email"
                required
                placeholder="Enter your email"
              />
            </label>

            <label>
              Subject
              <select name="subject" defaultValue="" required>
                <option value="" disabled>Select a subject</option>
                <option value="product">Product enquiry</option>
                <option value="farmer">Farmer partnership</option>
                <option value="order">Order enquiry</option>
                <option value="other">Other</option>
              </select>
            </label>

            <label>
              Your Message
              <textarea
                name="message"
                rows="4"
                required
                placeholder="How can we help?"
              />
            </label>

            <button className="contact-submit" type="submit">
              Send Message →
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

export default Contact;
