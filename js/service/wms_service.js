/**
 * Obtiene los datos del servidor en formato JSON
 * @param {URL del servicio} url 
 * @param {Datos de retorno} callback 
 */
export const getGeoJSON = (url, callback) => {
    $.ajax({
        url: url,
        dataType: 'json'      
    })
    .done(data => {
        callback(true, data);
    })
    .fail(err => {
        callback(false, err);
    });
};

const getGeoJSONES6 = (url,callback) => {
    fetch(url)
    .then( response => {
        return callback(true, response.json());
    })
    .catch( error => {
        console.error('Error:', error)
        return callback(false, error);
    })
};
