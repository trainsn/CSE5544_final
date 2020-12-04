from flask import Flask, render_template, jsonify, request
from flask import url_for
import pandas as pd
import json
import numpy as np

data_path = './data/'

def save_json(savename, data):
    with open('%s.json' % savename, 'w') as outfile:
        json.dump(data, outfile, indent=2)

def pre_process_map():
    print('process map')
    with open(data_path + 'nyc.json') as data_file:   
        data_nyc_geo = json.load(data_file)
    json_all_data = {}
    json_all_data['type'] = 'FeatureCollection'
    all_features = []

    features = data_nyc_geo['features']
    for f in features:
        pro = f['properties']
        borough = pro['borough']
        if borough == 'Manhattan' or borough == 'Brooklyn' or borough == 'Queens':
            all_features.append(f)
    json_all_data['features'] = all_features
    print(all_features)
    save_json('./data/nyc_partial2',json_all_data)

# pre_process_map()


def from_txt2json():
    #get file object
    f = open("./data/TaxiVis-master/data/neighborhoods.txt", "r")
    flag = True
    json_all_data = {}
    json_all_data['type'] = 'FeatureCollection'
    all_features = []
    while(True):
        #read next line
        data, data_p, data_g = dict(), dict(), dict()
        data['type'] = 'Feature'
        name = str(f.readline()).replace('\n', '')
        if not name:
            break
        num_paths = int(f.readline())
        data_p['name'] = name
        print(name, num_paths)
        data['properties'] = data_p

        all_data = []
        for j in range(num_paths):
            num = int(f.readline())
            d = []
            for i in range(num):
                temp = f.readline().strip() 
                print(temp)
                d_i_lon, d_i_lat = temp.split(' ')
                d.append([float(d_i_lon), float(d_i_lat)])
            all_data.append(d)
        data_g['type'] = 'Polygon'
        data_g['coordinates'] = all_data
        
        data['geometry'] = data_g
        all_features.append(data)
    json_all_data['features'] = all_features
    save_json('./data/neighborhoods', json_all_data)
    f.close()

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('cityMap.html')


@app.route("/get_data", endpoint='get_data_layer')
def get_data():
    # testInfo = {}
    # testInfo['name'] = 'xiaoming'
    # testInfo['age'] = '28'
    return json.dumps(data_l)

# @app.route('/get_geo_data')
# def get_geo_data():
#     with open(data_path + 'new-york-city-boroughs.geojson') as data_file:  
#         data_nyc_geo = json.load(data_file)
#     return data_nyc_geo

# NYC: TAXI
# NJC: bike
@app.route('/get_nyc_geo_data')
def get_nyc_geo_data():
    with open(data_path + 'nyc_partial2.json') as data_file:    #nyc_partial2
        data_nyc_geo = json.load(data_file)
    return data_nyc_geo

@app.route('/get_njc_geo_data')
def get_njc_geo_data():
    with open(data_path + 'zoning-map-2019.geojson') as data_file:   
        data_nj_geo = json.load(data_file)
    return data_nj_geo

@app.route('/get_NYC_Taxi_data')
def get_NYC_Taxi_data():
    df = pd.read_csv(data_path + 'sample_merged_1.csv')
    print('original size: ', len(df), df.describe()) 
    return df.to_json(orient="index")

@app.route('/get_NJC_Bike_data')
def get_NJC_Bike_data():
    """
    df = pd.read_csv(data_path + 'NYC-BikeShare-2015-2017-combined.csv')
    print('original size: ', len(df), df.describe()) # 735502
    df.drop(['Unnamed: 0'],axis=1, inplace=True)
    
    ndf = df[['Start Time', 'Stop Time', 'Trip Duration',
       'Start Station Name', 'Start Station Latitude', 'Start Station Longitude',
       'End Station Name', 'End Station Latitude', 'End Station Longitude',
       'Bike ID', 'User Type','Birth Year', 'Gender', 'Trip_Duration_in_min']]
    ndf.loc[:,('Birth Year')] = ndf['Birth Year'].astype(int)
    ndf.loc[:,('Start Time')] = pd.to_datetime(ndf['Start Time'])
    ndf.loc[:,('Stop Time')] = pd.to_datetime(ndf['Stop Time'])

    # remove duplicates
    # duplicates = ndf.duplicated(subset=None, keep='first')
    # print("Found {} duplicate rows".format(len(ndf[duplicates])))
    ndf.drop_duplicates(subset=None, keep='first',inplace=True)
    print('remove duplicates', len(ndf)) 
 
    # remove empty cell
    ndf.replace('', np.nan) 
    ndf.dropna()
    print('remove empty cell', len(ndf)) 

    # remove invalid data
    ndf.loc[:,('age')] = 2017 - ndf['Birth Year']
    print(ndf.head(5))
    # AGE_RANGES = ["<20", "20-29", "30-39", "40-49", "50-59", "60+"]
    # AGE_RANGES_LIMITS = [0, 20, 30, 40, 50, 60, np.inf]
    AGE_MIN = 0
    AGE_MAX = 150
    DURATION_MIN = 1                 # a minimum duration of 1 seconds
    DURATION_MAX = 7 * 24 * 60 * 60  # a maximum duration of 7 days (seconds)
    ndf = ndf.loc[(ndf["age"]<AGE_MAX) & (ndf["age"]>AGE_MIN) &(ndf["Trip Duration"]>DURATION_MIN) & (ndf["Trip Duration"]<DURATION_MAX)]
    print('remove invalid data', len(ndf)) 

    # src_dst = ndf[["Start Station Latitude","Start Station Longitude","End Station Latitude","End Station Longitude"]]
    # print(src_dst.sample(5))
    ndf.loc[:,('Year')] = ndf['Start Time'].dt.year
    ndf = ndf.reset_index()
    print(ndf.head(5))

    ndf_2015 = ndf.loc[(ndf["Year"]==2015)].to_json(orient="index", date_format="iso", date_unit="us")
    ndf_2016 = ndf.loc[(ndf["Year"]==2016)].to_json(orient="index", date_format="iso", date_unit="us")
    ndf_2017 = ndf.loc[(ndf["Year"]==2017)].to_json(orient="index", date_format="iso", date_unit="us")
    save_json(data_path+'new_NJC_BikeShare_data_2015', json.loads(ndf_2015))
    save_json(data_path+'new_NJC_BikeShare_data_2016', json.loads(ndf_2016))
    save_json(data_path+'new_NJC_BikeShare_data_2017', json.loads(ndf_2017))

    # with open('new_NJC_BikeShare_data_2015.json', 'w') as outfile:
    #     json.dump(json.loads(ndf_2015), outfile)
    # with open('new_NJC_BikeShare_data_2016.json', 'w') as outfile:
    #     json.dump(json.loads(ndf_2016), outfile)
    # with open('new_NJC_BikeShare_data_2017.json', 'w') as outfile:
    #     json.dump(json.loads(ndf_2017), outfile)
    
    # json.dumps(parsed_2015, indent=4) 
    # ndf_2015.to_json(data_path + 'new_NJC_BikeShare_data_2015.json', indent=4)
    # ndf_2016.to_json(data_path + 'new_NJC_BikeShare_data_2016.json', indent=4)
    # ndf_2017.to_json(data_path + 'new_NJC_BikeShare_data_2017.json', indent=4)
    return json.loads(ndf_2016)
    """
    with open(data_path + 'new_NJC_BikeShare_data_2015.json') as data_file:  
        data_NJC_BikeShare = json.load(data_file)
    df = pd.DataFrame.from_dict(data_NJC_BikeShare, orient='index')
    print('original size: ', len(df), df.describe()) 
    return data_NJC_BikeShare


@app.route('/returned_data', methods = ['POST']) #postmethod
def get_post_javascript_data():
    try:
        loaded_data = json.load(request.data)
        print('len(selected_lat)', loaded_data)
        # for i in range(len(data)):
        #     # if isinstance(data[i], unicode):
        #     #     selected_lat[i] = data[i].encode('utf8')
        #     lats.append(data[i][u'lat'])
        #     back = dict({'labels': labels_.tolist(), 'cosine': cosine_sim.tolist()})
        back = dict({'data': loaded_data.tolist()})
        return back

    except ValueError:
        return "Error", 400

# @app.route('/postmethod', methods = ['POST'])
# def get_post_javascript_data():
#     # if request.method == 'POST':
#     #     jsdata = request.form['data']
#     #     print('jsdata', jsdata)
#     #     return json.dumps({'status':'OK','jsdata':jsdata});
#     # else:
#     #     message = {'greeting': 'Hello from Flask!'}
#     #     return jsonify(message)
#     try:
#         selected_lat = json.loads(request.data)
#         print('len(selected_lat)', selected_lat[u'method'])
#
#         lats = []
#         data = selected_lat[u'data']
#         method = selected_lat[u'method']
#
#         for i in range(len(data)):
#             # if isinstance(data[i], unicode):
#             #     selected_lat[i] = data[i].encode('utf8')
#             lats.append(data[i][u'lat'])
#
#         if method == 'kmeans':
#             clustering = KMeans(n_clusters=int(selected_lat[u'k']), random_state=0).fit(lats) #kmeans.predict
#             print clustering.labels_, len(data)
#         elif method == 'hierarchical':
#             clustering = AgglomerativeClustering(n_clusters=int(selected_lat[u'n_clusters']), affinity=selected_lat[u'affinity'], linkage = selected_lat[u'linkage']).fit(lats)
#             print clustering.labels_
#         elif method == "DBSCAN":
#             clustering = DBSCAN(eps=float(selected_lat[u'eps']), min_samples=int(selected_lat[u'min_samples'])).fit(lats)
#             print clustering.labels_
#
#         print(len(lats)) # 40*16
#
#         cosine_sim = np.array(cosine_similarity(lats, lats))
#         print(cosine_sim.shape)
#
#         back = dict({'labels': clustering.labels_.tolist(), 'cosine':cosine_sim.tolist()})
#         return back
#
#     except ValueError:
#         return "Error", 400

if __name__ == "__main__":
    app.run(host='0.0.0.0',port=8000,debug=True)

    # import os
    # port = 8000
    # # Open a web browser pointing at the app.
    # os.system("open http://localhost:{0}".format(port))
    # # Set up the development server on port 8000.
    # app.debug = True
    # app.run(port=8000)