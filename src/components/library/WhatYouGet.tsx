import { FileJson, BookOpen, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const items = [
  {
    icon: FileJson,
    title: 'Workflow File',
    description: 'Import-ready n8n JSON workflows built for practical use.',
    stat: '1 JSON workflow',
  },
  {
    icon: BookOpen,
    title: 'Deployment Guide',
    description: 'Step-by-step setup with required credentials and configuration notes.',
    stat: 'Checklist-style setup',
  },
  {
    icon: Lock,
    title: 'Secure Delivery',
    description: 'Private downloads with time-limited links and account access.',
    stat: 'Time-limited links',
  },
];

const WhatYouGet = () => {
  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">What You Get</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="card-panel p-6 text-center"
          >
            <div className="relative w-14 h-14 mx-auto mb-5">
              {/* Orbital ring */}
              <div className="absolute inset-0 border border-primary/10 rounded-full" />
              <div className="absolute -inset-2 border border-dashed border-primary/5 rounded-full" />
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
            </div>
            <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
            <span className="inline-block px-3 py-1 text-xs font-medium bg-muted rounded-full text-muted-foreground">
              {item.stat}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default WhatYouGet;
