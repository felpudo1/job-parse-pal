import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Upload, Database, Shield, Clock, FileText } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Upload,
      title: "Smart Upload",
      description: "Drag and drop CVs in PDF, DOCX, or other formats. Our system handles multiple file types seamlessly.",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      icon: Brain,
      title: "AI Extraction",
      description: "Advanced AI algorithms extract names, contact info, skills, and experience with 99.9% accuracy.",
      color: "text-success",
      bgColor: "bg-success/10"
    },
    {
      icon: Database,
      title: "Auto-Population",
      description: "Automatically populate forms and databases with extracted information, saving hours of manual work.",
      color: "text-warning",
      bgColor: "bg-warning/10"
    },
    {
      icon: Shield,
      title: "Secure Processing",
      description: "Enterprise-grade security ensures your sensitive CV data is protected with end-to-end encryption.",
      color: "text-destructive",
      bgColor: "bg-destructive/10"
    },
    {
      icon: Clock,
      title: "Real-time Analysis",
      description: "Get instant results with our optimized processing engine. No waiting, no delays.",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      icon: FileText,
      title: "Multiple Formats",
      description: "Support for PDF, DOCX, RTF, and plain text files. Handle any CV format your candidates submit.",
      color: "text-success",
      bgColor: "bg-success/10"
    }
  ];

  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
            Powerful Features for Modern Recruitment
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to streamline your CV processing workflow and make better hiring decisions faster.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className="border-border hover:shadow-medium transition-all duration-300 group">
                <CardHeader>
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${feature.bgColor} mb-4 group-hover:scale-110 transition-transform`}>
                    <IconComponent className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center rounded-full bg-gradient-accent px-6 py-3 text-sm font-medium text-foreground">
            Ready to streamline your recruitment process?
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;