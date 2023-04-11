function sortear() {
    // Obtener archivo XLSX
    var archivo = document.getElementById("xlsxFile").files[0];
  
    // Obtener número de ganadores
    var numGanadores = parseInt(document.getElementById("numGanadores").value);
  
    // Leer archivo XLSX
    var reader = new FileReader();
    reader.onload = function(event) {
      var data = event.target.result;
      var workbook = XLSX.read(data, { type: "binary" });
  
      // Obtener hoja activa del archivo
      var sheetName = workbook.SheetNames[0];
      var sheet = workbook.Sheets[sheetName];
  
      // Convertir hoja a objeto JSON
      var participantes = XLSX.utils.sheet_to_json(sheet);
  
      // Seleccionar ganadores al azar
      var ganadores = _.sampleSize(participantes, numGanadores);
  
      // Carga los DNI del archivo CSV en un array
      Papa.parse("dni.csv", {
        delimiter: ";",
        download: true,
        complete: function(results) {
          var listaDNI = [];
          for (var i = 0; i < results.data.length; i++) {
            listaDNI.push(parseInt(results.data[i][0]));
          }
  
          // Actualizar tabla de ganadores
          // Loop para agregar los ganadores a la tabla
          var ganadoresHtml = "";
          for (var i = 0; i < ganadores.length; i++) {
            var ganador = ganadores[i];
            var dniGanador = ganador.DNI;
            var num=i+1;
            if (listaDNI.includes(dniGanador)) {
              var nombreCompleto = ganador["APELLIDO PATERNO"] + " " + ganador["APELLIDO MATERNO"] + " " + ganador["NOMBRES"];
              var ganadorHtml = "<tr><td>"+ num + "</td><td>" + dniGanador + "</td><td>" + ganador.CODIGO + "</td><td>" + nombreCompleto + "</td><td>"+ ganador["PROGRAMA DE ESTUDIOS"]+ "</td></tr>";
              ganadoresHtml += ganadorHtml;
            }
            
          }
  
          // Mostrar resultados en el HTML
          document.getElementById("ganadores").innerHTML = ganadoresHtml;
  
          // Guardar lista de participantes sin ganadores en un nuevo libro de Excel
          var newWorkbook = XLSX.utils.book_new();
          var newSheet = XLSX.utils.json_to_sheet(participantes.filter(function(participante) {
            for (var i = 0; i < ganadores.length; i++) {
              var ganador = ganadores[i];
              if (ganador.DNI === participante.DNI) {
                return false;
              }
            }
            return true;
          }));
          XLSX.utils.book_append_sheet(newWorkbook, newSheet, "participantes");
  
          // Descargar archivo al hacer clic en un botón
          document.getElementById("descargar").addEventListener("click", function() {
            var fileName = "participantes" + ".xlsx";
            XLSX.writeFile(newWorkbook, fileName);
          });
        }
      });
    };
  
    reader.readAsBinaryString(archivo);
  }
  