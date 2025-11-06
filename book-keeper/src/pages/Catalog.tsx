import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Catalog = () => {
  const [books, setBooks] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchCategories();
    fetchBooks();
  }, [selectedCategory]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("name");
    setCategories(data || []);
  };

  const fetchBooks = async () => {
    setIsLoading(true);
    let query = supabase
      .from("books")
      .select(`
        *,
        categories (
          name
        )
      `)
      .order("title");

    if (selectedCategory !== "all") {
      query = query.eq("category_id", selectedCategory);
    }

    const { data } = await query;
    setBooks(data || []);
    setIsLoading(false);
  };

  const handleIssueBook = async (bookId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const book = books.find(b => b.id === bookId);
    if (book.available_copies <= 0) {
      toast({
        title: "Not available",
        description: "This book is currently not available.",
        variant: "destructive",
      });
      return;
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 14 days loan period

    const { error: transactionError } = await supabase
      .from("transactions")
      .insert({
        book_id: bookId,
        user_id: user.id,
        due_date: dueDate.toISOString(),
        status: "issued",
      });

    if (transactionError) {
      toast({
        title: "Error",
        description: "Failed to issue book.",
        variant: "destructive",
      });
      return;
    }

    const { error: updateError } = await supabase
      .from("books")
      .update({ available_copies: book.available_copies - 1 })
      .eq("id", bookId);

    if (updateError) {
      toast({
        title: "Error",
        description: "Failed to update book availability.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success!",
      description: "Book issued successfully. Check your dashboard.",
    });

    fetchBooks();
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-serif mb-2">Book Catalog</h1>
          <p className="text-muted-foreground">Browse and issue books from our collection</p>
        </div>

        <div className="flex gap-4 mb-8 flex-col md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by title or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading books...</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No books found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book) => (
              <Card key={book.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{book.title}</CardTitle>
                  <CardDescription>{book.author}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  {book.categories && (
                    <Badge variant="secondary" className="mb-2">
                      {book.categories.name}
                    </Badge>
                  )}
                  {book.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
                      {book.description}
                    </p>
                  )}
                  <div className="space-y-1 text-sm">
                    {book.isbn && <p className="text-muted-foreground">ISBN: {book.isbn}</p>}
                    {book.publisher && <p className="text-muted-foreground">Publisher: {book.publisher}</p>}
                    {book.publication_year && <p className="text-muted-foreground">Year: {book.publication_year}</p>}
                    <p className={book.available_copies > 0 ? "text-green-600" : "text-destructive"}>
                      Available: {book.available_copies} / {book.total_copies}
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => handleIssueBook(book.id)}
                    disabled={book.available_copies <= 0}
                  >
                    {book.available_copies > 0 ? "Issue Book" : "Not Available"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;
