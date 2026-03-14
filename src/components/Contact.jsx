import { Mail, MapPin } from 'lucide-react';
import { useState } from 'react';

const initialForm = {
  name: '',
  email: '',
  company: '',
  message: '',
};

function Contact() {
  const [formData, setFormData] = useState(initialForm);
  const [status, setStatus] = useState({ type: '', text: '' });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus({
        type: 'error',
        text: 'Please complete Name, Email, and Message before submitting.',
      });
      return;
    }

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    if (!isValidEmail) {
      setStatus({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    setStatus({
      type: 'success',
      text: 'Message sent successfully (placeholder). Backend integration can be added next.',
    });
    setFormData(initialForm);
  };

  return (
    <section id="contact" className="section section-contact" aria-labelledby="contact-title">
      <div className="container contact-grid">
        <div className="contact-content" data-reveal>
          <p className="eyebrow">Get in Touch</p>
          <h2 id="contact-title">Let's Discuss<br />Your Project</h2>
          <p className="contact-intro">
            Whether you're a consultant, contractor, or developer — StrucLab can provide
            specialist structural engineering support tailored to your project needs.
          </p>
          <div className="contact-meta">
            <a className="contact-meta-item" href="mailto:info@struclab.com.au">
              <span className="contact-meta-icon"><Mail size={15} aria-hidden="true" /></span>
              <span>info@struclab.com.au</span>
            </a>
            <div className="contact-meta-item">
              <span className="contact-meta-icon"><MapPin size={15} aria-hidden="true" /></span>
              <span>Perth, Australia</span>
            </div>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit} noValidate data-reveal>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="name">Name <span className="required-mark">*</span></label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="email">Email <span className="required-mark">*</span></label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="company">Company / Organisation</label>
            <input
              id="company"
              name="company"
              type="text"
              autoComplete="organization"
              placeholder="Optional"
              value={formData.company}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label htmlFor="message">Message <span className="required-mark">*</span></label>
            <textarea
              id="message"
              name="message"
              rows="5"
              placeholder="Tell us about your project or enquiry…"
              value={formData.message}
              onChange={handleChange}
              required
            />
          </div>

          <button className="btn btn-primary form-submit" type="submit">
            Send Enquiry
          </button>

          {status.text && (
            <p
              className={`form-status ${status.type === 'error' ? 'error' : 'success'}`}
              role="status"
              aria-live="polite"
            >
              {status.text}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}

export default Contact;
