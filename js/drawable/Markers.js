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
    switch (feature) {
        case 'robo':
            return require('../../assets/leaf-red.png');
        default:
            return require('../../assets/leaf-green.png');
    }
};