-- User Table
CREATE TABLE public.user(  
  id        serial,
  login     varchar(64) NOT NULL,
  password  varchar(64) NOT NULL
);

ALTER TABLE public.user ADD CONSTRAINT pkUser PRIMARY KEY (id);
CREATE UNIQUE INDEX akUserLogin ON public.user (login);

-- Service Table
CREATE TABLE public.service(
  id         serial,
  login      varchar(64) NOT NULL,
  password   varchar(64) NOT NULL,
  title      varchar(64) NOT NULL,
  secret_key varchar(64) NOT NULL
);

ALTER TABLE public.service ADD CONSTRAINT pkService PRIMARY KEY (id);
CREATE UNIQUE INDEX akServiceLogin ON public.service (login);

-- user_data_type_group table
CREATE TABLE public.user_data_type_group(
  id         serial,
  group_code varchar(64) NOT NULL
);

ALTER TABLE public.user_data_type_group ADD CONSTRAINT pkUserDataTypeGroup PRIMARY KEY (id);
CREATE UNIQUE INDEX akUserDataTypeGroupCode ON public.user_data_type_group (group_code);

-- user_data_type table
CREATE TABLE public.user_data_type(
  id            serial,
  type_code     varchar(64) NOT NULL,
  data_group_id integer     NOT NULL
);

ALTER TABLE public.user_data_type ADD CONSTRAINT pkUserDataType PRIMARY KEY (id);
CREATE UNIQUE INDEX akUserDataTypeCode ON public.user_data_type (type_code);
ALTER TABLE public.user_data_type ADD CONSTRAINT fkUserDataTypeGroupId FOREIGN KEY (data_group_id) REFERENCES public.user_data_type_group (id) ON DELETE CASCADE;

-- user_data_map table
CREATE TABLE public.user_data_map(
  id      serial  NOT NULL,
  user_id integer  NOT NULL
);

ALTER TABLE public.user_data_map ADD CONSTRAINT pkUserDataMap PRIMARY KEY (id);
ALTER TABLE public.user_data_map ADD CONSTRAINT fkUserDataMapUserId FOREIGN KEY (user_id) REFERENCES public.user (id) ON DELETE CASCADE;

-- service_user_data table
CREATE TABLE service_user_data(
  service_id   integer  NOT NULL,
  user_data_id integer  NOT NULL
);

ALTER TABLE public.service_user_data ADD CONSTRAINT fkServiceUserDataId FOREIGN KEY (service_id) REFERENCES public.service (id) ON DELETE CASCADE;
ALTER TABLE public.service_user_data ADD CONSTRAINT fkServiceUserDataUserDataId FOREIGN KEY (user_data_id) REFERENCES public.user_data_map (id) ON DELETE CASCADE;

-- service_permissions table
CREATE TABLE public.service_permissions(
  service_id integer  NOT NULL,
  group_id   integer  NOT NULL
);

ALTER TABLE public.service_permissions ADD CONSTRAINT fkServicePermissionServiceId FOREIGN KEY (service_id) REFERENCES public.service (id) ON DELETE CASCADE;
ALTER TABLE public.service_permissions ADD CONSTRAINT fkServicePermissionDataGroupId FOREIGN KEY (group_id) REFERENCES public.user_data_type_group (id) ON DELETE CASCADE;

-- user_data_values table
CREATE TABLE public.user_data_values(
  user_data_id integer  NOT NULL,
  type_id      integer  NOT NULL,
  value        varchar(100) NULL
);

ALTER TABLE public.user_data_values ADD CONSTRAINT fkUserDataValuesUserDataId FOREIGN KEY (user_data_id) REFERENCES public.user_data_map (id) ON DELETE CASCADE;
ALTER TABLE public.user_data_values ADD CONSTRAINT fkUserDataValuesTypeId FOREIGN KEY (type_id) REFERENCES public.user_data_type (id) ON DELETE CASCADE;

-- action_type table
CREATE TABLE public.action_type(
  id   serial,
  code varchar(64) NOT NULL
);

ALTER TABLE public.action_type ADD CONSTRAINT pkActionType PRIMARY KEY (id);

-- user_log table
CREATE TABLE public.user_log(
  id        serial,
  action_id integer  NOT NULL,
  user_id   integer  NOT NULL
);

ALTER TABLE public.user_log ADD CONSTRAINT pkUserLog PRIMARY KEY (id);
ALTER TABLE public.user_log ADD CONSTRAINT fkUserLogActionId FOREIGN KEY (action_id) REFERENCES public.action_type (id) ON DELETE CASCADE;
ALTER TABLE public.user_log ADD CONSTRAINT fkUserLogUserId FOREIGN KEY (user_id) REFERENCES public.user (id) ON DELETE CASCADE;