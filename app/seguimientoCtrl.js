app.controller('seguimientoCtrl', function($scope, $rootScope,$upload, $http, $routeParams) {
    
    $scope.inicio = function(){

        $scope.datos = {

            autorizacion : $routeParams.autorizacion,
            observaciones:'',
            reagendado:'No',
            preexistencia:'No',
            ruta: ''
        }

    }

    $scope.onFileSelect = function($files) {
    var file = $files[0];

    if (file.size > 5097152){
         $scope.error ='Tu archivo excedio los 5 MB';
    }
    $scope.upload = $upload.upload({
        url: 'api/api.php?funcion=temporal',
        data: {fname: $scope.fname},
        file: file,
      }).success(function(data, status, headers, config) {

        $scope.mensaje = data.archivo;
        $scope.alerta = 'alert-success';
        $scope.datos.ruta = data.nombre;

        console.log(data);

            $http({
                url:'api/api.php?funcion=guardaresultado&nombre='+$scope.datos.ruta,
                method:'POST', 
                contentType: "application/json; charset=utf-8", 
                dataType: "json", 
                data:$scope.datos
            }).success(function(data) {

                $scope.mensaje = data.respuesta;
                $scope.alerta = 'alert-success';
        //        $location.path("/observacion/"+$routeParams.autorizacion);

        
      });  
      });     
    }



});
