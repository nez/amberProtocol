## Instalación

### Dependencias
1. Base de datos PostgreSQL >= 9.4
2. NodeJS v6 o posterior

### Creación y restauración de la base de datos
1. `create database amber;`
2. `create user auser with password 'test';`
3. `grant all privileges on database amber to auser;`
4. `psql -U auser amber < sql/db.sql`

### Instalación de bibliotecas
1. `git clone https://github.com/mxabierto/amberProtocol.git`
2. `cd amberProtocol/ && npm install`
3. `cd public/ && bower install`

## Ejecución
1. `cd amberProtocol/ && npm start`
2. A través de un navegador web, apuntar a la siguiente dirección:
`http://localhost:3000/`
