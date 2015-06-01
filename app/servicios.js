

app.factory('todoFactory',function($http){
      var factory = [];
      
      factory.getxmltemporal = function(variable){
        return $http.get('Facturas/'+ variable);
      },

      factory.getTodos = function(autorizacion, movimiento, variable){
        return $http.get('Facturas/'+ autorizacion + '-'+ movimiento + '/' + variable);
      }
     
        return factory;
});


app.factory('busqueda', function($http){
    return{
        administrador:function(){
            return $http.get('api/api.php?funcion=consultaConcluidos2');
        },
        archivo:function(){
            return $http.get('api/api.php?funcion=mostrararchivo');
        },
        autorizaciones:function(){
            return $http.get('api/api.php?funcion=consultaAutorizaciones');
        },
        autoriza:function(){
            return $http.get('api/api.php?funcion=consultaAut');
        },
        concluido:function(){
            return $http.get('api/api.php?funcion=consultaConcluidos');
        },
        confirma:function(){
            return $http.get('api/api.php?funcion=consultaConfirmaciones');
        },
        empresas:function(){
            return $http.get('api/api.php?funcion=empresas');
        },
        expedientes:function(datos){
            return $http.post('api/api.php?funcion=buscaExpedientes',datos);
        },
        folio:function(folio){
            return $http.get('api/api.php?funcion=consultaFolio&folio='+folio);
        },
        hospitalarios:function(){
            return $http.get('api/api.php?funcion=consultaHospitalarios');
        },
        detalleagenda:function(autorizacion){
            return $http.get('api/api.php?funcion=detalleAgenda&autorizacion='+autorizacion);
        },
        detalleconcluido:function(autorizacion){
            return $http.get('api/api.php?funcion=detalleConcluido&autorizacion='+autorizacion);
        },
        detallealtacita:function(autorizacion){
            return $http.get('api/api.php?funcion=detallealtacita&autorizacion='+autorizacion);
        },
        detalleautorizacion:function(clave){
            return $http.get('api/api.php?funcion=detalleAutorizacion&numero='+clave);
        },
        detallehospitalario:function(clave){
            return $http.get('api/api.php?funcion=detalleHospitalario&numero='+clave);
        },
        detalleobservacion:function(autorizacion, tipo, movimiento){
            return $http.get('api/api.php?funcion=detalleobservacion&autorizacion='+autorizacion+'&tipo='+tipo+'&movimiento='+movimiento);
        },
        detalleresultado:function(autorizacion){
            return $http.get('api/api.php?funcion=detalleres&autorizacion='+autorizacion);
        },
        infolesionado:function(autorizacion){
            return $http.get('api/api.php?funcion=infolesionado&autorizacion='+autorizacion);
        },
        movimientos:function(clave){
            return $http.get('api/api.php?funcion=detalleAutorizacionMovimiento&numero='+clave);
        },
        observacion:function(){
            return $http.get('api/api.php?funcion=consultaObservacion');
        },
        pendiente:function(){
            return $http.get('api/api.php?funcion=consultaPendientes');
        },
        pendienteTranferir:function(){
            return $http.get('api/api.php?funcion=pendienteTransferir');
        },
        posicion:function(){
            return $http.get('api/api.php?funcion=posicion');
        },
        resultado:function(){
            return $http.get('api/api.php?funcion=consultaResultados');
        },
        riesgo:function(){
            return $http.get('api/api.php?funcion=riesgo');
        },
        tipoMovimiento:function(){
            return $http.get('api/api.php?funcion=tipoMovimiento');
        },
        unidades:function(){
            return $http.get('api/api.php?funcion=unidades');
        },
        usuariosComerciales:function(){
            return $http.get('api/api.php?funcion=usuariosComerciales');
        },
        verificaprefijo:function(prefijo,empresa){
            return $http.get('/documento/api/verificaprefijo/'+prefijo +"/"+empresa);
        },
        rellenaFolio:function(folio){

            if (folio != '') {

              var totalletras = folio.length;

              var letras = folio.substr(0,4);
              var numeros = folio.substr(4,totalletras);

              if(letras.length < 4 ){

                var faltantes = 4 - letras.length;

                for (var i = 0; i < faltantes; i++) {

                  var letra = letras.charAt(i);
                  letras = letras + "0";
                }
              }

              if(numeros.length < 6 ){

                var faltantes = 6 - numeros.length;

                for (var i = 0; i < faltantes; i++) {
                  
                  numeros = "0" + numeros;
                }
              }

              folio = letras + numeros;

              return folio;

            }else{

              return folio

            }


        }
    }
});

app.factory('uploadManager', function ($rootScope) {
    var _files = [];
    return {
        add: function (file) {
            _files.push(file);
            $rootScope.$broadcast('fileAdded', file.files[0].name);
        },
        clear: function () {
            _files = [];
        },
        files: function () {
            var fileNames = [];
            $.each(_files, function (index, file) {
                fileNames.push(file.files[0].name);
            });
            return fileNames;
        },
        upload: function () {
            $.each(_files, function (index, file) {
                file.submit();
            });
        },
        setProgress: function (percentage) {
            $rootScope.$broadcast('uploadProgress', percentage);
        }
    };
});


app.factory('alertService', ['$timeout', '$rootScope',
    function($timeout, $rootScope) {
        alertService = {};
        $rootScope.alerts = [];

        alertService.add = function(type, title, msg, timeout) {
            $rootScope.alerts.push({
                type: type,
                title: title,
                msg: msg,
                close: function() {
                    return alertService.closeAlert(this);
                }
            });

            if(typeof timeout == 'undefined') {
                timeout = 3000;
            }

            if (timeout) {
                $timeout(function(){
                    alertService.closeAlert(this);
                }, timeout);
            }
        }

        alertService.closeAlert = function(alert) {
            return this.closeAlertIdx($rootScope.alerts.indexOf(alert));
        }

        alertService.closeAlertIdx = function(index) {
            return $rootScope.alerts.splice(index, 1);
        }

        return alertService;
    }
]);