# Technical Context: Media Bias Analyzer

## Technologies Used

### Frontend (Chrome Extension)
- **HTML/CSS/JavaScript**: Core web technologies for the extension UI
- **Chrome Extension API**: For browser integration and functionality
  - `chrome.sidePanel`: For displaying the analysis interface
  - `chrome.storage`: For persisting user data and history
  - `chrome.tabs`: For interacting with the current browser tab
  - `chrome.runtime`: For background script communication
- **Fetch API**: For making HTTP requests to the backend
- **JSON**: For structured data storage and manipulation
  - Used for prompt framework organization
  - Used for communication between components

### Backend (Flask Server)
- **Python**: Primary programming language
- **Flask**: Web framework for handling API requests
- **Flask-CORS**: For handling cross-origin requests from the extension
- **OpenAI API**: For accessing GPT-4o language model capabilities
- **python-dotenv**: For managing environment variables

### External Services
- **OpenAI GPT-4o**: AI model that performs the article analysis
- **Google Fonts**: For typography (Montserrat font family)

## Development Setup

### Prerequisites
- Python 3.7 or higher
- Google Chrome Browser
- OpenAI API Key
- Node.js and npm (optional, for development purposes)

### Local Development Environment

#### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd media-bias-backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - On Windows: `venv\Scripts\activate`
   - On macOS/Linux: `source venv/bin/activate`

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Create a `.env` file with your OpenAI API key:
   ```
   OPENAI_API_KEY=your-openai-api-key-here
   ```

6. Run the Flask server:
   ```bash
   python app.py
   ```
   - Server runs on http://127.0.0.1:5000 by default

#### Extension Setup
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable Developer mode
3. Click "Load unpacked" and select the extension directory
4. The extension should now be available in Chrome

## Technical Constraints

### Browser Compatibility
- **Chrome Only**: The extension is built specifically for Google Chrome using Chrome Extension Manifest V3
- **Side Panel API**: Requires Chrome version that supports the side panel feature

### Backend Requirements
- **Local Server**: Currently requires a locally running Flask server
- **API Key**: Requires a valid OpenAI API key with access to GPT-4o
- **Network Access**: Extension must be able to communicate with the local server

### Content Extraction Limitations
- **Text-Based Content**: Only extracts and analyzes text content from web pages
- **DOM Structure**: Extraction may vary in effectiveness depending on the website's structure
- **Dynamic Content**: May not capture content loaded dynamically after page load

### API Limitations
- **Rate Limits**: Subject to OpenAI API rate limits
- **Token Limits**: GPT-4o has maximum token limits for input/output
- **Cost Considerations**: API usage incurs costs based on token count

## Dependencies

### Backend Dependencies
```
Flask==2.0.1
Flask-CORS==3.0.10
openai==1.12.0
python-dotenv==1.0.0
```

### Frontend Dependencies
- No external JavaScript libraries are used (vanilla JS implementation)
- Google Fonts CDN for the Montserrat font family

## File Structure

```
media-bias-analyzer/
├── media-bias-backend/
│   ├── app.py                 # Flask application and API endpoints
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables (not in repo)
├── icons/
│   ├── icon16.png             # Extension icon (16x16)
│   ├── icon48.png             # Extension icon (48x48)
│   ├── icon128.png            # Extension icon (128x128)
│   ├── logoHero.svg           # Logo used in the header
│   ├── settings.svg           # Settings icon
│   └── three-dots-menu.svg    # Menu icon for history entries
├── manifest.json              # Extension manifest file
├── popup.html                 # Main HTML for the side panel UI
├── popup.css                  # Styles for the side panel UI
├── popup.js                   # Main JavaScript for the UI functionality
├── promptUtils.js             # Utility functions for working with the prompt framework
├── promptFramework.json       # JSON structure for the AI prompt
├── contentScript.js           # Script that runs in the context of web pages
├── background.js              # Background script for extension functionality
├── aiBiasFramework.txt        # Original text version of the AI prompt (for reference)
└── README.md                  # Project documentation
```

## Tool Usage Patterns

### OpenAI API Usage
- **System Message**: Sets the role as a "highly vigilant internet watchdog"
- **User Message**: Contains the article text and detailed analysis rubric
- **Temperature**: Set to 0.3 for more consistent outputs
- **Response Format**: Structured JSON with specific analysis fields

### Chrome Storage API Usage
- **Local Storage**: Used for persisting data between sessions
- **Key Data Stored**:
  - `analysisResults`: Current analysis results
  - `analysisHistory`: Array of previous analyses with metadata
  - `promptFramework`: JSON structure for the AI prompt
  - `biasAnalysisPrompt`: Legacy string version of the prompt (for backward compatibility)

### Content Extraction Strategy
- Simple paragraph extraction using `document.querySelectorAll("p")`
- Extracts article metadata (title, URL, favicon)
- Future improvement opportunity: More sophisticated extraction logic

### Prompt Framework Usage
- **JSON Structure**: Organizes the prompt into distinct sections with metadata
- **Section Properties**:
  - `id`: Unique identifier for the section
  - `title`: Display title for the section
  - `content`: The actual content of the section
  - `order`: Position of the section in the concatenated prompt
  - `has_placeholder`: Boolean indicating if the section contains a placeholder
  - `placeholder`: The placeholder text to be replaced (e.g., `{article_text}`)
  - `json_id`: For dashboard items, the ID used in the JSON response
- **Utility Functions**:
  - `loadPromptFramework()`: Loads the framework from JSON
  - `concatenatePrompt()`: Combines sections into a complete prompt string
  - `updatePromptSection()`: Updates specific sections
  - `savePromptFramework()`: Persists changes to storage

## Security Considerations

### API Key Protection
- OpenAI API key stored in server-side `.env` file
- Key never exposed to client-side code

### Data Handling
- Article text is sent to backend but not persistently stored
- Analysis results stored locally in the user's browser
- No user identification or tracking implemented

### Permission Usage
- `activeTab`: For accessing the current tab's content
- `scripting`: For injecting content scripts
- `storage`: For saving analysis history and settings
- `sidePanel`: For displaying the side panel UI
- `host_permissions`: For accessing content on all URLs

## Performance Considerations

- **Analysis Time**: Dependent on OpenAI API response time
- **UI Responsiveness**: Asynchronous operations to keep UI responsive
- **Storage Limits**: History limited to 50 entries to prevent excessive storage use
- **JSON Parsing**: Efficient parsing and manipulation of JSON data structures
- **Backward Compatibility**: Fallback mechanisms for handling legacy prompt format
