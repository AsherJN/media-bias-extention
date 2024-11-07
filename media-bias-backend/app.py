from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import os
import json

def generate_prompt(article_text):
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
    return prompt



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

    article_text = data['text']

    # Create the prompt for OpenAI
    prompt = generate_prompt(article_text)

    try:
        # Call the OpenAI API using the ChatCompletion endpoint
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",  # or "gpt-3.5-turbo" if you prefer
            messages=[
                {"role": "system", "content": "You are a media bias analysis assistant. Provide responses in JSON format only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )

        # Extract the generated text
        analysis = response.choices[0].message.content.strip()

        # Parse the JSON output
        analysis_json = json.loads(analysis)

        return jsonify(analysis_json)

    except json.JSONDecodeError as e:
        return jsonify({'error': f'JSON parsing error: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)






















# from dotenv import load_dotenv
# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import openai
# import os
# import json

# # Initialize the Flask app
# app = Flask(__name__)
# CORS(app)

# # Set up OpenAI API key
# load_dotenv()
# openai.api_key = os.getenv("OPENAI_API_KEY")

# @app.route('/analyze', methods=['POST'])
# def analyze():
#     data = request.get_json()

#     if not data or 'text' not in data:
#         return jsonify({'error': 'No text provided'}), 400

#     article_text = data['text']

#     # Create the prompt for OpenAI
#     prompt = f"""
# Analyze the following news article for media bias and provide the results in JSON format with the following fields:
# - bias_score: integer between -10 (left-leaning) to +10 (right-leaning), 0 is neutral.
# - language_tone: 'positive', 'negative', or 'neutral'.
# - framing_perspective: A brief description of the framing and perspective.
# - disputed_claims: A list of any claims that are contested or debunked.

# Article Text:
# {article_text}

# Provide the analysis in JSON format only.
# """

#     try:
#         # Call the OpenAI API using the Completion endpoint
#         response = openai.Completion.create(
#             engine="text-davinci-003",  # Use 'engine' instead of 'model' for older versions
#             prompt=prompt,
#             max_tokens=500,
#             temperature=0.7,
#             n=1,
#             stop=None,
#         )

#         # Extract the generated text
#         analysis = response.choices[0].text.strip()

#         # Parse the JSON output
#         analysis_json = json.loads(analysis)

#         return jsonify(analysis_json)

#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

# if __name__ == '__main__':
#     app.run(debug=True)
