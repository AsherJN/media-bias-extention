# System Patterns: Media Bias Analyzer

## System Architecture

The Media Bias Analyzer follows a client-server architecture with the following components:

```
┌─────────────────────────────────────┐      ┌─────────────────────────┐      ┌─────────────────┐
│ Chrome Extension (Client)           │      │ Flask Backend (Server)  │      │ OpenAI API      │
│                                     │      │                         │      │                 │
│ ┌─────────────┐    ┌─────────────┐  │      │ ┌─────────────────────┐ │      │ ┌─────────────┐ │
│ │ Content     │    │ Extension   │  │      │ │ Flask Application   │ │      │ │ GPT-4o      │ │
│ │ Script      │◄───┤ UI (Popup)  │  │      │ │                     │ │      │ │ Model       │ │
│ │             │    │             │  │      │ │ ┌─────────────────┐ │ │      │ │             │ │
│ └─────────────┘    └─────────────┘  │      │ │ │ Analysis Logic  │ │ │      │ └─────────────┘ │
│        │                 ▲           │      │ │ └─────────────────┘ │ │      │                 │
│        │                 │           │      │ └─────────────────────┘ │      └─────────────────┘
│        ▼                 │           │      │             ▲            │               ▲
│ ┌─────────────┐    ┌─────────────┐  │      │             │            │               │
│ │ Background  │    │ Chrome      │  │      │             │            │               │
│ │ Script      │    │ Storage API │  │      │             │            │               │
│ └─────────────┘    └─────────────┘  │      │             │            │               │
└─────────────────────────────────────┘      └─────────────┼────────────┘               │
                                                           │                            │
                                                           └────────────────────────────┘
```

### Key Components

1. **Chrome Extension (Client)**
   - **Content Script**: Extracts article text from web pages
   - **Background Script**: Manages side panel behavior
   - **Extension UI**: Displays analysis results in a side panel
   - **Chrome Storage API**: Persists analysis history and settings

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

2. **Prompt Generation**
   - Extension loads the prompt framework from JSON
   - All instructions (role, context, dashboard items, task, JSON schema) are placed in the system message
   - Only the article text is placed in the user message
   - Additional instructions are added to maintain the role's personality within JSON fields
   - The OpenAI API's response_format parameter is used to enforce JSON structure
   - This ensures the AI model follows both the custom role personality and the JSON schema requirements with equal priority

3. **Analysis Request**
   - Background script forwards the complete prompt to the Flask backend
   - Flask backend sends the prompt to the OpenAI API

4. **Analysis Processing**
   - OpenAI API processes the prompt and returns analysis
   - Flask backend parses and formats the response
   - Formatted analysis is returned to the extension

5. **Results Display**
   - Extension receives analysis data
   - UI renders the bias meter and analysis sections
   - Results are stored in Chrome storage for history

## Design Patterns

### Observer Pattern
- The extension uses event listeners to respond to user actions
- Content script observes DOM changes to extract article content

### Model-View-Controller (MVC)
- **Model**: Article data and analysis results
- **View**: HTML/CSS components in the side panel
- **Controller**: JavaScript functions that handle user interactions

### Facade Pattern
- The backend API provides a simplified interface to the complex OpenAI API
- The content script abstracts away the complexity of DOM manipulation

### Strategy Pattern
- Different analysis components (bias score, language tone, etc.) are processed independently
- Each component has its own display strategy in the UI
- Dynamic text bubble creation adapts to the actual dashboard items returned by the backend
- UI components are generated based on data structure rather than hardcoded implementation

### Composite Pattern
- The prompt framework uses a composite structure where each section is a component
- Sections can be manipulated independently but combined to form a complete prompt

### Factory Pattern
- The promptUtils.js file contains factory functions for creating and manipulating prompt components
- The createDynamicTextBubbles function acts as a factory for UI components based on data structure
- Dynamic creation of UI elements based on the analysis response structure improves flexibility

## Key Technical Decisions

### Side Panel UI
- Chrome's side panel API is used instead of a popup for more screen real estate
- This allows for a more comprehensive display of analysis results

### Local Backend Server
- A local Flask server is used instead of direct API calls from the extension
- This keeps API keys secure and allows for more complex processing

### JSON Data Format
- All communication between components uses JSON for consistency
- Structured data format makes it easy to parse and display results

### JSON-Based Prompt Framework
- The AI prompt is stored as a structured JSON object instead of a string
- Each section has metadata (ID, title, order) and content
- Sections are organized into categories (Personality, Dashboard Items, Prompt Instructions)
- This enables more flexible manipulation and customization of the prompt
- The categorized structure improves maintainability and organization
- A comprehensive editor UI allows users to customize the prompt:
  - Personality sections can have their content edited
  - Dashboard Items can have both title and content edited
  - Changes are saved directly to Chrome storage
  - A Reset to Default button restores the original prompt

### Expandable UI Sections
- Analysis results are organized into collapsible sections
- This prevents information overload while still providing comprehensive analysis

### History Management
- Analysis history is stored locally using Chrome's storage API
- This provides persistence without requiring user accounts

### Standardized JSON Structure
- The AI prompt uses a standardized JSON structure throughout the application
- All components use the same field naming convention (dashboard_item_X)
- No backward compatibility code is maintained, simplifying the codebase

### Dynamic UI Generation
- UI components are dynamically generated based on the analysis response structure
- The createDynamicTextBubbles function reads the promptFramework to get titles for dashboard items
- This approach improves maintainability and adaptability to changes in the backend response
- Removal of hardcoded fallbacks ensures consistent technology alignment throughout the application

## Critical Implementation Paths

### Article Text Extraction
```
User clicks "Analyze" → Content script extracts text → Text sent to backend → Analysis results displayed
```

### Prompt Generation
```
Framework loaded from JSON → Sections flattened and sorted by order → All instructions placed in system message → Article text placed in user message → Sent as separate system/user messages to OpenAI API
```

### History Management
```
Analysis completed → Results saved to storage → History page displays entries → User can revisit analyses
```

### Settings Configuration
```
User opens settings → Changes preferences → Settings saved to storage → Preferences applied to extension
```

### Prompt Framework Usage
```
Framework loaded from JSON → Sections flattened to array → Sections sorted by order → Article text section identified and extracted → All other sections placed in system message → Article text placed in user message → Used in analysis
```

### Prompt Customization
```
User opens prompt editor → Framework loaded from storage → UI renders editable cards → User edits content/title → Changes saved to storage → Updated framework used in future analyses
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

4. **Framework Loading Failures**
   - Clear error handling with user-friendly messages
   - Error logging for debugging framework issues

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

4. **JSON Validation**
   - Validation of JSON structure before use
   - Error handling for malformed JSON data
