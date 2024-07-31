from datetime import datetime
from pymongo import MongoClient
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)
current_datetime = datetime.now()

MONGODB_URL= os.getenv("MONGODB_URL")

client = MongoClient(MONGODB_URL)

db = client.get_database('stocks-NIFTY100')
# collection = db.get_collection('test')
collection = db.get_collection('companies')



# collection1 = db.get_collection(current_datetime.strftime("%Y_%m_%d"))
# documents = collection1.find()
# for document in documents:
#     print(document)


@app.route("/getData")
def fetchData():
    projection = {'_id': False}
    res = list(collection.find({},projection).sort({"company":1}))
    print("🚀 ~ res:", res)
    # client.close()
    return jsonify(res)

@app.route("/updateRemark", methods=['PATCH'])
def updateRemark():
    data = request.json
    company = data.get('company')
    remark=data.get('remarks')
    if not company:
        return jsonify({'error': 'Invalid data'}), 400
    
    result = collection.update_one(
        {'company': company},
        {'$set': {"remarks":remark}}
    )

    if result.matched_count:
        return jsonify({'message': 'Update successful'}), 200
    else:
        return jsonify({'error': 'Document not found'}), 404
    
@app.route("/updateData", methods=['PATCH'])
def updateData():
    data = request.json
    company = data.get('company') 
    field=data.get('field')
    value=data.get('value')
    date=data.get('date')
    print("===>",company,field,value,date)
    if not company:
        return jsonify({'error': 'Invalid data'}), 400
    result = collection.update_one(
        {'company': company, 'records.date':date},
        {'$set': {f'records.$.{field}':value}}
    )
    if result.matched_count:
        return jsonify({'message': 'Update successful'}), 200
    else:
        return jsonify({'error': 'Document not found'}), 404
    
# if __name__ == "__main__":
#     app.run()
   