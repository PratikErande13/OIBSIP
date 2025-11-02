import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Clock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Question = {
  id: string;
  question_number: number;
  question_text: string;
  options: string[];
  correct_answer: string;
};

const Exam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [sessionId, setSessionId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [examTitle, setExamTitle] = useState("");

  useEffect(() => {
    startExamSession();
  }, [examId]);

  useEffect(() => {
    if (timeLeft <= 0 && sessionId) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, sessionId]);

  const startExamSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    // Fetch exam details
    const { data: examData } = await supabase
      .from("exams")
      .select("*")
      .eq("id", examId)
      .single();

    if (examData) {
      setExamTitle(examData.title);
      setTimeLeft(examData.duration_minutes * 60);
    }

    // Fetch questions
    const { data: questionsData } = await supabase
      .from("questions")
      .select("*")
      .eq("exam_id", examId)
      .order("question_number");

    if (questionsData) {
      const formattedQuestions = questionsData.map(q => ({
        ...q,
        options: Array.isArray(q.options) ? q.options : JSON.parse(q.options as string)
      }));
      setQuestions(formattedQuestions as Question[]);
    }

    // Create exam session
    const { data: sessionData } = await supabase
      .from("user_exam_sessions")
      .insert({
        user_id: session.user.id,
        exam_id: examId,
      })
      .select()
      .single();

    if (sessionData) {
      setSessionId(sessionData.id);
    }

    setLoading(false);
  };

  const handleAnswerChange = async (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));

    // Save answer to database
    await supabase
      .from("user_answers")
      .upsert({
        session_id: sessionId,
        question_id: questionId,
        selected_answer: answer,
      });
  };

  const handleSubmit = async () => {
    if (!sessionId) return;

    // Calculate score
    let score = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correct_answer) {
        score++;
      }
    });

    // Update session
    await supabase
      .from("user_exam_sessions")
      .update({
        end_time: new Date().toISOString(),
        submitted: true,
        score,
      })
      .eq("id", sessionId);

    toast({
      title: "Exam submitted!",
      description: `You scored ${score} out of ${questions.length}`,
    });

    navigate("/dashboard");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading exam...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const answeredCount = Object.keys(answers).length;
  const isTimerWarning = timeLeft < 300; // Less than 5 minutes

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">{examTitle}</h1>
              <p className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {questions.length} • {answeredCount} answered
              </p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold ${
              isTimerWarning ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"
            }`}>
              <Clock className="h-5 w-5" />
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {isTimerWarning && timeLeft > 0 && (
          <Alert className="mb-6 border-warning bg-warning/10">
            <AlertCircle className="h-4 w-4 text-warning" />
            <AlertDescription className="text-warning-foreground">
              Less than 5 minutes remaining! The exam will auto-submit when time runs out.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {currentQuestion.question_text}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup
              value={answers[currentQuestion.id] || ""}
              onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
            >
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                  >
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label
                      htmlFor={`option-${index}`}
                      className="flex-1 cursor-pointer text-base"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>

            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>

              {isLastQuestion ? (
                <Button onClick={handleSubmit}>
                  Submit Exam
                </Button>
              ) : (
                <Button
                  onClick={() =>
                    setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))
                  }
                >
                  Next
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6">
          <h3 className="text-sm font-medium mb-3">Question Navigator</h3>
          <div className="grid grid-cols-10 gap-2">
            {questions.map((q, index) => (
              <Button
                key={q.id}
                size="sm"
                variant={
                  index === currentQuestionIndex
                    ? "default"
                    : answers[q.id]
                    ? "secondary"
                    : "outline"
                }
                onClick={() => setCurrentQuestionIndex(index)}
                className="h-10"
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Exam;