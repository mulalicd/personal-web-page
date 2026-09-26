/**
 * profile.ts — single source of truth for every fact about Davor Mulalić
 * shown on the site or given to the chatbot (Commander M-7, project P-2).
 *
 * Sources, in order of authority (project CONSTITUTION.md P-2):
 *   1. LinkedIn profile export (2026-09-26)
 *   2. Davor_Mulalic_CV.pdf (private storage bucket `cv`)
 *   3. Director decisions recorded in CONSTITUTION.md P-3
 * Do not add a fact here that cannot be traced to one of them.
 *
 * Framework-free on purpose: imported by React (Vite) and by the Deno
 * Edge Function `chat-assistant`. Keep the `.ts` extension in imports.
 */
import type { Profile } from "../types/index.ts";

export const profile: Profile = {
  name: "Davor Mulalić",
  headline: "C-Level AI Leader",
  roleLine: "C-Level AI Leader • CEO & Managing Director",
  availability: "Available now for CEO / COO / Chief AI mandates",
  intro:
    "Expert in AI strategy, digital transformation, and building high-performing teams. " +
    "I bridge the gap between traditional leadership and AI innovation to create sustainable growth.",
  location: "Sarajevo, Bosnia and Herzegovina",
  email: "mulalic.davor@outlook.com",
  phoneDisplay: "+387 (0)61 787 331",
  phoneHref: "tel:+38761787331",
  linkedinUrl: "https://www.linkedin.com/in/davormulalic/",
  websiteUrl: "https://mulalic.ai-studio.wiki",

  industries: [
    "Education & EdTech",
    "Finance & Banking",
    "Manufacturing",
    "Micro Finance",
    "Business Consulting",
    "Sales",
    "NGO",
    "Project Management",
    "Holding",
    "Medical & Pharmaceutical",
  ],

  // Director decision 2026-09-26: €16M = operating income grew €12M → €16M (+33%).
  heroMetrics: [
    { value: "25+", label: "Years Experience", barPercentage: 85, color: "primary" },
    { value: "€16M", label: "Operating Income (+33%)", barPercentage: 95, color: "accent" },
    { value: "673%", label: "Net Profit Increase", barPercentage: 100, color: "purple" },
    { value: "€11M+", label: "Contracts Secured", barPercentage: 75, color: "amber" },
  ],

  // Director decision 2026-09-26 (Sprint 02): three eras, one orbit each in the hero.
  careerEras: [
    { id: "finance", name: "Finance & Operations", period: "1997 – 2013", color: "primary" },
    { id: "industry", name: "Industry & Global Business", period: "2013 – 2020", color: "purple" },
    { id: "education", name: "Education & AI Leadership", period: "2020 – today", color: "accent" },
  ],

  aboutParagraphs: [
    "Executive Leader and expert in AI Strategy and Digital Transformation with over 25 years of experience " +
      "driving growth, innovation, and operational excellence. In my roles as CEO and Managing Director, I have a " +
      "proven track record of delivering strong financial results, including growing operating income from €12M to " +
      "€16M (+33%) and a 90% boost in revenue.",
    "Leveraging my deep understanding of business needs and emerging technologies, I bridge traditional leadership " +
      "with AI-powered solutions, creating strategic roadmaps, implementing no-code AI tools, and enabling data-driven " +
      "decision-making that accelerates sustainable growth.",
    "A skilled negotiator and relationship builder, I have secured contracts exceeding €11M and cultivated long-term " +
      "partnerships with key clients and suppliers. My initiatives have driven a 50% increase in employee engagement, " +
      "demonstrating my ability to combine results-driven leadership with people-centered management.",
    "Beyond the boardroom, I am a devoted husband, proud father, and active philanthropist. Guided by personal values, " +
      "I believe that empathy, meaningful relationships, and giving back to the community are essential for lasting " +
      "professional and personal success. Today, I focus on helping organizations navigate the era of AI " +
      "transformation—turning strategic vision into tangible business outcomes while fostering human-centered, " +
      "future-ready leadership.",
  ],

  // Director decision 2026-09-26: 500+ = professionals led across the whole career.
  aboutMetrics: [
    { value: "25+", label: "Years Experience", barPercentage: 85, color: "primary" },
    { value: "€16M", label: "Operating Income", barPercentage: 95, color: "accent" },
    { value: "90%", label: "Revenue Boost", barPercentage: 90, color: "purple" },
    { value: "500+", label: "Professionals Led (career)", barPercentage: 70, color: "amber" },
  ],

  competencies: [
    "Leadership & Future-Ready Management",
    "AI Strategy & Digital Transformation",
    "Workforce Development & Team Building",
    "Business Strategy & Sales Development",
    "Financial & Production Management",
    "Project Management",
    "School Management",
    "Complex Problem Solving",
    "Strong Decision Making",
    "Client Acquisition",
    "New Market Penetration",
    "Creative Design & Innovation",
  ],

  education: [
    {
      degree: "Master of International Business",
      institution: "Cambridge International Business Study",
      period: "2015 – 2017",
    },
    {
      degree: "Doctor of Veterinary Medicine",
      institution: "Veterinary Faculty Sarajevo",
      period: "1991 – 1999",
    },
  ],

  awards: [
    {
      icon: "🏆",
      title: "Business Leader for Sustainable Development in BiH",
      period: "2025",
      detail:
        "Winner, Small Company category, thematic area “People” — Internationale Deutsche Schule Sarajevo. " +
        "Awarded by UNDP, the United Nations, the Embassy of Sweden and the Foreign Trade Chamber of BiH",
      color: "accent",
    },
    {
      icon: "🎯",
      title: "673% Net Profit Growth — €51K → €394K",
      period: "Jul 2018 – Jul 2019",
      detail: "CEO / Managing Director & COO, Blue Trade Ltd. (Krautz-Temax Group)",
      color: "primary",
    },
    {
      icon: "📈",
      title: "Operating Income €12M → €16M (+33%)",
      period: "Apr 2015 – Apr 2016",
      detail: "CEO (Assistant General Manager) / COO, Xylon Corporation Ltd. (Plena Group)",
      color: "purple",
    },
    {
      icon: "🤝",
      title: "€11M+ Contracts Secured",
      period: "Career total",
      detail: "Long-term partnerships with key clients and suppliers",
      color: "amber",
    },
  ],

  gallery: [
    {
      imageKey: "awardCeremony",
      alt: "Davor Mulalić receiving the Business Leaders for Sustainable Development in BiH 2025 award for Internationale Deutsche Schule Sarajevo",
      caption: "Business Leader for Sustainable Development in BiH 2025",
      detail: "Winner, Small Company category, thematic area “People” · UNDP · UN · Embassy of Sweden · Foreign Trade Chamber of BiH",
    },
    {
      imageKey: "awardSpeech",
      alt: "Davor Mulalić speaking at the Business Leaders for Sustainable Development in BiH 2025 award ceremony",
      caption: "Speech at the 2025 award ceremony",
      detail: "Business Leaders for Sustainable Development in BiH 2025",
    },
  ],

  // LinkedIn "Certifications" (2026-09-26).
  certifications: [
    { name: "ISO 9001:2015 Lead Implementer", detail: "Quality Management Systems" },
    { name: "HACCP (Food Safety) Auditor", detail: "Food Safety Management" },
    { name: "LEAN Management", detail: "Lean operations" },
    { name: "Sandler Training – Sales Mastery", detail: "Sales leadership" },
    { name: "Licensed Diving Instructor 1*", detail: "CMAS 1* and SSI Dive Master Instructor" },
  ],

  // Standards and methods implemented in organizations he led (CV).
  standards: [
    { name: "ISO 9001:2015", detail: "Quality Management Systems" },
    { name: "HACCP", detail: "Food Safety Management" },
    { name: "FSC", detail: "Forest Stewardship Council" },
    { name: "PEFC", detail: "Forest Certification" },
    { name: "ERP", detail: "Enterprise Resource Planning" },
    { name: "KAIZEN", detail: "Continuous Improvement" },
    { name: "LEAN", detail: "Lean Management" },
    { name: "IAS", detail: "International Accounting Standards" },
  ],

  // Director decision 2026-09-26: English "Proficiency", Latin "Intermediate".
  languages: [
    { language: "Bosnian / Croatian / Serbian", level: "C2 Native", strong: true },
    { language: "English", level: "Proficiency", strong: true },
    { language: "German", level: "A2", strong: false },
    { language: "French", level: "A1", strong: false },
    { language: "Latin", level: "Intermediate", strong: false },
  ],

  skills: [
    "AISBP Framework™",
    "AI Strategy & Business Integration",
    "Computer Literacy — MS Office, Visual Basic, SQL, HTML (creator of the “MS Excel in practice” course)",
  ],

  experience: [
    {
      title: "CEO / Managing Director",
      organization: "Internationale Deutsche Schule Sarajevo & International Montessori House",
      location: "Sarajevo, Bosnia and Herzegovina",
      period: "Jul 2020 – Present",
      icon: "building",
      era: "education",
      current: true,
      achievements: [
        "Led operational management for IDSS and IMH, aligning Thuringia and Baden-Württemberg curricula through AI-supported performance tracking",
        "Designed and executed strategic development plans, delivering 220% enrollment growth (80 → 256) and optimized workflows via predictive analytics",
        "Led recruitment and leadership development initiatives, increasing employee retention by 30% and workforce efficiency through AI-driven HR insights",
        "Conducted market research, enabling two new branches and a 40% expansion in service capacity",
        "Guided the school to the “Business Leader for Sustainable Development 2025” award — Bosnia and Herzegovina’s highest national recognition for sustainable leadership, awarded by UNDP, the United Nations, the Embassy of Sweden, and the Foreign Trade Chamber",
        "Streamlined operations to ensure full compliance with legal frameworks and institutional standards, supported by AI-based risk monitoring",
        "Implemented ISO 9001:2015 and HACCP standards, reducing non-conformance by 30% and improving safety and quality metrics",
      ],
      metrics: [
        { value: "€815K", label: "Revenue" },
        { value: "▲240%", label: "Revenue growth" },
        { value: "▲220%", label: "Enrollments" },
        { value: "53", label: "Team" },
      ],
      technologies: ["AI Analytics", "Predictive Tools", "LMS", "IB MYP", "ISO 9001:2015"],
    },
    {
      title: "Corporate Sales Manager",
      organization: "Bisnode / Dun & Bradstreet",
      location: "Bosnia and Herzegovina / Sweden",
      period: "Jul 2019 – Jul 2020",
      icon: "trending",
      era: "industry",
      achievements: [
        "Advised 80+ companies on commercial strategies, driving a 25% average revenue increase across the client portfolio",
        "Built and coached a high-performing sales team of 6, boosting efficiency by 40% and client acquisition by 30%",
        "Conducted market analysis, identifying opportunities that increased market penetration and product offerings by 15%",
        "Launched two innovative product lines, generating €84,000 in annual sales while reducing sales cycle time by 25%",
        "Managed relationships with 50+ key accounts, driving 44% revenue growth and strengthening long-term partnerships",
      ],
      metrics: [
        { value: "€438K", label: "Sales income" },
        { value: "▲44%", label: "Growth" },
        { value: "80+", label: "Clients advised" },
      ],
    },
    {
      title: "CEO / Managing Director & COO",
      organization: "Blue Trade Ltd. (Krautz-Temax Group)",
      location: "Bosnia and Herzegovina / Belgium",
      period: "Feb 2018 – Jul 2019",
      icon: "briefcase",
      era: "industry",
      achievements: [
        "Formulated and implemented strategic business plans for three divisions — Temax® (construction materials), Nitta Trans (time-temperature sensitive transport) and Vivit Bio Line (bottled water) — driving €394,000 in net profit (+673%) over 18 months",
        "Delivered market analysis and strategic insights that directly influenced a 15% expansion in regional market share",
        "Designed operational strategies, boosting efficiency by 25% and expanding operations into two new markets",
        "Enforced strict compliance frameworks, achieving 100% adherence to EU regulations",
        "Strengthened partnerships with stakeholders, facilitating €1.2M in joint ventures",
        "Directed financial oversight achieving 40% ROI across business units",
        "Mentored executive teams using tailored training programs, leading to a 20% increase in leadership effectiveness",
      ],
      metrics: [
        { value: "€394K", label: "Net profit" },
        { value: "▲673%", label: "Growth" },
        { value: "8", label: "Team" },
      ],
    },
    {
      title: "CEO (Assistant General Manager) / COO",
      organization: "Xylon Corporation Ltd. (Plena Group)",
      location: "Bosnia and Herzegovina / UK",
      period: "Apr 2015 – Feb 2018",
      icon: "building",
      era: "industry",
      achievements: [
        "Directed corporate strategy aligned with board directives, growing operating income from €12M to €16M (+33%) in one year",
        "Managed and coached a cross-functional team of over 190 employees across seven departments, improving productivity by 35%",
        "Engineered production strategies, leading to €15M annual revenue and a 20% reduction in production costs",
        "Achieved certification for ISO, FSC, and PEFC, raising operational compliance by 25%",
        "Reorganized procurement systems, saving €400,000 annually through strategic vendor negotiations",
        "Orchestrated ERP implementation, cutting lead times by 30% and improving inventory accuracy by 40%",
      ],
      metrics: [
        { value: "€16M", label: "Operating income" },
        { value: "▲33%", label: "Growth" },
        { value: "197", label: "Team" },
      ],
      technologies: ["ERP Systems", "ISO", "FSC", "PEFC", "LEAN"],
    },
    {
      title: "CEO (Assistant General Manager / Business Development Director) / COO",
      organization: "D.I.K. International Limited",
      location: "Nigeria — Abuja HQ, Warri, Port Harcourt, Calabar",
      period: "Jan 2013 – Apr 2015",
      icon: "trending",
      era: "industry",
      achievements: [
        "Streamlined organizational strategy, resulting in a 32% increase in annual revenue to €10M",
        "Enhanced HR practices, improving employee retention by 20% and building a high-performing culture",
        "Managed high-impact projects, achieving 95% on-time delivery rates",
        "Implemented innovative strategies generating €2.4M in additional revenue across subsidiaries",
        "Led KAIZEN initiatives, cutting operational waste by 30% and driving €1.5M in cost savings",
      ],
      metrics: [
        { value: "€10M", label: "Revenue" },
        { value: "▲32%", label: "Growth" },
        { value: "42", label: "Team" },
      ],
    },
    {
      title: "CEO / Head of Regional Office",
      organization: "LOK Microcredit Foundation",
      location: "Bosnia and Herzegovina",
      period: "Apr 2007 – Jan 2013",
      icon: "landmark",
      era: "finance",
      achievements: [
        "Directed operations for 16 regional offices, expanding the portfolio by 300% (€3M → €12M) and the client base by 364% (1,400 → 6,500)",
        "Expanded operations by establishing 12 new offices and recruiting 33 credit officers within two years",
        "Chaired the loan committee with a 97% repayment rate, minimizing defaults and maintaining portfolio quality",
        "Implemented ISO 9001:2000 standards, reducing documentation errors by 40%",
        "Built strategic client partnerships, generating €2M in long-term business opportunities",
      ],
      metrics: [
        { value: "€12M", label: "Portfolio" },
        { value: "▲300%", label: "Growth" },
        { value: "43", label: "Team" },
      ],
    },
    {
      title: "CEO / Managing Director",
      organization: "Hospitalija Trgovina d.o.o.",
      location: "Bosnia and Herzegovina / Croatia",
      period: "Dec 2003 – Apr 2007",
      icon: "heart",
      era: "finance",
      achievements: [
        "Established operational systems, achieving €2M annual revenue within three years from inception",
        "Designed strategic business plans, increasing operational efficiency by 35% and reducing overhead costs by 20%",
        "Recruited and mentored an 8-member team, driving a 50% increase in client acquisition",
        "Executed targeted marketing strategies, boosting net sales by 45% and reducing distribution costs by 25%",
        "Supervised the complete sales pipeline, increasing customer retention by 30% and winning three key tender contracts",
        "Secured exclusive dealership agreements with Becton Dickinson and Improve, increasing revenue by €400,000 annually",
      ],
      metrics: [
        { value: "€2M", label: "Operating income" },
        { value: "▲25%", label: "Growth" },
        { value: "8", label: "Team" },
      ],
    },
    {
      title: "Senior Operations Associate",
      organization: "USAID, KPMG — the largest business finance / banking project in the Balkans",
      location: "Bosnia and Herzegovina",
      period: "Mar 1997 – Dec 2003",
      icon: "landmark",
      era: "finance",
      achievements: [
        "Directed the Operations Unit and a team of 6 Operations Assistants, achieving a 25% improvement in efficiency",
        "Managed credit and loan approvals, disbursing €10M+ in funds with a 98% timeliness rate",
        "Implemented VBA / MS Access solutions reducing operational costs by €250,000 annually",
        "Delivered analytical reports to the US Ambassador on major funding allocations",
        "Designed IAS-driven policies, reducing accounting errors by 30%",
      ],
      metrics: [
        { value: "€10M+", label: "Disbursed" },
        { value: "€250K", label: "Annual savings" },
        { value: "6", label: "Team" },
      ],
    },
  ],

  volunteering: [
    {
      title: "Business Mentor / CMAS & SSI Dive Master Instructor",
      organization: "KVS Scuba",
      period: "Apr 2019 – Present",
      icon: "anchor",
      description:
        "Mentored 500+ diving enthusiasts in sports, commercial, and technical diving with a 100% certification success rate.",
      achievements: [
        "Advocated for water resource preservation through 80+ community events, reaching 7,000+ participants",
        "Developed therapeutic diving programs benefitting 50+ individuals with disabilities",
        "Led collaborative workshops with a team of 10 instructors, improving training quality scores by 20%",
      ],
      active: true,
    },
    {
      title: "Member of the Research Unit",
      organization: "Sharklab Malta",
      period: "2016 – Present",
      icon: "heart",
      description: "Contributing to marine conservation and research efforts.",
      achievements: [
        "Conducted species monitoring and public outreach programs",
        "Supporting conservation efforts that reduced harmful fishing practices",
      ],
      active: true,
    },
    {
      title: "President / Co-Founder",
      organization: "ELAN NGO – Youth-Sport-Environment",
      period: "Sep 2010 – Jun 2018",
      icon: "users",
      description: "Co-founded and led an organization promoting youth sports and environmental awareness.",
      achievements: [
        "Increased youth participation in sports by 40% and organized 15+ environmental events annually",
        "Designed engagement programs raising community involvement by 30%",
        "Secured €30,000 in funding for sustainability projects",
        "Partnered with local governments and schools benefitting 500+ participants annually",
      ],
      active: false,
    },
  ],

  interests: [
    { name: "Licensed Diving Instructor", detail: "CMAS 1* and SSI Dive Master Instructor" },
    { name: "Business Consulting", detail: "VISASQ / COLEMAN" },
  ],

  books: [
    {
      title: "AI for Business and Personal Excellence",
      subtitle: "Strategies for Growth and Productivity",
      description: "Applying AI strategies for business growth and personal productivity enhancement",
      topics: ["Business automation", "Personal productivity", "AI strategy"],
      coverKey: "aiBusinessExcellence",
    },
    {
      title: "The AI Teacher's Companion",
      subtitle: "Integrating Artificial Intelligence in Your Classroom",
      description: "Practical guide for educators to effectively integrate AI tools into daily teaching practice",
      topics: ["AI tools for teachers", "Lesson planning with AI", "Practical examples"],
      coverKey: "aiTeacherCompanion",
    },
    {
      title: "Mastering Prompt Engineering",
      subtitle: "A Practical Manual for Advanced Non-Coders",
      description:
        "Comprehensive guide to prompt engineering for educators and professionals without coding background",
      topics: ["Prompting techniques", "Educational applications", "Best practices"],
      coverKey: "promptEngineering",
    },
  ],

  aisbp: {
    summary:
      "An integrated executive decision system built on documented operational failure patterns, conservative " +
      "financial modeling, and structured AI reasoning frameworks.",
    websiteUrl: "https://aisbp.ai-studio.wiki/",
    book: {
      title: "AI Solved Business Problems",
      subtitle: "50 Real-World Challenges from 10 Industries — A Manager's Workbook",
      description:
        "Strategic field manual documenting 50 recurring operational breakdowns across 10 industries, including " +
        "documented failure modes and conservative ROI models. Part of the AISBP Framework™.",
      topics: ["Operational failure modes", "Conservative ROI models", "10 industries"],
      coverKey: "aiSolvedBusinessProblems",
    },
    stats: [
      { value: "€12M+", label: "Generated ROI" },
      { value: "47", label: "Pilot Implementations" },
      { value: "50", label: "Business Problems" },
      { value: "150", label: "Failure Modes" },
    ],
    products: [
      {
        title: "AISBP Framework™ – Complete System",
        price: "€100",
        description:
          "Includes:\n– AI Solved Business Problems (PDF)\n– AISBP Operational Intelligence System (Web App)\n– The Leadership Matrix™ Simulation",
        buttonText: "Secure Access via PayPal",
        link: "https://www.paypal.com/ncp/payment/TV29C24U3J5SE",
        featured: true,
      },
      {
        title: "AI Solved Business Problems – Strategic Field Manual (PDF)",
        price: "€30",
        description:
          "Structured documentation of 50 recurring operational breakdowns across 10 industries, including documented failure modes and conservative ROI models.",
        buttonText: "Purchase PDF",
        link: "https://www.paypal.com/ncp/payment/CKF79P6W4R93Q",
      },
      {
        title: "AISBP Operational Intelligence System – Interactive Access",
        price: "€50",
        description:
          "Interactive executive decision environment with indexed problems, structured prompts, and financial modeling tools.",
        buttonText: "Access Web Application",
        link: "https://www.paypal.com/ncp/payment/BH2JQCNN953EL",
      },
      {
        title: "The Leadership Matrix™ – Executive Simulation Environment",
        price: "€40",
        description:
          "Structured crisis simulation for senior operational leaders navigating capital constraints, stakeholder friction, and time-sensitive decision pressure.",
        buttonText: "Access Simulation",
        link: "https://www.paypal.com/ncp/payment/SVXDJYGJVHDLA",
      },
    ],
  },

  portfolioSummary:
    "Portfolio section: 20 AI-powered web application concepts and 40 advanced AI prompt engineering solutions " +
    "across 10+ industries (healthcare, banking, retail, manufacturing, education, energy, legal, HR, hospitality, " +
    "insurance, transport/logistics, finance and more).",

  testimonials: [
    {
      text: "Davor stands out as an exceptional leader who leads by example rather than just authority. He is deeply organized and inspiring, never hesitating to work alongside his team to reach a goal. His open-minded approach fostered a culture where my ideas were not only heard but championed, pushing me to exceed my own expectations. He combines vast global experience with a genuine willingness to learn from his employees—a rare and motivating trait.",
      author: "Bianca Badrov",
      organization: "Blue Trade Ltd.",
      role: "Digital Marketing Enthusiast",
    },
    {
      text: "A major asset to our holding company, Davor demonstrated an exceptional ability to resourcefully manage and prioritize multiple high-stakes projects simultaneously. His integrity, connectedness, and persistence went far beyond the call of duty. Because of his unwavering commitment and strategic foresight, a critical $1 billion project was successfully extended for another ten-year period.",
      author: "Daniel Kanu",
      organization: "DIK International Limited, Nigeria",
      role: "Managing Director",
    },
    {
      text: "Mr. Mulalić's greatest assets are his tireless work ethic and versatile skillset. He possesses a unique ability to bridge divides, working effectively with diverse ethnic groups in complex environments. Beyond his management capabilities, his technical skills in design and his uplifting sense of humor make him a unifying force within any organization.",
      author: "Laura Brodrick",
      organization: "Danish Refugee Council",
      role: "Project Manager",
    },
    {
      text: "Davor is an enthusiastic champion of the team's mission who takes immense pride in complex problem-solving. He is assertive yet conscientious, bringing a consistently positive attitude that drives results. His approach to business finance operations is characterized by a dedication to finding solutions where others see only obstacles.",
      author: "James A. Gomez",
      organization: "USAID-Business Finance",
      role: "Chief Operating Officer",
    },
    {
      text: "In handling the most complex management tasks, Mr. Mulalić has proven himself to be indispensable. He is a profoundly trustworthy professional with a collaborative team approach, yet he possesses the distinct capability to initiate and drive business independently. His strategic instincts allow him to navigate complex operational challenges with confidence.",
      author: "Stipe Hrkać",
      organization: "Hospitalija Trgovina d.o.o.",
      role: "Director",
    },
    {
      text: "I unreservedly recommend Mr. Davor Mulalić for any high-level management position. His tenure was defined by unwavering responsibility and reliability. He possesses a rare talent for efficiently optimizing human, material, and financial resources simultaneously, ensuring that organizational potential is fully maximized.",
      author: "Nusret Čaušević",
      organization: "LOK Microcredit Foundation",
      role: "General Director",
    },
  ],
};
