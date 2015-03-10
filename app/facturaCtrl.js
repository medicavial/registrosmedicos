app.controller('facturaCtrl', function($scope, $http, busqueda, $location, todoFactory, $timeout, $upload, alertService, $routeParams, $rootScope) {


	$scope.inicio = function(){

		$scope.todos = [];
        // loadTodos();
        $scope.variable = 1;
        $scope.archivos = [];
        $scope.bit3 = 0;
        $scope.bit4 = 0;
        $scope.lista = true;
        $scope.lista2 = false;
        $scope.infolesionado();
        $scope.detalle = false;


		$scope.factura = {

			autorizacion: $routeParams.autorizacion,
			movimiento: $routeParams.movimiento,
			archivo: '',
			bit: '',
			bit2: '',
			lesionado: '',
			folio: ''

		}

		$scope.datos = {

			rfc: '',
			emisor: '',
			fechaEmi: '',
			foliofiscal: ''

		}
	}

	$scope.infolesionado = function(){

		busqueda.infolesionado($routeParams.autorizacion).success(function (data){

			$scope.factura.lesionado = data.lesionado;
			$scope.factura.folio = data.folio;

		});

	}

    $scope.onFileSelect_xml = function($files) {


       if($scope.bit2 == 1){

       	alert("Ya existe un fichero XML");

       }else{

	   var aux = $files[0].name.split('.');

	   if(aux[aux .length-1] == 'xml'){
	      // return true;

       for (var i = 0; i < $files.length; i++) {
       var file = $files[i];

		$scope.variable = 2;
		var amt = 0;

    //$files: an array of files selected, each file has name, size, and type.

      $scope.upload = $upload.upload({
	        url: 'api/api.php?funcion=archivo_temporal', //upload.php script, node.js route, or servlet url
	        method: 'POST',
	        //headers: {'header-key': 'header-value'},
	        //withCredentials: true,
	        data: $scope.factura,
	        file: file, // or list of files ($files) for html5 only
	        
	      progress:function(evt) {

	      	console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
	          
	          var amt =  parseInt(100.0 * evt.loaded / evt.total);
	  
			  $scope.countTo = amt;
			  $scope.countFrom = 0;
			  
			  $timeout(function(){  
			    $scope.progressValue = amt;
			  }, 200);
	      }
	  })

      .success(function (data, status, headers, config){

      	console.log(data);


                alertService.add('success', data.respuesta);
                $scope.archivos = data.archivo;
                $scope.variable = 1;
                $scope.factura.leexml = data.leexml;
                $scope.bit2 = data.bit2;
                $scope.bit4 = data.bit4;


                todoFactory.getxmltemporal($scope.factura.leexml).success(function(data){
	            courses  = x2js.xml_str2json(data);

	            $scope.factura.foliofiscal = courses.Comprobante.Complemento.TimbreFiscalDigital._UUID;
	            $scope.factura.rfc = courses.Comprobante.Receptor._rfc;
	            $scope.factura.emisor = courses.Comprobante.Emisor._nombre;
	            $scope.factura.receptor = courses.Comprobante.Receptor._nombre;
	            $scope.factura.subtotal = courses.Comprobante._subTotal;
	            $scope.factura.iva = courses.Comprobante.Impuestos.Traslados.Traslado._importe;
	            $scope.factura.total = courses.Comprobante._total;
	            $scope.factura.descuento = courses.Comprobante._descuento;
	            $scope.factura.fechaemision = courses.Comprobante._fecha;

	         });

	            
            }).error( function (xhr,status,data){

                alertService.add('danger', 'Ocurrio un ERROR con tu Archivo!!!');

            });

    }

	   }else{
      alert('El archivo debe ser .xml');
      // return false;
   }
}
  };


   $scope.onFileSelect_pdf = function($files) {

       if($scope.bit == 1){

       alert("Ya existe un fichero PDF");

    }else{

	   var aux = $files[0].name.split('.');

	   if(aux[aux .length-1] == 'pdf'){
	      // return true;

       for (var i = 0; i < $files.length; i++) {
       var file = $files[i];

		$scope.variable = 2;
		var amt = 0;

    //$files: an array of files selected, each file has name, size, and type.

      $scope.upload = $upload.upload({
	        url: 'api/api.php?funcion=archivo_temporal', //upload.php script, node.js route, or servlet url
	        method: 'POST',
	        //headers: {'header-key': 'header-value'},
	        //withCredentials: true,
	        data: $scope.factura,
	        file: file, // or list of files ($files) for html5 only
	        
	      progress:function(evt) {

	      	console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
	          
	          var amt =  parseInt(100.0 * evt.loaded / evt.total);
	  
			  $scope.countTo = amt;
			  $scope.countFrom = 0;
			  
			  $timeout(function(){  
			    $scope.progressValue = amt;
			  }, 200);
	      }
	  })

      .success(function (data, status, headers, config){

      	console.log(data);


                alertService.add('success', 'Tu Archivo subio con Exito!!!');
                $scope.archivos = data.archivo;
                $scope.variable = 1;
                $scope.factura.leexml = data.leexml;
                $scope.bit = data.bit;
                $scope.bit3 = data.bit3;
                

            }).error( function (xhr,status,data){

                alertService.add('danger', 'Ocurrio un ERROR con tu Archivo!!!');

            });

    }

	   }else{
      alert('El archivo debe ser .pdf');
      // return false;
   }
}
  };

    $scope.guardaArchivos = function(){


        try{

        	$scope.factura.archivo = $scope.archivos;
        	console.log($scope.factura);

            $http({

                url:'api/api.php?funcion=guardafactura',
                method:'POST', 
                contentType: "application/json; charset=utf-8", 
                dataType: "json", 
                data:$scope.factura

            }).success(function (data){

                alertService.add('success', 'Tu Archivos se Guardaron con Exito!!!');
                $scope.edicion = true;
                $scope.bit4 = 1;
                $scope.lista =  false;
                todoFactory.getTodos($scope.factura.autorizacion,$scope.factura.movimiento,$scope.factura.leexml).success(function(data){
	            courses  = x2js.xml_str2json(data);

	            $scope.factura.foliofiscal = courses.Comprobante.Complemento.TimbreFiscalDigital._UUID;
	            $scope.factura.rfc = courses.Comprobante.Receptor._rfc;
	            $scope.factura.emisor = courses.Comprobante.Emisor._nombre;
	            $scope.factura.receptor = courses.Comprobante.Receptor._nombre;
	            $scope.factura.subtotal = courses.Comprobante._subTotal;
	            $scope.factura.iva = courses.Comprobante.Impuestos.Traslados.Traslado._importe;
	            $scope.factura.total = courses.Comprobante._total;
	            $scope.factura.descuento = courses.Comprobante._descuento;
	            $scope.factura.fechaemision = courses.Comprobante._fecha;
	            $scope.lista2 = true;

	            $http({

	                url:'api/api.php?funcion=inserta_xml',
	                method:'POST', 
	                contentType: "application/json; charset=utf-8", 
	                dataType: "json", 
	                data:$scope.factura

	            }).success(function (data){

	            	alertService.add('success', 'Tus Datos se Guardaron con Exito!!!');


	            }).error( function (xhr,status,data){

	            	alertService.add('danger', 'Error!!!');

	            });

	        });
                                
                //console.log(data);
            }).error( function (xhr,status,data){

                alertService.add('danger', 'ERROR!!!');


            });

        }catch(err){

            alert(err);
        }
        
    } 

    $scope.timbrar = function(){

		$http({
			url:'api/api.php?funcion=timbrar',
			method:'POST', 
			contentType: 'application/json', 
			dataType: "json", 
			data:$scope.factura
		}).success( function (data){

			$scope.confirma = data;
			$scope.edicion1 = true; 
			alertService.add('success', 'Tus Archivos fueron Enviados a Validación!!!');
			alert('Archivos Enviados!!!');
			$location.path("/cita");

		}).error( function (data){

			alert('Ocurrio un error de conexion intente nuevamente si persiste el problema comunicate al area de sistemas');

		});
	}


	    $scope.elimina = function(index){

        try{
            
             //console.log($scope.archivos[index]);
            $scope.mensaje2 ='';

            $http({

                url:'api/api.php?funcion=elimina_factura',
                method:'POST', 
                contentType: "application/json; charset=utf-8", 
                dataType: "json", 
                data: { archivo: $scope.archivos[index] }
            }).success(function (data){

                $scope.mensaje2 = data.respuesta;
                $scope.bit = data.bit;
                $scope.bit2 = data.bit2;
                $scope.tipoalerta = 'alert-success';
                $scope.archivos.splice(index,1);

                // console.log($scope.archivos.splice(index,1));
                                
                //console.log(data);
            }).error( function (xhr,status,data){

                $scope.mensaje2 ='Existe Un Problema de Conexion Intente Cargar Nuevamente la Pagina';
                $scope.tipoalerta = 'alert-danger';

            });

        }catch(err){

            alert(err);
        }
        
    }


     $scope.Buscar = function(){


        try{

            $http({

                url:'api/api.php?funcion=buscarFactura',
                method:'POST', 
                contentType: "application/json; charset=utf-8", 
                dataType: "json", 
                data:$scope.datos

            }).success(function (data){

                $scope.detalle = true;
            	$scope.rfc = data.rfc;
            	$scope.foliofiscal = data.foliofiscal;
            	$scope.fechaemision = data.fechaemision;
            	$scope.autorizacion = data.autorizacion;
            	$scope.movimiento = data.movimiento;
            	$scope.receptor = data.receptor;
            	$scope.subtotal = data.importe;
            	$scope.emisor = data.emisor;
            	$scope.iva = data.iva;
            	$scope.total = data.total;
            	$scope.descuento = data.descuento;
            	$scope.archivosdetalles = data.archivo;

                                
                //console.log(data);
            }).error( function (xhr,status,data){

                alertService.add('danger', 'ERROR!!!');


            });

        }catch(err){

            alert(err);
        }
        
    }
  

});