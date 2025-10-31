import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { z } from "zod";
import { Loader2 } from "lucide-react";

const bookingSchema = z.object({
  passengerName: z.string().min(2, "Name must be at least 2 characters").max(100),
  passengerAge: z.number().min(1, "Age must be at least 1").max(120, "Age must be less than 120"),
  passengerGender: z.enum(["Male", "Female", "Other"]),
  trainId: z.string().uuid("Please select a train"),
  fromStation: z.string().min(2, "Please enter from station").max(100),
  toStation: z.string().min(2, "Please enter destination").max(100),
  journeyDate: z.string().min(1, "Please select journey date"),
  classType: z.enum(["AC_1", "AC_2", "AC_3", "SLEEPER", "GENERAL"]),
});

const BookTicket = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [trains, setTrains] = useState<any[]>([]);
  const [selectedTrain, setSelectedTrain] = useState<any>(null);

  const [formData, setFormData] = useState({
    passengerName: "",
    passengerAge: "",
    passengerGender: "",
    trainId: "",
    fromStation: "",
    toStation: "",
    journeyDate: "",
    classType: "",
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (!session) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchTrains = async () => {
      const { data, error } = await supabase
        .from("trains")
        .select("*")
        .order("train_number");

      if (error) {
        toast({
          variant: "destructive",
          title: "Error loading trains",
          description: error.message,
        });
      } else {
        setTrains(data || []);
      }
    };

    fetchTrains();
  }, [toast]);

  const handleTrainSelect = (trainId: string) => {
    const train = trains.find((t) => t.id === trainId);
    setSelectedTrain(train);
    setFormData({ ...formData, trainId });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validatedData = bookingSchema.parse({
        ...formData,
        passengerAge: parseInt(formData.passengerAge),
      });

      // Generate PNR
      const { data: pnrData, error: pnrError } = await supabase.rpc("generate_pnr");

      if (pnrError) throw pnrError;

      // Create booking
      const { error: bookingError } = await supabase.from("bookings").insert({
        user_id: user?.id,
        pnr_number: pnrData,
        train_id: validatedData.trainId,
        passenger_name: validatedData.passengerName,
        passenger_age: validatedData.passengerAge,
        passenger_gender: validatedData.passengerGender,
        from_station: validatedData.fromStation,
        to_station: validatedData.toStation,
        journey_date: validatedData.journeyDate,
        class_type: validatedData.classType,
        seat_number: `${validatedData.classType}-${Math.floor(Math.random() * 100) + 1}`,
        booking_status: "CONFIRMED",
      });

      if (bookingError) throw bookingError;

      toast({
        title: "Booking Confirmed!",
        description: `Your PNR number is ${pnrData}`,
      });

      navigate("/bookings");
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          variant: "destructive",
          title: "Validation error",
          description: err.errors[0].message,
        });
      } else if (err instanceof Error) {
        toast({
          variant: "destructive",
          title: "Booking failed",
          description: err.message,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto" style={{ boxShadow: "var(--shadow-card)" }}>
          <CardHeader>
            <CardTitle className="text-3xl">Book Train Ticket</CardTitle>
            <CardDescription>Fill in the details to reserve your seat</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passengerName">Passenger Name</Label>
                  <Input
                    id="passengerName"
                    placeholder="John Doe"
                    value={formData.passengerName}
                    onChange={(e) => setFormData({ ...formData, passengerName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passengerAge">Age</Label>
                  <Input
                    id="passengerAge"
                    type="number"
                    placeholder="25"
                    value={formData.passengerAge}
                    onChange={(e) => setFormData({ ...formData, passengerAge: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="passengerGender">Gender</Label>
                <Select
                  value={formData.passengerGender}
                  onValueChange={(value) => setFormData({ ...formData, passengerGender: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="train">Select Train</Label>
                <Select value={formData.trainId} onValueChange={handleTrainSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select train" />
                  </SelectTrigger>
                  <SelectContent>
                    {trains.map((train) => (
                      <SelectItem key={train.id} value={train.id}>
                        {train.train_number} - {train.train_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTrain && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Train Details:</p>
                  <p className="font-medium">
                    {selectedTrain.source_station} → {selectedTrain.destination_station}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Departure: {selectedTrain.departure_time} | Arrival: {selectedTrain.arrival_time}
                  </p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromStation">From Station</Label>
                  <Input
                    id="fromStation"
                    placeholder="Mumbai Central"
                    value={formData.fromStation}
                    onChange={(e) => setFormData({ ...formData, fromStation: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="toStation">To Station</Label>
                  <Input
                    id="toStation"
                    placeholder="New Delhi"
                    value={formData.toStation}
                    onChange={(e) => setFormData({ ...formData, toStation: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="journeyDate">Journey Date</Label>
                  <Input
                    id="journeyDate"
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={formData.journeyDate}
                    onChange={(e) => setFormData({ ...formData, journeyDate: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="classType">Class</Label>
                  <Select
                    value={formData.classType}
                    onValueChange={(value) => setFormData({ ...formData, classType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AC_1">AC 1st Class</SelectItem>
                      <SelectItem value="AC_2">AC 2nd Tier</SelectItem>
                      <SelectItem value="AC_3">AC 3rd Tier</SelectItem>
                      <SelectItem value="SLEEPER">Sleeper Class</SelectItem>
                      <SelectItem value="GENERAL">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => navigate("/dashboard")} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    "Confirm Booking"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default BookTicket;
