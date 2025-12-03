# Quick Setup Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Environment Variables

```bash
cp .env.example .env
```

Then edit `.env` and add your OpenAI API key:

```env
OPENAI_API_KEY="your-openai-api-key-here"
```

## Step 3: Initialize Database

```bash
npx prisma generate
npx prisma db push
```

**Note**: If you encounter Prisma engine download errors in this environment, the schema is ready and will work in a standard Node.js environment.

## Step 4: Install LaTeX (Required for PDF Generation)

### macOS
```bash
brew install --cask mactex
```

### Ubuntu/Debian
```bash
sudo apt-get install texlive-full
```

### Windows
Download and install [MiKTeX](https://miktex.org/download)

## Step 5: Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Quick Test

1. Sign up for an account
2. Upload a PDF resume
3. Create a new application with a job description
4. Download the tailored resume PDF

## Project Features

- Resume parsing with AI
- Automatic resume tailoring for job postings
- LaTeX-based PDF generation
- Application question responses
- Secure authentication
- Multiple resumes and applications

## Need Help?

See the main [README.md](README.md) for full documentation.
