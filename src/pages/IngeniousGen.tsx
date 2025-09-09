import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { 
  Briefcase, 
  Code, 
  Trophy, 
  Award, 
  Users, 
  Rocket, 
  ChevronRight,
  Sparkles,
  Building2,
  GraduationCap,
  Target,
  Network,
  TrendingUp,
  Zap,
  Star,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TimelineItem {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  highlights: string[];
  color: string;
}

const timelineData: TimelineItem[] = [
  {
    id: 1,
    title: "Estágios em Empresas Parceiras",
    description: "Os alunos do Ingenious Gen têm a oportunidade de realizar estágios em empresas parceiras durante sua formação, participando em projetos reais e ganhando experiência prática em seus campos de estudo.",
    icon: <Briefcase className="w-6 h-6" />,
    highlights: [
      "Projetos reais de mercado",
      "Mentoria profissional",
      "Networking empresarial"
    ],
    color: "from-purple-500 to-indigo-500"
  },
  {
    id: 2,
    title: "Bootcamps Intensivos",
    description: "O Ingenious Gen oferece Bootcamps intensivos e práticos sobre as áreas de aprendizagem, proporcionando aos alunos a oportunidade de aprimorar suas habilidades e adquirir conhecimentos específicos de forma rápida e eficaz.",
    icon: <Code className="w-6 h-6" />,
    highlights: [
      "Aprendizado acelerado",
      "Prática hands-on",
      "Tecnologias atuais"
    ],
    color: "from-indigo-500 to-blue-500"
  },
  {
    id: 3,
    title: "Concursos e Desafios",
    description: "Os alunos do Ingenious Gen participam em concursos e desafios que estimulam a criatividade, a inovação e o desenvolvimento de soluções inovadoras, preparando-os para o mercado de trabalho.",
    icon: <Trophy className="w-6 h-6" />,
    highlights: [
      "Competições nacionais",
      "Prêmios e reconhecimento",
      "Desenvolvimento criativo"
    ],
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: 4,
    title: "Formação Complementar e Certificação",
    description: "O Ingenious Gen oferece módulos extracurriculares com certificação profissional e de universidade, aprofundando os conhecimentos dos alunos e aumentando suas chances de sucesso profissional.",
    icon: <Award className="w-6 h-6" />,
    highlights: [
      "Certificação universitária",
      "Módulos especializados",
      "Validação internacional"
    ],
    color: "from-cyan-500 to-emerald-500"
  },
  {
    id: 5,
    title: "Exposição de Projetos e Networking",
    description: "Os alunos têm a oportunidade de apresentar seus projetos a profissionais da área, recebendo feedback valioso e conectando-se com líderes da indústria, abrindo portas para novas oportunidades.",
    icon: <Users className="w-6 h-6" />,
    highlights: [
      "Showcase para indústria",
      "Feedback de especialistas",
      "Conexões profissionais"
    ],
    color: "from-emerald-500 to-green-500"
  },
  {
    id: 6,
    title: "Apoio à Colocação e Empreendedorismo",
    description: "O Ingenious Gen conecta os alunos com empresas para oportunidades de colocação e oferece suporte para o desenvolvimento de ideias e a criação de novos negócios. O objetivo é ajudar os alunos a construir carreiras de sucesso e a contribuir para a economia.",
    icon: <Rocket className="w-6 h-6" />,
    highlights: [
      "Placement garantido",
      "Incubadora de startups",
      "Mentoria empresarial"
    ],
    color: "from-green-500 to-purple-500"
  }
];

const IngeniousGen = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeItem, setActiveItem] = useState<number | null>(null);

  // Mouse tracking for parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 bg-gradient-animated animate-gradient" />
      
      {/* Dark overlay for better contrast */}
      <div className="fixed inset-0 bg-black/40" />
      
      {/* Floating particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 bg-white/20 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight 
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight
            }}
            transition={{
              duration: Math.random() * 30 + 20,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        ))}
      </div>

      {/* Parallax background elements */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          transform: `translate(${mousePosition.x * 0.03}px, ${mousePosition.y * 0.03}px)`,
        }}
      >
        <div className="absolute top-40 left-20 h-72 w-72 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 right-20 h-96 w-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[40rem] w-[40rem] bg-cyan-500/5 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10">
        <Header />
        
        {/* Hero Section */}
        <section className="relative px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 ring-1 ring-white/20 backdrop-blur-sm mb-6">
                <GraduationCap className="h-4 w-4 text-purple-300" />
                <span className="text-sm text-white">Programa de Formação Profissional</span>
              </div>
              
              {/* Title */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight mb-6">
                <span className="block text-white font-medium tracking-tighter">Ingenious Gen</span>
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-cyan-300 to-emerald-300 font-medium tracking-tighter">
                  Formação e Experiência Real
                </span>
              </h1>
              
              {/* Description */}
              <p className="text-lg text-slate-200/90 max-w-3xl mx-auto mb-8">
                Transformamos talento em expertise através de um programa completo que combina 
                formação acadêmica, experiência prática e conexões com a indústria.
              </p>

              {/* Stats */}
              <div className="flex flex-wrap items-center justify-center gap-6 mb-12">
                <div className="inline-flex items-center gap-3 rounded-full bg-black/30 px-5 py-2.5 ring-1 ring-white/15">
                  <Building2 className="h-5 w-5 text-purple-300" />
                  <div className="text-left">
                    <span className="block text-white font-semibold">500+</span>
                    <span className="text-xs text-slate-300/80">Empresas Parceiras</span>
                  </div>
                </div>
                <div className="inline-flex items-center gap-3 rounded-full bg-black/30 px-5 py-2.5 ring-1 ring-white/15">
                  <Star className="h-5 w-5 text-amber-300" />
                  <div className="text-left">
                    <span className="block text-white font-semibold">95%</span>
                    <span className="text-xs text-slate-300/80">Taxa de Colocação</span>
                  </div>
                </div>
                <div className="inline-flex items-center gap-3 rounded-full bg-black/30 px-5 py-2.5 ring-1 ring-white/15">
                  <TrendingUp className="h-5 w-5 text-emerald-300" />
                  <div className="text-left">
                    <span className="block text-white font-semibold">10k+</span>
                    <span className="text-xs text-slate-300/80">Alunos Formados</span>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white border-0 shadow-lg"
                >
                  Inscreva-se Agora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                >
                  Saiba Mais
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="relative px-4 sm:px-6 lg:px-8 pb-32">
          <div className="max-w-5xl mx-auto">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 ring-1 ring-white/20 backdrop-blur-sm mb-4">
                <Target className="h-4 w-4 text-cyan-300" />
                <span className="text-sm text-white">Jornada de Transformação</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
                Seu Caminho para o Sucesso
              </h2>
            </motion.div>

            {/* Timeline */}
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-purple-500/50 via-cyan-500/50 to-emerald-500/50" />
              
              {/* Timeline Items */}
              {timelineData.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * (index + 1) }}
                  className={cn(
                    "relative flex items-center mb-20",
                    index % 2 === 0 ? "justify-start" : "justify-end"
                  )}
                >
                  {/* Content Card */}
                  <div 
                    className={cn(
                      "relative w-full lg:w-5/12",
                      index % 2 === 0 ? "lg:pr-12 text-left" : "lg:pl-12 text-right"
                    )}
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      onHoverStart={() => setActiveItem(item.id)}
                      onHoverEnd={() => setActiveItem(null)}
                      className="relative bg-white/5 rounded-3xl p-6 ring-1 ring-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-300"
                    >
                      {/* Gradient overlay */}
                      <div className={cn(
                        "absolute -inset-px rounded-3xl bg-gradient-to-r opacity-0 transition-opacity duration-300",
                        item.color,
                        activeItem === item.id && "opacity-20"
                      )} />
                      
                      {/* Icon */}
                      <div className={cn(
                        "inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-r text-white mb-4",
                        item.color
                      )}>
                        {item.icon}
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">
                        {item.title}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-sm text-slate-200/80 mb-4 leading-relaxed">
                        {item.description}
                      </p>
                      
                      {/* Highlights */}
                      <div className={cn(
                        "space-y-2",
                        index % 2 !== 0 && "text-right"
                      )}>
                        {item.highlights.map((highlight, i) => (
                          <div 
                            key={i} 
                            className={cn(
                              "inline-flex items-center gap-2 text-xs",
                              index % 2 === 0 ? "justify-start" : "justify-end"
                            )}
                          >
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                            <span className="text-slate-300">{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                  
                  {/* Timeline Node */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
                    <motion.div
                      animate={{
                        scale: activeItem === item.id ? 1.2 : 1,
                        rotate: activeItem === item.id ? 180 : 0
                      }}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        "w-6 h-6 rounded-full bg-gradient-to-r ring-4 ring-black/40",
                        item.color
                      )}
                    >
                      <div className="w-full h-full rounded-full animate-ping bg-white/30" />
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Final CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-center mt-20"
            >
              <div className="relative bg-gradient-to-r from-purple-500/10 to-emerald-500/10 rounded-3xl p-12 ring-1 ring-white/10 backdrop-blur-xl">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-emerald-500 px-4 py-2 text-white shadow-lg">
                    <Zap className="h-4 w-4" />
                    <span className="text-sm font-medium">Comece Sua Jornada</span>
                  </div>
                </div>
                
                <h3 className="text-2xl font-semibold text-white mb-4 tracking-tight">
                  Pronto para Transformar seu Futuro?
                </h3>
                <p className="text-slate-200/80 mb-6 max-w-2xl mx-auto">
                  Junte-se a milhares de profissionais que já transformaram suas carreiras através 
                  do programa Ingenious Gen. Vagas limitadas para a próxima turma.
                </p>
                
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Button 
                    size="lg"
                    className="bg-white text-purple-600 hover:bg-white/90 shadow-lg"
                  >
                    <Network className="mr-2 h-4 w-4" />
                    Fale com um Consultor
                  </Button>
                  <Button 
                    size="lg"
                    variant="ghost"
                    className="text-white hover:bg-white/10"
                  >
                    Download do Programa
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default IngeniousGen;