app.controller('seguimientoCtrl', function($scope, $rootScope,$upload) {
    
    $scope.inicio = function(){

        $scope.datos = {
            observaciones:'',
            reagendado:true,
            ruta:''
        }

    }

    $scope.onFileSelect = function($files) {
    var file = $files[0];

    if (file.size > 2097152){
         $scope.error ='File size cannot exceed 2 MB';
    }     
    $scope.upload = $upload.upload({
        url: 'api/api.php?funcion=temporal',
        data: {fname: $scope.fname},
        file: file,
      }).success(function(data, status, headers, config) {
        // file is uploaded successfully
        console.log(data);
            $scope.datos.ruta = data.ubicacion;
      });
    }
});
