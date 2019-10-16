import * as C from './drawable/Components';
import {markers as Markers} from './drawable/Markers';
import * as F from './functions';
import {getGeoJSON as getData} from './service/wms_service';


$(document).ready(function() {
  C.map.zoomControl.setPosition('topright');
  let url = F.loadWFS("pruebas:carpeta_invest_pgj_cdmx", "EPSG:4326");
  let cluster = F.clusterMarkers;

  getData(url,(success, data) => {
    if(success){
      console.log(data);
      console.log(Object.keys(data.features).length);
      
      F.loadMarkers(data,cluster,Markers);
      C.map.addLayer(cluster);
    }
  });

  document.getElementById("progress").style.display = 'none';
  document.getElementById("progress2").style.display = 'none';
});
