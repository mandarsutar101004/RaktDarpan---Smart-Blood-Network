import sys
sys.stdout.reconfigure(encoding='utf-8')
from flask import Flask, request, jsonify
import pandas as pd
import re
from flask_cors import CORS
import os
from difflib import get_close_matches
import logging
import spacy

app = Flask(__name__)
CORS(app, resources={r"/chatbot": {"origins": "*"}})  # Allow all origins for testing
app.logger.setLevel(logging.DEBUG)

# Load spaCy model
nlp = spacy.load("en_core_web_sm")

def find_donation_center(city):
    file_path = "donation_centers.csv"
    if not os.path.exists(file_path):
        return {"message": f"❌ Error: {file_path} not found. Please contact the admin."}
    if not city or city.isspace():
        return {"message": "📍 Please provide a valid city name (e.g., Mumbai, Thane)."}
    
    try:
        df = pd.read_csv(file_path, encoding="utf-8")
        results = df[df['Location'].str.contains(city, case=False, na=False)]
        if results.empty:
            return {"message": f"❌ No blood donation centers found in {city}. Try Mumbai, Navi Mumbai, or Thane."}
        
        centers = [
            {
                "Center_Name": row['Center_Name'],
                "Location": row['Location'],
                "Contact": row['Contact'],
                "Eligibility_Criteria": row['Eligibility_Criteria']
            }
            for _, row in results.iterrows()
        ]
        return {"message": f"🔍 Found {len(centers)} blood donation center(s) in {city}:", "centers": centers}
    
    except Exception as e:
        app.logger.error(f"⚠️ Error: {str(e)}")
        return {"message": f"⚠️ Error fetching data: {str(e)}. Please try again later."}
    
def check_eligibility(user_input, entities):
    eligibility_criteria = {
        "pregnant": "🤰 Pregnant women cannot donate. Wait 6 weeks after delivery or as advised by a doctor.",
        "diabetes": "🩺 Controlled diabetics (no insulin dependence) may donate if stable. Check with a doctor.",
        "cold": "🤧 Wait at least 2 weeks after recovering from a cold or flu.",
        "illness": "❌ If you're unwell, wait until you recover fully before donating.",
        "medication": "💊 Some medications (e.g., antibiotics, blood thinners) may disqualify you. Consult a doctor.",
        "tattoo": "🖋 If you’ve had a tattoo or piercing in the last 6 months, you’re ineligible due to infection risk.",
        "weight": "⚖️ You must weigh at least 50kg (110 lbs) to donate blood safely.",
        "age": "🎂 You must be 18–65 years old to donate. Some centers accept 17 with parental consent.",
        "cancer": "❌ A history of cancer usually disqualifies you from donating blood.",
        "hiv": "❌ Individuals with HIV/AIDS cannot donate blood due to health risks.",
        "hepatitis": "❌ A history of hepatitis (B or C) disqualifies you from donating.",
        "anemia": "🥩 Hemoglobin must be at least 12.5 g/dL for women, 13.0 g/dL for men.",
        "vaccination": "💉 Wait 2–4 weeks after most vaccines (e.g., flu, COVID-19).",
        "smoking": "🚬 Smoking doesn’t disqualify you, but avoid it right before donating.",
        "alcohol": "🍺 Avoid alcohol 24 hours before donating.",
        "bp": "🩺 BP should be within 90/50 to 180/100 mmHg.",
        "period": "🌸 Women can donate during menstruation if they feel well.",
        "surgery": "🩹 Wait 6 months after major surgery or as advised."
    }
    
    synonyms = {
        "expecting": "pregnant",
        "sugar": "diabetes",
        "flu": "cold",
        "sick": "illness",
        "medicine": "medication",
        "piercing": "tattoo",
        "underweight": "weight",
        "old": "age",
        "young": "age",
        "iron": "anemia",
        "vaccine": "vaccination",
        "smoke": "smoking",
        "drinking": "alcohol",
        "blood pressure": "bp",
        "menstruation": "period",
        "operation": "surgery"
    }

    user_input = user_input.lower()
    mapped_entities = [synonyms.get(entity.lower(), entity.lower()) for entity in entities if entity]
    app.logger.debug(f"Mapped entities: {mapped_entities}")

    # Check entities against eligibility criteria
    for entity in mapped_entities:
        if entity in eligibility_criteria:
            app.logger.debug(f"Matched eligibility entity: {entity}")
            return {"message": eligibility_criteria[entity]}
    
    # Check full input for eligibility keywords
    for pattern, response in eligibility_criteria.items():
        if re.search(r'\b' + pattern + r'\b', user_input):
            app.logger.debug(f"Matched eligibility regex: {pattern}")
            return {"message": response}
    
    return {"message": "🤖 I didn’t understand. Try asking about eligibility (e.g., 'Can I donate if pregnant?') or centers."}

def donation_process():
    return {
        "message": "🩸 **Blood Donation Process:**",
        "steps": [
            "1️⃣ Registration**: Provide your ID and fill out a health questionnaire.",
            "2️⃣ Health Check**: A nurse checks your hemoglobin, BP, and pulse.",
            "3️⃣ Donation**: Blood is collected (about 350–450 mL, takes 10–15 mins).",
            "4️⃣ Rest : Relax for 10–15 mins and enjoy a snack or juice.",
            "5️⃣ Feel Good : Know you’ve helped save up to 3 lives! ❤️"
        ]
    }

GENERAL_RESPONSES = {
    "who can donate blood": "✅ Healthy individuals aged 18–65, weighing 50kg+, with no major health issues.",
    "how often can i donate blood": "⏳ Whole blood: every 8 weeks (max 6 times/year). Platelets: every 7 days (max 24 times/year).",
    "what are the benefits of donating blood": "💪 Saves lives, reduces heart disease risk, burns ~650 calories.",
    "is blood donation safe": "✅ Yes! Sterile, single-use equipment ensures safety.",
    "what are blood groups": "🩸 8 types: A+, A-, B+, B-, O+, O-, AB+, AB-. O- is universal donor; AB+ is universal recipient.",
    "why donate blood": "❤️ 1 donation can save 3 lives! Needed for surgeries, accidents, and illnesses.",
    "how much blood is taken": "🩺 About 350–450 mL (less than 10% of your total blood volume).",
    "what happens to donated blood": "🧪 Tested, separated (red cells, plasma, platelets), and sent to hospitals.",
    "can i donate if i’m on my period": "🌸 Yes, if you feel well and hemoglobin is normal.",
    "does donating blood hurt": "🤕 Only a slight pinch from the needle. Most say it’s painless after.",
    "how long does it take": "⏱ Total process: ~30–60 mins. Actual donation: 10–15 mins.",
    "what to eat before donating": "🍎 Eat iron-rich foods (spinach, meat) and stay hydrated.",
    "can i exercise after donating": "🏋️ Wait 24 hours for strenuous activity.",
    "what is platelet donation": "🩺 Platelets collected via apheresis (1–2 hours) for cancer or surgery patients.",
    "can i donate blood if i have a cold": "🤧 No, wait 2 weeks after symptoms are gone."
}

def detect_intent(user_input):
    user_input = user_input.lower()
    app.logger.debug(f"Processing input: {user_input}")
    
    # Process input with spaCy
    doc = nlp(user_input)
    entities = [token.text for token in doc if token.pos_ in ["NOUN", "ADJ"]]  # Extract nouns and adjectives
    app.logger.debug(f"Extracted entities: {entities}")
    
    # Greeting intent (strict check)
    if any(greet == user_input or user_input.startswith(greet + " ") for greet in ["hi", "hello", "hey"]):
        app.logger.debug("Matched greeting")
        return {"message": "👋 Hi! Ask me about blood donation centers, eligibility, or the process!"}
    
    # Center lookup intent
    if any(keyword in user_input for keyword in ["center", "centers", "where", "donate near"]):
        app.logger.debug("Matched center intent")
        city = next((ent.text for ent in doc.ents if ent.label_ == "GPE"), None)
        if not city:
            city_match = re.search(r"(?:in|at|near)\s+([\w\s]+)", user_input)
            city = city_match.group(1).strip() if city_match else ""
        app.logger.debug(f"Extracted city: {city}")
        return find_donation_center(city) if city else {"message": "📍 Please specify a city (e.g., 'centers in Mumbai')."}
    
    # Donation process intent
    if any(keyword in user_input for keyword in ["process", "how to donate", "steps", "procedure"]):
        app.logger.debug("Matched process intent")
        return donation_process()
    
    # Eligibility intent
    if any(keyword in user_input for keyword in ["eligible", "eligibility", "can i", "am i", "donate if", "donate blood"]):
        app.logger.debug("Matched eligibility intent")
        eligibility_response = check_eligibility(user_input, entities)
        if "I didn’t understand" not in eligibility_response["message"]:
            app.logger.debug("Returning specific eligibility response")
            return eligibility_response
        app.logger.debug("No specific condition, returning generic eligibility")
        return {"message": "✅ To donate blood, you must be 18–65, weigh 50kg+, and be in good health. Any specific conditions (e.g., pregnancy, illness)?"}
    
    # FAQ intent
    faq_keys = list(GENERAL_RESPONSES.keys())
    for key in faq_keys:
        if user_input == key:
            app.logger.debug(f"Exact FAQ match: {key}")
            return {"message": GENERAL_RESPONSES[key]}
    
    if user_input.startswith("tell me about"):
        topic = user_input.replace("tell me about", "").strip()
        app.logger.debug(f"Topic extracted: {topic}")
        for key in faq_keys:
            key_words = set(key.split())
            topic_words = set(topic.split())
            if topic_words & key_words:
                if "blood group" in topic or "groups" in topic or "blood groups" in key:
                    app.logger.debug(f"Blood group FAQ match: {key}")
                    return {"message": GENERAL_RESPONSES["what are blood groups"]}
                app.logger.debug(f"Topic FAQ match: {key}")
                return {"message": GENERAL_RESPONSES[key]}
    
    close_match = get_close_matches(user_input, faq_keys, n=1, cutoff=0.6)
    if close_match:
        app.logger.debug(f"Close FAQ match: {close_match[0]}")
        return {"message": GENERAL_RESPONSES[close_match[0]]}
    
    # Fallback
    app.logger.debug("Falling back to eligibility with entities")
    return check_eligibility(user_input, entities)

@app.route("/chatbot", methods=["POST"])
def chatbot():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400
    data = request.get_json()
    user_input = data.get("message", "").strip().lower()
    if not user_input:
        return jsonify({"error": "Message is required"}), 400
    response = detect_intent(user_input)
    return jsonify(response)

if __name__ == "__main__":
    app.run(port=5002, debug=True)