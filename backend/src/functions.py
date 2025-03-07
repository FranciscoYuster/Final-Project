from google.oauth2 import id_token
from google.auth.transport import requests as google_request
import requests
import os
from dotenv import load_dotenv

load_dotenv()

def verify_google_token(token):
    client_id =  os.getenv('VITE_GOOGLE_CLIENT_ID')
    try:
        id_info = id_token.verify_oauth2_token(token, google_request.Request(), client_id)
        return {
            "success": True,
            "user_id": id_info["sub"],
            "email": id_info["email"],
            "name": id_info["name"],
            "picture": id_info["picture"],

        }
    except ValueError:
        return {"error": False, "message": "Token invalido"}
    
def verify_google_access_token(acces_token):
    url = f"https://www.googleapis.com/oauth2/v1/userinfo?access_token=${acces_token}"

    response = requests.get(url)

    print(f"wenaklo", response)

    if response.status_code == 200:
        return {
            "Success": True,
            "data": response.json()
        }
    else:
        return {
           "Success": False,
            "message": "Token invalido" 
        }