import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, Search, Users, TrendingUp } from "lucide-react";
import heroImage from "@/assets/library-hero.jpg";
import { Navbar } from "@/components/Navbar";

const Landing = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `linear-gradient(to right, hsl(var(--background) / 0.95), hsl(var(--background) / 0.7)), url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="container relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold font-serif mb-6 text-foreground">
              Welcome to the Digital Library Experience
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Access thousands of books, manage your reading journey, and discover your next favorite read
              in our comprehensive library management system.
            </p>
            <div className="flex gap-4">
              <Button size="lg" asChild>
                <Link to="/auth">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/catalog">Browse Catalog</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <h2 className="text-3xl font-bold font-serif text-center mb-12">
            Everything You Need in One Place
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Vast Collection</h3>
              <p className="text-muted-foreground">
                Browse through our extensive catalog of books across all genres
              </p>
            </div>
            
            <div className="text-center">
              <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Search</h3>
              <p className="text-muted-foreground">
                Find exactly what you're looking for with our powerful search
              </p>
            </div>
            
            <div className="text-center">
              <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Management</h3>
              <p className="text-muted-foreground">
                Track your borrowed books and manage returns effortlessly
              </p>
            </div>
            
            <div className="text-center">
              <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Updates</h3>
              <p className="text-muted-foreground">
                Get instant notifications about due dates and availability
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container text-center">
          <h2 className="text-3xl font-bold font-serif mb-6">
            Ready to Start Your Reading Journey?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of readers who trust LibraryHub for their literary adventures
          </p>
          <Button size="lg" asChild>
            <Link to="/auth">Create Your Account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-card">
        <div className="container text-center text-muted-foreground">
          <p>&copy; 2025 LibraryHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
