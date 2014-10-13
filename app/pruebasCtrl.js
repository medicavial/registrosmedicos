function pruebasCtrl($scope, busqueda, $http, $filter){

	///Generar tabla dinamica con angular necesitamos agregar dos dependencias la cuales son:
	//ngTableParams y $filter


	$scope.inicio = function(){

		$scope.buscaautorizaciones();
		$scope.altaunidad();
		$scope.altacliente();

		$scope.autorizacion = {
			folio:'',
			autorizacion:'',
			fechaini:'',
			fechafin:'',
			lesionado:'',
			cliente:'',
			unidad:''
		}

		$scope.hospitalario = {
			folio:'',
			hospitalario:'',
			fechaini:'',
			fechafin:'',
			lesionado:'',
			cliente:'',
			unidad:''
		}

		$scope.itemsByPage = 15;
	}

	$scope.buscaautorizaciones = function(){

		busqueda.autorizaciones().success(function (data){

			$scope.autorizaciones = data;
			
		});

	}

	$scope.buscahospitalarios = function(){
		
		busqueda.hospitalarios().success(function (data){
			$scope.hospitalarios = data;
		});

	}

	$scope.altaunidad = function(){

		busqueda.unidades().success(function (data){
			$scope.unidades = data;
		});

	}

	$scope.altacliente = function(){

		busqueda.empresas().success(function (data){
			$scope.clientes = data;
		});

	}

	$scope.buscarAut = function(){

		if (!$scope.fechaaut) {
			$scope.autorizacion.fechaini = '';
			$scope.autorizacion.fechafin = '';
		};

		console.log($scope.autorizacion);
		$http({
			url:'api/api.php?funcion=busquedaAutorizacion',
			method:'POST', 
			contentType: 'application/json', 
			dataType: "json", 
			data:$scope.autorizacion
		}).success( function (data){
			
			console.log(data);
			$scope.autorizaciones = data;

		}).error( function (data){

			alert('Ocurrio un error de conexion intente nuevamente si persiste el problema comunicate al area de sistemas');

		});
	}


	$scope.buscarHos = function(){

		if (!$scope.fechahos) {
			$scope.hospitalario.fechaini = '';
			$scope.hospitalario.fechafin = '';
		};
		
		console.log($scope.hospitalario);
		$http({
			url:'api/api.php?funcion=busquedaHospitalarios',
			method:'POST', 
			contentType: 'application/json', 
			dataType: "json", 
			data:$scope.hospitalario
		}).success( function (data){
			console.log(data);
			$scope.hospitalarios = data;

		}).error( function (data){

			alert('Ocurrio un error de conexion intente nuevamente si persiste el problema comunicate al area de sistemas');

		});

	}

	$scope.verificaFolioA = function(folio){

		$scope.autorizacion.folio = busqueda.rellenaFolio(folio);

	}

	$scope.verificaFolioH = function(folio){

		$scope.hospitalario.folio = busqueda.rellenaFolio(folio);

	}

	//esta funcion nos sirve para generar  la informacion el la tabla 
	// $scope.muestraTabla = function(data){


	// 	$scope.tableParams = new ngTableParams({
	// 	        page: 1,            // muestra primera pagina
	// 	        count: 10,          // cuantos datos mostrar 
	// 	        sorting: {
	// 	            name: 'asc'     // orden inicial
	// 	        }
	// 	    }, {
	// 	        total: data.length, // tamaño de los datos
	// 	        getData: function($defer, params) {
	// 	            // utlizamos el filtro de angular para hacer el orden segun la columna que queramos
	// 	            var orderedData = params.sorting() ?
	// 	                                $filter('orderBy')(data, params.orderBy()) :
	// 	                                data;

	// 	            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
	// 	        }
	// 	    });
	// }

	$scope.selectos = [];

	$scope.filterOptions = {
	    filterText: '',
	    useExternalFilter: false
	};

    ////opciones del grid                 
    $scope.gridOptions = { 
    	data: 'autorizaciones', 
    	//enableColumnResize:true,
    	// enablePinning: true, 
    	enableRowSelection:true,
    	multiSelect:true,
    	// showSelectionCheckbox: false,
    	// selectWithCheckboxOnly: false,
    	selectedItems: $scope.selectos, 
    	// filterOptions: $scope.filterOptions,
    	// enableCellEdit: false,
    	// showFooter: true,
        // showFilter:false,
    	columnDefs: [
                    { field:'clave',displayName:'Autorizacion', width: 130, pinned: false},
                    { field:'fecha',displayName:'Fecha', width: 130, pinned: false},
                    { field:'cliente',displayName:'Cliente', width: 130 },
                    { field:'unidad',displayName:'Unidad', width: 130 },
                    { field:'lesionado',displayName:'Lesionado', width: 220 },
                    { field:'folio',displayName:'Folio', width: 130 },
		            { field:'fecharegistro',displayName:'Fecha Registro', width: 130 },
		            { field:'diagnostico',displayName:'Diagnostico', width: 220 }
        ]
        
    };

	
}