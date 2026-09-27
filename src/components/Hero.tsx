import { Button } from "@/components/ui/button";
import { ArrowRight, Upload, Brain, CheckCircle } from "lucide-react";
import heroImage from "@/assets/hero-cv-analysis.jpg";
import CVUploadDialog from "./CVUploadDialog";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-accent py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-6">
              <Brain className="mr-2 h-4 w-4" />
              AI-Powered CV Analysis
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl mb-6">
              Transform Your
              <span className="bg-gradient-primary bg-clip-text text-transparent"> CV Analysis </span>
              Experience
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Upload your CV and let our AI extract key information instantly. 
              Streamline recruitment, automate data entry, and make smarter hiring decisions.
            </p>

            {/* Feature highlights */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex items-center text-muted-foreground">
                <CheckCircle className="h-5 w-5 text-success mr-2" />
                Instant data extraction
              </div>
              <div className="flex items-center text-muted-foreground">
                <CheckCircle className="h-5 w-5 text-success mr-2" />
                Multiple file formats
              </div>
              <div className="flex items-center text-muted-foreground">
                <CheckCircle className="h-5 w-5 text-success mr-2" />
                Secure processing
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex w-full">
              <CVUploadDialog />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-border/50">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">10K+</div>
                <div className="text-sm text-muted-foreground">CVs Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">99.9%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">5s</div>
                <div className="text-sm text-muted-foreground">Avg Processing</div>
              </div>
            </div>
          </div>

          {/* Right Column - Hero Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-strong">
              <img
                src={heroImage}
                alt="CV Analysis Platform Dashboard"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-primary/20"></div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 bg-background rounded-lg shadow-medium p-3 animate-fade-in hidden lg:block">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Processing CV...</span>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 bg-background rounded-lg shadow-medium p-3 animate-slide-in hidden lg:block">
              <div className="text-sm">
                <div className="font-medium text-foreground">Data Extracted</div>
                <div className="text-muted-foreground">Name, Skills, Experience</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;