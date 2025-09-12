import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Brain, Database, CheckCircle } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      step: "01",
      icon: Upload,
      title: "Upload Your CV",
      description: "Simply drag and drop or click to upload CV files in any format (PDF, DOCX, RTF, TXT).",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      step: "02",
      icon: Brain,
      title: "AI Processing",
      description: "Our advanced AI analyzes the document and extracts key information like name, contact details, skills, and experience.",
      color: "text-success",
      bgColor: "bg-success/10"
    },
    {
      step: "03",
      icon: Database,
      title: "Auto-Fill Forms",
      description: "Extracted data automatically populates your forms and databases, ready for review and use.",
      color: "text-warning",
      bgColor: "bg-warning/10"
    },
    {
      step: "04",
      icon: CheckCircle,
      title: "Review & Export",
      description: "Review the extracted information, make any necessary adjustments, and export to your preferred format.",
      color: "text-destructive",
      bgColor: "bg-destructive/10"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gradient-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
            How CVAnalyzer Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Four simple steps to transform your CV processing workflow and save hours of manual data entry.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <Card key={index} className="border-border hover:shadow-medium transition-all duration-300 group relative">
                {/* Step Number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold shadow-medium">
                  {step.step}
                </div>
                
                <CardHeader className="text-center">
                  <div className={`inline-flex h-16 w-16 items-center justify-center rounded-full ${step.bgColor} mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <IconComponent className={`h-8 w-8 ${step.color}`} />
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground">
                    {step.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Connection Lines for Desktop */}
        <div className="hidden lg:block relative mt-8">
          <div className="absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gradient-primary transform -translate-y-1/2 opacity-30"></div>
        </div>

        {/* Bottom Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-foreground mb-2">5s</div>
            <div className="text-muted-foreground">Average processing time</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-foreground mb-2">99.9%</div>
            <div className="text-muted-foreground">Extraction accuracy</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-foreground mb-2">10+</div>
            <div className="text-muted-foreground">Supported formats</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-foreground mb-2">24/7</div>
            <div className="text-muted-foreground">Processing availability</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;