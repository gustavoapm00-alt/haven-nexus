const projects = [
  {
    title: 'Building: AI Sales Research Agent',
    description: 'An AI agent that researches leads, pulls key signals, and gives you a one-page brief before every call.',
    status: 'In active development',
    statusColor: 'bg-green-500/20 text-green-400',
  },
  {
    title: 'Testing: PTSD-Friendly Supplement Stack',
    description: 'Experimenting with mind–body supplements and routines designed for focus, recovery, and emotional regulation.',
    status: 'R&D phase',
    statusColor: 'bg-yellow-500/20 text-yellow-400',
  },
  {
    title: 'Planning: Testimony Short Film Series',
    description: 'A short-film format to document real stories of addiction, faith, depression, and recovery.',
    status: 'Pre-production',
    statusColor: 'bg-blue-500/20 text-blue-400',
  },
];

const LabSection = () => {
  return (
    <section id="lab" className="section-padding bg-secondary/30">
      <div className="container-main">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl mb-4">
            INSIDE THE <span className="text-gradient">HAVEN LAB</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Notes, experiments, and builds in progress.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.title}
              className="card-glow p-8 rounded-sm border border-border/50 hover:border-primary/30 transition-all duration-500"
            >
              <span className={`inline-block px-3 py-1 text-xs font-medium rounded-sm mb-4 ${project.statusColor}`}>
                {project.status}
              </span>

              <h3 className="font-display text-xl text-foreground mb-3">
                {project.title}
              </h3>

              <p className="text-muted-foreground text-sm leading-relaxed">
                {project.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Want early access to my builds?
          </p>
          <a href="#email-capture" className="text-primary hover:underline font-medium">
            Join the Haven list →
          </a>
        </div>
      </div>
    </section>
  );
};

export default LabSection;
