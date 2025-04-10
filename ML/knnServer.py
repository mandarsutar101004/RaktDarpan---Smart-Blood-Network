from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import requests
from sklearn.neighbors import NearestNeighbors
import json
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = Flask(__name__)
CORS(app)  # Allow requests from frontend

# Backend API to fetch all donors from MongoDB
NODE_BACKEND_URL = "http://127.0.0.1:8081/api/users/allDonors"

# Blood compatibility dictionary
BLOOD_COMPATIBILITY = {
    "O-": ["O-"],  # Universal donor (can only receive O-)
    "O+": ["O+", "O-"],
    "A-": ["A-", "O-"],
    "A+": ["A+", "A-", "O+", "O-"],
    "B-": ["B-", "O-"],
    "B+": ["B+", "B-", "O+", "O-"],
    "AB-": ["AB-", "A-", "B-", "O-"],
    "AB+": ["AB+", "AB-", "A+", "A-", "B+", "B-", "O+", "O-"]  # Universal recipient
}

# Fetch sender email & password from environment variables
SENDER_EMAIL = os.getenv("SENDER_EMAIL", "raktdarpan2024@gmail.com")
SENDER_PASSWORD = os.getenv("SENDER_PASSWORD", "#SmartBloodNetwork")

def fetch_donor_data():
    """Fetch donor data from Node.js backend (MongoDB)."""
    try:
        response = requests.get(NODE_BACKEND_URL)
        if response.status_code == 200:
            return response.json()
        else:
            return []
    except Exception as e:
        print("Error fetching donor data:", str(e))
        return []

def send_email_notifications(donors, recipient_name, recipient_email, recipient_blood_group, location):
    """Send email notifications to nearby donors."""
    smtp_server = "smtp.gmail.com"
    smtp_port = 587
    emails_sent = 0

    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)

        for donor in donors:
            donor_email = donor["email"]
            donor_name = donor["name"]

            if not donor_email:  # Skip if email is missing
                print(f"Skipping donor {donor_name} - No email provided!")
                continue

            print(f"Attempting to send email to {donor_email}...")

            subject = "Urgent Blood Donation Request"
            body = f"""
            Dear {donor_name},

            A recipient named {recipient_name} is in urgent need of {recipient_blood_group} blood.
            Your donation can save a life!

            📍 Location: {location}
            📧 Contact the recipient: {recipient_email}

            Please consider donating at the nearest blood bank.

            Thank you,
            Team RaktDarpan
            """

            msg = MIMEMultipart()
            msg["From"] = SENDER_EMAIL
            msg["To"] = donor_email  # Send to donor's actual email
            msg["Subject"] = subject
            msg.attach(MIMEText(body, "plain"))

            try:
                server.sendmail(SENDER_EMAIL, donor_email, msg.as_string())
                emails_sent += 1
                print(f"Email sent to {donor_email}")
            except smtplib.SMTPException as e:
                print(f"Error sending email to {donor_email}: {str(e)}")
                continue

        server.quit()
        print(f"All {emails_sent} email notifications sent successfully!")
        return emails_sent

    except smtplib.SMTPException as e:
        print("SMTP error occurred:", str(e))
        return 0
    except Exception as e:
        print("Error sending email:", str(e))
        return 0

@app.route('/matchDonors', methods=['POST'])
def match_donors():
    try:
        data = request.json
        recipient_lat = float(data.get("latitude"))
        recipient_lon = float(data.get("longitude"))
        recipient_blood_group = data.get("bloodGroup")
        recipient_name = data.get("recipientName")
        recipient_email = data.get("recipientEmail")
        location = data.get("location", "Unknown Location")

        # Validate input
        if not all([recipient_lat, recipient_lon, recipient_blood_group, recipient_name, recipient_email]):
            return jsonify({"error": "Invalid input parameters"}), 400

        # Fetch donor data from MongoDB
        donors_data = fetch_donor_data()
        if not donors_data:
            return jsonify({"message": "No donors available!"}), 404

        # Convert donor data into DataFrame
        df = pd.DataFrame(donors_data)

        # Ensure valid latitude, longitude & bloodGroup
        df["latitude"] = pd.to_numeric(df["latitude"], errors="coerce")
        df["longitude"] = pd.to_numeric(df["longitude"], errors="coerce")
        df["bloodGroup"] = df["bloodGroup"].astype(str).str.strip()
        df = df.dropna(subset=["latitude", "longitude", "email"])  # Remove invalid lat/lon or missing email

        # Find compatible donors
        compatible_donors = df[df["bloodGroup"].isin(BLOOD_COMPATIBILITY.get(recipient_blood_group, []))]

        if compatible_donors.empty:
            return jsonify({"message": "No compatible donors found!"}), 404

        # Edge case: Only 1 donor available
        if len(compatible_donors) < 2:
            emails_sent = send_email_notifications(compatible_donors.to_dict(orient="records"), recipient_name, recipient_email, recipient_blood_group, location)
            return jsonify({"message": f"Emails sent to {emails_sent} donor(s)!","nearestDonors": compatible_donors.to_dict(orient="records")}), 200

        # Train KNN model
        n_neighbors = min(3, len(compatible_donors))  # Don't exceed donor count
        knn = NearestNeighbors(n_neighbors=n_neighbors, metric="euclidean")
        knn.fit(compatible_donors[["latitude", "longitude"]])

        # Find nearest donors
        distances, indices = knn.kneighbors([[recipient_lat, recipient_lon]])
        nearest_donors = json.loads(compatible_donors.iloc[indices[0]].to_json(orient="records"))

        # Send email notifications
        emails_sent = send_email_notifications(nearest_donors, recipient_name, recipient_email, recipient_blood_group, location)

        return jsonify({"message": f"Emails sent to {emails_sent} donor(s)!","nearestDonors": nearest_donors})

    except Exception as e:
        print("Error in matching donors:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/sendTestEmail', methods=['GET'])
def send_test_email():
    """Send a test email to verify SMTP configuration."""
    RECIPIENT_EMAIL = "test@example.com"

    try:
        smtp_server = "smtp.gmail.com"
        smtp_port = 587

        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)

        subject = "Test Email"
        body = "This is a test email from RaktDarpan."

        msg = MIMEMultipart()
        msg["From"] = SENDER_EMAIL
        msg["To"] = RECIPIENT_EMAIL
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))

        server.sendmail(SENDER_EMAIL, RECIPIENT_EMAIL, msg.as_string())
        print("Test email sent successfully!")
        server.quit()
        return jsonify({"message": "Test email sent successfully!"}), 200
    except Exception as e:
        print("Error sending test email:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
