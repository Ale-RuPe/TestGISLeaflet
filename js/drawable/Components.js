/**
 * Diferentes estilos de Mapas
 */
const capa1 =  L.tileLayer('https://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: 'Tiles courtesy of <a href="http://openstreetmap.se/" target="_blank">OpenStreetMap Sweden</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
const capa2 = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

const capa3 = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 1,
	maxZoom: 19,
	ext: 'jpg'
});

const wikimedia = L.tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png', {
	attribution: '<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia</a>',
	minZoom: 1,
	maxZoom: 19
});

/*+++++++++++POLÍGONOS+++++++++++*/
/**
 * Genera el polígono de las alcaldias.
 */
export let cql = "nomgeo LIKE '%'";
export let pAlcaldias = L.tileLayer.wms("http://localhost:8080/geoserver/pruebas/wms?Tiled=True&", {
	layers: 'pruebas:mapa_alcaldias',
	format: 'image/png8',
	opacity: 0.5,
	crossOrigin: 'anonymous', 
	transparent: true,
	cql_filter: cql
});

let layerGroup = L.layerGroup({
	'Alcaldias': pAlcaldias
});

/**
 * Mapa principal
 */
export const map = L.map('map',{
	center: [19.2998164,-99.1807436],
	zoom: 8,
	layers: [capa1]
});


export let baseMaps = {
	'Hidro':capa1,
	'OSM':capa2
};

export let overlayMaps = {
    "Alcaldías": pAlcaldias.addTo(map)
};

/**
 * Controles del mapa
 */
export let layercontrol = L.control.layers(baseMaps, overlayMaps, {
	position: "topright"
}).addTo(map);


//let latlng = L.latLng(39.924, 116.463); //coordenadas de CDMX
//var map = L.map('map', { center: latlng, zoom: 3 });
