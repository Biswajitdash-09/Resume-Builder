
import React from 'react';
import { Heart, Mail, Github, Linkedin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-background border-t border-border mt-8">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500 fill-red-500" />
            <span>by Biswajit Dash</span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <a 
                href="mailto:biswajitdash929@gmail.com" 
                className="hover:text-foreground transition-colors"
              >
                biswajitdash929@gmail.com
              </a>
            </div>
            
            <div className="flex items-center gap-2">
              <Github className="h-4 w-4" />
              <a 
                href="https://github.com/Biswajitdash-09" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                GitHub
              </a>
            </div>
            
            <div className="flex items-center gap-2">
              <Linkedin className="h-4 w-4" />
              <a 
                href="https://www.linkedin.com/in/biswajitdash09" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
