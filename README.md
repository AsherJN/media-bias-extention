# Media Bias Analyzer Chrome Extension

## Overview
The Media Bias Analyzer is a Chrome extension that analyzes news articles for media bias, language tone, framing perspective, and disputed claims. It provides users with a visual dashboard to help them understand the potential bias and framing of online news content. The extension leverages a Flask backend server and the OpenAI GPT API to perform the analysis.

## Table of Contents
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [Clone the Repository](#clone-the-repository)
  - [Set Up the Backend Server](#set-up-the-backend-server)
  - [Set Up the Chrome Extension](#set-up-the-chrome-extension)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Dependencies](#dependencies)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)
- [Contact](#contact)
- [Troubleshooting](#troubleshooting)
- [Notes](#notes)
- [Future Enhancements](#future-enhancements)

## Features
- **Bias Score Meter**: Visual representation of the article's bias on a scale from -5 (liberal) to +5 (conservative), with an interpretation meter.
- **Language Tone Analysis**: Determines whether the article's language tone is positive, negative, or neutral.
- **Framing Perspective**: Provides a brief description of the article's framing and perspective.
- **Disputed Claims Detection**: Lists any claims within the article that are contested or debunked.
- **Modern UI**: Sleek and user-friendly interface inspired by contemporary web design standards.
- **Easy Integration**: Simple setup process to get started quickly.

## Prerequisites
- Python 3.7 or higher
- Google Chrome Browser
- OpenAI API Key
- Node.js and npm (optional, for development purposes)

## Installation

### Clone the Repository
Clone the repository to your local machine:
```bash
git clone https://github.com/yourusername/media-bias-analyzer.git
```
## Set Up the Backend Server

1. **Navigate to the Backend Directory:**
    ```bash
    cd media-bias-analyzer/media-bias-backend
    ```
2. **Create a Virtual Environment:**
    ```bash
    python -m venv venv
    ```
3. **Activate the Virtual Environment:**
    - **On Windows:**
      ```bash
      venv\Scripts\activate
      ```
    - **On macOS/Linux:**
      ```bash
      source venv/bin/activate
      ```
4. **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
5. **Set Up Environment Variables:**
   - Create a `.env` file in the `media-bias-backend` directory.
   - Add your OpenAI API key to the `.env` file:
     ```env
     OPENAI_API_KEY=your-openai-api-key-here
     ```
6. **Run the Backend Server:**
    ```bash
    python app.py
    ```
   - The server should now be running on `http://127.0.0.1:5000`.

## Set Up the Chrome Extension

1. **Navigate to the Extension Directory:**
    ```bash
    cd ../media-bias-extension
    ```
2. **Load the Extension into Chrome:**
   - Open Chrome and go to `chrome://extensions/`.
   - Enable Developer mode by toggling the switch in the top right corner.
   - Click on **Load unpacked**.
   - Select the `media-bias-extension` folder.
3. **Update Extension Permissions (if necessary):**
   - Ensure that the `manifest.json` file has the correct permissions and host permissions for the sites you wish to analyze.

## Usage

### Start the Backend Server
Make sure the backend Flask server is running:
```bash
cd media-bias-analyzer/media-bias-backend
source venv/bin/activate
python app.py
```
## Use the Extension
1. **Navigate to a news article** in Chrome.
2. **Click on the Media Bias Analyzer extension icon**.
3. **Click the "Analyze This Page" button**.
4. **Wait for the analysis to complete**.
5. **View the results** in the extension popup.

## Project Structure

```plaintext
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


# Dependencies

## Backend Dependencies (Python)
- **Flask**
- **Flask-CORS**
- **OpenAI**
- **python-dotenv**

Install all backend dependencies via pip using the `requirements.txt` file:
```bash
pip install -r requirements.txt

## Frontend Dependencies (Chrome Extension)

- **None** (All dependencies are handled via CDN or are native to JavaScript)

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the Repository**: Click on the "Fork" button at the top right of the repository page.
2. **Clone Your Fork**:
    ```bash
    git clone https://github.com/yourusername/media-bias-analyzer.git
    ```
3. **Create a New Branch**:
    ```bash
    git checkout -b feature/your-feature-name
    ```
4. **Make Your Changes.**
5. **Commit Your Changes**:
    ```bash
    git commit -m "Add your commit message here"
    ```
6. **Push to Your Fork**:
    ```bash
    git push origin feature/your-feature-name
    ```
7. **Create a Pull Request**: Go to the original repository and click on **New Pull Request**.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgments

- **OpenAI** for providing the GPT API used for text analysis.
- **Flask** for the web framework.
- **Chrome Extensions Documentation** for guidance on extension development.
- **Community Contributors** who have helped improve this project.

## Contact

For any questions or suggestions, please open an issue on the GitHub repository or contact the maintainer at `youremail@example.com`.

## Troubleshooting

- **CORS Issues**: If you encounter Cross-Origin Resource Sharing (CORS) errors, ensure that the Flask backend has CORS properly configured.
- **OpenAI API Errors**: Verify that your OpenAI API key is correct and that you have sufficient permissions and quota.
- **Extension Not Working**: Make sure you have reloaded the extension after making changes. Check the console logs in Chrome's Developer Tools for errors.

## Notes

- **Security**: Do not expose your OpenAI API key in public repositories or client-side code.
- **Privacy**: Be mindful of the content you analyze, as it may be sent to OpenAI's servers for processing.
- **API Usage**: Be aware of OpenAI's API usage policies and limits to avoid unexpected charges.

## Future Enhancements

- **Deploy Backend Server**: Host the Flask backend on a cloud platform for remote access.
- **Improved UI/UX**: Continue refining the extension's interface for better usability.
- **Additional Features**:
  - Sentiment analysis.
  - Historical data tracking.
  - User settings and preferences.