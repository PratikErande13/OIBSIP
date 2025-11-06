import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { BookOpen, Users, Plus, Pencil, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const Admin = () => {
  const [books, setBooks] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Book form state
  const [bookForm, setBookForm] = useState({
    title: "",
    author: "",
    isbn: "",
    category_id: "",
    publisher: "",
    publication_year: "",
    total_copies: "1",
    description: "",
  });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!data) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setIsAdmin(true);
    fetchData();
  };

  const fetchData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchBooks(),
      fetchMembers(),
      fetchCategories(),
    ]);
    setIsLoading(false);
  };

  const fetchBooks = async () => {
    const { data } = await supabase
      .from("books")
      .select(`
        *,
        categories (name)
      `)
      .order("title");
    setBooks(data || []);
  };

  const fetchMembers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("full_name");
    setMembers(data || []);
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("name");
    setCategories(data || []);
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase
      .from("books")
      .insert({
        ...bookForm,
        publication_year: bookForm.publication_year ? parseInt(bookForm.publication_year) : null,
        total_copies: parseInt(bookForm.total_copies),
        available_copies: parseInt(bookForm.total_copies),
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add book.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success!",
      description: "Book added successfully.",
    });

    setIsDialogOpen(false);
    setBookForm({
      title: "",
      author: "",
      isbn: "",
      category_id: "",
      publisher: "",
      publication_year: "",
      total_copies: "1",
      description: "",
    });
    fetchBooks();
  };

  const handleDeleteBook = async (bookId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this book?");
    if (!confirmed) return;

    const { error } = await supabase
      .from("books")
      .delete()
      .eq("id", bookId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete book.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success!",
      description: "Book deleted successfully.",
    });
    fetchBooks();
  };

  if (!isAdmin || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-8 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-serif mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage books and members</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Books</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{books.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="books" className="space-y-4">
          <TabsList>
            <TabsTrigger value="books">Books</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>

          <TabsContent value="books" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Manage Books</h2>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Book
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <form onSubmit={handleAddBook}>
                    <DialogHeader>
                      <DialogTitle>Add New Book</DialogTitle>
                      <DialogDescription>
                        Fill in the book details below
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          value={bookForm.title}
                          onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="author">Author *</Label>
                        <Input
                          id="author"
                          value={bookForm.author}
                          onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="isbn">ISBN</Label>
                          <Input
                            id="isbn"
                            value={bookForm.isbn}
                            onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="category">Category</Label>
                          <Select
                            value={bookForm.category_id}
                            onValueChange={(value) => setBookForm({ ...bookForm, category_id: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="publisher">Publisher</Label>
                          <Input
                            id="publisher"
                            value={bookForm.publisher}
                            onChange={(e) => setBookForm({ ...bookForm, publisher: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="year">Publication Year</Label>
                          <Input
                            id="year"
                            type="number"
                            value={bookForm.publication_year}
                            onChange={(e) => setBookForm({ ...bookForm, publication_year: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="copies">Total Copies *</Label>
                        <Input
                          id="copies"
                          type="number"
                          min="1"
                          value={bookForm.total_copies}
                          onChange={(e) => setBookForm({ ...bookForm, total_copies: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={bookForm.description}
                          onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Add Book</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Copies</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {books.map((book) => (
                      <TableRow key={book.id}>
                        <TableCell className="font-medium">{book.title}</TableCell>
                        <TableCell>{book.author}</TableCell>
                        <TableCell>{book.categories?.name || "N/A"}</TableCell>
                        <TableCell>
                          {book.available_copies} / {book.total_copies}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteBook(book.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <h2 className="text-2xl font-semibold">Manage Members</h2>
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.full_name}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>{member.phone || "N/A"}</TableCell>
                        <TableCell>
                          {new Date(member.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
