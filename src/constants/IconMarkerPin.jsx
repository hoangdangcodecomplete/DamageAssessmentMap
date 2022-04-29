import L from "leaflet";

export default  new L.Icon({
  iconUrl: require("../assets/engineer.svg"),
  iconSize: [37, 45],
  iconAnchor: [17, 46],//[left/top, right/bottom]
  popupAnchor: [2, -40],
})

