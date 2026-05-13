import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

const testimonials = [
  {
    text: "Davor stands out as an exceptional leader who leads by example rather than just authority. He is deeply organized and inspiring, never hesitating to work alongside his team to reach a goal. His open-minded approach fostered a culture where my ideas were not only heard but championed, pushing me to exceed my own expectations. He combines vast global experience with a genuine willingness to learn from his employees—a rare and motivating trait.",
    author: "Bianca Badrov",
    organization: "Blue Trade Ltd.",
    source: "Digital Marketing Enthusiast",
  },
  {
    text: "A major asset to our holding company, Davor demonstrated an exceptional ability to resourcefully manage and prioritize multiple high-stakes projects simultaneously. His integrity, connectedness, and persistence went far beyond the call of duty. Because of his unwavering commitment and strategic foresight, a critical $1 billion project was successfully extended for another ten-year period.",
    author: "Daniel Kanu",
    organization: "DIK International Limited, Nigeria",
    source: "Managing Director",
  },
  {
    text: "Mr. Mulalić's greatest assets are his tireless work ethic and versatile skillset. He possesses a unique ability to bridge divides, working effectively with diverse ethnic groups in complex environments. Beyond his management capabilities, his technical skills in design and his uplifting sense of humor make him a unifying force within any organization.",
    author: "Laura Brodrick",
    organization: "Danish Refugee Council",
    source: "Project Manager",
  },
  {
    text: "Davor is an enthusiastic champion of the team's mission who takes immense pride in complex problem-solving. He is assertive yet conscientious, bringing a consistently positive attitude that drives results. His approach to business finance operations is characterized by a dedication to finding solutions where others see only obstacles.",
    author: "James A. Gomez",
    organization: "USAID-Business Finance",
    source: "Chief Operating Officer",
  },
  {
    text: "In handling the most complex management tasks, Mr. Mulalić has proven himself to be indispensable. He is a profoundly trustworthy professional with a collaborative team approach, yet he possesses the distinct capability to initiate and drive business independently. His strategic instincts allow him to navigate complex operational challenges with confidence.",
    author: "Stipe Hrkać",
    organization: "Hospitalija Trgovina d.o.o.",
    source: "Director",
  },
  {
    text: "I unreservedly recommend Mr. Davor Mulalić for any high-level management position. His tenure was defined by unwavering responsibility and reliability. He possesses a rare talent for efficiently optimizing human, material, and financial resources simultaneously, ensuring that organizational potential is fully maximized.",
    author: "Nusret Čaušević",
    organization: "LOK Microcredit Foundation",
    source: "General Director",
  },
];

export function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="references" className="py-20 lg:py-32 bg-card">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Section Header */}
          <div className="text-center mb-12">
            <motion.span
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.2 }}
              className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4"
            >
              References
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-bold text-foreground"
            >
              What People Say
            </motion.h2>
          </div>

          {/* Testimonial Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.4 }}
            className="relative bg-background p-8 lg:p-12 rounded-2xl shadow-lg"
          >
            <Quote className="absolute top-8 left-8 w-12 h-12 text-primary/10" />
            
            <div className="relative">
              <motion.p
                key={currentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-xl lg:text-2xl text-foreground leading-relaxed mb-8 italic"
              >
                "{testimonials[currentIndex].text}"
              </motion.p>

              <motion.div
                key={`author-${currentIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-foreground">
                    {testimonials[currentIndex].author}
                  </p>
                  <p className="text-muted-foreground">
                    {testimonials[currentIndex].organization}
                  </p>
                  <p className="text-sm text-primary mt-1">
                    {testimonials[currentIndex].source}
                  </p>
                </div>

                {/* Navigation */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={prev}
                    className="w-10 h-10 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-foreground" />
                  </button>
                  <button
                    onClick={next}
                    className="w-10 h-10 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-foreground" />
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
