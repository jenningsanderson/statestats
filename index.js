const tileReduce = require('@mapbox/tile-reduce');
const _ = require('lodash')
const fs = require('fs');
const path = require('path');

const INPUT_FILE = 'data/states.geojson'

if (process.argv.length < 3){
  console.error("Please specify a state or territory like: \n\n\tnode index.js CO \n\tnode index.js colorado\n")
  process.exit(1)
}else{
  process.argv.shift()
  process.argv.shift()
  var input = process.argv.join(" ")
}

var states = JSON.parse(fs.readFileSync(INPUT_FILE));

console.warn("Found " +states.features.length+ " possible areas for analysis in "+INPUT_FILE);

function cleanedName(name){
  return name.toLowerCase().replace(/\s/g,"_")
}

var names   = states.features.map(function(x){return cleanedName(x.properties.NAME)})
var abbrevs = states.features.map(function(x){return cleanedName(x.properties.STATE)})

var bounds;

if (names.indexOf(cleanedName(input)) > -1){
  console.warn("Found area for: "+input + "\nOutput file will be:\tresults/"+cleanedName(input)+".json");
  bounds = states.features[names.indexOf(cleanedName(input))]
}else
  if (abbrevs.indexOf(cleanedName(input)) > -1){
    console.warn("Found area for: "+input + "\nOutput file will be:\n\tresults/"+cleanedName(input)+"_users.json and\n\tresults/"+cleanedName(input)+".geojson");
    bounds = states.features[abbrevs.indexOf(cleanedName(input))]
}else{
  console.error("Sorry, "+INPUT_FILE+" does not contain a feature for "+input)
  process.exit(0)
}

// process.exit(0)

// console.warn(JSON.stringify(bounds))

var users = {}

tileReduce({
    map: path.join(__dirname, "map-statestats.js"),
    zoom: 12,
    sources: [{name: 'osm', mbtiles: path.join("../latest.planet-compact.mbtiles"), raw: false}],
    // output: fs.createWriteStream('../data/tileSummaries.geojsonseq'),
    geojson: bounds.geometry
    // mapOptions: searchTerms
})
.on('reduce', function(res){
  //Iterate through the users that came back from each tile
  Object.keys(res).forEach(function(user){

    //Check if we have that user yet...
    if (users.hasOwnProperty(user)){

      //Great, we do: 
      Object.keys(res[user]).forEach(function(k){
        //Add the value to that key
        users[user][k] += res[user][k]
      })
      
    } else {
      //We haven't logged this user yet, so we can just add the object
      users[user] = res[user]

    }
  })
})
.on('end', function(){
  console.warn("finished, now aggregating")

  var users_out = []

  var count=0;
  Object.keys(users).forEach(function(u){
    if (count==0){
      Object.keys(users[u]).forEach(function(k){
        //Add the value to that key
        bounds.properties[k] = users[u][k]
      })
    }else{
      //Itererate through all of the key/value pairs for this user
      Object.keys(users[u]).forEach(function(k){
        //update the global value for it.
        bounds.properties[k] += users[u][k]
      })

      users[u]['user'] = u
      users_out.push(users[u])

    }
    count++;
  })
    
  fs.writeFileSync("results/"+cleanedName(input)+".geojson", JSON.stringify(bounds))
    
  var sorted = _.sortBy(users_out, function(u){return -u.total_edits;})

  fs.writeFileSync("results/"+cleanedName(input)+"_users.json", JSON.stringify(sorted))
  
  console.warn("DONE")
})
