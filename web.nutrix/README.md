# NutriX - AI-Powered Clinical Nutrition Platform

A premium web application that analyzes medical reports and generates personalized meal plans using AI.

## Features

- 🔐 **User Authentication** - Secure login and registration
- 👤 **Profile Management** - Physical metrics with real-time BMR/TDEE calculation
- 📄 **Medical Analysis** - PDF upload with Gemini AI biomarker extraction
- 🍽️ **Meal Planning** - Personalized 3-meal plans based on health conditions
- 📊 **Health Insights** - Visual status indicators for various conditions
- 📝 **Plan History** - Save and restore previous meal plans

## Tech Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS with custom premium theme
- **Animations**: Framer Motion
- **Routing**: React Router DOM
- **AI Services**: Google Gemini API (configurable), Custom RAG backend (configurable)

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
```bash
cd web.nutrix
```

2. Install dependencies
```bash
npm install
```

3. (Optional) Configure API keys

Create a `.env` file in the root directory:

```env
# Optional: Gemini API for PDF extraction
VITE_GEMINI_API_KEY=your_api_key_here

# Optional: Backend RAG service
VITE_BACKEND_URL=https://your-backend-url.com
```

**Note**: The application works with mock services by default. Real API integration is optional.

4. Start the development server
```bash
npm run dev
```

The app will open at `http://localhost:3000`

## Project Structure

```
web.nutrix/
├── src/
│   ├── components/          # Shared UI components
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   └── StatusIndicator.jsx
│   ├── features/            # Feature modules
│   │   ├── analysis/        # Medical analysis feature
│   │   │   ├── AnalysisScreen.jsx
│   │   │   ├── PDFUploader.jsx
│   │   │   ├── BiomarkerTable.jsx
│   │   │   └── ConditionPredictor.js
│   │   ├── planner/         # Meal planner feature
│   │   │   ├── PlannerScreen.jsx
│   │   │   └── MealCard.jsx
│   │   └── profile/         # Profile management
│   │       ├── ProfileScreen.jsx
│   │       └── MetricsCalculator.js
│   ├── models/              # Data models
│   │   ├── User.js
│   │   ├── Biomarker.js
│   │   └── MealPlan.js
│   ├── services/            # API and utilities
│   │   ├── geminiService.js
│   │   ├── ragService.js
│   │   └── validationService.js
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # React entry point
│   └── index.css            # Global styles
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## Usage Guide

### 1. Complete Your Profile

- Navigate to the **Profile** tab
- Enter your personal information (name, age, gender)
- Add physical metrics (height, weight)
- Select your activity level
- See real-time BMR and TDEE calculations
- Save your profile

### 2. Analyze Medical Reports

- Go to the **Analysis** tab
- Upload a PDF of your medical test results
- Review extracted biomarkers
- Edit values if needed
- View predicted health conditions with confidence scores

### 3. Generate Meal Plans

- Navigate to the **Meal Plan** tab
- Click "Generate Meal Plan"
- Review your personalized 3-meal plan:
  - Breakfast, Lunch, and Dinner
  - Complete macro breakdown
  - Tailored to your TDEE and health conditions
- Access plan history to restore previous plans

## Health Conditions Supported

- **Anemia** - Low hemoglobin detection
- **Diabetes** - Elevated glucose and HbA1c analysis
- **Hypertension** - Blood pressure monitoring
- **High Cholesterol** - Lipid panel analysis
- **Fit** - All biomarkers within normal ranges

## Validation Ranges

- **Age**: 18-100 years
- **Weight**: 30-300 kg
- **Height**: 100-250 cm
- **PDF Upload**: Max 10MB, PDF files only

## Design Features

- 🎨 **Premium UI** - Glass-morphism effects with orange (#F97316) accents on deep black (#0F172A)
- ✨ **Smooth Animations** - Framer Motion transitions throughout
- 📱 **Responsive Design** - Works on desktop and mobile
- 🎯 **Intuitive UX** - Clear navigation and visual feedback

## API Integration

### Gemini API (Optional)

To enable real PDF extraction:

1. Get an API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to `.env`: `VITE_GEMINI_API_KEY=your_key`
3. Set `USE_MOCK = false` in `src/services/geminiService.js`

### RAG Backend (Optional)

To connect a custom meal generation backend:

1. Deploy your RAG service
2. Add to `.env`: `VITE_BACKEND_URL=your_url`
3. Set `USE_MOCK = false` in `src/services/ragService.js`

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## License

MIT

## Support

For issues or questions, please open an issue on the repository.

---

Built with ❤️ using React, Tailwind CSS, and Framer Motion
