import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

const team = [
  { name: 'Alan Mugambi', role: 'Chief Executive Officer', bio: 'Full-Stack Engineer | Systems Architect | Product Builder | Software Architect | Innovation-Driven Founder' },
  { name: 'Brian Mutua', role: 'Chief Technology Officer', bio: 'Full-stack engineer and systems architect. Previously led engineering at a leading Nairobi startup.' },
  { name: 'Cynthia Wambui', role: 'Head of Operations', bio: 'Event management veteran with experience running 200+ large-scale events across Kenya and Uganda.' },
  { name: 'Gloria Wanja', role: 'Head of Marketing', bio: 'Brand strategist and digital marketer focused on growing Kenya\'s creative economy.' },
]

const values = [
  { title: 'Accessibility', desc: 'We believe every Kenyan deserves seamless access to great events, regardless of where they are.', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg> },
  { title: 'Security', desc: 'Every transaction on Jambo Tickets is secured end-to-end, with unique QR codes to prevent fraud.', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg> },
  { title: 'Transparency', desc: 'Clear pricing, honest fees, real-time analytics for organisers. No hidden surprises.', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
]

export default function About() {
  return (
    <>
      <Helmet>
        <title>About Us — Jambo Tickets</title>
        <meta name="description" content="Learn about Jambo Tickets — Kenya's leading event ticketing platform built to connect people with extraordinary experiences." />
      </Helmet>

      {/* Hero */}
      <section className="bg-navy py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-extrabold text-white mb-5"
          >
            Built for Kenya's <span className="text-crimson">Event Ecosystem</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-gray-300 text-lg leading-relaxed"
          >
            Jambo Tickets was founded in Nairobi with a single mission: to make discovering and attending Kenya's best events as seamless as possible — for fans and organisers alike.
          </motion.p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="text-crimson text-xs font-bold uppercase tracking-widest">Our Story</span>
              <h2 className="text-3xl font-bold text-navy mt-2 mb-5">From a Problem to a Platform</h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                It started at a sold-out concert in Nairobi where our founders spent two hours in a queue only to find the gate system had crashed. Tickets were lost, money was wasted, and the experience was ruined.
              </p>
              <p className="text-text-secondary leading-relaxed mb-4">
                That frustration became the seed of Jambo Tickets. We set out to build Africa's most reliable ticketing infrastructure — one that works on a 2G connection, integrates natively with M-Pesa, and puts both organisers and attendees first.
              </p>
              <p className="text-text-secondary leading-relaxed">
                Today we partner with hundreds of event organisers across Kenya, from grassroots community events to major international concerts, processing millions of shillings in ticket sales every month.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="bg-background rounded-2xl p-8 border border-border grid grid-cols-2 gap-6">
              {[
                { value: '2020', label: 'Founded' },
                { value: '1,200+', label: 'Events' },
                { value: 'KES 500M+', label: 'Processed' },
                { value: '18 Cities', label: 'Covered' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-extrabold text-navy">{stat.value}</div>
                  <div className="text-text-secondary text-sm mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-heading mb-3">What We Stand For</h2>
            <p className="text-text-secondary">Three principles guide everything we build.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-7">
            {values.map((v, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="card p-6">
                <div className="w-12 h-12 bg-crimson/10 text-crimson rounded-xl flex items-center justify-center mb-4">{v.icon}</div>
                <h3 className="font-bold text-navy mb-2">{v.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-heading mb-3">The Team</h2>
            <p className="text-text-secondary">A small, focused team passionate about Kenya's creative economy.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="card p-5 text-center hover:shadow-card-hover transition-all duration-200">
                <div className="w-16 h-16 bg-navy rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-white">{member.name[0]}</span>
                </div>
                <h4 className="font-bold text-navy text-sm">{member.name}</h4>
                <p className="text-crimson text-xs font-medium mt-0.5 mb-2">{member.role}</p>
                <p className="text-text-secondary text-xs leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-navy">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-gray-400 mb-8">Browse events or list yours on Jambo Tickets today.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/events" className="bg-crimson hover:bg-crimson-hover text-white font-semibold px-7 py-3 rounded-lg transition-colors">
              Browse Events
            </Link>
            <Link to="/register" className="bg-white/10 hover:bg-white/20 text-white font-semibold px-7 py-3 rounded-lg transition-colors">
              List Your Event
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
