# System Patterns: Media Bias Analyzer

## System Architecture

The Media Bias Analyzer follows a client-server architecture with the following components:

```
┌─────────────────────────────────────────────────┐      ┌─────────────────────────┐      ┌─────────────────┐
│ Chrome Extension (Client)                       │      │ Flask Backend (Server)  │      │ OpenAI API      │
│                                                 │      │                         │      │                 │
│ ┌─────────────┐    ┌─────────────────────────┐  │      │ ┌─────────────────────┐ │      │ ┌─────────────┐ │
│ │ Content     │    │ Extension UI (SidePanel)│  │      │ │ Flask Application   │ │      │ │ GPT-4o      │ │
│ │ Script      │◄───┤                         │  │      │ │                     │ │      │ │ Model       │ │
│ │             │    │                         │  │      │ │ ┌─────────────────┐ │ │      │ │             │ │
│ └─────────────┘    └─────────────────────────┘  │      │ │ │ Analysis Logic  │ │ │      │ └─────────────┘ │
│        │                 ▲                       │      │ │ └─────────────────┘ │ │      │                 │
│        │                 │                       │      │ └─────────────────────┘ │      └─────────────────┘
│        ▼                 │                       │      │             ▲            │               ▲
│ ┌─────────────┐    ┌─────────────┐               │      │             │            │               │
│ │ Background  │    │ Chrome      │               │      │             │            │               │
│ │ Script      │    │ Storage API │               │      │             │            │               │
│ └─────────────┘    └─────────────┘               │      │             │            │               │
│        │                 ▲                       │      │             │            │               │
│        │                 │                       │      │             │            │               │
│        ▼                 │                       │      │             │            │               │
│ ┌──────────────────────────────────────┐         │      │             │            │               │
│ │ dashboardItems.json                  │         │      │             │            │               │
│ │ (Prompt & Dashboard Configuration)   │         │      │             │            │               │
│ └──────────────────────────────────────┘         │      │             │            │               │
└─────────────────────────────────────────────────┘      └─────────────┼────────────┘               │
                                                                       │                            │
                                                                       └────────────────────────────┘
```

### Key Components

1. **Chrome Extension (Client)**
   - **Content Script**: Extracts article text from web pages
   - **Background Script**: Manages side panel behavior
   - **Extension UI**: Displays analysis results in a side panel
   - **Chrome Storage API**: Persists analysis history and settings
   - **dashboardItems.json**: Structured configuration for prompt and dashboard items

2. **Flask Backend (Server)**
   - **Flask Application**: Handles HTTP requests from the extension
   - **Analysis Logic**: Prepares prompts and processes responses

3. **OpenAI API**
   - **GPT-4o Model**: Performs the actual analysis of article text

## Data Flow

1. **Article Text Extraction**
   - User navigates to a news article
   - User clicks extension icon to open side panel
   - User clicks "Analyze" button
   - Content script extracts article text and metadata
   - Data is sent to background script

2. **Analysis Request**
   - Background script reads the prompt configuration from dashboardItems.json
   - Background script constructs the full prompt from the JSON structure
   - Background script forwards article text and constructed prompt to the Flask backend
   - Flask backend replaces `{article_text}` in the prompt with the actual article text
   - Flask backend sends the completed prompt to the OpenAI API

3. **Analysis Processing**
   - OpenAI API processes the prompt and returns analysis
   - Flask backend parses and formats the response
   - Formatted analysis is returned to the extension

4. **Results Display**
   - Extension receives analysis data
   - UI renders the bias meter and analysis sections
   - Results are stored in Chrome storage for history

## Design Patterns

### Observer Pattern
- The extension uses event listeners to respond to user actions
- Content script observes DOM changes to extract article content

### Model-View-Controller (MVC)
- **Model**: Article data, analysis results, and prompt configuration
- **View**: HTML/CSS components in the side panel
- **Controller**: JavaScript functions that handle user interactions

### Configuration Object Pattern
- The dashboardItems.json file serves as a centralized configuration object
- Separates configuration from code for improved maintainability
- Enables runtime customization without code changes

### Facade Pattern
- The backend API provides a simplified interface to the complex OpenAI API
- The content script abstracts away the complexity of DOM manipulation
- The prompt construction process abstracts the complexity of the prompt structure

### Strategy Pattern
- Different analysis components (bias score, language tone, etc.) are processed independently
- Each component has its own display strategy in the UI

## Key Technical Decisions

### Side Panel UI
- Chrome's side panel API is used instead of a popup for more screen real estate
- This allows for a more comprehensive display of analysis results

### Structured JSON Prompt Configuration
- Prompt template converted from monolithic text to structured JSON
- Enables modularity, customization, and future UI controls
- Separates different components of the prompt for individual editing

### Local Backend Server
- A local Flask server is used instead of direct API calls from the extension
- This keeps API keys secure and allows for more complex processing

### JSON Data Format
- All communication between components uses JSON for consistency
- Structured data format makes it easy to parse and display results
- Both prompt configuration and analysis results use JSON for uniformity

### Expandable UI Sections
- Analysis results are organized into collapsible sections
- This prevents information overload while still providing comprehensive analysis

### History Management
- Analysis history is stored locally using Chrome's storage API
- This provides persistence without requiring user accounts

## Critical Implementation Paths

### Article Text Extraction
```
User clicks "Analyze" → Content script extracts text → Text sent to backend → Analysis results displayed
```

### Prompt Construction
```
Background script reads dashboardItems.json → Constructs full prompt → Sends to backend with article text
```

### History Management
```
Analysis completed → Results saved to storage → History page displays entries → User can revisit analyses
```

### Settings Configuration
```
User opens settings → Changes preferences → Settings saved to storage → Preferences applied to extension
```

## Error Handling

1. **Network Failures**
   - Timeout handling for backend requests
   - User-friendly error messages

2. **Text Extraction Issues**
   - Fallback strategies for different page structures
   - Error reporting when article text cannot be extracted

3. **API Limitations**
   - Handling of token limits and rate limiting
   - Graceful degradation when API is unavailable

4. **Configuration Issues**
   - Validation of JSON structure before use
   - Fallback to default configuration if JSON is invalid

## Security Considerations

1. **API Key Protection**
   - Keys stored in server environment variables
   - No sensitive data in client-side code

2. **Data Privacy**
   - Analysis performed on-demand only
   - No persistent storage of article content

3. **Permission Scope**
   - Extension requests only necessary permissions
   - Clear explanation of permission usage
