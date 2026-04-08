# 🚀 Smart Progress Tracker (Career OS)

## Measure Real Learning Progress, Not Just Activity

A full-stack web application that tracks daily tasks and learning 
activities to measure actual progress through weighted scoring, 
skill analysis, consistency tracking, and job readiness assessment.

---

## 🎯 Problem

Traditional tools only track task completion. They don't tell you:
- Are you actually improving?
- Which skills are strong/weak?
- Are you consistent?
- Are you job-ready?

## 💡 Solution

Smart Progress Tracker uses **weighted scoring** to measure real progress:
Task Score = (Actual Time) × (Difficulty Multiplier) × (Completion %)

## 🛠️ Tech Stack

| Layer     | Technology         |
|-----------|--------------------|
| Frontend  | React + Vite       |
| Styling   | Tailwind CSS       |
| Charts    | Recharts           |
| Backend   | Node.js + Express  |
| Database  | MongoDB Atlas      |
| Auth      | JWT                |

## 📊 Features

### Input Layer
- ✅ Daily Task Logger with skill tags
- ✅ Grid & List view
- ✅ Difficulty levels (Easy/Medium/Hard)

### Logic Layer  
- ✅ Weighted Progress Calculation
- ✅ Weekly Progress Percentage
- ✅ Skill Analysis Engine
- ✅ Goal vs Actual Comparison

### Output Layer
- ✅ Progress Bars & Charts
- ✅ Skill Heatmap
- ✅ Daily Productivity Chart
- ✅ Planned vs Actual Chart
- ✅ Monthly Summary

### Intelligence Layer
- ✅ Consistency Tracker (Streaks)
- ✅ Automated Weekly Review
- ✅ Job Readiness Score

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Git

### 1. Clone Repository

git clone https://github.com/yourusername/smart-progress-tracker.git
cd smart-progress-tracker

### 2. Setup Backend

cd server
npm install
# Create .env file with your MongoDB URI and JWT secret
cp .env.example .env
# Edit .env with your values
npm run dev

### 3.Setup Fronted
cd client
npm install
npm run dev

### 4. Open Browser
http://localhost:5173

### 📸 Screenshots
# Dashboard
Weekly progress, charts, skill distribution

# Task Logger
Add tasks with skill tags, difficulty, time tracking

# Analytics
Skill analysis, heatmap, consistency tracker

# Job Readiness
Composite score from skills, projects, consistency

### 🏗️ Architecture

User → Task Logger → MongoDB
                        ↓
              Progress Engine (Weighted Calculation)
                        ↓
              Skill Analyzer + Consistency Tracker
                        ↓
              Charts + Insights + Job Readiness Score
                        ↓
              React Dashboard (Visual Output)

### 📈 Weighted Progress Formula

Task Score = (actualTime/60) × difficultyMultiplier × (completion/100)

Difficulty Multipliers:
  Easy   = 1.0x
  Medium = 1.5x  
  Hard   = 2.5x

Weekly Progress = (Total Score / Expected Score) × 100

### 🎯 Job Readiness Score Components

Component	     Weight
Skill Coverage	   30%
Skill Depth	      25%
Project Work	   20%
Consistency       15%
Difficulty Level	10%

### 📜 License
MIT License
