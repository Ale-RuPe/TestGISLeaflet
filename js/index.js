import * as C from './drawable/Components';
import {markers as Markers} from './drawable/Markers';
import * as F from './functions';



$(document).ready(function() {
  $('.collapsible').collapsible();  
  $('.datepicker').datepicker();
  $('.modal').modal({
    dismissible: false
  });
  C.map.zoomControl.setPosition('topright');
  
  F.startCluster();
  
  document.getElementById("progress").style.display = 'none';
  document.getElementById("progress2").style.display = 'none';
});
