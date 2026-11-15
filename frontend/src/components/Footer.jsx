import React from 'react';
import { Github, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full py-4 border-t border-[var(--color-brand-border)] bg-[var(--color-brand-dark)]/90 backdrop-blur-sm z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[var(--color-brand-text-secondary)]">
        <div className="font-medium">
          © {new Date().getFullYear()} <span className="text-[var(--color-brand-text-primary)] font-semibold">CodeForge</span>. Made with <span className="text-[var(--color-brand-orange)]">♥</span> by <a href="https://github.com/manishcodess" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-brand-text-primary)] transition-colors underline decoration-[var(--color-brand-border)] hover:decoration-[var(--color-brand-orange)]">Manish Kr. Sharma</a>
        </div>
        <div className="flex items-center space-x-6">
          <a 
            href="https://github.com/manishcodess" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center hover:text-[var(--color-brand-orange)] transition-colors"
          >
            <Github className="mr-1.5 w-3.5 h-3.5" />
            GitHub
          </a>
          <a 
            href="mailto:manish.sharma.iiit@gmail.com" 
            className="flex items-center hover:text-[var(--color-brand-orange)] transition-colors"
          >
            <Mail className="mr-1.5 w-3.5 h-3.5" />
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

