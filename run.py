#!/usr/bin/python3

import json, os


bounds_file = 'data/states.geojson'

boundaries = json.load(open(bounds_file,'r'))

print("Found {} boundaries".format(str(len(boundaries['features']))))

for area in boundaries['features']:
    
    command = "node index.js {}".format(area['properties']['NAME'])
    
    print("\t{}".format(command))
    
    os.system(command)