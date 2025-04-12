from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.neighbors import NearestNeighbors
import numpy as np
import requests
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Configuration
USER_API = "http://localhost:8081/api/users/currentUser"
CAMPS_API = "http://localhost:8081/api/camps/allCamps"
DEFAULT_MAX_DISTANCE = 50  # km
DEFAULT_LIMIT = 4  # Show 4 nearest camps
EARTH_RADIUS = 6371  # km

def get_auth_header(token):
    return {'Authorization': f'Bearer {token}'}

def fetch_user_location(token):
    """Fetch user coordinates from the user API"""
    try:
        response = requests.get(USER_API, headers=get_auth_header(token), timeout=5)
        response.raise_for_status()
        data = response.json()
        
        # Handle different response structures
        if isinstance(data, dict):
            if 'latitude' in data and 'longitude' in data:
                return float(data['latitude']), float(data['longitude'])
            elif 'data' in data and isinstance(data['data'], dict):
                return float(data['data']['latitude']), float(data['data']['longitude'])
        return None, None
        
    except Exception as e:
        print(f"User location error: {str(e)}")
        return None, None

from datetime import datetime, timedelta

def fetch_all_camps(token):
    """Fetch all camps from the camps API and filter by date"""
    try:
        response = requests.get(CAMPS_API, headers=get_auth_header(token), timeout=5)
        response.raise_for_status()
        data = response.json()
        
        # Calculate date range (today to one month from now)
        today = datetime.now().date()
        one_month_later = today + timedelta(days=30)
        
        # Handle various response structures
        camps = []
        if isinstance(data, list):
            camps = data
        elif isinstance(data, dict):
            if 'camps' in data:
                camps = data['camps']
            elif 'data' in data and isinstance(data['data'], list):
                camps = data['data']
        
        # Filter camps by date
        valid_camps = []
        for camp in camps:
            try:
                if not isinstance(camp, dict):
                    continue
                    
                # Check for required fields
                if 'latitude' not in camp or 'longitude' not in camp or 'organizingDate' not in camp:
                    continue
                    
                # Parse and validate coordinates
                float(camp['latitude'])
                float(camp['longitude'])
                
                # Parse and validate date
                camp_date = datetime.strptime(camp['organizingDate'], '%Y-%m-%dT%H:%M:%S.%fZ').date()
                if today <= camp_date <= one_month_later:
                    valid_camps.append(camp.copy())
                    
            except (ValueError, TypeError, KeyError) as e:
                print(f"Invalid camp data: {str(e)}")
                continue
                
        return valid_camps
        
    except Exception as e:
        print(f"Camps data error: {str(e)}")
        return None

@app.route('/findNearbyCamps', methods=['POST'])
def find_nearby_camps():
    # Authentication
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"error": "Authorization token required", "success": False}), 401
    token = auth_header.split(' ')[1]

    try:
        # Get user location
        user_lat, user_lon = fetch_user_location(token)
        if user_lat is None or user_lon is None:
            return jsonify({"error": "Invalid user coordinates", "success": False}), 400

        # Get camps data (already filtered by date)
        valid_camps = fetch_all_camps(token)
        if valid_camps is None:
            return jsonify({"error": "Could not fetch camps data", "success": False}), 400
        if not valid_camps:
            return jsonify({
                "success": True,
                "message": "No upcoming camps in the next month",
                "results": {"camps": []}
            })

        # Prepare coordinates for KNN (convert to radians for haversine)
        camp_coords = np.radians([
            [float(camp['latitude']), float(camp['longitude'])] 
            for camp in valid_camps
        ])
        user_coord = np.radians([[user_lat, user_lon]])

        # Get request parameters (fixed to return exactly 3 nearest camps)
        data = request.get_json() or {}
        try:
            max_distance = float(data.get('maxDistance', DEFAULT_MAX_DISTANCE))
        except (ValueError, TypeError):
            return jsonify({"error": "Invalid maxDistance parameter", "success": False}), 400

        # KNN algorithm to find nearest 4 camps
        knn = NearestNeighbors(
            n_neighbors=min(4, len(valid_camps)),  # Always get exactly 3 nearest
            metric='haversine'
        )
        knn.fit(camp_coords)
        
        # Find nearest camps (without distance restriction first)
        distances, indices = knn.kneighbors(user_coord)
        
        # Prepare exactly 4 nearest camps within max_distance
        results = []
        for i, distance in zip(indices[0], distances[0]):
            if distance * EARTH_RADIUS > max_distance:
                continue  # Skip if beyond max distance
            
            camp = valid_camps[i].copy()
            camp['distance'] = round(float(distance * EARTH_RADIUS), 2)
            results.append(camp)
            
            if len(results) == 4:  # Stop when we have 3 valid camps
                break

        # If we didn't get 3 within max_distance, include the closest ones beyond it
        if len(results) < 4:
            for i, distance in zip(indices[0], distances[0]):
                if len(results) == 4:
                    break
                    
                # Only add if not already included
                camp_id = valid_camps[i].get('_id') or valid_camps[i].get('id')
                if not any(c.get('_id') == camp_id or c.get('id') == camp_id for c in results):
                    camp = valid_camps[i].copy()
                    camp['distance'] = round(float(distance * EARTH_RADIUS), 2)
                    camp['beyondMaxDistance'] = True  # Flag if beyond max distance
                    results.append(camp)

        # Add date information
        today = datetime.now().date()
        one_month_later = today + timedelta(days=30)
        
        return jsonify({
            "success": True,
            "userLocation": {"latitude": user_lat, "longitude": user_lon},
            "dateRange": {
                "startDate": today.isoformat(),
                "endDate": one_month_later.isoformat()
            },
            "searchParameters": {
                "maxDistance": max_distance,
                "limit": 4,  # Explicitly state we're returning exactly 4
                "timestamp": datetime.now().isoformat()
            },
            "results": {
                "totalCamps": len(valid_camps),
                "nearestCamps": len(results),
                "camps": results
            }
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": "Internal server error",
            "details": str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)