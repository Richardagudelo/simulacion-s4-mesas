# 馃嵔 Simulaci贸n Restaurante 馃嵔
## 馃嵈 Equipo MESAS 馃敇
#### Laboratorio #4 Simulaci贸n de computadores

## Contenido

- [Enunciado](#enunciado)
- [驴 C贸mo usar este proyecto ?](#usar-este-proyecto)
  - [Consumir Endpoints](#consumir-endpoints)
  - [Documentaci贸n Endpoints](#documentacion-endpoints)
  - [Contribuir al desarrollo](#contribuir-al-desarrollo)
- [Dependencias](#dependencias)
- [Integrantes del equipo](#integrantes)

## Enunciado
Desarrollar un programa, basado en la teor铆a de agentes, que permita ver el funcionamiento completo del restaurante, dados los siguientes par谩metros:

- El programa debe reunir a todos los agentes implementados de forma individual, de acuerdo a un modelo de simulaci贸n.
- Debe desarrollarse la implementaci贸n f铆sica teniendo en cuenta una red de comunicaciones y la implantaci贸n de cada uno de los agentes en una estaci贸n de trabajo independiente.
- El programa debe mostrar el comportamiento del restaurante teniendo en cuenta una jornada de 8 horas y las estructuras particulares de cada uno de las entidades, brindadas en clase.

### Funcionalidad del restaurante asignada: MESAS

## Usar este proyecto

El uso de este proyecto se explica a continuaci贸n:

### Consumir Endpoints
El proyecto esta desplegado en: https://scmesas.azurewebsites.net/, usando esta url puedes consumir los [Endpoints](#documentacion-endpoints)

### Documentacion Endpoints
- Ruta prueba despliegue
```
/
```

### Contribuir al desarrollo

1. Clona el proyecto
```
git clone https://github.com/Richardagudelo/simulacion-s4-mesas.git
```

2. En la raiz del proyecto, desde una terminal, instala las [Dependencias](#dependencias)
```
npm install
```

3. Ejecuta [index.js](index.js)
```
node index.js
```

5. Prueba los [Endpoints](#documentacion-endpoints) desde alguna herramienta para probar API'S

## Dependencias

Detalle de las dependencias del proyecto:

```
Node:       ^v.14.x

"express": "^4.17.1"
"winston": "^3.3.3"
```

## Integrantes

- [Oscar Rojas](https://github.com/augusticor)
- [Christian Chamorro](https://github.com/cris2014971130)
- [Richard Agudelo](https://github.com/Richardagudelo)
- [Luis Torres](https://github.com/luisTorres14)
- [Andres Florez](https://github.com/florez18399)
