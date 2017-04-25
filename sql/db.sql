drop database if exists amber;
create database amber;

drop user if exists auser;
create user auser with password 'test';

grant all privileges on database amber to auser;

\c amber;
set role auser;

/* Dependencias */
drop table if exists dependencias cascade;
create table dependencias (
    id serial primary key,
    nombre text,
    slug   text,
    direccion_calle text,
    direccion_numero_int text,
    direccion_numero_ext text,
    direccion_colonia text,
    direccion_localidad text,
    direccion_municipio text,
    direccion_ciudad text,
    direccion_estado text,
    direccion_pais text
);

/* Usuarios */
drop table if exists usuarios cascade;
create table usuarios(
    id serial primary key,
    usuario text,
    contrasena text,
    email text,
    nombres text,
    apellido_paterno text,
    apellido_materno text,
    rfc text,
    direccion_calle text,
    direccion_numero_int text,
    direccion_numero_ext text,
    direccion_colonia text,
    direccion_localidad text,
    direccion_municipio text,
    direccion_ciudad text,
    direccion_estado text,
    direccion_pais text,
    permiso_alerta boolean,
    permiso_administrador boolean,
    permiso_tablero boolean,
    id_dependencia integer references dependencias(id)
);

insert into usuarios ("usuario","contrasena","nombres","apellido_paterno","apellido_materno","permiso_alerta","permiso_administrador", "permiso_tablero") values
('admin','$2a$10$DmxbjTLBYDdcha8qlXpsaOyUqkJ0BAQ3Q4EIyMtr5HLXm6R0gSvbm','Administrador','','', true, true, true);

/* Alertas :: Boletin */
drop table if exists alertas cascade;
create table alertas(
    id serial primary key,
    title text,
    id_usuario integer references usuarios(id),
    sent timestamp,
    status text,
    msgType text,
    source text,
    description text
);

/* Alert Info :: Boletin */
drop table if exists infos cascade;
create table infos(
    id serial primary key,
    id_alert integer references alertas(id),
    event text,
    responseType text,
    urgency text,
    severity text,
    certainty text,
    effective date,
    headline text,
    description text
    /* Area geografical info */
);

/* Recursos :: Boletin */
drop table if exists resources cascade;
create table resources(
 id serial primary key,
 id_alert integer references alertas(id),
 description text,
 mimeType text,
 rec_size integer,
 uri text
);

/* Area :: Boletin */
drop table if exists area cascade;
create table area(
 id serial primary key,
 id_alert integer references alertas(id),
   area text,
   areaDesc text,
   polygon polygon,
   geoCode integer
);

/* Event :: Alerta */
drop table if exists event cascade;
create table event(
id serial primary key,
 id_alert integer references alertas(id),
 edate date,
 victimNumber integer,
 companionNumber integer,
 suspectNumber integer,
 eventDesc text,
 expiration date,
 latitude numeric,
 longitude numeric,
 w3w text,
 roadType text,
 roadName text,
 highway text,
 backroad text,
 exteriorNumber integer,
 interiorNumber integer,
 settlementType text,
 settlementName text,
 postalCode integer,
 localityName text,
 localityCoe integer,
 municipalityName text,
 municipalityCode integer,
 stateName text,
 stateCode integer,
 perpendiculars text,
 parallel text,
 landmarks text
);

/* Victimas :: Alerta */
drop table if exists victims cascade;
create table victims(
    id serial primary key,
    id_alert integer references alertas(id),
    name     text,
    surname1 text,
    surname2 text,
    pic      text, /* Fix */
    birthDate date,
    age       integer,
    gender   text,
    nationality text,
    hairType text,
    hairColor text,
    eyeColor text,
    height numeric,
    weight numeric,
    complex text,
    wear    text,
    peculiar text
);

/* Companion :: Alerta */
drop table if exists companion cascade;
create table companion(
  id serial primary key,
    id_alert integer references alertas(id),
    alias    text,
    name     text,
    surname1 text,
    surname2 text,
    pic      text, /* Fix */
    birthDate date,
    age       integer,
    gender   text,
    kinship   text,
    nationality text,
    hairType text,
    hairColor text,
    eyeColor text,
    height numeric,
    weight numeric,
    complex text,
    wear    text,
    vehicle text,
    peculiar text
);

/* Suspect :: Alerta */
drop table if exists suspect cascade;
create table suspect(
  id serial primary key,
    id_alert integer references alertas(id),
    alias    text,
    name     text,
    surname1 text,
    surname2 text,
    pic      text, /* Fix */
    birthDate date,
    age       integer,
    gender   text,
    kinship   text,
    nationality text,
    hairType text,
    hairColor text,
    eyeColor text,
    height numeric,
    weight numeric,
    complex text,
    wear    text,
    vehicle text,
    peculiar text
);