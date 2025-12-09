const bulletPoints = [
  'AI tools that automate work',
  'Shops and brands that feel premium and human',
  'Supplements and routines for mental clarity',
  'Content and stories that actually mean something',
  'Future housing and development projects for people who need a way out',
];

const WhatIsSection = () => {
  return (
    <section id="what-is" className="section-padding bg-background">
      <div className="container-main max-w-4xl">
        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-center mb-12">
          WHAT IS <span className="text-gradient">HAVEN SYSTEMS</span>?
        </h2>

        <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
          <p>
            Haven Systems is my personal ecosystem of brands, tools, and projects.
          </p>

          <p>
            I'm not just running an agency. I'm building a network of systems that help people 
            move from survival mode to strategy mode—using technology, structure, creativity, and faith.
          </p>

          <p className="font-medium text-foreground">
            Everything I build lives under Haven Systems:
          </p>

          <ul className="space-y-3 pl-4">
            {bulletPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>

          <p>
            This isn't a random mix of businesses. It's one mission, expressed in different ways.
          </p>
        </div>

        {/* Mission callout */}
        <div className="mt-12 p-6 border border-primary/30 rounded-sm bg-primary/5">
          <p className="text-sm uppercase tracking-wider text-primary mb-2 font-medium">Mission</p>
          <p className="text-xl md:text-2xl font-display text-foreground">
            TURN PAINFUL STORIES INTO POWERFUL SYSTEMS.
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhatIsSection;
