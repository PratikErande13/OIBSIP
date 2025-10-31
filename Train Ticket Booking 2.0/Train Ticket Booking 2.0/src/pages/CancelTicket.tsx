import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { Search, AlertTriangle } from "lucide-react";

const CancelTicket = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [pnr, setPnr] = useState("");
  const [booking, setBooking] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setBooking(null);

    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          trains (
            train_number,
            train_name,
            source_station,
            destination_station,
            departure_time,
            arrival_time
          )
        `)
        .eq("pnr_number", pnr.trim())
        .eq("user_id", user?.id)
        .single();

      if (error) {
        toast({
          variant: "destructive",
          title: "Booking not found",
          description: "Please check the PNR number and try again.",
        });
      } else {
        setBooking(data);
        if (data.booking_status === "CANCELLED") {
          toast({
            variant: "destructive",
            title: "Already cancelled",
            description: "This booking has already been cancelled.",
          });
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to search for booking.",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleCancelConfirm = async () => {
    setIsCancelling(true);

    try {
      const { error } = await supabase
        .from("bookings")
        .update({
          booking_status: "CANCELLED",
          cancelled_at: new Date().toISOString(),
        })
        .eq("id", booking.id);

      if (error) throw error;

      toast({
        title: "Booking cancelled",
        description: `PNR ${booking.pnr_number} has been successfully cancelled.`,
      });

      navigate("/bookings");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Cancellation failed",
        description: "Failed to cancel the booking. Please try again.",
      });
    } finally {
      setIsCancelling(false);
      setShowCancelDialog(false);
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
          <h1 className="text-4xl font-bold mb-2">Cancel Ticket</h1>
          <p className="text-muted-foreground">Enter your PNR number to cancel your booking</p>
        </div>

        <Card className="max-w-2xl mx-auto mb-8" style={{ boxShadow: "var(--shadow-card)" }}>
          <CardHeader>
            <CardTitle>Search Booking</CardTitle>
            <CardDescription>Enter your 10-digit PNR number</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="pnr" className="sr-only">PNR Number</Label>
                <Input
                  id="pnr"
                  placeholder="Enter PNR Number"
                  value={pnr}
                  onChange={(e) => setPnr(e.target.value)}
                  maxLength={10}
                  required
                />
              </div>
              <Button type="submit" disabled={isSearching || pnr.length !== 10}>
                <Search className="mr-2 h-4 w-4" />
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {booking && (
          <Card className="max-w-2xl mx-auto" style={{ boxShadow: "var(--shadow-card)" }}>
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
                <Badge
                  className={
                    booking.booking_status === "CONFIRMED"
                      ? "bg-accent text-accent-foreground"
                      : "bg-destructive text-destructive-foreground"
                  }
                >
                  {booking.booking_status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4 mb-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">PNR Number</p>
                    <p className="font-mono font-bold text-lg">{booking.pnr_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Passenger Name</p>
                    <p className="font-semibold">{booking.passenger_name}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Journey</p>
                    <p className="font-semibold">
                      {booking.from_station} → {booking.to_station}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Journey Date</p>
                    <p className="font-semibold">
                      {new Date(booking.journey_date).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Class & Seat</p>
                    <p className="font-semibold">
                      {formatClassType(booking.class_type)} - {booking.seat_number}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Age & Gender</p>
                    <p className="font-semibold">
                      {booking.passenger_age} years, {booking.passenger_gender}
                    </p>
                  </div>
                </div>
              </div>

              {booking.booking_status === "CONFIRMED" && (
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setBooking(null);
                      setPnr("");
                    }}
                    className="flex-1"
                  >
                    Search Another
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setShowCancelDialog(true)}
                    className="flex-1"
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Cancel This Booking
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. Your booking with PNR {booking?.pnr_number} will be
                permanently cancelled.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isCancelling}>No, Keep Booking</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCancelConfirm}
                disabled={isCancelling}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isCancelling ? "Cancelling..." : "Yes, Cancel Booking"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};

export default CancelTicket;
