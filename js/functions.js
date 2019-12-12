import * as C from './drawable/Components';
import * as Service from './service/wms_service';
import {markers as Markers} from './drawable/Markers';
import {getFromFeature as getCrimeIcon} from './drawable/Markers';
import {ipServidor} from './conf_servidor'
let clearFA = false;


/**
 * Parametros para la obtencion de los datos de Geoserver
 */
export const urlGeoserver = ipServidor+':8080';//'10.100.79.52:8080'; //:1234 en otros dispositivos 
export const pathGeoServer ="/geoserver/cic_ipn/";
export const capaAlcaldiasGeoServer = 'cic_ipn:alcaldias';
export const capaDelitosGeoServer = "cic_ipn:InfoDelitos";
export const maxFeaturesGS = 9873;

/**
 * Parametros de filtros
 */
let cql_filter_A = '';
//let cql_filter_A_d = "nomgeo LIKE '%'";
let cql_filter_PGJ = "";
//let cql_filter_PGJ_d = "nombreAlcaldia ILIKE '%'";
let cql_filter_Rango = '';
let cql_filter_Tipo = '';
let cql_filter_Arma = '';


/**
 * Cluster para agrupar Marcadores
 */
export let clusterMarkers = L.markerClusterGroup({
    removeOutsideVisibleBounds: true,
    spiderfyOnMaxZoom: true,
    chunkedLoading: true
});

/**
 * Genera la URL para obtener datos del servicio WFS
 * @param {Nombre de la Capa} layerName 
 * @param {Código EPSG} epsg 
 */
export const loadWFS = (cql_fil,layerName, epsg) => {
    let urlString = "http://"+urlGeoserver+pathGeoServer+'ows';
    let param;
    if(cql_fil.length==0){
        param = {
            service: 'WFS',
            version: '1.1.0',
            request: 'GetFeature',
            typeName: layerName,
            outputFormat: 'application/json',
            maxFeatures: maxFeaturesGS,
            srsName: epsg
        };
    }
    else{
        param = {
            service: 'WFS',
            version: '1.1.0',
            request: 'GetFeature',
            typeName: layerName,
            outputFormat: 'application/json',
            maxFeatures: maxFeaturesGS,
            srsName: epsg,
            cql_filter: cql_fil
        };
    }

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
    let id =0;
    L.geoJson(data, {
        onEachFeature: (feature) => {
            let tipoDelito = feature.properties.delito;
            let fecha = feature.properties.fecha;
            if(fecha)
                fecha = fecha.slice(0, -1);

            let arma = '';
            if(tipoDelito.includes('ARMA DE FUEGO')){
                tipoDelito.replace('ARMA DE FUEGO', ' ');
                arma = "ARMA DE FUEGO";
            }else if(tipoDelito.includes('ARMA BLANCA')){
                tipoDelito.replace('ARMA BLANCA', ' ');
                arma = "ARMA BLANCA";
            }
            
            let colonia = feature.properties.nombreCol;
            let calle1 = feature.properties.calle1;
            let calle2 = feature.properties.calle2;
            let alcaldia = feature.properties.nombreAlcaldia;
            let origen = feature.properties.origen==true ? "Fuente oficial" : "Twitter";
            let latitud = feature.properties.latitud;
            let longitud = feature.properties.longitud;
            
            let customIcon = L.icon({
                iconUrl: getCrimeIcon(tipoDelito),
                iconSize:     [35, 38], // size of the icon
                //shadowSize:   [50, 64], // size of the shadow
                iconAnchor:   [12,42], // point of the icon which will correspond to marker's location
                //shadowAnchor: [4, 62],  // the same for the shadow
                popupAnchor:  [5, -26] // point from which the popup should open relative to the iconAnchor
            });

            let marker;
            marker = L.marker([latitud,longitud],{icon: customIcon});//, {icon: markers.redMarker})
            
            let tabla = "<table id='"+id+"' class='hide' style='width:100%'>"+
            "<thead><tr><th>Tipo de delito</th><th>Arma</th><th>Fecha</th>"+
            "<th>Colonia</th>"+"<th>Calle1</th>"+"<th>Calle2</th>"+
            "<th>Alcaldia</th>"+"<th>Origen</th>"+
            "<th>Latitud</th>"+"<th>Longitud</th>"+"</tr></thead>"+
            "<tbody><tr><td>"+tipoDelito+"</td>"+"<td>"+arma+"</td>"+
            "<td>"+fecha+"</td>"+
            "<td>"+colonia+"</td>"+"<td>"+calle1+"</td>"+"<td>"+calle2+"</td>"+
            "<td>"+alcaldia+"</td>"+"<td>"+origen+"</td>"+
            "<td>"+latitud+"</td>"+"<td>"+longitud+"</td>"+
            "</tr></tbody></table>"+
            
            "<table><tr><td>Tipo de delito</td><td>"+tipoDelito+"</td></tr>"+
            "<td>Fecha</td><td>"+fecha+"</td></tr>"+
            "<td>Origen</td><td>"+origen+"</td></tr>"+
            "</table><a href='#' onclick='toDataTables("+id+")'>Más información</a>";

            id = id+1;
            marker.bindPopup(tabla);
            clusterMarkers.addLayer(marker);
        }
    });
};

/**
 * Inicializa el Cluster
 */
export const initCluster = () =>{
    //let cql = "alcaldia_h LIKE '%'";
    let url = loadWFS('', capaDelitosGeoServer, "EPSG:4326");
    paintCluster(url);
    //repaintWMSAlcaldias('');
    document.getElementById("progress").style.display = 'none';
    document.getElementById("progress2").style.display = 'none';
}

/**
 * Pinta el Cluster en el mapa
 * @param {Url del servicio} markers  
 */
export const paintCluster = (url) => {
    Service.getGeoJSON(url,(success, data) => {
        if(success){
            console.log(data);
            console.log(Object.keys(data.features).length);   
            loadMarkers(data,clusterMarkers,Markers);
            C.map.addLayer(clusterMarkers);
        }
    });
}

/**
 * Actualiza el Cluster
 * @param {Filtro CQL} cql 
 */
export const updateCluster = (cql) =>{
    C.map.removeLayer(clusterMarkers);
    clusterMarkers = L.markerClusterGroup({
        removeOutsideVisibleBounds: true,
        spiderfyOnMaxZoom: true,
        chunkedLoading: true
    });
    let url = loadWFS(cql, capaDelitosGeoServer, "EPSG:4326");
    paintCluster(url);
};

/**
 * 
 * @param {Filtro CQL} cql 
 */
const repaintWMSAlcaldias = (cql) =>{
    if(cql.length == 0){
        cql = "nomgeo LIKE '%'";
        if(C.map.hasLayer(C.pFiltroAlcaldias)){
            C.map.removeLayer(C.pFiltroAlcaldias);
        }
    }else{
        if(C.map.hasLayer(C.pFiltroAlcaldias)){
            C.map.removeLayer(C.pFiltroAlcaldias);
        }
        console.log("pintar:"+cql);
        C.pFiltroAlcaldias = L.tileLayer.wms("http://"+urlGeoserver+pathGeoServer+"wms?Tiled=True&", {
            layers: capaAlcaldiasGeoServer,
            format: 'image/png8',
            opacity: 0.6,
            crossOrigin: 'anonymous', 
            transparent: true,
            cql_filter: cql,
            styles: 'cic_ipn:FiltroAlcaldias'
        });
        C.map.setZoom(9);
        C.map.addLayer(C.pFiltroAlcaldias);
    }
};

/**
 * Limpia los checkbox con los filtros
 */
const clearFilterA = () => {
    let divs = document.getElementsByClassName("Alcaldia");
    for (let i=0; i < divs.length; i++) {
        divs[i].checked = false;
    }
    cql_filter_A = '';
    cql_filter_PGJ=""
    console.log("filtro=|"+cql_filter_A+"|");
};

/**
 * Funcion para aplicar el filtro de la alcaldía en los datos de PGJ
 * @param {Nombre de la alcaldia} alcaldia 
 */
const selectAlcaldia = (alcaldia) =>{
    let filter = '';
    switch (alcaldia) {
        case "Tlalpan":
            filter = "ILIKE '%TLAL%'";
            break;
        case "Venustiano Carranza":
            filter = "ILIKE '%VENUSTI%'";
            break;
        case "Azcapotzalco":
            filter = "ILIKE '%AZCAPO%'";
            break;
        case "Iztapalapa":
            filter = "ILIKE '%IZTAPA%'";
            break;
        case "Iztacalco":
            filter = "ILIKE '%IZTACA%'";
            break;
        case "Miguel Hidalgo":
            filter = "ILIKE '%MIGUEL%'";
            break;
        case "La Magdalena Contreras":
            filter = "ILIKE '%LA%'";  
            break;
        case "Coyoacán":
            filter = "ILIKE '%COYOA%'";
            break;
        case "Milpa Alta":
            filter = "ILIKE '%MILPA%'";
            break;
        case "Tláhuac":
            filter = "ILIKE '%Tlá%'";
            break;
        case "Benito Juárez":
            filter = "ILIKE '%BENI%'";
            break;
        case "Cuajimalpa de Morelos":
            filter = "ILIKE '%CUAJIM%'";
            break;
        case "Gustavo A. Madero":
            filter = "ILIKE '%GUSTAVO%'";
            break;
        case "Cuauhtémoc":
            filter = "ILIKE '%CUAUHT%'";
            break;
        case "Álvaro Obregón":
            filter = "ILIKE '%Álva%'";
            break;
        case "Xochimilco":
            filter = "LIKE 'XOCH%'";
            break;
        default:
            filter = "LIKE '%'";
            break;
    }
    return filter;
};

/**
 * Función para aplicar el tipo de arma utilizada
 * @param {valorTipoArma} value 
 */
const selectArma=(value)=>{
    switch (value) {
        case 'Arma blanca':
            return "ILIKE '%ARMA BLANCA%'"
        case 'Arma de fuego':
            return "ILIKE '%ARMA DE FUEGO%'"
        case 'Sin arma':
            return "NOT ILIKE '%ARMA%'"
    }
};

/**
 * Prepara el fltrado por alcaldias
 */
const applyFilterA = () => {
    cql_filter_A = '';
    if(clearFA){
        let toastHTML = '<span>Se han eliminado los filtros</span><button class="btn-flat toast-action">OK</button>';
        M.toast({html: toastHTML});
        repaintWMSAlcaldias(cql_filter_A);
        updateCluster(cql_filter_PGJ);
    }else{
        //Selecciona todos los elementos del filtro de Alcaldia
        let divs = document.getElementsByClassName("Alcaldia");

        //Recorre la lista de elementos seleccionados
        for (let i=0; i < divs.length; i++) {
            //console.log('Elemento '+i+' : '+ divs[i].checked+ ', '+ divs[i].getAttribute('value'));
            if(divs[i].checked && cql_filter_A.length == 0){
                cql_filter_A = "nomgeo='" + divs[i].getAttribute('value') + "' ";
                cql_filter_PGJ = "nombreAlcaldia " + selectAlcaldia(divs[i].getAttribute('value')) + " ";
            }else if(divs[i].checked){
                cql_filter_A += " OR nomgeo='" + divs[i].getAttribute('value') + "' ";
                cql_filter_PGJ += " OR nombreAlcaldia " + selectAlcaldia(divs[i].getAttribute('value')) + " ";
            }
        }
        //let sideNavInstance = M.Sidenav.getInstance($('.sidenav'));
        if(cql_filter_A.length==0 || cql_filter_PGJ.length==0){
            console.log("Sin filtro: Selecciona un Filtro");
            console.log(cql_filter_A);    

            let toastHTML = '<span>No hay filtros seleccionados</span><button class="btn-flat toast-action">OK</button>';
            M.toast({html: toastHTML});
            //repaintWMSAlcaldias(cql_filter_A_d);
            //updateCluster(cql_filter_PGJ_d);
        }else{
            let toastHTML = '<span>Los filtros han sido aplicados</span><button class="btn-flat toast-action">OK</button>';
            M.toast({html: toastHTML});
            //sideNavInstance.close();
            console.log("filtro=|"+cql_filter_A+"|");
            console.log("filtro=|"+cql_filter_PGJ+"|");
            repaintWMSAlcaldias(cql_filter_A);
            updateCluster(cql_filter_PGJ);
        }
    }
};


const applyFilterTipo = (divs) =>{
    cql_filter_Tipo ="";
    //Recorre la lista de divs seleccionados
    for (let i=0; i < divs.length; i++) {
        if(divs[i].checked && cql_filter_Tipo.length == 0){
            cql_filter_Tipo = "delito ILIKE '%" + divs[i].getAttribute('value') + "%' ";
        }else if(divs[i].checked){
            cql_filter_Tipo += " OR delito ILIKE '%" + divs[i].getAttribute('value') + "%' ";
        }
    }
    console.log(cql_filter_Tipo);
    if(cql_filter_Tipo.length==0){
        let toastHTML = '<span>No hay filtros seleccionados</span><button class="btn-flat toast-action">OK</button>';
        M.toast({html: toastHTML});
    }else{
        let toastHTML = '<span>Los filtros han sido aplicados</span><button class="btn-flat toast-action">OK</button>';
        M.toast({html: toastHTML});
        repaintWMSAlcaldias("");
        updateCluster(cql_filter_Tipo);
    }
};


const applyFilterArmas = (divs) =>{
    cql_filter_Tipo ="";
    //Recorre la lista de divs seleccionados
    for (let i=0; i < divs.length; i++) {
        if(divs[i].checked && cql_filter_Tipo.length == 0){
            cql_filter_Tipo = "delito " + selectArma(divs[i].getAttribute('value')) + " ";
        }else if(divs[i].checked){
            cql_filter_Tipo += " OR delito " + selectArma(divs[i].getAttribute('value')) + " ";
        }
    }
    console.log(cql_filter_Tipo);
    if(cql_filter_Tipo.length==0){
        let toastHTML = '<span>No hay filtros seleccionados</span><button class="btn-flat toast-action">OK</button>';
        M.toast({html: toastHTML});
    }else{
        let toastHTML = '<span>Los filtros han sido aplicados</span><button class="btn-flat toast-action">OK</button>';
        M.toast({html: toastHTML});
        repaintWMSAlcaldias("");
        updateCluster(cql_filter_Tipo);
    }
};

/**
 * Aplica el filtro de fechas
 */
const applyDateFilter = (dateRange) => {
    let toastHTML = '<span>Se ha aplicado el filtro</span><button class="btn-flat toast-action">OK</button>';
    M.toast({html: toastHTML});
   
    repaintWMSAlcaldias('');
    updateCluster(dateRange);
};


/**
 * Funciones de preparacion de elementos
 */
// Aplica el filtro de alcaldias
let applyfilterAlcaldias = document.getElementById('send_filtroA_b').onclick = () => {
    applyFilterA();
};

// Limpia el filtro de alcaldias
let clearfilterAlcaldias = document.getElementById('clear_filtroA_b').onclick = () => {
    clearFA = true;
    clearFilterA();
};

// Prepara y aplica el filtro de fehas 
document.getElementById('btnFiltroFechas').onclick = ()=>{
    //let fechaIn = M.Datepicker.getInstance();
    let fechaIni = $('#fechaIni').val();
    let fechaFin = $('#fechaFin').val();

    if(fechaIni.length==0 || fechaFin.length==0 ){
        let toastHTML = '<span>Selecciona ambas fechas</span><button class="btn-flat toast-action">OK</button>';
        M.toast({html: toastHTML});
    }else{
        console.log(fechaIni);
        console.log(fechaFin);
        cql_filter_Rango = "fecha BETWEEN '"+fechaIni+"%' AND '"+fechaFin+"%'";
        applyDateFilter(cql_filter_Rango);
        $('#modal1').modal('close');
    }
};

// Limpia el filtro de fechas
document.getElementById('btnClearFiltroFechas').onclick = () =>{
    cql_filter_Rango = '';
    $('#fechaIni').val('');
    $('#fechaFin').val('');
};

// Selecciona todos los elementos del filtro de tipoDelitos
document.getElementById('send_filtroTipoDelitos_b').onclick = () => {
    cql_filter_Tipo = '';
    let elementos = document.getElementsByClassName("tipoDelitos");
    applyFilterTipo(elementos);
};

// Limpia todos los elementos del filtro de tipo de delito
document.getElementById('clear_filtroTipoDelitos_b').onclick = () => {    
    let divs = document.getElementsByClassName("tipoDelitos");
    for (let i=0; i < divs.length; i++) {
        divs[i].checked = false;
    }
    cql_filter_Tipo = '';
};

// Selecciona todos los elementos del filtro de tipoArmas
document.getElementById('send_filtroArmas_b').onclick = () => {
    cql_filter_Arma = '';
    let elementos = document.getElementsByClassName("tipoArmas");
    applyFilterArmas(elementos);
};

// Limpia todos los elementos del filtro de tipoArmas
document.getElementById('clear_filtroArmas_b').onclick = () => {    
    let divs = document.getElementsByClassName("tipoArmas");
    for (let i=0; i < divs.length; i++) {
        divs[i].checked = false;
    }
    cql_filter_Arma = '';
};
