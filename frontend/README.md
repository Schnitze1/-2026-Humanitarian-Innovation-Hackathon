# Aiga Frontend UI

React-based Single Page Application (SPA), 5-step workflow for NGOs to safely draft, review, and export AI-assisted reports. 

## Key Features

- **Workflow Progress System**: Persistent, centralized top-navigation progress bar guiding users through Setup, Upload, Generate, Review, and Disclosure steps.
- **Dynamic South Pacific Imagery**: Integration with LoremFlickr dynamically surfaces high-quality stock photography tagged with South Pacific regions (e.g., Fiji, Samoa, Vanuatu, Tonga) aligned precisely to 14 specific NGO issues on the Homepage.
- **Confidence Highlighting**: The Review UI leverages Markdown parsing to dynamically inject high-visibility colors (Green for >= 80% accuracy, Orange for < 80%) into the generated text, immediately exposing potential AI hallucinations.
- **Native PDF Export**: The Disclosure tab securely iframes backend HTML templates, allowing users to "Save as PDF" using the native browser print dialog, ensuring styling is preserved seamlessly.

## Project Structure

```
frontend/
├── public/                # Static assets, entry HTML
├── src/
│   ├── api/               # Custom fetch wrappers (client.js) connecting to FastAPI
│   ├── components/
│   │   ├── layout/        # AppLayout, PageHeader, HeroGallery
│   │   ├── ingest/        # File dropzones
│   │   ├── ui/            # Reusable buttons, cards, badges
│   ├── constants/         # NGO catalogs and South Pacific image mapping dictionary
│   ├── context/           # React Context (ReportContext) for state management
│   ├── pages/             # Route-level views (Welcome, Setup, Upload, Generate, Review, Disclosure)
│   ├── styles/            # Vanilla CSS stylesheets
│   └── App.js             # Router definitions
```

## Running the Application

Make sure the FastAPI backend is running on port 8000.

```bash
cd frontend
npm install
npm start
```

The application will be accessible at `http://127.0.0.1:3000`.
