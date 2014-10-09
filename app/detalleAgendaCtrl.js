app.controller('detalleAgendaCtrl', function($scope, $http, busqueda, $rootScope, $routeParams, $filter, $location) {

	$scope.inicio = function(){

		$scope.titulo = 'Agendar';
		console.log($routeParams.autorizacion);
		//$scope.detalleAut();
		//$scope.mensaje ='';
		$scope.edicion = true;
		//$scope.autorizacion=$routeParams.autorizacion;

		$scope.datos= {

            autorizacion : $routeParams.autorizacion,
	    	proveedor :'',
	    	costo : '',
	    	cita:'',
	    	notas : '',
	    	referencia : '',
	    	fechacita :FechaAct,
	    	horacita :FechaActHora,
	    	paciente :'',
	    	proveedor1 :'',
	    	status: 'Por confirmar'
    	}


	}	


	$scope.detalleAut = function(){


		busqueda.detalleagenda($routeParams.autorizacion).success(function (data){

			$scope.datos = {
				autorizacion:$routeParams.autorizacion
			}

		});

	}

     $scope.agenda = function(){

        console.log($scope.datos);

    try{

			$scope.mensaje ='';

			$http({

		        url:'api/api.php?funcion=agenda',
		        method:'POST', 
		        contentType: "application/json; charset=utf-8", 
		        dataType: "json", 
		        data:$scope.datos
		       

		    }).success(function (data){

		         console.log(data);
		        $scope.mensaje = data.respuesta;
		        $scope.alerta = 'alert-success';
		        $scope.autorizacion = data.autorizacion;
		        $location.path("/seguimiento/" + $routeParams.autorizacion);
		        
		        //console.log(data);
		    }).error( function (xhr,status,data){

		        $scope.mensaje ='Error';
		        $scope.alerta = 'alert-danger';

		    });

		}catch(err){

			alert(err);
		}
}

 $scope.confirmar = function(){

        console.log($scope.datos);

 //       $scope.datos.status = 'Por confirmar';
 //       $scope.agenda();

     try{

		 	$scope.mensaje ='';

		 	$http({

		         url:'api/api.php?funcion=confirmar',
		         method:'POST', 
		         contentType: "application/json; charset=utf-8", 
		         dataType: "json", 
		         data:$scope.datos
		       

		     }).success(function (data){

		          console.log(data);
		         $scope.mensaje = data.respuesta;
		         $scope.alerta = 'alert-success';
		         $scope.autorizacion = data.autorizacion;
		         $location.path("/cita");
		        
		         //console.log(data);
		     }).error( function (xhr,status,data){

		         $scope.mensaje ='Error';
		         $scope.alerta = 'alert-danger';

		     });

		 }catch(err){

		 	alert(err);
		 }
}
	

});