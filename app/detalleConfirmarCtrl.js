var hoy = new Date(); 
var dd = hoy.getDate(); 
var mm = hoy.getMonth()+1;//enero es 0! 
if (mm < 10) { mm = '0' + mm; }
if (dd < 10) { dd = '0' + dd; }

var yyyy = hoy.getFullYear();
//armamos fecha para los datepicker
var FechaAct = yyyy + '-' + mm + '-' + dd;

var hora = hoy.getHours();
var minuto = hoy.getMinutes();

var FechaActHora = hora + ':' + minuto;

app.controller('detalleConfirmarCtrl', function($scope, $http, busqueda, $rootScope, $routeParams, $filter, $location) {

	$scope.inicio = function(){

		$scope.titulo = 'Agendar';
		//console.log($routeParams.autorizacion);
		$scope.detalleAut();
		$scope.mensaje ='';
		$scope.edicion = true;
		//$scope.autorizacion=$routeParams.autorizacion;

		$scope.datos= {

            autorizacion : '',
	    	proveedor :'',
	    	costo : '',
	    	cita:'',
	    	notas : '',
	    	referencia : '',
	    	fechacita :FechaAct,
	    	horacita :FechaActHora,
	    	paciente : '',
	    	proveedor1 :'',
	    	status: 'Por confirmar',
	    	folio: $routeParams.folio,
	    	fecha: FechaAct,
	    	hora: FechaActHora
    	}


	}	


	$scope.detalleAut = function(){


		busqueda.detallealtacita($routeParams.autorizacion).success(function (data){

			console.log(data);

			$scope.datos = {

				autorizacion:data[0].AUM_clave,
				proveedor:data[0].RC_proveedor,
				costo:data[0].RC_costo,
				cita:data[0].RC_tipocita,
				notas:data[0].RC_obs,
				referencia:data[0].RC_inforeferencia,
				paciente:$routeParams.paciente,
				folio:$routeParams.folio,
				fechacita:data[0].RC_fechahora,
				horacita:data[0].RC_hora,
				proveedor1:data[0].RC_conproveedor,
				telefono:data[0].Exp_telefono

			}

			$scope.autorizacion = data[0].AUM_clave;

		});

	}

	 $scope.actualiza = function(){

        console.log($scope.datos);

    try{

			$scope.mensaje ='';

			$http({

		        url:'api/api.php?funcion=actualizacita',
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