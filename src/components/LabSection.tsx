import ScrollReveal from './ScrollReveal';
import StaggerContainer, { StaggerItem } from './StaggerContainer';

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
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl mb-4">
              INSIDE THE <span className="text-gradient">AERELION LAB</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Notes, experiments, and builds in progress.
            </p>
          </div>
        </ScrollReveal>

        <StaggerContainer className="grid md:grid-cols-3 gap-6" staggerDelay={0.1}>
          {projects.map((project) => (
            <StaggerItem key={project.title}>
              <div className="card-glass p-8 rounded-sm transition-all duration-500 h-full">
                <span className={`inline-block px-3 py-1 text-xs font-medium rounded-sm mb-4 backdrop-blur-sm ${project.statusColor}`}>
                  {project.status}
                </span>

                <h3 className="font-display text-xl text-foreground mb-3">
                  {project.title}
                </h3>

                <p className="text-muted-foreground text-sm leading-relaxed">
                  {project.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <ScrollReveal delay={0.2}>
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Want early access to my builds?
            </p>
            <a href="#email-capture" className="text-primary hover:underline font-medium">
              Join the AERELION list →
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default LabSection;
