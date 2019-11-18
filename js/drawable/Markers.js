export const markers = new Object();

markers.redMarker = L.ExtraMarkers.icon({
    icon: 'fa-coffee',
    markerColor: 'red',
    shape: 'square',
    prefix: 'fa'
});

markers.greenMarker = L.ExtraMarkers.icon({
    icon: 'fa-coffee',
    markerColor: 'green',
    shape: 'square',
    prefix: 'fa'
});

export const getFromFeature = (feature) => {
    let delito = feature.toLowerCase();
    if(delito.includes('robo')){
        return require('../../assets/crimes/robo.png');
    }
    else if( delito.includes('violencia familiar') ){
        return require('../../assets/crimes/violencia.png');
    }
    else if(delito.includes('homicidio')){
        return require('../../assets/crimes/homicidio.png');
    }
    else if(delito.includes('secuestro')){
        return require('../../assets/crimes/secuestro.png');
    }
    else{
        return require('../../assets/crimes/default.png');
    }
};
//SIN ARMA
//delito NOT ILIKE '%ARMA%'

//CON ARMA BLANCA
//delito ILIKE '%ARMA BLANCA%'

//FUEGO
//delito ILIKE '%ARMA DE FUEGO%'


