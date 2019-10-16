/**
 * Cluster para agrupar Marcadores
 */
export const clusterMarkers = L.markerClusterGroup({
    removeOutsideVisibleBounds: true,
    spiderfyOnMaxZoom: false,
    chunkedLoading: true,
    disableClusteringAtZoom:19
});

/**
 * Genera la URL para obtener datos del servicio WFS
 * @param {Nombre de la Capa} layerName 
 * @param {Código EPSG} epsg 
 */
export const loadWFS = (layerName, epsg) => {
    let urlString = "http://localhost:8080/geoserver/pruebas/ows";
    let cql = "alcaldia_h='TLAHUAC' OR alcaldia_h='GUSTAVO A MADERO'";
    let param = {
        service: 'WFS',
        version: '1.1.0',
        request: 'GetFeature',
        typeName: layerName,
        outputFormat: 'application/json',
        maxFeatures:5000,
        srsName: epsg
        //cql_filter: cql
    };
    let u = urlString + L.Util.getParamString(param, urlString);
    console.log(u);
    return u;
};    

/**
 * Carga los datos del servicio WFS de Geoserver y los agrega al Cluster
 * @param {Datos} data 
 * @param {Grupo de Cluster} clusterMarkers 
 * @param {Marcadores} markers  
 */
export const loadMarkers = (data, clusterMarkers, markers) =>{
    L.geoJson(data, {
        onEachFeature: (feature) => {
            let title = feature.properties.delito;
            let marker;
            if(feature.properties.alcaldia_h=='TLAHUAC'){
                marker = L.marker([feature.properties.latitud, feature.properties.longitud],{icon: markers.redMarker})
            }
            else{
                marker = L.marker([feature.properties.latitud, feature.properties.longitud],{icon: markers.greenMarker})
            }
            marker.bindPopup(title);
            clusterMarkers.addLayer(marker);
        }
    });
};

/*
let zona_alcaldias = new Image({
    opacity: 0.8,
    source: new ImageWMS({
      url: 'http://localhost:8080/geoserver/pruebas/wms?transparent=true',
      params: {'LAYERS': 'pruebas:mapa_alcaldias'},
      serverType: 'geoserver',
      crossOrigin:'anonymous'
    })
  });
  const wmsLayer = new TileLayer({
    source: zona_pgj  
  });
*/