#!/bin/bash

echo "=== AUTO-FIX DE MODELOS (mayúsculas/minúsculas) ==="

BASE="/home/fs1/Tareas-MERN/backend"
MODEL_DIR="$BASE/modelos"

echo "Directorio de modelos: $MODEL_DIR"

# Obtener lista real de archivos
REAL_FILES=$(ls "$MODEL_DIR")

echo "Archivos detectados:"
echo "$REAL_FILES"
echo ""

# Procesar todos los JS del proyecto
find "$BASE" -type f -name "*.js" | while read FILE; do
    echo "Revisando: $FILE"

    # Buscar requires a modelos
    grep -o "require('../modelos/[A-Za-z0-9_]\+')" "$FILE" | while read REQ; do

        ORIGINAL=$(echo "$REQ" | sed "s/require('../modelos\/\(.*\))/\1/")
        echo "   Encontrado require: $ORIGINAL"

        # Verificar si el archivo existe tal cual
        if [ ! -f "$MODEL_DIR/$ORIGINAL.js" ]; then
            # Buscar coincidencia real ignorando mayúsculas
            MATCH=$(echo "$REAL_FILES" | grep -i "^${ORIGINAL}\.js$")

            if [ ! -z "$MATCH" ]; then
                CORRECT=$(echo "$MATCH" | sed "s/\.js$//")

                echo "   >> Corrigiendo require: $ORIGINAL → $CORRECT"

                # Crear backup
                cp "$FILE" "$FILE.bak"

                # Reemplazar el require incorrecto
                sed -i "s|require('../modelos/$ORIGINAL')|require('../modelos/$CORRECT')|g" "$FILE"

            else
                echo "   !! No se encontró coincidencia para $ORIGINAL"
            fi
        else
            echo "   OK: el archivo existe correctamente"
        fi
    done
done

echo ""
echo "====== AUTO-FIX COMPLETADO ======"
echo "Si algo falla, revisa los archivos *.bak"
