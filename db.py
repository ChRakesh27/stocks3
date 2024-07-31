from pymongo import MongoClient
from datetime import datetime
from dotenv import load_dotenv
import os

load_dotenv()

MONGODB_URL= os.getenv("MONGODB_URL")
current_datetime = datetime.now()

client = MongoClient(MONGODB_URL)
db = client.get_database('stocks-NIFTY100')
# collection = db.get_collection(current_datetime.strftime("%Y-%m-%d"))
# collection = db.get_collection("2024-04-01")
# collection = db.get_collection("test")
collection = db.get_collection("stocks")