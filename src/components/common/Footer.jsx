import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Footer = () => {
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <motion.footer 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={sectionVariants}
      className="bg-gray-900 text-gray-300 mt-auto"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-10">
        {/* Footer Content */}
        <motion.div 
          variants={sectionVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-12"
        >
          {/* About Section */}
          <motion.div variants={itemVariants}>
            <h3 className="text-xl font-semibold text-white mb-4">CarRental</h3>
            <p className="leading-relaxed">
              Your trusted partner for car rentals. Find the perfect car for your journey.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { to: "/about", label: "About Us" },
                { to: "/cars", label: "Our Cars" },
                { to: "/contact", label: "Contact Us" }
              ].map((link) => (
                <motion.li 
                  key={link.to}
                  variants={itemVariants}
                  whileHover={{ translateX: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Link
                    to={link.to}
                    className="hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={itemVariants}>
            <h4 className="text-lg font-semibold text-white mb-4">Contact Info</h4>
            <ul className="space-y-2">
              {[
                { type: "Email", value: "info@carrental.com", href: "mailto:info@carrental.com" },
                { type: "Phone", value: "(555) 123-4567", href: "tel:913645" },
                { type: "Address", value: "123 Car Street, Auto City" }
              ].map((contact) => (
                <motion.li 
                  key={contact.type}
                  variants={itemVariants}
                >
                  {contact.href ? (
                    <a href={contact.href} className="hover:text-white">
                      {contact.type}: {contact.value}
                    </a>
                  ) : (
                    <>{contact.type}: {contact.value}</>
                  )}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* Footer Bottom */}
        <motion.div 
          variants={itemVariants}
          className="mt-10 pt-8 border-t border-gray-800 text-center"
        >
          <p className="text-sm">
            © {new Date().getFullYear()} <span className="text-white">CarRental</span>. All rights reserved.
          </p>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;