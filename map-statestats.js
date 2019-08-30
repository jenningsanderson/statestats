var _     = require('lodash');
var turf = require("@turf/turf");
var tilebelt = require("@mapbox/tilebelt");

module.exports = function(data, tile, writeData, done) {

  //Extract the osm layer from the mbtile
  var layer = data.osm.osm;

  var users = {}

  layer.features.forEach(function(feat){

    var u = feat.properties['@user']

    if (!users.hasOwnProperty(u)){
      users[u] = {
        'km'           : 0,
        'b'            : 0,
        'ice_cream'    : 0,
        'dry_cleaning' : 0,
        'laundry:'     : 0,
        'total_edits'  : 0
      }
    }

    users[u].total_edits++;

    //Now do the appropriate thing:
    if (feat.geometry.type==="LineString" && feat.properties.hasOwnProperty('highway'){
      users[u].km += turf.length(feat);
    }else{

      if( feat.properties.HasOwnProperty("building") && feat.properties.building != "no"){
        users[u].b += 1
      }

      //Put other amenities here?

      if( feat.properties.HasOwnProperty("amenity") && feat.properties.amenity == "ice_cream"){
        users[u].ice_cream += 1
      }
      else if( feat.properties.HasOwnProperty("shop"){

        if feat.properties.shop == "dry_cleaning"){
          users[u].dry_cleaning += 1
        }

        if feat.properties.shop == "dry_cleaning"){
          users[u].dry_cleaning += 1
        }
        if feat.properties.shop == "laundry"){
          users[u].laundry += 1
        }
      }
    }
  })

  done(null, users)
};
