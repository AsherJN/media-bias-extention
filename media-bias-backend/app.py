from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import os
import json
import re

def reformat_json_response(response_text):
    """
    Extracts JSON content from a formatted string while removing triple backticks 
    and retaining the original JSON syntax and spacing.
    
    Args:
        response_text (str): The text containing the JSON response with formatting.
        
    Returns:
        str: A cleaned JSON string retaining its syntax and formatting.
    """
    # Remove any occurrences of triple backticks
    response_text = response_text.replace("```json", "").replace("```", "").strip()
    
    # Return the cleaned content
    return response_text

def generate_prompt(article_text):
    prompt = f"""
Role: You are a highly vigilant internet watchdog who's main priority is to assist users in navigating media bias that may be present in the news/media that people consume.

Context: This Media Bias Analysis Rubric will help equip you to objectively evaluate bias in news articles by focusing on Overall Bias Score, Language and Tone, Framing and Perspective, and Alternative Perspectives. By systematically assessing each of these areas, users can assign a Composite Bias Score, enabling a clearer, more informed understanding of an article's ideological lean and balance.

1. Overall Bias Score
Definition: This is a numerical representation of the article’s ideological lean, from -5 (very liberal) to +5 (very conservative), with 0 representing a neutral or moderate stance. This score should be informed by patterns in language, framing, and sourcing.
How to Assess:
Score -5 (Very Liberal): Article consistently promotes liberal perspectives, uses language and framing that support progressive causes, and shows a distinct lack of conservative views or frames them negatively.
Score -2 to -4 (Liberal): Article leans liberal but does so less overtly. Conservative views may be mentioned but are subtly downplayed or critiqued.
Score -1 to +1 (Moderate): Article appears balanced, with no significant lean towards either ideology. Both liberal and conservative views are presented fairly and without judgment.
Score +2 to +4 (Conservative): Article leans conservative; liberal views may be included but often receive less emphasis or critique.
Score +5 (Very Conservative): Article strongly favors conservative ideologies, uses language that supports conservative stances, and lacks or negatively frames liberal views.
Questions to Ask:
Does the article favor or prioritize one ideological perspective?
Are alternative perspectives acknowledged fairly?
How does the tone and language compare when discussing liberal versus conservative views?

2. Language and Tone
Definition: Language and tone refer to the word choices, phrasing, and overall emotional register of the article. Bias can manifest through the use of emotionally charged or derogatory language when referring to specific groups or ideas.
How to Assess:
Identify Loaded Words: Notice if words have positive or negative connotations depending on the ideological stance of the subject. For example, “freedom fighter” vs. “militant” or “reform” vs. “radical change.”
Evaluate Tone: Assess whether the tone feels neutral, supportive, skeptical, or adversarial towards the subject matter. Tone may subtly suggest approval or disapproval even if the article claims objectivity.
Identify Emotional Appeal: Articles aiming to sway readers may rely on emotional language that evokes fear, anger, or sympathy.
Quantify Frequency of Bias-Laden Words: Assign a frequency score based on the use of such words, with 0 for neutral language and +5 or -5 for highly biased language, depending on the ideological lean.
Questions to Ask:
Are there words that carry emotional weight (e.g., “outrageous,” “brave,” “reckless”)?
Is the article’s tone measured and informative, or does it encourage a particular emotional response?
Are particular groups or ideologies consistently associated with positive or negative language?

3. Framing and Perspective
Definition: Framing is the way an article presents its information, particularly in how it contextualizes facts, focuses on certain aspects over others, and chooses what is emphasized or downplayed.
How to Assess:
Identify What’s Emphasized: Examine which elements of the story receive the most attention. Is the article focused on issues that favor a particular ideology, or is it providing a balanced perspective?
Look for Omissions: Sometimes, bias is shown in what is not discussed. Check if relevant information, perspectives, or historical context is omitted, potentially skewing the narrative.
Examine Headline and Subheadings: Often, headlines set a framing that may not fully align with the article’s content. Assess whether the headline suggests a bias that is not supported by the body.
Identify Causal Framing: Pay attention to whether certain individuals or groups are framed as responsible for positive or negative outcomes. Framing may subtly suggest fault or virtue based on the ideology of those involved.
Questions to Ask:
Does the article frame certain actions or groups as inherently positive or negative?
Are there specific aspects of the story that feel overemphasized or underreported?
How does the headline frame the story, and does it align with the actual content?

4. Alternative Perspectives
Definition: This metric evaluates whether the article acknowledges and fairly presents differing viewpoints, particularly those that challenge the article's main narrative. A balanced piece should consider alternative perspectives without dismissiveness or condescension.
How to Assess:
Identify Inclusion of Opposing Views: A thorough analysis should show that both (or multiple) sides are given space, context, and fair presentation. Articles should ideally quote or cite sources from multiple perspectives.
Assess Fairness in Representation: Determine if the article allows opposing perspectives to speak for themselves without dismissive language. Balanced articles avoid caricatures or overly simplistic portrayals.
Look for Attribution and Sources: Quality articles will include sources or citations for opposing viewpoints, even if they ultimately lean in one direction. Check if these sources are credible or if the article is “cherry-picking” less reputable voices.
Assess Whether Viewpoints are Dismissed or Generalized: Some articles mention opposing views only to immediately critique or generalize them in a negative light. Balanced articles present opposing perspectives thoughtfully.
Questions to Ask:
Are alternative views genuinely explored, or are they presented only to be dismissed?
Are there credible sources supporting all perspectives included in the article?
How does the article treat opposing perspectives in terms of tone, placement, and framing?

Listed below delimitted by the triple dashes is the news article that you will be analyzing:
---
{article_text}
---

Task: Leveraging GPT-4o's ability to search the internet and by using the Media Bias Analysis Rubric, your task to to analyze the following news article for media bias and provide the results in JSON format with the following fields:
- analysis_summary: Give the user an overall assesment of the of the article's bias using the media bias rubric. State the degree in which the article skews either liberal, conservative, or neutral and give some key reasonings on how that conclusion was made. Don't mention any numbers from bias_score, keep your assesment subjective. Limit this summary to less than 100 words.
- context: Use the internet to search to identify key pieces of background information that a user would need to know in order to understand what the article is about. This should be thorough and comprehensive in order to provide the user with a very well-rounded view of the current events that the article details. This should be between 200-500 words.
- content_summary: A 200 word article summary giving the user a comprehensive overview of the key points and takeways of the article.
- bias_score: integer between -5 (left-leaning) to +5 (right-leaning), 0 is neutral.
- language_tone: A 2 sentence summary on language and tone bias
- framing_perspective: A comprehensive summary of the framing and perspective of the article. Limit to less than 150 words.
- alternative_perspectives: Evaluate whether the article acknowledges and fairly presents differing viewpoints, particularly those that challenge the article's main narrative. Then use the internet to provide a set of alternative viewpoints or facts that would provide a reader with a more nuanced perspective. Be very specific with the listing of particular viewpoints. This should be in paragraph format and less than 300 words.
- publisher_bias: Use the internet to quickly evaluate the historical biases that persist in articles that come from certain publishers. For example, articles published by fox news typically lean conservative while articles published by CNN typically lean liberal. This should be a small 50 word summary.

Output Instructions: Your output is strictly supposed to be in JSON formatting and your output should contain nothing else beyond the JSON content.

Output Example:

{{
  "analysis_summary": "Summary of Bias Analysis goes here"
  "context": "Contextual summary goes here",
  "content_summary": "Content Summary of the article goes here",
  "bias_score": 0,
  "language_tone": "Language Tone Analysis goes here",
  "framing_perspective": "Framing Perspective Analysis goes here",
  "alternative_perspectives": "Alternative Perspectives Analysis goes here"
  "publisher_bias": "Publisher Bias Analysis goes here"
}}

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
            model="gpt-4o-mini", 
            messages=[
                {"role": "system", "content": "You are a highly vigilant internet watchdog who's main priority is to assist users in navigating media bias that may be present in the news/media that people consume. Provide responses in JSON format only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            # max_tokens=500
        )
        # print(response)
        # Extract the generated text
        analysis = response.choices[0].message.content.strip()
        analysis = reformat_json_response(analysis)
        print(analysis)
        # Parse the JSON output
        
        analysis_json = json.loads(analysis)
        # print(analysis_json)
        return jsonify(analysis_json)

    except json.JSONDecodeError as e:
        return jsonify({'error': f'JSON parsing error: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)


