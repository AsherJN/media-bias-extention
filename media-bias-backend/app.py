from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import os
import json  # To parse JSON responses

# Initialize the Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Set up OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()

    if not data or 'text' not in data:
        return jsonify({'error': 'No text provided'}), 400

    article_text = data['text']

    # Create the prompt for OpenAI
    prompt = f"""
Analyze the following news article for media bias and provide the results in JSON format with the following fields:
- bias_score: integer between -10 (left-leaning) to +10 (right-leaning), 0 is neutral.
- language_tone: 'positive', 'negative', or 'neutral'.
- framing_perspective: A brief description of the framing and perspective.
- disputed_claims: A list of any claims that are contested or debunked.

Article Text:
{article_text}

Provide the analysis in JSON format only.
"""

    try:
        # Call the OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",  # Use "gpt-4" if you have access
            messages=[
                {"role": "system", "content": "You are an assistant that analyzes news articles for media bias."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500,
            n=1,
            stop=None,
            temperature=0.7,
        )

        # Extract the assistant's reply
        analysis = response['choices'][0]['message']['content']

        # Parse the JSON output
        analysis_json = json.loads(analysis.strip())

        return jsonify(analysis_json)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
