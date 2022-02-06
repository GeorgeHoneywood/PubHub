// This is adapted from the implementation in Project-OSRM
// https://github.com/DennisOSRM/Project-OSRM-Web/blob/master/WebContent/routing/OSRM.RoutingGeometry.js
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {Position} from "../../models/Position";

function decodePolyline(str: string, precision: number = 6): [[number, number]] {
  var index = 0,
    lat = 0,
    lng = 0,
    coordinates: [[number, number]] = [[0, 0]],
    shift = 0,
    result = 0,
    byte: number | null = 0,
    latitude_change,
    longitude_change,
    factor = Math.pow(10, precision || 6);
  // This is big poopy butt hole dumb dumb
  coordinates.splice(0);

  // Coordinates have variable length when encoded, so just keep
  // track of whether we've hit the end of the string. In each
  // loop iteration, a single coordinate is decoded.
  while (index < str.length) {
    // Reset shift, result, and byte
    byte = null;
    shift = 0;
    result = 0;

    do {
      byte = str.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    latitude_change = result & 1 ? ~(result >> 1) : result >> 1;

    shift = result = 0;

    do {
      byte = str.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    longitude_change = result & 1 ? ~(result >> 1) : result >> 1;

    lat += latitude_change;
    lng += longitude_change;

    coordinates.push([lng / factor, lat / factor]);
  }

  return coordinates;
}

export { decodePolyline };
