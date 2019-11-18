import * as C from './drawable/Components';
import * as F from './functions';


$(document).ready(function() {
  initComponents();
  initFiltroAlcaldias();
  initFiltroTipoDelito();
  initFiltroTipoArma();
  F.initCluster();
  $('select').formSelect();
  
  /**
   * Prepara el modal (COMPONENTS)
   */
});

/**
 * Inicia los componentes de materialize (Barra de nav, Modales, Filtros)
 */
const initComponents = () => {
  

  C.map.zoomControl.setPosition('topright');
  $('.collapsible').collapsible();  
  $('.datepicker').datepicker();
  $('.modal').modal();

  $('#dateFilter_range').click( ()=>{
    $('#modal1').modal('open');
  });

  $('.sidenav').sidenav();

  $('#modal1').modal();

  $(".selectFecha").datepicker({
    format: 'dd/mm/yy'
  });
  $('#fechaIni').val('');
  $('#fechaFin').val('');
};

const initFiltroTipoDelito = () => {
  for(let i =0;i<getTiposDelito.length;i++){
    let labelFiltro = "<label id='filtroA'>";
    labelFiltro += "<input class='tipoDelitos' type='checkbox' value='"+getTiposDelito[i]+"'/>";
    labelFiltro += "<span style='color: black;'>"+getTiposDelito[i]+"</span><br></label>";
    $('#cuerpoFiltroTipoDelito').append(labelFiltro);
  }
};

/**
 * Inicia los filtros de las alcaldias 
 */
const initFiltroAlcaldias = () => {
  for(let i =0;i<getAlcaldias.length;i++){
    let labelFiltro = "<label id='filtroA'>";
    labelFiltro += "<input class='Alcaldia' type='checkbox' value='"+getAlcaldias[i]+"'/>";
    labelFiltro += "<span style='color: black;'>"+getAlcaldias[i]+"</span><br></label>";
    $('#cuerpoFiltroAl').append(labelFiltro);
    //console.log("valor="+getAlcaldias[i]);
  }
};

const initFiltroTipoArma= () => {
  for(let i =0;i<getTiposArmas.length;i++){
    let labelFiltro = "<label id='filtroA'>";
    labelFiltro += "<input class='tipoArmas' type='checkbox' value='"+getTiposArmas[i]+"'/>";
    labelFiltro += "<span style='color: black;'>"+getTiposArmas[i]+"</span><br></label>";
    $('#cuerpoFiltroTipoArma').append(labelFiltro);
  }
};

/**
 * Arreglo con cada una de las alcaldias
 */
const getAlcaldias =[
  "Álvaro Obregón",
  "Azcapotzalco",
  "Benito Juárez",
  "Coyoacán",
  "Cuajimalpa de Morelos",
  "Cuauhtémoc",
  "Gustavo A. Madero",
  "Iztacalco",
  "Iztapalapa",
  "La Magdalena Contreras",
  "Miguel Hidalgo",
  "Milpa Alta",
  "Tláhuac",
  "Tlalpan",
  "Venustiano Carranza",
  "Xochimilco"
];

const getTiposDelito =[  
  "Homicidio",
  "Robo",
  "Secuestro",
  "Violencia familiar"
];

const getTiposArmas =[
  "Arma blanca",
  "Arma de fuego",
  "Sin arma"
];