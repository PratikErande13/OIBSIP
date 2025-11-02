-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create trigger for auto-updating profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create exams table
CREATE TABLE public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view exams"
  ON public.exams FOR SELECT
  USING (true);

-- Create questions table
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  question_number INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view questions"
  ON public.questions FOR SELECT
  USING (true);

-- Create user exam sessions table
CREATE TABLE public.user_exam_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  submitted BOOLEAN DEFAULT FALSE,
  score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_exam_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
  ON public.user_exam_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions"
  ON public.user_exam_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON public.user_exam_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Create user answers table
CREATE TABLE public.user_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.user_exam_sessions(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  selected_answer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, question_id)
);

ALTER TABLE public.user_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own answers"
  ON public.user_answers FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM public.user_exam_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own answers"
  ON public.user_answers FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM public.user_exam_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own answers"
  ON public.user_answers FOR UPDATE
  USING (
    session_id IN (
      SELECT id FROM public.user_exam_sessions WHERE user_id = auth.uid()
    )
  );

-- Insert sample exam data
INSERT INTO public.exams (title, description, duration_minutes, total_questions) VALUES
('General Knowledge Quiz', 'Test your general knowledge with this 10-question quiz', 15, 10),
('Programming Fundamentals', 'Basic programming concepts and terminology', 20, 10);

-- Insert sample questions for General Knowledge Quiz
INSERT INTO public.questions (exam_id, question_number, question_text, options, correct_answer)
SELECT 
  (SELECT id FROM public.exams WHERE title = 'General Knowledge Quiz'),
  1,
  'What is the capital of France?',
  '["Paris", "London", "Berlin", "Madrid"]'::jsonb,
  'Paris'
UNION ALL SELECT 
  (SELECT id FROM public.exams WHERE title = 'General Knowledge Quiz'),
  2,
  'Which planet is known as the Red Planet?',
  '["Venus", "Mars", "Jupiter", "Saturn"]'::jsonb,
  'Mars'
UNION ALL SELECT 
  (SELECT id FROM public.exams WHERE title = 'General Knowledge Quiz'),
  3,
  'What is the largest ocean on Earth?',
  '["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"]'::jsonb,
  'Pacific Ocean'
UNION ALL SELECT 
  (SELECT id FROM public.exams WHERE title = 'General Knowledge Quiz'),
  4,
  'Who painted the Mona Lisa?',
  '["Vincent van Gogh", "Leonardo da Vinci", "Pablo Picasso", "Michelangelo"]'::jsonb,
  'Leonardo da Vinci'
UNION ALL SELECT 
  (SELECT id FROM public.exams WHERE title = 'General Knowledge Quiz'),
  5,
  'What is the smallest country in the world?',
  '["Monaco", "Vatican City", "San Marino", "Liechtenstein"]'::jsonb,
  'Vatican City'
UNION ALL SELECT 
  (SELECT id FROM public.exams WHERE title = 'General Knowledge Quiz'),
  6,
  'How many continents are there?',
  '["5", "6", "7", "8"]'::jsonb,
  '7'
UNION ALL SELECT 
  (SELECT id FROM public.exams WHERE title = 'General Knowledge Quiz'),
  7,
  'What is the longest river in the world?',
  '["Amazon River", "Nile River", "Yangtze River", "Mississippi River"]'::jsonb,
  'Nile River'
UNION ALL SELECT 
  (SELECT id FROM public.exams WHERE title = 'General Knowledge Quiz'),
  8,
  'Which element has the chemical symbol "O"?',
  '["Gold", "Oxygen", "Silver", "Iron"]'::jsonb,
  'Oxygen'
UNION ALL SELECT 
  (SELECT id FROM public.exams WHERE title = 'General Knowledge Quiz'),
  9,
  'In what year did World War II end?',
  '["1943", "1944", "1945", "1946"]'::jsonb,
  '1945'
UNION ALL SELECT 
  (SELECT id FROM public.exams WHERE title = 'General Knowledge Quiz'),
  10,
  'What is the speed of light?',
  '["299,792 km/s", "150,000 km/s", "500,000 km/s", "1,000,000 km/s"]'::jsonb,
  '299,792 km/s';

-- Insert sample questions for Programming Quiz
INSERT INTO public.questions (exam_id, question_number, question_text, options, correct_answer)
SELECT 
  (SELECT id FROM public.exams WHERE title = 'Programming Fundamentals'),
  1,
  'What does HTML stand for?',
  '["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language"]'::jsonb,
  'Hyper Text Markup Language'
UNION ALL SELECT 
  (SELECT id FROM public.exams WHERE title = 'Programming Fundamentals'),
  2,
  'Which programming language is known as the "language of the web"?',
  '["Python", "Java", "JavaScript", "C++"]'::jsonb,
  'JavaScript'
UNION ALL SELECT 
  (SELECT id FROM public.exams WHERE title = 'Programming Fundamentals'),
  3,
  'What does CSS stand for?',
  '["Cascading Style Sheets", "Computer Style Sheets", "Creative Style Sheets", "Colorful Style Sheets"]'::jsonb,
  'Cascading Style Sheets'
UNION ALL SELECT 
  (SELECT id FROM public.exams WHERE title = 'Programming Fundamentals'),
  4,
  'Which of these is NOT a programming paradigm?',
  '["Object-Oriented", "Functional", "Procedural", "Alphabetical"]'::jsonb,
  'Alphabetical'
UNION ALL SELECT 
  (SELECT id FROM public.exams WHERE title = 'Programming Fundamentals'),
  5,
  'What is a variable in programming?',
  '["A function", "A storage location for data", "A loop", "A class"]'::jsonb,
  'A storage location for data'
UNION ALL SELECT 
  (SELECT id FROM public.exams WHERE title = 'Programming Fundamentals'),
  6,
  'Which symbol is used for comments in Python?',
  '["//", "/*", "#", "<!--"]'::jsonb,
  '#'
UNION ALL SELECT 
  (SELECT id FROM public.exams WHERE title = 'Programming Fundamentals'),
  7,
  'What does API stand for?',
  '["Application Programming Interface", "Advanced Programming Integration", "Automated Program Interaction", "Application Process Interface"]'::jsonb,
  'Application Programming Interface'
UNION ALL SELECT 
  (SELECT id FROM public.exams WHERE title = 'Programming Fundamentals'),
  8,
  'What is the result of 10 % 3 in most programming languages?',
  '["3", "1", "0", "10"]'::jsonb,
  '1'
UNION ALL SELECT 
  (SELECT id FROM public.exams WHERE title = 'Programming Fundamentals'),
  9,
  'Which data structure uses LIFO (Last In First Out)?',
  '["Queue", "Stack", "Array", "Tree"]'::jsonb,
  'Stack'
UNION ALL SELECT 
  (SELECT id FROM public.exams WHERE title = 'Programming Fundamentals'),
  10,
  'What is the purpose of a loop in programming?',
  '["To store data", "To repeat a block of code", "To define variables", "To create functions"]'::jsonb,
  'To repeat a block of code';