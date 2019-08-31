var _     = require('lodash');
var turf = require("@turf/turf");
var tilebelt = require("@mapbox/tilebelt");

module.exports = function(data, tile, writeData, done) {

  //Extract the osm layer from the mbtile
  var layer = data.osm.osm;

  var users = {}
  
  var amenity = []
  var shop    = []
  var leisure = []

  layer.features.forEach(function(feat){

    var u = feat.properties['@user']

    if (!users.hasOwnProperty(u)){
      users[u] = {
          
        /* 
        
            Set any attributes here
        
        */
          
        'highway'      : 0,
        'building'     : 0,
        'ice_cream'    : 0,
        'dry_cleaning' : 0,
        'laundry'      : 0,
        'total_objects'  : 0
      }
    }

    users[u].total_objects++;

    //Now do the appropriate thing:
    if (feat.geometry.type==="LineString" && feat.properties.hasOwnProperty('highway')){
      users[u].highway += turf.length(feat, {units: 'miles'});
    }else{

      if( feat.properties.hasOwnProperty("building") && feat.properties.building != "no"){
        users[u].building += 1
      }

      //Put other amenities here?
      
      if (feat.properties.hasOwnProperty("leisure") ){
        leisure.push(feat.properties.leisure);
      } 
        
      //shop / amenity are exclusive
      if ( feat.properties.hasOwnProperty("amenity") ){
        amenity.push(feat.properties.amenity)
          
        if ( feat.properties.amenity == 'ice_cream') {
          users[u].ice_cream += 1
        }
      }
      else if( feat.properties.hasOwnProperty("shop")){
        
        shop.push(feat.properties.shop);

        if (feat.properties.shop == "dry_cleaning"){
          users[u].dry_cleaning++;
            
        }
        if (feat.properties.shop == "laundry"){
          users[u].laundry++;
        }
      }
    }      
  })

  done(null, {
      users: users, 
      amenity: _.countBy(amenity),
      shop: _.countBy(shop),
      leisure: _.countBy(leisure)
  })
};