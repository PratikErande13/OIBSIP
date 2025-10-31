import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { Calendar, MapPin, Train, Hash, User as UserIcon } from "lucide-react";

const MyBookings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    const fetchBookings = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          trains (
            train_number,
            train_name,
            departure_time,
            arrival_time
          )
        `)
        .eq("user_id", user.id)
        .order("booking_date", { ascending: false });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error loading bookings",
          description: error.message,
        });
      } else {
        setBookings(data || []);
      }
      setIsLoading(false);
    };

    fetchBookings();
  }, [user, toast]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-accent text-accent-foreground";
      case "CANCELLED":
        return "bg-destructive text-destructive-foreground";
      case "PENDING":
        return "bg-secondary text-secondary-foreground";
      default:
        return "bg-muted";
    }
  };

  const formatClassType = (classType: string) => {
    const classMap: Record<string, string> = {
      AC_1: "AC 1st Class",
      AC_2: "AC 2nd Tier",
      AC_3: "AC 3rd Tier",
      SLEEPER: "Sleeper",
      GENERAL: "General",
    };
    return classMap[classType] || classType;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Bookings</h1>
          <p className="text-muted-foreground">View and manage your train reservations</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Train className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
              <p className="text-muted-foreground mb-4">Start your journey by booking your first ticket!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
                <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl mb-1">
                        {booking.trains?.train_name}
                      </CardTitle>
                      <CardDescription className="text-base">
                        Train #{booking.trains?.train_number}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(booking.booking_status)}>
                      {booking.booking_status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Hash className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">PNR Number</p>
                          <p className="font-mono font-bold text-lg">{booking.pnr_number}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <UserIcon className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Passenger Details</p>
                          <p className="font-semibold">{booking.passenger_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.passenger_age} years, {booking.passenger_gender}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Journey</p>
                          <p className="font-semibold">
                            {booking.from_station} → {booking.to_station}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Journey Date</p>
                          <p className="font-semibold">
                            {new Date(booking.journey_date).toLocaleDateString("en-IN", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Train className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Class & Seat</p>
                          <p className="font-semibold">
                            {formatClassType(booking.class_type)} - {booking.seat_number}
                          </p>
                        </div>
                      </div>

                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Booked on</p>
                        <p className="text-sm font-medium">
                          {new Date(booking.booking_date).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyBookings;
