import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { 
  Sparkles, Lightbulb, ArrowUpRight, Search
} from "lucide-react";
import { PortfolioFilter } from "./PortfolioFilter";
import { PortfolioDetailCard } from "./PortfolioDetailCard";
import { getPortfolioImage } from "./portfolioImages";
import { FloatingCard } from "./FloatingCard";

// Complete list of 20 web apps - shuffled by industry
const webApps = [
  { id: 1, name: "Sales Lead Scoring AI", industry: "Sales", purpose: "Lead prioritization", problem: "Sales teams waste time on contacts that will never buy.", solution: "Automatically ranks leads based on purchase likelihood using CRM and behavioral signals.", value: "Cuts sales qualification time ~60%; improves conversion 15–30%.", techStack: ["Python", "Scikit-learn", "FastAPI", "React", "PostgreSQL", "Redis"] },
  { id: 2, name: "Clinic Appointment Optimizer", industry: "Healthcare", purpose: "Appointment scheduling", problem: "Patients wait too long because scheduling isn't optimized.", solution: "AI reallocates appointments and fills unused time slots automatically.", value: "Reduces patient waiting 30–70%; increases utilization.", techStack: ["TypeScript", "Next.js", "Node.js", "MongoDB", "Google OR-Tools"] },
  { id: 3, name: "Credit Risk Automation Engine", industry: "Banking", purpose: "Credit decisioning", problem: "Banks manually process credit applications.", solution: "Automated credit scoring with transparent explanations.", value: "Loan processing time down 60–90%; bad loans reduced 10–20%.", techStack: ["Python", "XGBoost", "SHAP", "Django", "PostgreSQL", "Docker"] },
  { id: 4, name: "Enterprise Churn Prevention Hub", industry: "SaaS / IT", purpose: "Customer retention", problem: "Companies lose users because they don't know when customers are leaving.", solution: "Predicts churn and orchestrates automated retention workflows.", value: "Churn reduction 20–40%; revenue saved.", techStack: ["Python", "TensorFlow", "React", "Node.js", "Kafka", "Snowflake"] },
  { id: 5, name: "Hotel Revenue Dynamic Pricing", industry: "Hospitality", purpose: "Dynamic pricing", problem: "Hotels lose money because prices aren't dynamic.", solution: "Real-time pricing based on demand and competitive signals.", value: "RevPAR increase 5–20%; higher profitability.", techStack: ["Python", "Prophet", "FastAPI", "React", "Redis", "AWS Lambda"] },
  { id: 6, name: "Pharmacy Demand Forecaster", industry: "Pharmacy", purpose: "Stock management", problem: "Pharmacies run out of medications or have excess that expires.", solution: "Forecasts drug demand and recommends optimal purchase orders.", value: "Stock-outs reduced 60%; expired inventory down 25–50%.", techStack: ["Python", "ARIMA", "LightGBM", "Flask", "MySQL", "Tableau"] },
  { id: 7, name: "Production Line AI Monitor", industry: "Manufacturing", purpose: "Line optimization", problem: "Production lines have expensive downtime.", solution: "Real-time anomaly detection and process analytics.", value: "Downtime down 30–60%; higher throughput.", techStack: ["Python", "PyTorch", "Apache Kafka", "Grafana", "InfluxDB", "Docker"] },
  { id: 8, name: "Smart Accounting Validator", industry: "Finance", purpose: "Transaction audit", problem: "Manual validation of financial data takes days.", solution: "Automatic validation of bookkeeping entries and policy compliance.", value: "Manual review down 70%; lower error rate.", techStack: ["Python", "Pandas", "OpenAI API", "React", "PostgreSQL", "Airflow"] },
  { id: 9, name: "Route & Load Optimizer", industry: "Transport / Logistics", purpose: "Route planning", problem: "Trucks waste fuel and time on poor routes.", solution: "Optimizes delivery routes and vehicle load utilization.", value: "Fuel cost down 10–25%; faster cycle times.", techStack: ["Python", "Google OR-Tools", "React", "Mapbox", "PostgreSQL", "Celery"] },
  { id: 10, name: "Insurance Fraud Intelligence", industry: "Insurance", purpose: "Fraud detection", problem: "Too many fraudulent claims pass through.", solution: "Combines rules + ML to score suspicious claims.", value: "Loss reduction 25–60%; faster processing.", techStack: ["Python", "XGBoost", "Neo4j", "FastAPI", "Elasticsearch", "Docker"] },
  { id: 11, name: "Retail Demand Planner", industry: "Retail", purpose: "Inventory planning", problem: "Stores buy too much or too little.", solution: "SKU-level forecasts with regional modifiers.", value: "Inventory reduction 15–35%; availability increased.", techStack: ["Python", "Prophet", "Spark", "React", "Snowflake", "Airflow"] },
  { id: 12, name: "Contract Risk Analyzer", industry: "Legal", purpose: "Contract review", problem: "Lawyers spend hours reviewing documents.", solution: "Flags risky clauses and provides suggested amendments.", value: "Legal review effort down 40–70%.", techStack: ["Python", "spaCy", "Transformers", "React", "Elasticsearch", "AWS"] },
  { id: 13, name: "Fleet Predictive Maintenance", industry: "Transport", purpose: "Maintenance planning", problem: "Vehicles break down due to unplanned failures.", solution: "Predicts failures based on sensor analytics & ML.", value: "Downtime reduced 40–75%.", techStack: ["Python", "TensorFlow", "Apache Kafka", "TimescaleDB", "Grafana", "IoT Hub"] },
  { id: 14, name: "School Timetable Optimizer Pro", industry: "Education", purpose: "Schedule planning", problem: "Administrator spends days creating schedules.", solution: "Automates school timetable based on constraints & rules.", value: "Admin time reduced 80%.", techStack: ["Python", "Constraint Programming", "React", "Node.js", "PostgreSQL"] },
  { id: 15, name: "Construction Cost Planner", industry: "Construction", purpose: "Budget optimization", problem: "Projects are overpaid due to poor planning.", solution: "Tracks cost and optimizes supply planning.", value: "Budget overruns reduced 10–30%.", techStack: ["React", "Node.js", "PostgreSQL", "Power BI", "Azure Functions"] },
  { id: 16, name: "Energy Usage Forecaster", industry: "Energy", purpose: "Consumption prediction", problem: "Companies exceed energy limits and receive penalties.", solution: "Predicts usage and balances grids to avoid peaks.", value: "Energy cost optimization 8–25%.", techStack: ["Python", "LSTM", "FastAPI", "React", "InfluxDB", "Grafana"] },
  { id: 17, name: "Talent Screening & Ranking", industry: "HR", purpose: "Candidate pre-selection", problem: "HR spends weeks reviewing CVs.", solution: "Scores resumes and cultural compatibility.", value: "Shortlisting time cut 70–90%.", techStack: ["Python", "NLP", "OpenAI API", "React", "PostgreSQL", "Redis"] },
  { id: 18, name: "Menu Profit Maximizer", industry: "Hospitality", purpose: "Menu optimization", problem: "Restaurants don't know which items bring profit.", solution: "Profit analytics per dish with suggested mix.", value: "Margin increase 5–15%.", techStack: ["React", "Node.js", "PostgreSQL", "D3.js", "Python", "Pandas"] },
  { id: 19, name: "Adaptive Learning Companion", industry: "Education", purpose: "Personalized learning", problem: "Students get lost because they can't keep up.", solution: "Individual learning paths with analytics.", value: "Learning improvement 30–70%.", techStack: ["React", "Node.js", "MongoDB", "OpenAI API", "TensorFlow.js", "WebSocket"] },
  { id: 20, name: "Smart Warehouse Picker Routing", industry: "Logistics", purpose: "Warehouse efficiency", problem: "Workers waste time walking unnecessarily.", solution: "Optimizes picking sequence and workforce assignment.", value: "Picker productivity +20–50%.", techStack: ["Python", "OR-Tools", "React", "FastAPI", "Redis", "PostgreSQL"] },
];

// Complete list of 40 AI prompts
const aiPrompts = [
  { id: 21, industry: "Healthcare", title: "Clinical Summary Extractor", description: "Creates structured summaries from unstructured clinical notes.", value: "50–80% physician time saved.", techStack: ["GPT-4", "LangChain", "FHIR API", "Python"] },
  { id: 22, industry: "Banking", title: "Credit Underwriting Rationale", description: "Human-readable rationale for automated underwriting.", value: "Higher transparency; reduced regulatory risk.", techStack: ["GPT-4", "Prompt Chaining", "Python", "SHAP"] },
  { id: 23, industry: "Retail", title: "SKU Price Elasticity Modeler", description: "Hypotheses for elasticity + suggested tests per SKU.", value: "Revenue potential +3–12%.", techStack: ["GPT-4", "Python", "Pandas", "Statistical Modeling"] },
  { id: 24, industry: "Pharma", title: "Regulatory Compliance Drafter", description: "Generates documents for CTD submissions.", value: "Preparation time cut 40–70%.", techStack: ["GPT-4", "LangChain", "RAG", "Document AI"] },
  { id: 25, industry: "Manufacturing", title: "Production Bottleneck Solver", description: "Recommendations to increase throughput per station.", value: "Output up 10–25%.", techStack: ["GPT-4", "CoT Prompting", "Process Mining", "Python"] },
  { id: 26, industry: "Finance", title: "Financial Anomaly Investigator", description: "Detects unusual transactions and proposes root-cause hypotheses.", value: "Up to 80% faster incident identification.", techStack: ["GPT-4", "Few-Shot Learning", "Python", "SQL"] },
  { id: 27, industry: "Transport", title: "Multimodal Route Replanner", description: "Suggests alternative routes based on weather and traffic.", value: "Time savings 15–40%.", techStack: ["GPT-4", "Function Calling", "Maps API", "Python"] },
  { id: 28, industry: "Education", title: "Curriculum Gap Analyzer", description: "Analyzes assessments and identifies content gaps.", value: "Better outcomes; prep time reduced.", techStack: ["GPT-4", "RAG", "LangChain", "Vector DB"] },
  { id: 29, industry: "Insurance", title: "Claims Fraud Hypothesis Generator", description: "Suggests fraud hypotheses and case prioritization.", value: "Lower losses; effective audit focus.", techStack: ["GPT-4", "CoT Prompting", "Python", "Neo4j"] },
  { id: 30, industry: "Industry", title: "Predictive Maintenance Explainer", description: "Engineering-grade root cause report + maintenance plan.", value: "Faster decision making; lower downtime.", techStack: ["GPT-4", "RAG", "Sensor Data APIs", "Python"] },
  { id: 31, industry: "Tourism / Hotels", title: "Dynamic Rate Recommender", description: "Suggests pricing adjustments based on demand patterns.", value: "Revenue increase; better responsiveness.", techStack: ["GPT-4", "Few-Shot Learning", "Python", "Revenue APIs"] },
  { id: 32, industry: "HR", title: "Candidate Cultural Fit Assessor", description: "Generates assessments and interview questions.", value: "Lower attrition; better hires.", techStack: ["GPT-4", "Prompt Engineering", "Python", "ATS APIs"] },
  { id: 33, industry: "Legal", title: "Contract Clause Risk Scorer", description: "Rates and explains clause-level contractual risks.", value: "Less legal review effort.", techStack: ["GPT-4", "RAG", "LangChain", "spaCy"] },
  { id: 34, industry: "Education", title: "Personalized Lesson Generator", description: "Differentiated lessons per student style and level.", value: "Prep time down 60–80%.", techStack: ["GPT-4", "Prompt Chaining", "Bloom's Taxonomy", "LangChain"] },
  { id: 35, industry: "Construction / Procurement", title: "Procurement Price Negotiator", description: "Generates arguments, benchmarks, and tactics.", value: "Cost savings 5–15%.", techStack: ["GPT-4", "RAG", "Market Data APIs", "Python"] },
  { id: 36, industry: "Hospitality", title: "Menu Engineering Optimizer", description: "Suggests menu changes based on profitability.", value: "Higher menu profitability.", techStack: ["GPT-4", "CoT Prompting", "Python", "Pandas"] },
  { id: 37, industry: "Energy", title: "Grid Load Balancing Planner", description: "Simulates load and suggests dispatch schedules.", value: "Lower overload events.", techStack: ["GPT-4", "Function Calling", "Python", "SCADA APIs"] },
  { id: 38, industry: "Logistics", title: "Warehouse Picking Sequence AI", description: "Generates pick path and batching strategy.", value: "Picking time down 20–50%.", techStack: ["GPT-4", "CoT Prompting", "OR-Tools", "Python"] },
  { id: 39, industry: "Marketing", title: "Marketing Campaign ROI Estimator", description: "Projects campaign ROI and budget allocation.", value: "Higher ROI; smarter budget.", techStack: ["GPT-4", "Few-Shot Learning", "Python", "Analytics APIs"] },
  { id: 40, industry: "Finance / Tax", title: "Cross-border Tax Assistant", description: "Summarizes key tax implications for cross-border cases.", value: "Fewer filing errors.", techStack: ["GPT-4", "RAG", "Legal Databases", "LangChain"] },
  { id: 41, industry: "Pharma", title: "Clinical Trial Cohort Selector", description: "Recommends stratification criteria and priorities.", value: "Faster enrollment.", techStack: ["GPT-4", "RAG", "FHIR API", "Python"] },
  { id: 42, industry: "Banking", title: "AML Transaction Pattern Finder", description: "ML-augmented suspicious pattern hypotheses.", value: "Better AML detection.", techStack: ["GPT-4", "CoT Prompting", "Python", "Graph Analytics"] },
  { id: 43, industry: "Pharma", title: "Pharmacovigilance Signal Detector", description: "Detects adverse event signals in reports.", value: "Faster response; reduced risk.", techStack: ["GPT-4", "NER", "RAG", "MedDRA"] },
  { id: 44, industry: "Finance", title: "Financial Forecast Sensitivity Analyzer", description: "Generates stress test scenarios & sensitivities.", value: "Better preparedness.", techStack: ["GPT-4", "Monte Carlo", "Python", "Excel API"] },
  { id: 45, industry: "Manufacturing", title: "Supplier Risk Monitor", description: "Aggregates supplier performance and finance.", value: "Fewer supply interruptions.", techStack: ["GPT-4", "Web Scraping", "RAG", "Python"] },
  { id: 46, industry: "E-commerce", title: "UX Conversion Auditor", description: "Funnel analysis + A/B testing suggestions.", value: "Conversion uplift 5–30%.", techStack: ["GPT-4", "Vision API", "Analytics APIs", "Python"] },
  { id: 47, industry: "IT / Legal", title: "Privacy Impact Assessor", description: "Generates PIA with mitigation points.", value: "Lower compliance risk.", techStack: ["GPT-4", "RAG", "GDPR Framework", "LangChain"] },
  { id: 48, industry: "Management", title: "Executive Briefing Generator", description: "Creates concise 1-page insights from large data.", value: "Saves executive time.", techStack: ["GPT-4", "Summarization", "RAG", "Python"] },
  { id: 49, industry: "PR / Comms", title: "Crisis Comms Playbook Creator", description: "Generates steps and messages for crisis scenarios.", value: "Faster coordinated response.", techStack: ["GPT-4", "Prompt Chaining", "Scenario Modeling", "Python"] },
  { id: 50, industry: "Corporate", title: "M&A Target Quick-Scan", description: "Summarizes finance, risk, synergies.", value: "Faster pre-screening.", techStack: ["GPT-4", "RAG", "Financial APIs", "Python"] },
  { id: 51, industry: "AI / Tech", title: "Large-Scale Prompt Chain Architect", description: "Generates modular prompt-chain architecture.", value: "Development time -30–60%.", techStack: ["GPT-4", "Meta-Prompting", "LangChain", "Python"] },
  { id: 52, industry: "Legal", title: "High-Risk Contract Redline Generator", description: "Suggests clause edits and priority risk items.", value: "Faster negotiation.", techStack: ["GPT-4", "NLP", "RAG", "Document AI"] },
  { id: 53, industry: "Healthcare", title: "Patient Pathway Optimizer", description: "Maps optimal hospitalization steps.", value: "Reduced length of stay; cost savings.", techStack: ["GPT-4", "Process Mining", "FHIR API", "Python"] },
  { id: 54, industry: "Sales", title: "High-Value Sales Pitch Builder", description: "Generates evidence-based personalized pitches.", value: "Higher win rate.", techStack: ["GPT-4", "RAG", "CRM APIs", "LangChain"] },
  { id: 55, industry: "Regulatory", title: "Compliance-ready Report Formatter", description: "Turns reports into audit-ready documentation.", value: "Audit time reduced.", techStack: ["GPT-4", "Document AI", "RAG", "Python"] },
  { id: 56, industry: "Logistics", title: "Supply Chain Disruption Simulator", description: "Generates alternative flows and action plans.", value: "Faster recovery.", techStack: ["GPT-4", "Scenario Modeling", "Python", "Graph Analytics"] },
  { id: 57, industry: "Healthcare / AI", title: "High-Precision Medical Image Annotator", description: "Suggests annotation for radiology images.", value: "Faster annotation; better ML datasets.", techStack: ["GPT-4 Vision", "DICOM", "Python", "Label Studio"] },
  { id: 58, industry: "AI Governance", title: "Ethical AI Audit Checklist Generator", description: "Generates audit checklist + KPIs & mitigations.", value: "Lower ethical/regulatory risk.", techStack: ["GPT-4", "NIST AI RMF", "RAG", "Python"] },
  { id: 59, industry: "Management", title: "Cross-Functional OKR Synthesizer", description: "Aggregates team goals and proposes aligned OKRs.", value: "Faster alignment.", techStack: ["GPT-4", "Prompt Chaining", "Python", "Notion API"] },
  { id: 60, industry: "IT / DevOps", title: "Auto-Code Review & Refactor Advisor", description: "Suggests refactors and security fixes.", value: "Less tech debt; fewer bugs.", techStack: ["GPT-4", "AST Parsing", "GitHub API", "Python"] },
];

// Collect all unique industries
const allIndustries = [...new Set([
  ...webApps.map(a => a.industry),
  ...aiPrompts.map(p => p.industry),
])].sort();

type SelectedItem = 
  | ({ type: "app" } & typeof webApps[0])
  | ({ type: "prompt" } & typeof aiPrompts[0]);

export const PortfolioSection = () => {
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeType, setActiveType] = useState<"all" | "apps" | "prompts">("all");
  const [activeIndustry, setActiveIndustry] = useState("");

  // Filter logic
  const filteredApps = useMemo(() => {
    if (activeType === "prompts") return [];
    return webApps.filter((app) => {
      const matchesSearch = searchQuery === "" || 
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.solution.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.purpose.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesIndustry = activeIndustry === "" || app.industry === activeIndustry;
      return matchesSearch && matchesIndustry;
    });
  }, [searchQuery, activeIndustry, activeType]);

  const filteredPrompts = useMemo(() => {
    if (activeType === "apps") return [];
    return aiPrompts.filter((prompt) => {
      const matchesSearch = searchQuery === "" ||
        prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesIndustry = activeIndustry === "" || prompt.industry === activeIndustry;
      return matchesSearch && matchesIndustry;
    });
  }, [searchQuery, activeIndustry, activeType]);

  const totalResults = filteredApps.length + filteredPrompts.length;

  return (
    <section id="portfolio" className="py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            World-Class Portfolio
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            AI Solutions & Innovations
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            60+ real-world AI implementations across 10+ industries — from full-scale web applications to high-impact prompt engineering solutions.
          </p>
        </motion.div>

        {/* Filter */}
        <PortfolioFilter
          industries={allIndustries}
          activeType={activeType}
          activeIndustry={activeIndustry}
          searchQuery={searchQuery}
          onTypeChange={setActiveType}
          onIndustryChange={setActiveIndustry}
          onSearchChange={setSearchQuery}
          totalResults={totalResults}
        />

        {/* Web Apps Section */}
        {filteredApps.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Web Applications</h3>
              <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                {filteredApps.length}
              </span>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredApps.map((app) => (
                  <motion.div
                    key={app.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="bg-card rounded-xl border border-border/50 overflow-hidden hover:border-primary/30 hover:shadow-card transition-all duration-300 cursor-pointer group"
                    onClick={() => setSelectedItem({ type: "app", ...app })}
                  >
                    <FloatingCard intensity={8}>
                      {/* Thumbnail */}
                      <div className="aspect-[16/10] bg-muted/30 relative overflow-hidden">
                        <img
                          src={getPortfolioImage(app.id)}
                          alt={app.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-card/90 backdrop-blur-sm rounded-md text-[10px] font-medium text-primary border border-border/50">
                          {app.industry}
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-foreground text-sm leading-tight group-hover:text-primary transition-colors">
                            {app.name}
                          </h4>
                          <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{app.solution}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {app.techStack.slice(0, 3).map((tech) => (
                            <span key={tech} className="px-1.5 py-0.5 bg-muted rounded text-[9px] font-medium text-muted-foreground">
                              {tech}
                            </span>
                          ))}
                          {app.techStack.length > 3 && (
                            <span className="px-1.5 py-0.5 text-[9px] text-muted-foreground">
                              +{app.techStack.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </FloatingCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* AI Prompts Section */}
        {filteredPrompts.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Lightbulb className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-semibold text-foreground">AI Prompts</h3>
              <span className="px-2.5 py-0.5 bg-accent/10 text-accent rounded-full text-xs font-medium">
                {filteredPrompts.length}
              </span>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredPrompts.map((prompt) => (
                  <motion.div
                    key={prompt.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="bg-card rounded-xl border border-border/50 overflow-hidden hover:border-accent/30 hover:shadow-card transition-all duration-300 cursor-pointer group"
                    onClick={() => setSelectedItem({ type: "prompt", ...prompt })}
                  >
                    <FloatingCard intensity={8}>
                      {/* Thumbnail */}
                      <div className="aspect-[16/10] bg-muted/20 relative overflow-hidden">
                        <img
                          src={getPortfolioImage(prompt.id)}
                          alt={prompt.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-card/90 backdrop-blur-sm rounded-md text-[10px] font-medium text-accent border border-border/50">
                          {prompt.industry}
                        </div>
                      </div>

                      <div className="p-4">
                        <h4 className="font-semibold text-foreground text-sm mb-1.5 group-hover:text-accent transition-colors leading-tight">
                          {prompt.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{prompt.description}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {prompt.techStack.slice(0, 3).map((tech) => (
                            <span key={tech} className="px-1.5 py-0.5 bg-muted rounded text-[9px] font-medium text-muted-foreground">
                              {tech}
                            </span>
                          ))}
                          {prompt.techStack.length > 3 && (
                            <span className="px-1.5 py-0.5 text-[9px] text-muted-foreground">
                              +{prompt.techStack.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </FloatingCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Empty state */}
        {totalResults === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No portfolio items match your search.</p>
            <button
              onClick={() => { setSearchQuery(""); setActiveIndustry(""); setActiveType("all"); }}
              className="mt-3 text-sm text-primary hover:underline"
            >
              Clear all filters
            </button>
          </motion.div>
        )}
      </div>

      {/* Detail Card Modal */}
      <PortfolioDetailCard
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </section>
  );
};
