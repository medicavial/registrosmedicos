app.factory("auth", function($location, $rootScope, $http, webStorage){
    return{
        login : function(username, password)
        {   
            $('#boton').button('loading');

            $http({
                url:'api/api.php?funcion=login',
                method:'POST', 
                contentType: 'application/json', 
                dataType: "json", 
                data:{user:username,psw:password}
            }).success( function (data){
                
                $('#boton').button('reset');

                console.log(data);

                if(data.respuesta){

                    $rootScope.mensaje = data.respuesta;

                }else{
                    
                    //creamos la cookie con el nombre que nos han pasado
                    webStorage.local.clear();

                    webStorage.session.add('username', data[0].Uni_nombre);
                    webStorage.session.add('permiso', data[0].Per_clave);
                    webStorage.session.add('user', data[0].Usu_login);
                    webStorage.session.add('clave', data[0].USU_claveMV);
                    webStorage.session.add('hospitalario', data[0].Hospitalario);

                    $rootScope.username =  data[0].Uni_nombre;
                    $rootScope.permiso = data[0].Per_clave;
                    $rootScope.user = data[0].Usu_login;
                    $rootScope.clave = data[0].USU_claveMV;
                    $rootScope.hospitalario = data[0].Hospitalario;

                    $location.path("/");

                }
                
            }).error( function (xhr,status,data){

                $('#boton').button('reset');
                alert('Existe Un Problema de Conexion Intente Cargar Nuevamente la Pagina');

            });

            
        },
        logout : function()
        {
            //al hacer logout eliminamos la cookie con $cookieStore.remove y los rootscope
            webStorage.session.clear();
            webStorage.local.clear();

            $rootScope.username =  '';
            $rootScope.permiso = '';
            $rootScope.user = '';
            $rootScope.clave = '';
            $rootScope.hospitalario = '';

            //mandamos al login
            $location.path("/login");

        },
        checkStatus : function()
        {
            //creamos un array con las rutas que queremos controlar
            if($location.path() != "/login" && webStorage.session.get('username') == null)
            {   
                $location.path("/login");
            }
            //en el caso de que intente acceder al login y ya haya iniciado sesión lo mandamos a la home
            if($location.path() == "/login" && webStorage.session.get('username') != null)
            {
                $location.path("/home");
            }
        }
    }
});

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