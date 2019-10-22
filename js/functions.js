import * as C from './drawable/Components';
import {getGeoJSON as getData} from './service/wms_service';
import {markers as Markers} from './drawable/Markers';

/**
 * Cluster para agrupar Marcadores
 */
export let clusterMarkers = L.markerClusterGroup({
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
export const loadWFS = (cql_fil,layerName, epsg) => {
    let urlString = "http://localhost:8080/geoserver/pruebas/ows";
    let param = {
        service: 'WFS',
        version: '1.1.0',
        request: 'GetFeature',
        typeName: layerName,
        outputFormat: 'application/json',
        maxFeatures:5000,
        srsName: epsg,
        cql_filter: cql_fil
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


export const startCluster = () =>{
    let cql = "alcaldia_h LIKE '%'";
    let url = loadWFS(cql, "pruebas:carpeta_invest_pgj_cdmx", "EPSG:4326");
    getData(url,(success, data) => {
        if(success){
            console.log(data);
            console.log(Object.keys(data.features).length);   
            loadMarkers(data,clusterMarkers,Markers);
            C.map.addLayer(clusterMarkers);
        }
    });
}

let cql_filter_A = '';
let cql_filter_A_d = "nomgeo LIKE '%'";
let cql_filter_PGJ = "";
let cql_filter_PGJ_d = "alcaldia_h LIKE '%'";

export const updateCluster = (cql) =>{
    C.map.removeLayer(clusterMarkers);
    clusterMarkers = L.markerClusterGroup({
        removeOutsideVisibleBounds: true,
        spiderfyOnMaxZoom: false,
        chunkedLoading: true,
        disableClusteringAtZoom:19
    });
    let url = loadWFS(cql, "pruebas:carpeta_invest_pgj_cdmx", "EPSG:4326");
    getData(url,(success, data) => {
        if(success){
            console.log(data);
            console.log(Object.keys(data.features).length);   
            loadMarkers(data,clusterMarkers,Markers);
            C.map.addLayer(clusterMarkers);
        }
    });
}

const applyFilterA = () => {
    cql_filter_A = '';
    //Selecciona todos los elementos del filtro de Alcaldia
    let divs = document.getElementsByClassName("Alcaldia");
    //Recorre la lista de elementos seleccionados
    for (let i=0; i < divs.length; i++) {
        //console.log('Elemento '+i+' : '+ divs[i].checked+ ', '+ divs[i].getAttribute('value'));
        if(divs[i].checked && cql_filter_A.length == 0){
            cql_filter_A = "nomgeo='" + divs[i].getAttribute('value') + "' ";
            cql_filter_PGJ = "alcaldia_h " + selectAlcaldia(divs[i].getAttribute('value')) + " ";
        }else if(divs[i].checked){
            cql_filter_A += " OR nomgeo='" + divs[i].getAttribute('value') + "' ";
            cql_filter_PGJ += " OR alcaldia_h " + selectAlcaldia(divs[i].getAttribute('value')) + " ";
        }
        /*
        divs[i].addEventListener("click",function() {
            //Aquí la función que se ejecutará cuando se dispare el evento
            alert(this.innerHTML); //En este caso alertaremos el texto del cliqueado
        });
        */
    }
    if(cql_filter_A.length==0 || cql_filter_PGJ.length==0){
        console.log('no filter');
        repaint(cql_filter_A_d);
        updateCluster(cql_filter_PGJ_d);
    }
    console.log("filtro=|"+cql_filter_A+"|");
    console.log("filtro=|"+cql_filter_PGJ+"|");

    repaint(cql_filter_A);
    updateCluster(cql_filter_PGJ);
};


const clearFilterA = () => {
    let divs = document.getElementsByClassName("Alcaldia");
    for (let i=0; i < divs.length; i++) {
        divs[i].checked = false;
    }
    cql_filter_A = '';
    cql_filter_PGJ=""
    console.log("filtro=|"+cql_filter_A+"|");

}

let applyfilterAlcaldias = document.getElementById('send_filtroA_b').onclick = () => {
    applyFilterA();
};
let clearfilterAlcaldias = document.getElementById('clear_filtroA_b').onclick = () => {
    clearFilterA();
};

document.getElementById('dateFilter_b').onclick = () =>{
    $('#modal1').modal('open');
}

/*
$(".Alcaldia").on( 'change', function() {
    aplicarFiltros();
    if( $(this).is(':checked') ) {
        console.log("El checkbox con valor " + $(this).val() + " is CHECKED");
        repaint();
        //cql = "nomgeo='Iztapalapa'"
    }
    else {
        console.log("El checkbox con valor " + $(this).val() + "is UNCHECKED");
        repaint();
        //cql = "cvegeo>='09001'"
    }
});
*/


const repaint = (cql) =>{
    if(cql.length ==0){
        cql = "nomgeo LIKE '%'";
    }
    C.map.removeLayer(C.pAlcaldias);
    console.log("pintar:"+cql);
    C.pAlcaldias = L.tileLayer.wms("http://localhost:8080/geoserver/pruebas/wms?Tiled=True&", {
        layers: 'pruebas:mapa_alcaldias',
        format: 'image/png8',
        opacity: 0.5,
        crossOrigin: 'anonymous', 
        transparent: true,
        cql_filter: cql
    });
    C.map.addLayer(C.pAlcaldias);
};



//nomgeo LIKE 'Álv%'
const selectAlcaldia = (alcaldia) =>{
    let filter = '';
    switch (alcaldia) {
        case "La Magdalena Contreras":
            filter = "LIKE 'LA%'";  
            break;
        case "Álvaro Obregón":
            filter = "LIKE 'ALV%'";
            break;
        case "Iztapalapa":
            filter = "LIKE 'IZT%'";
            break;
        case "Tláhuac":
            filter = "LIKE 'TLAH%'";
            break;
        default:
            filter = "LIKE '%'";
            break;
    }
    return filter;
}



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