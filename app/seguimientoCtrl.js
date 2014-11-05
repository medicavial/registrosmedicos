app.controller('seguimientoCtrl', function($scope, $rootScope,$upload, $http, $routeParams, $location, $timeout, uploadManager, busqueda) {
    
    $scope.inicio = function(){

        $scope.detalleAut();
        $scope.edicion = true;
        $scope.archivos = [];
        

        $scope.datos = {

            autorizacion : $routeParams.autorizacion,
            observaciones:'',
            reagendado:'No',
            preexistencia:'No',
            archivo: $scope.archivos,
            folio: '',
            paciente: '',
            proveedor:'',
            pconfirmo:'',
            fecha:'',
            hora:''
      

             }

    }

    $scope.detalleAut = function(){

        busqueda.detalleresultado($routeParams.autorizacion).success(function (data){

                $scope.datos.paciente = data[0].AUM_lesionado;
                $scope.datos.folio = data[0].AUM_folioMV;
                $scope.datos.proveedor = data[0].RC_proveedor;
                $scope.datos.pconfirmo = data[0].RC_conproveedor;
                $scope.datos.fecha = data[0].RC_fechacita;
                $scope.datos.hora = data[0].RC_hora;
            

            $scope.autorizacion = data[0].AUM_clave;

        });

    }

   $scope.onFileSelect = function($files) {
     
    //$files: an array of files selected, each file has name, size, and type.
    for (var i = 0; i < $files.length; i++) {
      var file = $files[i];

      console.log($scope.datos);
      $scope.upload = $upload.upload({
        url: 'api/api.php?funcion=temporal', //upload.php script, node.js route, or servlet url
        method: 'POST',
        //headers: {'header-key': 'header-value'},
        //withCredentials: true,
        data: $scope.datos,
        file: file, // or list of files ($files) for html5 only
//        fileName: $scope.autorizacion, // to modify the name of the file(s)
        // customize file formData name ('Content-Disposition'), server side file variable name. 
        //fileFormDataName: myFile, //or a list of names for multiple files (html5). Default is 'file' 
        // customize how data is added to formData. See #40#issuecomment-28612000 for sample code
        //formDataAppender: function(formData, key, val){}
      }).progress(function(evt) {
        console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
      })
      .success(function (data, status, headers, config){

                // console.log(data);
                $scope.mensaje = data.respuesta;
                $scope.tipoalerta = 'alert-success';
                $scope.archivos.push(data.ruta);
                
                //console.log(data);
            }).error( function (xhr,status,data){

                $scope.mensaje ='Existe Un Problema de Conexion Intente Cargar Nuevamente la Pagina';
                $scope.tipoalerta = 'alert-danger';

            });

    }
    /* alternative way of uploading, send the file binary with the file's content-type.
       Could be used to upload files to CouchDB, imgur, etc... html5 FileReader is needed. 
       It could also be used to monitor the progress of a normal http post/put request with large data*/
    // $scope.upload = $upload.http({...})  see 88#issuecomment-31366487 for sample code.
  };

  $scope.guardar = function(){

        try{

            console.log($scope.datos);
            $scope.mensaje2 ='';

            $http({

                url:'api/api.php?funcion=guardaresultado',
                method:'POST', 
                contentType: "application/json; charset=utf-8", 
                dataType: "json", 
                data:$scope.datos

            }).success(function (data){

                // console.log(data);
                $scope.mensaje2 = data.respuesta;
                $scope.tipoalerta = 'alert-success';
                $location.path("/cita");
                



                
                //console.log(data);
            }).error( function (xhr,status,data){

                $scope.mensaje2 ='Existe Un Problema de Conexion Intente Cargar Nuevamente la Pagina';
                $scope.tipoalerta = 'alert-danger';

            });

        }catch(err){

            alert(err);
        }
        
    }   

    $scope.elimina = function(index){

        try{
            
            console.log($scope.archivos[index].ruta);
            $scope.mensaje2 ='';


            $http({

                url:'api/api.php?funcion=eliminaarchivo',
                method:'POST', 
                contentType: "application/json; charset=utf-8", 
                dataType: "json", 
                data: $scope.datos
            }).success(function (data){

                 

                $scope.mensaje2 = data.respuesta;
                $scope.tipoalerta = 'alert-success';
                $scope.archivos.splice(index,1);

   //             $location.path("/cita");
                                
                //console.log(data);
            }).error( function (xhr,status,data){

                $scope.mensaje2 ='Existe Un Problema de Conexion Intente Cargar Nuevamente la Pagina';
                $scope.tipoalerta = 'alert-danger';

            });

        }catch(err){

            alert(err);
        }
        
    }   

        
});
