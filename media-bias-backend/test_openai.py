

from dotenv import load_dotenv
import os
from openai import OpenAI
import json

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

prompt = """
Analyze the following news article for media bias and provide the results in JSON format with the following fields:
- bias_score: integer between -10 (left-leaning) to +10 (right-leaning), 0 is neutral.
- language_tone: 'positive', 'negative', or 'neutral'.
- framing_perspective: A brief description of the framing and perspective.
- disputed_claims: A list of any claims that are contested or debunked.

Article Text:
Your test article text here.

Provide the analysis in JSON format only.
"""

try:
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",  # or "gpt-3.5-turbo" if you prefer
        messages=[
            {"role": "system", "content": "You are a media bias analysis assistant. Provide responses in JSON format only."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=500
    )
    
    # Extract the content from the response
    analysis = response.choices[0].message.content.strip()
    
    # Parse and print the JSON
    analysis_json = json.loads(analysis)
    print(json.dumps(analysis_json, indent=2))

except json.JSONDecodeError as e:
    print(f"Error parsing JSON: {e}")
except Exception as e:
    print(f"Error: {e}")