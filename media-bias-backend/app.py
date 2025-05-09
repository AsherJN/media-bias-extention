# Try to import dotenv, but continue if it's not available
try:
    from dotenv import load_dotenv
    # Load environment variables from .env file
    load_dotenv()
except ImportError:
    print("Warning: python-dotenv not installed. Using environment variables directly.")
    def load_dotenv():
        pass

from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import os
import json
import re

def reformat_json_response(response_text):
    """
    Extracts JSON content from a formatted string while removing triple backticks.
    """
    response_text = response_text.replace("```json", "").replace("```", "").strip()
    return response_text

# Initialize the Flask app
app = Flask(__name__)
CORS(app, resources={r"/analyze": {"origins": "*"}})

# Set up OpenAI client
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()

    if not data or 'text' not in data:
        return jsonify({'error': 'No text provided'}), 400
    if 'prompt' not in data or not data['prompt']:
        return jsonify({'error': 'No prompt provided'}), 400

    article_text = data['text']
    prompt = data['prompt'].replace("{article_text}", article_text)

    try:
        print("Starting analysis of article text...")
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "You are a highly vigilant internet watchdog whose main priority is to assist users in navigating media bias. Provide responses in JSON format only."
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
        )

        print("Received response from OpenAI API")
        analysis = response.choices[0].message.content.strip()
        analysis = reformat_json_response(analysis)
        print("Processing analysis response...")

        refusal_phrases = ["I'm sorry", "I cannot", "I apologize", "As an AI", "I don't have the ability"]
        if any(phrase in analysis for phrase in refusal_phrases):
            return jsonify({
                'error': 'The AI refused to process this prompt. This may be due to content policy violations or formatting issues. Please check your prompt and try again with different wording.'
            }), 400

        try:
            analysis_json = json.loads(analysis)
            return jsonify(analysis_json)
        except json.JSONDecodeError as e:
            return jsonify({
                'error': f'The AI response was not in valid JSON format. Please ensure your prompt maintains the proper structure and includes the article_text placeholder. Technical details: {str(e)}'
            }), 400

    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True)
