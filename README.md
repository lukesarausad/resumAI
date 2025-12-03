# resumAI - AI Resume & Application Assistant

An AI-powered web application that tailors resumes to specific job postings and generates responses to application questions. Built with Next.js 14, Google Gemini, and LaTeX.

## Features

- **Resume Upload & Parsing**: Upload PDF resumes and automatically parse them into structured data using AI
- **Job Description Analysis**: AI analyzes job requirements and extracts key skills/keywords
- **Resume Tailoring**: Automatically reorder and rewrite resume content to emphasize relevance for specific jobs
- **LaTeX Generation**: Generates professional resumes using Jake's Resume template format
- **PDF Export**: Compile LaTeX to PDF with ATS-optimized formatting
- **Application Questions**: AI generates thoughtful responses to application questions based on your resume
- **Resume Editor**: Edit and refine tailored resume content
- **Multiple Applications**: Track multiple applications per resume

## Tech Stack

- **Framework**: Next.js 14 (App Router) with TypeScript
- **Database**: Prisma ORM with SQLite
- **Authentication**: NextAuth.js with credentials provider
- **AI**: Google Gemini API (Gemini 1.5 Flash and Pro)
- **PDF Processing**: pdf-parse for reading, node-latex for generation
- **Styling**: Tailwind CSS + shadcn/ui components
- **LaTeX Template**: Jake's Resume format

## Prerequisites

Before you begin, ensure you have installed:

- Node.js 18+ and npm
- A LaTeX distribution (for PDF compilation):
  - **macOS**: `brew install --cask mactex`
  - **Ubuntu/Debian**: `sudo apt-get install texlive-full`
  - **Windows**: Install [MiKTeX](https://miktex.org/download)
- Google Gemini API key

## Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd resumAI
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth - Generate a secure secret with: openssl rand -base64 32
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Google Gemini
GEMINI_API_KEY="your-openai-api-key-here"

# Optional
NODE_ENV="development"
LATEX_COMPILE_TIMEOUT="30000"
MAX_RESUME_SIZE_MB="5"
```

4. **Initialize the database**

```bash
npx prisma generate
npx prisma db push
```

5. **Run the development server**

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
resumAI/
├── app/
│   ├── (auth)/              # Authentication pages
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/         # Protected dashboard pages
│   │   ├── dashboard/
│   │   ├── application/
│   │   └── layout.tsx
│   ├── api/                 # API routes
│   │   ├── auth/
│   │   ├── resumes/
│   │   └── applications/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── providers/
│   ├── resume-upload.tsx
│   └── ...
├── lib/
│   ├── auth.ts             # NextAuth configuration
│   ├── prisma.ts           # Prisma client
│   ├── session.ts          # Session utilities
│   ├── openai.ts           # Google Gemini integration
│   ├── pdf-parser.ts       # PDF parsing logic
│   ├── latex.ts            # LaTeX generation
│   └── latex-compiler.ts   # LaTeX to PDF compilation
├── prisma/
│   └── schema.prisma       # Database schema
├── templates/
│   └── jake-resume.tex     # LaTeX template
├── types/
│   ├── resume.ts           # Resume data types
│   └── next-auth.d.ts      # NextAuth types
└── ...
```

## Data Models

### User
- `id`: Unique identifier
- `email`: User email (unique)
- `password`: Hashed password
- `name`: Optional display name
- `resumes`: Relation to Resume model

### Resume
- `id`: Unique identifier
- `userId`: Foreign key to User
- `title`: Resume title
- `originalContent`: JSON-serialized resume data
- `applications`: Relation to Application model

### Application
- `id`: Unique identifier
- `resumeId`: Foreign key to Resume
- `jobTitle`: Target job title
- `jobDescription`: Full job description
- `tailoredContent`: JSON-serialized tailored resume
- `tailoredLatex`: Generated LaTeX code
- `questionResponses`: JSON-serialized Q&A pairs

## API Routes

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - Sign in (handled by NextAuth)

### Resumes
- `GET /api/resumes` - List user's resumes
- `POST /api/resumes` - Upload and parse new resume
- `GET /api/resumes/[id]` - Get specific resume
- `DELETE /api/resumes/[id]` - Delete resume

### Applications
- `GET /api/applications` - List applications (optionally filtered by resumeId)
- `POST /api/applications` - Create tailored application
- `GET /api/applications/[id]` - Get specific application
- `DELETE /api/applications/[id]` - Delete application
- `POST /api/applications/[id]/questions` - Generate question response
- `GET /api/applications/[id]/pdf` - Download PDF

## Usage Guide

### 1. Create an Account

1. Visit the app and click "Sign Up"
2. Enter your email, password, and name
3. You'll be automatically logged in

### 2. Upload Your Base Resume

1. Go to the Dashboard
2. Upload your resume as a PDF
3. The AI will parse and structure your resume
4. Give it a title (e.g., "Software Engineer Resume")

### 3. Create a Tailored Application

1. Click on a resume or go to "New Application"
2. Select your base resume
3. Enter the job title
4. Paste the full job description
5. Click "Generate Tailored Resume"
6. The AI will:
   - Analyze the job requirements
   - Reorder your experience bullets by relevance
   - Emphasize matching skills
   - Generate LaTeX code

### 4. Add Application Questions

1. In the application view, scroll to "Application Questions"
2. Enter a question (e.g., "Why do you want to work here?")
3. Click "Generate Response"
4. The AI will create a response based on your tailored resume

### 5. Download Your Resume

1. Click "Download PDF" to get your tailored resume
2. The PDF will be professionally formatted using Jake's Resume template
3. You can also copy the LaTeX source if needed

## Resume Data Structure

The application uses a structured JSON format for resumes:

```typescript
{
  contact: {
    name: string
    phone?: string
    email: string
    linkedin?: string
    github?: string
    website?: string
  },
  education: [{
    school: string
    degree: string
    location: string
    date: string
    gpa?: string
    coursework?: string[]
  }],
  experience: [{
    company: string
    position: string
    location: string
    date: string
    bullets: string[]
  }],
  projects?: [{
    name: string
    technologies: string[]
    date?: string
    bullets: string[]
  }],
  skills: {
    [category: string]: string[]
  }
}
```

## AI Prompt Engineering

### Resume Parsing
Uses GPT-4o-mini with JSON mode to extract structured data from PDF text.

### Resume Tailoring
Uses GPT-4o to:
- Analyze job requirements
- Reorder experience bullets by relevance
- Emphasize relevant metrics and achievements
- Incorporate job keywords naturally
- Maintain truthfulness

### Question Responses
Uses GPT-4o to:
- Reference specific experiences
- Demonstrate fit for the role
- Show genuine enthusiasm
- Stay within word limits (150-300 words)

## LaTeX Template

The application uses Jake's Resume template, which provides:
- Clean, professional single-column layout
- Proper spacing and typography
- ATS-friendly formatting
- Standard sections: Education, Experience, Projects, Skills

### Custom LaTeX Commands

```latex
\resumeSubheading{Title}{Date}{Subtitle}{Location}
\resumeItem{Bullet point text}
\resumeProjectHeading{Project Name | Technologies}{Date}
```

## Deployment

### Environment Setup

1. Set up a production database (SQLite or PostgreSQL)
2. Configure environment variables
3. Ensure LaTeX is installed on the server
4. Set up Google Gemini API access

### Build

```bash
npm run build
npm start
```

### Docker Option

For LaTeX compilation in production, consider using Docker with texlive installed.

## Troubleshooting

### Prisma Client Issues

If you see Prisma client errors:

```bash
npx prisma generate
npx prisma db push
```

### LaTeX Compilation Fails

Ensure LaTeX is installed:
- macOS: `which pdflatex`
- Linux: `which pdflatex`
- Windows: Check MiKTeX installation

### PDF Parsing Issues

The current implementation uses basic text extraction. For better results:
- Ensure PDFs are text-based (not scanned images)
- Use standard resume formatting
- The AI parser is quite flexible but works best with clear structure

### Google Gemini API Errors

- Check your API key is valid
- Ensure you have sufficient credits
- Check rate limits if seeing 429 errors

## Cost Estimates

Google Gemini API usage per action:
- Resume parsing: ~$0.01-0.02 (GPT-4o-mini)
- Resume tailoring: ~$0.05-0.10 (GPT-4o)
- Question response: ~$0.03-0.06 (GPT-4o)

Average cost per application: ~$0.10-0.20

## Security Considerations

- Passwords are hashed with bcrypt
- Sessions are managed securely with NextAuth
- API routes are protected with authentication
- User data is isolated (users can only access their own data)
- File uploads are validated (type, size)
- SQL injection prevention via Prisma ORM

## Future Enhancements

- Multiple LaTeX templates
- DOCX export support
- Resume comparison view
- Cover letter generation
- Email follow-up templates
- Application tracking dashboard
- Browser extension for one-click job application
- Collaborative editing
- Resume analytics and ATS scoring

## License

MIT License

## Acknowledgments

- Jake's Resume template by Jake Gutierrez
- shadcn/ui for the component library
- Google Gemini for AI capabilities
- Next.js team for the excellent framework

---

Built with Next.js, Google Gemini, and LaTeX