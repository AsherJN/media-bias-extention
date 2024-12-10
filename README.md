Media Bias Analyzer Chrome Extension
 
## Overview
 
The **Media Bias Analyzer** is a Chrome extension that provides a comprehensive and nuanced analysis of online news articles. It leverages a Flask backend and the OpenAI GPT API to evaluate various aspects of an article, helping users understand the underlying bias, context, and framing of the news content they consume. With a modern and refined user interface, the extension presents key insights, making it easier for users to critically assess media coverage.
 
## Table of Contents
 
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Data Returned by the Backend](#data-returned-by-the-backend)
- [Dependencies](#dependencies)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)
- [Contact](#contact)
- [Troubleshooting](#troubleshooting)
- [Notes](#notes)
- [Future Enhancements](#future-enhancements)
 
## Features
 
- **Comprehensive Article Analysis**:  
  Provides an in-depth assessment of media bias and contextual information.
  
- **Analysis Summary**:  
  A subjective overview of the article's bias without referencing the numeric bias score. It highlights whether the article skews liberal, conservative, or neutral, along with key reasoning (under 100 words).
  
- **Context**:  
  Offers 200-500 words of background information sourced from the internet, helping the user understand the article's subject matter and current events in a well-rounded manner.
  
- **Content Summary**:  
  A 200-word summary that concisely presents the article's key points and takeaways.
  
- **Bias Score Meter**:  
  A visual representation of the article's bias on a scale from -5 (left-leaning) to +5 (right-leaning), with 0 being neutral. The UI includes a gradient bar and an arrow indicator.
  
- **Language Tone Analysis**:  
  A brief 2-sentence description focusing on the language and tone used in the article.
  
- **Framing Perspective**:  
  A summary (under 150 words) that describes how the article frames its topic or argument.
  
- **Alternative Perspectives**:  
  Evaluates whether the article includes differing viewpoints. Also provides additional alternative facts or perspectives sourced from the internet to give users a more nuanced understanding (under 300 words).
  
- **Publisher Bias**:  
  A short (50 words) summary of the publisher's historical leaning or typical bias, referencing known media biases from recognized outlets.
  
- **Modern and User-Friendly UI**:  
  Sleek visuals, clickable insights, and expandable sections inspired by modern design standards.
  
- **Easy Integration**:  
  Straightforward setup process, leveraging a Flask backend and OpenAI API.
 
## Prerequisites
 
- Python 3.7 or higher
- Google Chrome Browser
- OpenAI API Key
- Node.js and npm (optional, for development purposes)
 
## Installation
 
### Clone the Repository
 
```bash
git clone https://github.com/yourusername/media-bias-analyzer.git
```
 
### Set Up the Backend Server
 
Navigate to the Backend Directory:
```bash
cd media-bias-analyzer/media-bias-backend
```
 
Create a Virtual Environment:
```bash
python -m venv venv
```
 
Activate the Virtual Environment:
- On Windows:
  ```bash
  venv\Scripts\activate
  ```
- On macOS/Linux:
  ```bash
  source venv/bin/activate
  ```
 
Install Dependencies:
```bash
pip install -r requirements.txt
```
 
Set Up Environment Variables:
- Create a `.env` file in the `media-bias-backend` directory.
- Add your OpenAI API key to the `.env` file:
  ```
  OPENAI_API_KEY=your-openai-api-key-here
  ```
 
Run the Backend Server:
```bash
python app.py
```
The server should now be running on http://127.0.0.1:5000.
 
### Set Up the Chrome Extension
 
Navigate to the Extension Directory:
```bash
cd ../media-bias-extension
```
 
Load the Extension into Chrome:
- Open Chrome and go to `chrome://extensions/`.
- Enable Developer mode.
- Click on "Load unpacked".
- Select the `media-bias-extension` folder.
 
Update Extension Permissions (if necessary): Ensure that `manifest.json` has the appropriate permissions and host permissions for the sites you wish to analyze.
 
## Usage
 
Start the Backend Server:
```bash
cd media-bias-analyzer/media-bias-backend
source venv/bin/activate
python app.py
```
 
Use the Extension:
1. Navigate to a news article in Chrome.
2. Click on the Media Bias Analyzer extension icon.
3. Click the Analyze button.
4. Wait for the analysis to complete.
5. View the results in the extension popup, including the bias score meter, analysis summary, context, content summary, language tone, framing perspective, alternative perspectives, and publisher bias.
 
## Project Structure
 
```
media-bias-analyzer/
├── media-bias-backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── .env
│   └── venv/
├── media-bias-extension/
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.css
│   ├── popup.js
│   ├── contentScript.js
│   ├── background.js (optional)
│   └── icons/
│       ├── icon16.png
│       ├── icon48.png
│       └── icon128.png
└── README.md
```
 
## Data Returned by the Backend
 
The backend API returns a JSON object containing:
- `analysis_summary` (<100 words): A subjective overview of the article's bias without referencing numeric scores.
- `context` (200-500 words): Background information sourced from the internet to understand the article's subject.
- `content_summary` (~200 words): A comprehensive summary of the article's key points and takeaways.
- `bias_score` (-5 to +5): An integer representing the article's bias direction and intensity.
- `language_tone` (2 sentences): Describes language and tone bias.
- `framing_perspective` (<150 words): Summarizes how the article frames its argument.
- `alternative_perspectives` (<300 words): Assesses if the article includes differing viewpoints and provides additional alternative facts.
- `publisher_bias` (~50 words): Describes the typical bias of the publisher based on historical patterns.
 
## Dependencies
 
### Backend Dependencies (Python)
- Flask
- Flask-CORS
- OpenAI
- python-dotenv
 
Install these via:
```bash
pip install -r requirements.txt
```
 
### Frontend Dependencies (Chrome Extension)
None (All dependencies are handled via CDNs or are native to JavaScript).
 
## Contributing
 
Contributions are welcome! To contribute:
1. Fork the Repository
2. Clone Your Fork
3. Create a New Branch
4. Make Your Changes
5. Commit Your Changes
6. Push to Your Fork
7. Create a Pull Request
 
## License
 
This is all open source, have fun!
 
## Acknowledgments
 
- OpenAI: For the GPT API used in text analysis.
- Flask: For providing the web framework.
- Chrome Extensions Documentation: For guidance on extension development.
- Community Contributors: For helping improve the project.
 
## Contact
 
For questions or suggestions, open an issue on the GitHub repository or contact the maintainer at joshua_nelson@ucsb.edu.
 
## Troubleshooting
 
- **CORS Issues**: Ensure that the Flask backend has CORS properly configured.
- **OpenAI API Errors**: Verify your API key and usage limits.
- **Extension Not Working**: Reload the extension and check Chrome's Developer Tools console for errors.
 
## Notes
 
- **Security**: Do not expose your OpenAI API key publicly.
- **Privacy**: The content analyzed may be sent to OpenAI's servers.
- **API Usage**: Be mindful of usage policies and costs.
 
## Future Enhancements
 
1. Deploy Backend Server
2. Improved UI/UX
3. Additional Features:
  - Sentiment analysis
  - Historical data tracking
  - User settings and preferences
 
Thank you for using the Media Bias Analyzer! We hope this tool helps you navigate news content with greater awareness and understanding.