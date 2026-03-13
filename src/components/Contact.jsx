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

    // Placeholder submit flow to be replaced by Formspree or Cloudflare Worker.
    console.log('Contact form submission:', formData);
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
          <p className="eyebrow">Contact</p>
          <h2 id="contact-title">Contact</h2>
          <p>
            If you would like to discuss a project or explore how StrucLab can assist your team,
            please get in touch.
          </p>
          <div className="contact-meta">
            <p>
              <Mail size={16} aria-hidden="true" />
              <span>Email: fadi@struclab.com</span>
            </p>
            <p>
              <MapPin size={16} aria-hidden="true" />
              <span>Location: Perth, Australia</span>
            </p>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit} noValidate data-reveal>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="company">Company</label>
          <input
            id="company"
            name="company"
            type="text"
            autoComplete="organization"
            value={formData.company}
            onChange={handleChange}
          />

          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            rows="5"
            value={formData.message}
            onChange={handleChange}
            required
          />

          <button className="btn btn-primary form-submit" type="submit">
            Send Message
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
