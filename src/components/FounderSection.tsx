const focusAreas = [
  'Building AI tools and systems for entrepreneurs',
  'Launching faith-driven and emotionally honest clothing',
  'Designing wellness stacks for people healing from addiction and burnout',
  'Laying the foundation for future housing and development projects',
];

const FounderSection = () => {
  return (
    <section id="founder" className="section-padding bg-secondary/30">
      <div className="container-main">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image placeholder */}
          <div className="order-2 lg:order-1">
            <div className="aspect-square max-w-md mx-auto lg:mx-0 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-sm" />
              <div className="absolute inset-4 border border-primary/30 rounded-sm" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="font-display text-4xl text-primary">G</span>
                  </div>
                  <p className="text-muted-foreground text-sm">Gustavo</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl mb-8">
              MEET THE <span className="text-gradient">BUILDER</span>
            </h2>

            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                I'm Gustavo, the mind behind Haven Systems.
              </p>

              <p>
                I grew up in chaos, addiction, and survival mode. For years, my life felt like 
                constant damage control—wrong environments, wrong influences, and a brain that 
                was always on fire.
              </p>

              <p>
                At 18, everything shifted. I found faith, started rebuilding my mind, and became 
                obsessed with systems—habits, structures, code, brands, and businesses that could 
                pull people out of the same darkness I was in.
              </p>

              <p>
                Now I work nights, build projects during the day, and treat my life like a lab: 
                testing ideas, building tools, starting brands, and learning how to turn pain 
                into strategy.
              </p>

              <p>
                Haven Systems is that lab—scaled. It's where my tech, business, creativity, and 
                calling all meet.
              </p>

              <p className="font-medium text-foreground">
                If you're trying to build something real out of a messy story, you're in the right place.
              </p>
            </div>

            <div className="mt-8">
              <p className="font-medium text-foreground mb-4">Right now I'm focused on:</p>
              <ul className="space-y-2">
                {focusAreas.map((area, index) => (
                  <li key={index} className="flex items-start gap-3 text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FounderSection;
