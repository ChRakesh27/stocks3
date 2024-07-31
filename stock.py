from bs4 import BeautifulSoup
from selenium import webdriver
from datetime import datetime
import db
import time

url1 = "https://groww.in/markets/top-gainers?index=GIDXNIFTY100"
url2 = "https://groww.in/markets/top-losers?index=GIDXNIFTY100"
urls=[url1,url2]

driver = webdriver.Chrome()
def driverConnection():
    for posts in urls:
        driver.get(posts) 
        page_source = driver.page_source
        soup = BeautifulSoup(page_source, 'html.parser')
        table = soup.find('table', {'class':'tb10Table'})
        urlFrom="losers"

        if(posts==url1):
            urlFrom="gainers"
        fetch_data(table,urlFrom)

def fetch_data(table, urlFrom):
    driver.refresh()
    current_datetime = datetime.now()
    update={}
    if table:
        rows = table.find_all('tr')
        position=0
        for row in rows[1:]:
            columns = row.find_all('td')
            company = columns[0].find('a').text.strip()
            market_price = columns[2].text.strip()
            percet = market_price.split()
            # link= "<a href='https://groww.in"+columns[0].find('a').get('href')+"'target='_blank'>"+company +"</a>"
            link= 'https://groww.in'+columns[0].find('a').get('href')
            key = current_datetime.strftime("%d-%m-%Y")
            price=float((percet[0][1:percet[0].find('.')+3]).replace(',', ''))
            ukey = "records"
            position += 1
            percentage=float(percet[1][1:-2])
            if urlFrom=="losers":
                percentage=-float(percet[1][1:-2])
            push = {
                '$push': {
                    ukey: {
                        "date":key,
                        "price":price,
                        'percentage':percentage,
                        'max': price, 
                        'min': price,
                        "position":position,
                        "close":0,
                        "open":0,
                        "urlFrom":urlFrom
                    }
                },
                '$set':{"link":link}
            }
            
            updateGainer = {
                '$max':{
                    f'records.$.max':price,
                    f'records.$.percentage':percentage,
                },
                '$min':{
                    f'records.$.min':price,
                    f'records.$.position':position,
                },
                '$set':{"records.$.urlFrom":urlFrom,"link":link}
            }

            updateLoser = {
                '$max':{
                    f'records.$.max':price,
                },
                '$min':{
                    f'records.$.percentage':percentage,
                    f'records.$.min':price,
                    f'records.$.position':position,
                },
                '$set':{"records.$.urlFrom":urlFrom,"link":link}
            }

            insert={
                "company":company,
                "remarks":"",
                "link":link,
                "low":"",
                "high":"",
                "symbol":"",
                "records":[{
                    "date":key,
                    "price":price,
                    'percentage':percentage,
                    'max': price, 
                    'min': price,
                    "position":position,
                    "close":0,
                    "open":0,
                    "urlFrom":urlFrom
                }]
            }

            isExist=db.collection.find_one({'company': company})
            if isExist!=None:
                isFound=False
                for record in isExist['records']:
                    print("🚀 ~  record['date']:",company, record["date"])
                    if record["date"] == key:
                        isFound = True
                        break
                if isFound:
                    update={}
                    if urlFrom=="losers":
                        update=updateLoser
                    else:
                        update=updateGainer
                    # db.collection.update_many({'company': company, 'records.date':key}, update, upsert=True)
                    print("🚀 ~ update:",company,update)
                else:
                    # db.collection.update_many({'company': company}, push, upsert=True)
                    print("🚀 ~ push:",company,push)
            else:
                # db.collection.insert_one(insert)
                print("🚀 ~ insert:",company,insert)
    return

def fetch_open_close():
    current_datetime = datetime.now()
    key = current_datetime.strftime("%d-%m-%Y")
    dataSet = list(db.collection.find({"records.date":key},{"link":True, "company":True}).sort({"company":1}))
    for item in dataSet:
        if not 'link' in item:
            continue
        driver = webdriver.Chrome()
        driver.get(item["link"]) 
        page_source = driver.page_source
        soup = BeautifulSoup(page_source, 'html.parser')
        close = float(soup.find("div", {"class": "lpu38Pri"}).text[1:])
        open = float((soup.find("span", {"class": "stockPerformance_value__g7yez"}).text).replace(',', ''))
        print("🚀 ~ company, open, close:",item["company"], open, close)
        update={'$set':{ f'records.$.close':close, f'records.$.open':open}}
        filter={'company': item["company"] , 'records.date':key}
        # break
        db.collection.update_many(filter, update, upsert=True)

startTime="09:15"
endTime="15:30"
isTriggered=False

while True:
    current_datetime = datetime.now()
    current_day = current_datetime.weekday()
    days_to_sunday = 6==current_day
    days_to_saturday =5 ==current_day
    currentTime = current_datetime.strftime("%H:%M:%S")
    if (currentTime>startTime and currentTime<endTime) and (not days_to_sunday and not days_to_saturday) :
        print("fetching..")
        driverConnection()
        print("done\n")
        time.sleep(120)
        # print("---5min---")
        # time.sleep(300)
        # print("---10min---")
        # time.sleep(300)
        # print("---15min---")
    else:
        if not (isTriggered and days_to_saturday and  days_to_sunday):
            fetch_open_close()
            isTriggered=True
        if days_to_saturday:
            print("---Saturday---")
        elif days_to_sunday:
            print("---Sunday---")
        else:
            print("TimeOut",currentTime)
        time.sleep(60)