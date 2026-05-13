
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { ExternalLink, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import bookAiBusiness from "@/assets/book-ai-business-excellence.png";
import bookAiTeacher from "@/assets/book-ai-teacher-companion.jpg";
import bookPromptEngineering from "@/assets/book-prompt-engineering-manual.png";


const amazonLink = "https://www.amazon.com/s?i=digital-text&rh=p_27%3ADavor%2BMulali%25C4%2587&s=relevancerank&text=Davor+Mulali%C4%87&ref=dp_byline_sr_ebooks_1";
const paypalLink = "https://www.paypal.com/ncp/payment/FKMN5XAS97TEY";

const books = [
  {
    title: "AI for Business and Personal Excellence",
    subtitle: "Strategies for Growth and Productivity",
    description: "Applying AI strategies for business growth and personal productivity enhancement",
    topics: ["Business automation", "Personal productivity", "AI strategy"],
    cover: bookAiBusiness,
  },
  {
    title: "The AI Teacher's Companion",
    subtitle: "Integrating Artificial Intelligence in Your Classroom",
    description: "Practical guide for educators to effectively integrate AI tools into daily teaching practice",
    topics: ["AI tools for teachers", "Lesson planning with AI", "Practical examples"],
    cover: bookAiTeacher,
  },
  {
    title: "Mastering Prompt Engineering",
    subtitle: "A Practical Manual for Advanced Non-Coders",
    description: "Comprehensive guide to prompt engineering for educators and professionals without coding background",
    topics: ["Prompting techniques", "Educational applications", "Best practices"],
    cover: bookPromptEngineering,
  },
];

export function BooksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="books" className="py-20 lg:py-32 bg-card">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {/* Section Header */}
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.2 }}
              className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4"
            >
              Published Works
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-bold text-foreground mb-4"
            >
              Books on AI in Business
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground max-w-2xl mx-auto"
            >
              Sharing knowledge and practical insights to help professionals leverage AI technology
            </motion.p>
          </div>

          {/* Books Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4 + index * 0.15 }}
                className="group bg-background rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300"
              >
                {/* Book Cover Image */}
                <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
                  <img
                    src={book.cover}
                    alt={`Book cover: ${book.title}`}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-foreground mb-1 line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-xs text-primary mb-2">{book.subtitle}</p>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {book.description}
                  </p>

                  {/* Topics */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {book.topics.slice(0, 2).map((topic, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded-md"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <a href={amazonLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3 h-3" />
                        Amazon
                      </a>
                    </Button>
                    <Button variant="default" size="sm" className="flex-1" asChild>
                      <a href={paypalLink} target="_blank" rel="noopener noreferrer">
                        <ShoppingCart className="w-3 h-3" />
                        Buy
                      </a>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
