import * as C from './drawable/Components';
import * as F from './functions';


$(document).ready(function() {
  initComponents();
  
  //F.initCluster();
  
  document.getElementById("progress").style.display = 'none';
  document.getElementById("progress2").style.display = 'none';
});

/**
 * Inicia los componentes de materialize (Barra de nav, Modales, Filtros)
 */
const initComponents = () => {
  C.map.zoomControl.setPosition('topright');
  $('.collapsible').collapsible();  
  $('.datepicker').datepicker();
  $('.modal').modal({
    dismissible: false
  });
}
