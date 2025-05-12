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
    
    article_text = data['text']
    
    # Check for new format (systemContent/userContent) or old format (prompt)
    if 'systemContent' in data and 'userContent' in data:
        # New format
        system_content = data['systemContent']
        user_content = data['userContent']
        print("Using new format with separate system and user content")
    elif 'prompt' in data and data['prompt']:
        # Old format - extract role section for system content
        full_prompt = data['prompt'].replace("{article_text}", article_text)
        
        # Try to extract the Role section from the prompt
        role_match = re.search(r'Role:(.*?)────────', full_prompt, re.DOTALL)
        
        if role_match:
            system_content = role_match.group(1).strip()
            # Remove the Role section from the user prompt
            user_content = full_prompt.replace(f"Role:{role_match.group(1)}────────", "────────", 1)
            print("Using old format with extracted system content from Role section")
        # else:
        #     # Fallback if Role section not found
        #     system_content = "You are a highly vigilant internet watchdog whose main priority is to assist users in navigating media bias. Provide responses in JSON format only."
        #     user_content = full_prompt
        #     print("Using old format with default system content")
    else:
        return jsonify({'error': 'No prompt information provided (neither systemContent/userContent nor prompt)'}), 400

    try:
        print("Starting analysis of article text...")
        
        # Add instructions to maintain role personality within JSON fields
        personality_instruction = "When responding, maintain your role's personality and voice WITHIN the content of each JSON field. Ensure the personality and language of your role are reflected in the text values of the JSON fields, while still maintaining the proper JSON structure. Additionally, when responding, strictly follow and maintain your custom instructions WITHIN the content of each JSON field. Ensure the custom instructions are reflected in the text values of the JSON fields, while still maintaining the proper JSON structure."
        
        # Append the personality instruction to the system content
        enhanced_system_content = system_content + "\n\n" + personality_instruction


        response = client.chat.completions.create(
            model="chatgpt-4o-latest",
            messages=[
                {"role": "system", "content": enhanced_system_content},
                {"role": "user", "content": user_content}
            ],
            temperature=0.3,
            response_format={"type": "json_object"},  # Force JSON response format
            max_tokens=1000,  # Adjust based on expected response length
            # user="media-bias-analyzer" #User identifier - for tracking API usage and detecting abuse – will implement later
        )
        
        # response = client.chat.completions.create(
        #     model="gpt-4o",
        #     messages=[
        #         {
        #             "role": "system",
        #             "content": enhanced_system_content
        #         },
        #         {"role": "user", "content": user_content}
        #     ],
        #     temperature=0.3,
        #     response_format={"type": "json_object"}  # Force JSON response format
        # )

        print("Received response from OpenAI API")
        
        analysis = response.choices[0].message.content.strip()
        analysis = reformat_json_response(analysis)
        print("Processing analysis response...")
        print(analysis)

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
