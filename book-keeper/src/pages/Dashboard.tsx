import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { BookOpen, Calendar, AlertCircle } from "lucide-react";
import { format, differenceInDays } from "date-fns";

const Dashboard = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    fetchProfile(session.user.id);
    fetchTransactions(session.user.id);
  };

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile(data);
  };

  const fetchTransactions = async (userId: string) => {
    setIsLoading(true);
    const { data } = await supabase
      .from("transactions")
      .select(`
        *,
        books (
          title,
          author,
          isbn
        )
      `)
      .eq("user_id", userId)
      .order("issue_date", { ascending: false });

    setTransactions(data || []);
    setIsLoading(false);
  };

  const handleReturnBook = async (transactionId: string, bookId: string) => {
    const { error: updateTransactionError } = await supabase
      .from("transactions")
      .update({
        return_date: new Date().toISOString(),
        status: "returned",
      })
      .eq("id", transactionId);

    if (updateTransactionError) {
      toast({
        title: "Error",
        description: "Failed to return book.",
        variant: "destructive",
      });
      return;
    }

    const { data: book } = await supabase
      .from("books")
      .select("available_copies")
      .eq("id", bookId)
      .single();

    if (book) {
      await supabase
        .from("books")
        .update({ available_copies: book.available_copies + 1 })
        .eq("id", bookId);
    }

    toast({
      title: "Success!",
      description: "Book returned successfully.",
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      fetchTransactions(user.id);
    }
  };

  const getStatusBadge = (transaction: any) => {
    if (transaction.status === "returned") {
      return <Badge variant="secondary">Returned</Badge>;
    }
    
    const daysUntilDue = differenceInDays(new Date(transaction.due_date), new Date());
    
    if (daysUntilDue < 0) {
      return <Badge variant="destructive">Overdue</Badge>;
    } else if (daysUntilDue <= 3) {
      return <Badge className="bg-yellow-500">Due Soon</Badge>;
    }
    
    return <Badge>Issued</Badge>;
  };

  const issuedBooks = transactions.filter(t => t.status === "issued");
  const returnedBooks = transactions.filter(t => t.status === "returned");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-serif mb-2">My Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {profile?.full_name || "User"}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Currently Borrowed</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{issuedBooks.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Returned</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{returnedBooks.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Books</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {issuedBooks.filter(t => differenceInDays(new Date(t.due_date), new Date()) < 0).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My Books</CardTitle>
            <CardDescription>Manage your borrowed books</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">You haven't borrowed any books yet</p>
                <Button onClick={() => navigate("/catalog")}>Browse Catalog</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{transaction.books.title}</h3>
                      <p className="text-sm text-muted-foreground">{transaction.books.author}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="text-muted-foreground">
                          Issued: {format(new Date(transaction.issue_date), "MMM dd, yyyy")}
                        </span>
                        {transaction.status === "issued" && (
                          <span className="text-muted-foreground">
                            Due: {format(new Date(transaction.due_date), "MMM dd, yyyy")}
                          </span>
                        )}
                        {transaction.return_date && (
                          <span className="text-muted-foreground">
                            Returned: {format(new Date(transaction.return_date), "MMM dd, yyyy")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(transaction)}
                      {transaction.status === "issued" && (
                        <Button
                          size="sm"
                          onClick={() => handleReturnBook(transaction.id, transaction.book_id)}
                        >
                          Return Book
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
